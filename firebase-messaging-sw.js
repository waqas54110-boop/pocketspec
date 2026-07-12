importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAUHZpHe1J1jdK_87OmEhcV6aZ4ydQIK5U",
  authDomain: "pocketspec-3295b.firebaseapp.com",
  projectId: "pocketspec-3295b",
  storageBucket: "pocketspec-3295b.firebasestorage.app",
  messagingSenderId: "1080432853252",
  appId: "1:1080432853252:web:7a1e55f469a0f96f481051"
});

const messaging = firebase.messaging();

// Jab tab band ho ya background mein ho, tab bhi notification dikhega
messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || "PocketSpec — Naya Product!";
  const options = {
    body: payload.notification?.body || "Ek naya product add hua hai, check karein.",
    icon: payload.notification?.image || "https://waqas54110-boop.github.io/pocketspec/images/u39-earbuds.png",
    badge: "https://waqas54110-boop.github.io/pocketspec/images/u39-earbuds.png",
    data: { url: payload.data?.url || "https://waqas54110-boop.github.io/pocketspec/" }
  };
  self.registration.showNotification(title, options);
});

// Notification click karne par site khulni chahiye
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || "https://waqas54110-boop.github.io/pocketspec/";
  event.waitUntil(clients.openWindow(url));
});
