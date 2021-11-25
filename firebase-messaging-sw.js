

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyCoLvpr3O3zuAhOE-eoFODYrkorVPSdCbY",
    authDomain: "group-e2bf6.firebaseapp.com",
    databaseURL: "https://group-e2bf6-default-rtdb.firebaseio.com",
    projectId: "group-e2bf6",
    storageBucket: "group-e2bf6.appspot.com",
    messagingSenderId: "342122930159",
    appId: "1:342122930159:web:6bb92fe5771158a5fc201a",
    measurementId: "G-4K73VFZV53",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessageHandler(function (payload) {
    const title = 'Hello World';
    const options = {
        body: payload.data.status
    };
    return self.registration.showNotification(title, options);
});


