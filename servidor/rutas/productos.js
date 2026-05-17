import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

// 1. GET /api/productos - Obtener todos los productos de la base de datos
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const productos = await db.collection('productos').find({}).toArray();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos de la base de datos' });
  }
});

// 2. POST /api/productos - Añadir un nuevo producto (Sección 5.6)
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevoProducto = req.body; 
    // El body contendrá: tipo, nombre, precio, descripcion, extra, imagen
    
    const resultado = await db.collection('productos').insertOne(nuevoProducto);
    res.status(201).json({ mensaje: 'Producto añadido con éxito', id: resultado.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar el producto en MongoDB' });
  }
});

// 3. DELETE /api/productos/borrar-multiples - Borrar una lista de productos seleccionados (Sección 5.7)
// Usamos POST o DELETE pasándole un array de IDs/Nombres en el body
router.post('/borrar-multiples', async (req, res) => {
  try {
    const db = getDB();
    const { nombres } = req.body; // Recibe un array de nombres o identificadores de productos a eliminar
    
    if (!Array.isArray(nombres) || nombres.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar una lista de productos a eliminar' });
    }

    const resultado = await db.collection('productos').deleteMany({
      nombre: { $in: nombres }
    });

    res.json({ mensaje: 'Productos eliminados con éxito', eliminadosCount: resultado.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar los productos seleccionados' });
  }
});

// 4. PUT /api/productos/:nombre - Actualizar campos de un producto concreto (Sección 5.7)
router.put('/:nombre', async (req, res) => {
  try {
    const db = getDB();
    const { nombre } = req.params;
    const camposActualizados = req.body; // Campos modificados en el formulario

    const resultado = await db.collection('productos').updateOne(
      { nombre: nombre },
      { $set: camposActualizados }
    );

    res.json({ mensaje: 'Producto actualizado con éxito', modificadoCount: resultado.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

export default router;