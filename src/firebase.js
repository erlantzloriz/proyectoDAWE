// src/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";


// RELLENADO CON TUS DATOS DE LA CONSOLA DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAgkFkDB5zsT4XuS3IKRejhMV7qU6zoT6Q",
  authDomain: "proyectodawe-f46f5.firebaseapp.com",
  projectId: "proyectodawe-f46f5",
  storageBucket: "proyectodawe-f46f5.firebasestorage.app",
  messagingSenderId: "19050044275",
  appId: "1:19050044275:web:693e7f0ca24d178c17c306",
  measurementId: "G-YC3RRQN5C0"
};


// Inicializamos la aplicación y el servicio de autenticación
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// --------------------------------------

export const auth = getAuth(app);

// Funciones auxiliares para exportar limpiamente
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };