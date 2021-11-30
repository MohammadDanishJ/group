const precacheVersion = 1;
const precacheName = 'precache-v' + precacheVersion;
const precacheFiles = [
    './base.css',
    './offline.html',
    'https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500;600;700&display=swap',
    ' https://fonts.gstatic.com/s/mitr/v6/pxiEypw5ucZF8eMcJJfecg.woff2',
    './assets/icons/icon-192x192.png'
];

self.addEventListener('install', (e) => {
    //console.log('[ServiceWorker] Installed');
    self.skipWaiting();
    e.waitUntil(
        caches.open(precacheName).then((cache) => {
            //console.log('[ServiceWorker] Precaching files');
            return cache.addAll(precacheFiles);
        }) // end caches.open()
    ); // end e.waitUntil
});

self.addEventListener('activate', (e) => {
    console.log('[SW] Activated');

    e.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((thisCacheName) => {

            if (thisCacheName.includes("precache") && thisCacheName !== precacheName) {
                //console.log('[ServiceWorker] Removing cached files from old cache - ', thisCacheName);
                return caches.delete(thisCacheName);
            }

        }));
    }) // end caches.keys()
    ); // end e.waitUntil
});

self.addEventListener('fetch', (e) => {
    //console.log('[ServiceWorker] Fetch event for ', e.request.url);
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                //console.log('Found in cache');
                return cachedResponse;
            }

            return fetch(e.request)
                .then((fetchResponse) => fetchResponse)
                .catch((err) => {
                    const isHTMLPage = e.request.method == "GET" && e.request.headers.get("accept").includes("text/html");
                    if (isHTMLPage) return caches.match("./test.html");
                });
        })
    );
});