// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCoLvpr3O3zuAhOE-eoFODYrkorVPSdCbY",
    authDomain: "group-e2bf6.firebaseapp.com",
    projectId: "group-e2bf6",
    storageBucket: "group-e2bf6.appspot.com",
    messagingSenderId: "342122930159",
    appId: "1:342122930159:web:6bb92fe5771158a5fc201a",
    measurementId: "G-4K73VFZV53"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let script = document.createElement('script');
script.src = "./script.js";
document.body.append(script);