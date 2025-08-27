// Service Worker for Push Myself PWA
const CACHE_NAME = 'push-myself-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.svg',
  '/icon.svg'
];

// 캐싱
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치됨');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  // 새 Service Worker 즉시 활성화
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화됨');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 모든 클라이언트에서 새 Service Worker 사용
      return self.clients.claim();
    })
  );
});

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('Push 이벤트 수신:', event);
  
  const options = {
    body: '오늘도 파이팅! 💪 새로운 하루를 시작해보세요.',
    icon: '/icon.svg',
    badge: '/apple-touch-icon.svg',
    tag: 'daily-motivation',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '앱 열기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ],
    data: {
      timestamp: Date.now(),
      type: 'daily-motivation',
      url: '/'
    }
  };

  // 푸시 데이터가 있으면 사용
  if (event.data) {
    try {
      const pushData = event.data.json();
      options.body = pushData.body || options.body;
      options.data = { ...options.data, ...pushData };
    } catch (error) {
      console.error('Push 데이터 파싱 실패:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Push Myself - 나를 넘어라', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭됨:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // 앱 열기
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (let client of clientList) {
        if (client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      
      // 새 탭으로 앱 열기
      return clients.openWindow('/');
    })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  console.log('백그라운드 동기화:', event.tag);
  
  if (event.tag === 'daily-motivation') {
    event.waitUntil(
      // 동기화 작업 수행
      console.log('일일 동기부여 동기화 완료')
    );
  }
});

// 메시지 처리 (클라이언트와 통신)
self.addEventListener('message', (event) => {
  console.log('Service Worker 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, options } = event.data;
    self.registration.showNotification(title || 'Push Myself', {
      body: body || '알림 메시지',
      icon: '/icon.svg',
      ...options
    });
  }
  
  // 클라이언트에 응답 전송
  event.ports[0]?.postMessage({
    type: 'RESPONSE',
    success: true
  });
}); 