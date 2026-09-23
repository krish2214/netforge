(function () {
  'use strict'

  function one(selector) {
    return document.querySelector(selector)
  }

  function many(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector))
  }

  var toastTimer
  function toast(message) {
    var element = one('#toast')
    if (!element) return
    element.textContent = message
    element.classList.add('show')
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(function () {
      element.classList.remove('show')
    }, 2200)
  }

  function copyValue(selector, label) {
    var field = one(selector)
    if (!field) return
    field.focus()
    field.select()
    var fallback = function () {
      try {
        document.execCommand('copy')
        toast(label + ' copied')
      } catch (_error) {
        toast('Select the URL and copy it manually')
      }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(field.value).then(function () {
        toast(label + ' copied')
      }, fallback)
    } else {
      fallback()
    }
  }

  var copyRelease = one('#copy-release')
  if (copyRelease) copyRelease.addEventListener('click', function () { copyValue('#release-url', 'Release URL') })
  var copySite = one('#copy-site')
  if (copySite) copySite.addEventListener('click', function () { copyValue('#site-url', 'Website URL') })

  var themeButton = one('#theme')
  if (themeButton) {
    var savedTheme = localStorage.getItem('netforge-site-theme')
    if (savedTheme === 'night') document.body.classList.add('night')
    themeButton.addEventListener('click', function () {
      document.body.classList.toggle('night')
      localStorage.setItem('netforge-site-theme', document.body.classList.contains('night') ? 'night' : 'paper')
      toast(document.body.classList.contains('night') ? 'Night workbench enabled' : 'Paper workbench enabled')
    })
  }

  var stageDetails = {
    probe: 'A small ranged request confirms that the origin can serve independent slices before NetForge commits to parallel work.',
    split: 'The file becomes a shared queue of byte ranges. Workers lease the next available chunk instead of receiving a fixed slice.',
    route: 'Each worker binds its request to a selected local address. The operating system keeps its normal route table.',
    verify: 'Parts are written separately, merged in order, and checked against the expected length and server validators.'
  }
  many('.stage').forEach(function (stage) {
    stage.addEventListener('click', function () {
      many('.stage').forEach(function (item) { item.classList.remove('active') })
      stage.classList.add('active')
      var detail = one('#stage-detail')
      if (detail) {
        detail.textContent = stageDetails[stage.dataset.stage] || 'This stage is ready.'
        detail.classList.add('show')
      }
    })
  })

  var currentFilter = 'all'
  function applyRows() {
    var search = one('#release-search')
    var query = search ? search.value.trim().toLowerCase() : ''
    var visible = 0
    many('.release-row').forEach(function (row) {
      var name = (row.dataset.name || row.textContent || '').toLowerCase()
      var matchesFilter = currentFilter === 'all' || row.dataset.os === currentFilter
      var matchesSearch = !query || name.indexOf(query) !== -1
      var visibleRow = matchesFilter && matchesSearch
      row.hidden = !visibleRow
      if (visibleRow) visible += 1
    })
    var empty = one('#empty')
    if (empty) empty.hidden = visible !== 0
  }

  many('.control[data-filter]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault()
      many('.control[data-filter]').forEach(function (item) { item.classList.remove('active') })
      button.classList.add('active')
      currentFilter = button.dataset.filter || 'all'
      applyRows()
    })
  })

  var searchInput = one('#release-search')
  if (searchInput) {
    searchInput.addEventListener('input', applyRows)
    searchInput.addEventListener('search', applyRows)
  }

  var recommend = one('#recommend')
  if (recommend) {
    recommend.addEventListener('click', function () {
      var userAgent = navigator.userAgent.toLowerCase()
      var platform = userAgent.indexOf('win') !== -1 ? 'windows' : userAgent.indexOf('mac') !== -1 ? 'mac' : userAgent.indexOf('linux') !== -1 ? 'linux' : 'all'
      many('.control[data-filter]').forEach(function (item) { item.classList.toggle('active', item.dataset.filter === platform) })
      currentFilter = platform
      applyRows()
      window.location.hash = 'downloads'
      toast(platform === 'all' ? 'Choose a platform below' : 'Showing the recommended ' + platform + ' builds')
    })
  }

  many('.shot img').forEach(function (image) {
    image.addEventListener('click', function () {
      var lightboxImage = one('#lightbox-image')
      var lightbox = one('#lightbox')
      if (!lightboxImage || !lightbox) return
      lightboxImage.src = image.dataset.full || image.src
      lightbox.classList.add('open')
    })
  })

  function closeLightbox() {
    var lightbox = one('#lightbox')
    var image = one('#lightbox-image')
    if (lightbox) lightbox.classList.remove('open')
    if (image) image.removeAttribute('src')
  }
  var closeButton = one('#close-lightbox')
  if (closeButton) closeButton.addEventListener('click', closeLightbox)
  var lightbox = one('#lightbox')
  if (lightbox) lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox() })
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeLightbox() })

  many('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var target = one(link.getAttribute('href'))
      if (target) {
        target.setAttribute('tabindex', '-1')
        window.setTimeout(function () { target.focus({ preventScroll: true }) }, 400)
      }
    })
  })

  applyRows()
}())
