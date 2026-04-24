// public/sw.js
const CACHE_NAME = "gc-image-cache-v1";
const IMAGE_CACHE_URLS = ["/", "/index.html"]; // optional: seed

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(IMAGE_CACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // only cache images
  if (req.destination === "image") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then(
          (cached) =>
            cached ||
            fetch(req).then((res) => {
              if (res.ok) cache.put(req, res.clone());
              return res;
            })
        )
      )
    );
  }
});
