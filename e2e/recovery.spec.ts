import { cp, readFile, rm, truncate, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { BLOCK, expect, test } from './fixtures'
import { seededBytes, sha256 } from './origin'

// D. Quitting, crashing and restarting. kill() is SIGKILL: no before-quit, no final save —
// what's on disk is whatever the app had managed to persist, exactly as after a crash or a
// power cut.

const SIZE = 32 * BLOCK

test.describe('restart @smoke', () => {
  test('normal quit mid-download → relaunch paused → resume', async ({ netforge, serve }) => {
    const origin = await serve({ size: SIZE })
    const reached = origin.hold(10 * BLOCK + 500)
    const id = await netforge.start(origin.url(), origin.sha256, { connections: 2 })
    await reached

    await netforge.quit()
    origin.release()
    await netforge.launch()

    const restored = await netforge.current()
    expect(restored?.id).toBe(id)
    expect(restored?.status).toBe('paused')
    expect(restored?.bytesDownloaded).toBeGreaterThan(0)

    await netforge.api.resumeDownload(id)
    await netforge.waitForStatus('completed')
  })

  test('a completed download is still there after a restart', async ({ netforge, serve }) => {
    const origin = await serve({ size: SIZE })
    await netforge.start(origin.url(), origin.sha256)
    const done = await netforge.waitForStatus('completed')

    await netforge.relaunch()
    const restored = await netforge.current()
    expect(restored?.status).toBe('completed')
    expect(sha256(await readFile(done.destinationPath))).toBe(origin.sha256)
  })
})

test.describe('crash (SIGKILL) and recover @smoke', () => {
  // Offsets chosen to land in different places: so early no progress has been saved yet,
  // mid-block, a block boundary, and the tail — each leaves different part-file and manifest
  // states behind. Chaos covers the moments in between.
  for (const offset of [100, 3 * BLOCK + 777, 12 * BLOCK, SIZE - 10]) {
    test(`killed with a response held at byte ${offset}`, async ({ netforge, serve }) => {
      const origin = await serve({ size: SIZE, seed: offset })
      const reached = origin.hold(offset)
      const id = await netforge.start(origin.url(), origin.sha256, { connections: 4 })
      await reached
      // Give progress events and the throttled manifest save a chance to (partly) happen.
      await netforge.waitUntil((state) => state.bytesDownloaded > 0)

      await netforge.kill()
      origin.release()
      await netforge.launch()

      const restored = await netforge.current()
      expect(restored?.id).toBe(id)
      expect(restored?.status).toBe('paused')

      await netforge.api.resumeDownload(id)
      await netforge.waitForStatus('completed')
    })
  }

  test('killed while assembling → relaunch paused → resume re-assembles', async ({
    netforge,
    dirs
  }) => {
    // A simulated download can throttle the assemble step, which keeps it in 'assembling'
    // long enough to kill it there.
    const source = join(dirs.userData, '..', 'source.bin')
    const bytes = seededBytes(SIZE, 21)
    await writeFile(source, bytes)
    const id = await netforge.startSimulated(
      {
        sourceFilePath: source,
        networks: [{ kind: 'ethernet', label: 'sim', speedBytesPerSec: 50e6, faultRatePercent: 0 }],
        chunkCount: 2,
        connectionsPerNetwork: 2,
        assembleSpeedBytesPerSec: SIZE / 4
      },
      sha256(bytes)
    )
    await netforge.waitUntil(
      (state) => state.status === 'assembling' && (state.assembledBytes ?? 0) > 0
    )

    await netforge.kill()
    await netforge.launch()
    expect((await netforge.current())?.status).toBe('paused')

    await netforge.api.resumeDownload(id)
    await netforge.waitForStatus('completed')
  })
})

test.describe('persisted state on disk @smoke', () => {
  async function pausedDownload(
    netforge: import('./fixtures').NetForgeApp,
    serve: (o: { size: number; seed?: number }) => Promise<import('./origin').Origin>,
    seed = 1
  ): Promise<{ id: string; origin: import('./origin').Origin }> {
    const origin = await serve({ size: SIZE, seed })
    const reached = origin.hold(8 * BLOCK)
    const id = await netforge.start(origin.url(), origin.sha256)
    await reached
    await netforge.api.pauseDownload(id)
    await netforge.waitForStatus('paused')
    origin.release()
    return { id, origin }
  }

  test('a leftover manifest.json.tmp is ignored', async ({ netforge, serve, dirs }) => {
    const { id } = await pausedDownload(netforge, serve)
    await netforge.quit()
    await writeFile(join(dirs.userData, 'downloads', id, 'manifest.json.tmp'), '{"half":')
    await netforge.launch()
    expect((await netforge.current())?.id).toBe(id)
    await netforge.api.resumeDownload(id)
    await netforge.waitForStatus('completed')
  })

  test('a corrupt manifest does not stop the app from starting', async ({
    netforge,
    serve,
    dirs
  }) => {
    const { id } = await pausedDownload(netforge, serve)
    await netforge.quit()
    await writeFile(join(dirs.userData, 'downloads', id, 'manifest.json'), 'not json {')
    await netforge.launch()
    expect(await netforge.current()).toBeNull()

    // And a new download still works.
    const origin = await serve({ size: 4 * BLOCK, seed: 99 })
    await netforge.start(origin.url(), origin.sha256)
    await netforge.waitForStatus('completed')
  })

  test('two saved downloads: only the newest is restored, the other is removed', async ({
    netforge,
    serve,
    dirs
  }) => {
    const { id } = await pausedDownload(netforge, serve)
    await netforge.quit()

    // Clone the saved download under another id, dated an hour earlier.
    const root = join(dirs.userData, 'downloads')
    const olderId = '00000000-0000-4000-8000-000000000000'
    await cp(join(root, id), join(root, olderId), { recursive: true })
    const manifestPath = join(root, olderId, 'manifest.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
    manifest.state.id = olderId
    manifest.state.startedAt -= 3_600_000
    await writeFile(manifestPath, JSON.stringify(manifest))

    await netforge.launch()
    expect((await netforge.current())?.id).toBe(id)
    await expect.poll(() => existsSync(join(root, olderId))).toBe(false)

    await netforge.api.resumeDownload(id)
    await netforge.waitForStatus('completed')
  })

  test('part files deleted while the app was closed → re-downloads them', async ({
    netforge,
    serve,
    dirs
  }) => {
    const { id } = await pausedDownload(netforge, serve)
    await netforge.quit()
    await rm(join(dirs.userData, 'downloads', id, 'parts'), { recursive: true, force: true })
    await netforge.launch()
    await netforge.api.resumeDownload(id)
    const state = await netforge.waitForStatus(['completed', 'error'])
    expect(state.error).toBeUndefined()
  })

  test('a finished part file cut short while the app was closed is fetched again', async ({
    netforge,
    serve,
    dirs
  }) => {
    // What a power cut can do: the manifest says a block is done, but its data never all
    // reached the disk.
    const { id } = await pausedDownload(netforge, serve)
    const done = (await netforge.current())!.blocks!.find((block) => block.status === 'completed')!
    await netforge.quit()
    const part = join(dirs.userData, 'downloads', id, 'parts', `part-${done.index}`)
    await truncate(part, 1000)

    await netforge.launch()
    await netforge.api.resumeDownload(id)
    await netforge.waitForStatus('completed')
  })
})
