if (!('serviceWorker' in navigator)) {
  // no-op
} else {
  let isReloading = false;
  const hadController = Boolean(navigator.serviceWorker.controller);

  function checkForUpdates(registration) {
    registration.update().catch(() => {
      // ignore network errors
    });
  }

  function registerServiceWorker() {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        checkForUpdates(registration);
      })
      .catch(() => {
        // ignore registration errors
      });
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isReloading || !hadController) return;
    isReloading = true;
    window.location.reload();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) checkForUpdates(registration);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
}
