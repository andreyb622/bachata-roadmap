(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  var isReloading = false;
  var hadController = !!navigator.serviceWorker.controller;

  function registerServiceWorker() {
    navigator.serviceWorker.register('./sw.js').then(function (registration) {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', function () {
        var worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', function () {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      checkForUpdates(registration);
    }).catch(function () { /* ignore */ });
  }

  function checkForUpdates(registration) {
    registration.update().catch(function () { /* ignore */ });
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (isReloading || !hadController) return;
    isReloading = true;
    window.location.reload();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    navigator.serviceWorker.getRegistration().then(function (registration) {
      if (registration) checkForUpdates(registration);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
})();
