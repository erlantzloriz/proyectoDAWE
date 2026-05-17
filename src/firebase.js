import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

//TODO: Coloca aquí las credenciales de configuración de tu proyecto en la consola de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializamos la aplicación y el servicio de autenticación
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Funciones auxiliares para exportar limpiamente
export { signInWithEmailAndPassword, signOut };