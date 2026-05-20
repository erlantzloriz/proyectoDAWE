import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import { conectarDB } from './db.js';

// Importación de las rutas modulares 
import rutasUsuarios from './rutas/usuarios.js';
import rutasProductos from './rutas/productos.js';

const app = express();
const PORT = 5000; // El cliente suele correr en el 5173 (Vite), usamos el 5000 para el backend
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// URL de conexión local a MongoDB (Base de datos: "tienda")
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tienda';
const DEFAULT_CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_CORS_ORIGINS;
const COOKIE_SECURE = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : IS_PRODUCTION;
const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || (COOKIE_SECURE ? 'none' : 'lax');

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// --- MIDDLEWARES GLOBALES ---

// 1. Configuración de CORS para permitir credenciales/cookies de sesión desde el frontend
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true // Crucial para que express-session intercambie cookies con React
}));

// 2. Parsers para leer JSON y formularios estructurados en los bodies de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Middleware de Gestión de Sesiones almacenadas en MongoDB
app.use(session({
  secret: 'ajeDawewiwowu', 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sesiones' // Se guardará en la BD "tienda", en la colección "sesiones"
  }),
  cookie: {
    secure: COOKIE_SECURE, // true si se usa HTTPS en producción
    httpOnly: true,
    sameSite: COOKIE_SAMESITE,
    maxAge: 1000 * 60 * 60 * 24 // Duración de 1 día activo
  }
}));

// 4. Middleware personalizado para gestionar el Contador de Visitas de la sesión
app.use((req, res, next) => {
  // Solo contamos visitas si el usuario ha iniciado sesión (lo sabremos porque guardaremos su email)
  if (req.session && req.session.email) {
    if (!req.session.visitas) {
      req.session.visitas = 1; // Inicializado a 1 al empezar la sesión
    } else {
      req.session.visitas += 1; // Incrementa en 1 cada vez que refresca la página estando autenticado
    }
  }
  next();
});

// --- ENRUTADORES MODULARES ---
// delegamos la lógica de negocio a los ficheros correspondientes sin saturar index.js
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/productos', rutasProductos);

// --- INICIALIZACIÓN DEL SERVIDOR ---
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Servidor Express corriendo en http://localhost:${PORT}`);
    console.log(` Almacén de sesiones conectado a MongoDB (Base de datos: tienda)`);
});

});