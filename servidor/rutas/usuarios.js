import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

// 1. POST /api/usuarios/login - Iniciar sesión y registrar datos en la Express Session (Sección 5.2 y 5.3)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    // Buscamos el usuario en MongoDB utilizando el email verificado previamente por Firebase
    const usuario = await db.collection('usuarios').findOne({ email: email });

    if (!usuario) {
      return res.status(404).json({ error: 'El usuario no está registrado en la base de datos de MongoDB' });
    }

    // Guardamos el email como prueba de sesión iniciada
    req.session.email = usuario.email;
    req.session.nombre = usuario.nombre;
    req.session.rol = usuario.rol || null; // 'administrador' o sin rol
    
    // Iniciamos el contador de visitas al hacer login
    req.session.visitas = 1;

    res.json({
      mensaje: 'Sesión iniciada en el servidor Express',
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        edad: Number.isFinite(usuario.edad) ? usuario.edad : null
      },
      visitas: req.session.visitas // Devolvemos el contador activo
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el proceso de login en el servidor' });
  }
});

// 2. GET /api/usuarios/perfil - Obtener los datos del usuario autenticado actual junto al contador de visitas
router.get('/perfil', async (req, res) => {
  if (!req.session || !req.session.email) {
    return res.status(401).json({ autenticado: false, error: 'No hay ninguna sesión activa' });
  }

  try {
    const db = getDB();
    const usuario = await db.collection('usuarios').findOne({ email: req.session.email });

    if (!req.session.visitas) {
      req.session.visitas = 1;
    } else {
      req.session.visitas += 1;
    }

    res.json({
      autenticado: true,
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        edad: Number.isFinite(usuario.edad) ? usuario.edad : null
      },
      visitas: req.session.visitas // Se incrementa al consultar el perfil
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar el perfil' });
  }
});

// 3. POST /api/usuarios/logout - Destruir la sesión actual (Sección 3.3)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid'); // Limpia la cookie de sesión en el navegador
    res.json({ mensaje: 'Sesión cerrada correctamente en Express' });
  });
});

// 4. PUT /api/usuarios/perfil - Actualizar los datos editables del usuario en MongoDB (Sección 5.5)
router.put('/perfil', async (req, res) => {
  if (!req.session || !req.session.email) {
    return res.status(401).json({ error: 'Acción no autorizada. Debe iniciar sesión.' });
  }

  const { nombre, telefono, direccion, edad } = req.body;
  const edadNumerica = edad === '' || edad === null || edad === undefined ? null : Number(edad);

  // Validación: El campo nombre NO se puede dejar vacío
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre no se puede dejar vacío' });
  }

  try {
    const db = getDB();
    
    // El email (req.session.email) y el rol no son editables en base de datos mediante la app
    await db.collection('usuarios').updateOne(
      { email: req.session.email },
      { 
        $set: { 
          nombre: nombre,
          telefono: telefono,
          direccion: direccion,
          edad: Number.isFinite(edadNumerica) ? edadNumerica : null
        } 
      }
    );

    // Actualizamos también el nombre en la sesión activa
    req.session.nombre = nombre;

    res.json({ mensaje: 'Datos de usuario actualizados con éxito en MongoDB' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
  }
});

export default router;