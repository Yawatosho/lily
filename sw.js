const CACHE_NAME = "lily-bookshelf-rescue-v55";
const CACHE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=55",
  "./app.js?v=55",
  "./manifest.webmanifest",
  "./assets/logo.png",
  "./assets/title_lily.png",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./assets/result_maigo_s.png",
  "./assets/result_maigo_a.png",
  "./assets/result_maigo_b.png",
  "./assets/result_maigo_c.png",
  "./assets/result_seiri_s.png",
  "./assets/result_seiri_a.png",
  "./assets/result_seiri_b.png",
  "./assets/result_seiri_c.png",
  "./assets/story_maigo_a.png",
  "./assets/story_maigo_b.png",
  "./assets/story_maigo_c.png",
  "./assets/story_seiri_a.png",
  "./assets/story_seiri_b.png",
  "./assets/story_seiri_c.png",
  "./assets/ui-library-backdrop.png",
  "./sounds/ready.mp3",
  "./sounds/go.mp3",
  "./sounds/bgm.mp3",
  "./sounds/bgm_story.mp3",
  "./sounds/ok.mp3",
  "./sounds/ng.mp3",
  "./sounds/result_s.mp3",
  "./sounds/result_a.mp3",
  "./sounds/result_b.mp3",
  "./sounds/result_c.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
