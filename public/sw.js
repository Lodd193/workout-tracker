const CACHE_NAME = 'workout-tracker-v1'
const OFFLINE_URL = '/offline.html'

// Resources to cache on install
const STATIC_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static resources')
      return cache.addAll(STATIC_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip Supabase API requests (need online connection)
  if (event.request.url.includes('supabase.co')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse
      }

      // Try to fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-OK responses
          if (!response || response.status !== 200) {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache successful responses
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          return caches.match(OFFLINE_URL)
        })
    })
  )
})

// Background sync for offline workout logs
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    console.log('[Service Worker] Syncing offline workouts...')
    event.waitUntil(syncOfflineWorkouts())
  }
})

async function syncOfflineWorkouts() {
  try {
    // Get pending workouts from IndexedDB
    const db = await openDB()
    const tx = db.transaction('pending_workouts', 'readonly')
    const store = tx.objectStore('pending_workouts')
    const pendingWorkouts = await store.getAll()

    if (pendingWorkouts.length === 0) {
      console.log('[Service Worker] No pending workouts to sync')
      return
    }

    console.log(`[Service Worker] Syncing ${pendingWorkouts.length} pending workouts`)

    // Send each workout to the server
    for (const workout of pendingWorkouts) {
      try {
        // This would integrate with your Supabase save logic
        console.log('[Service Worker] Syncing workout:', workout)
        // After successful sync, remove from pending
        const deleteTx = db.transaction('pending_workouts', 'readwrite')
        const deleteStore = deleteTx.objectStore('pending_workouts')
        await deleteStore.delete(workout.id)
      } catch (error) {
        console.error('[Service Worker] Failed to sync workout:', error)
      }
    }

    console.log('[Service Worker] Sync complete')
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error)
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WorkoutTrackerDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending_workouts')) {
        db.createObjectStore('pending_workouts', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}
