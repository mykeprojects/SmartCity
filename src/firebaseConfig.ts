import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";
const FIREBASE_KEY = import.meta.env.VITE_FIREBASE_KEY

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: FIREBASE_KEY,
  authDomain: "security-2025-02.firebaseapp.com",
  projectId: "security-2025-02",
  storageBucket: "security-2025-02.firebasestorage.app",
  messagingSenderId: "675694347977",
  appId: "1:675694347977:web:2b39e2f8740ec17761af18",
  measurementId: "G-KNWTQS3NEN",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Proveedores de autenticación
const google = new GoogleAuthProvider();
const github = new GithubAuthProvider();
const microsoft = new OAuthProvider("microsoft.com");

// Exportar
export { auth, google, github, microsoft };