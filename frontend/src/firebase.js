import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyADT1Sv8CPfu0KWe1erZWl6egakxkL_JEk",
    authDomain: "breathe-427de.firebaseapp.com",
    projectId: "breathe-427de",
    storageBucket: "breathe-427de.appspot.com",
    messagingSenderId: "552414234188",
    appId: "1:552414234188:web:750f5e59d8f104481256e9",
    measurementId: "G-969K21W91D"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
