import { useMemo, useState } from 'react';
import { resolverImagen } from '../utils.js';
import CampoDragDrop from './CampoDragDrop.jsx';

const ETIQUETAS_EXTRA = {
  Videojuego: 'Compania',
  Libro: 'Editorial',
  Musica: 'Artista',
  Pelicula: 'Director',
  JuegoMesa: 'Jugadores'
};

const CAMPOS_EXTRA = {
  Videojuego: 'compania',
  Libro: 'editorial',
  Musica: 'artista',
  Pelicula: 'director',
  JuegoMesa: 'jugadores'
};

export default function EditarBorrarProductos({ productos = [], onActualizarProductos, isOffline }) {
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [editandoNombre, setEditandoNombre] = useState(null);
  const [formData, setFormData] = useState({
    tipo: '',
    nombre: '',
    precio: '',
    descripcion: '',
    extra: '',
    imagen: ''
  });
  const [imagenOriginal, setImagenOriginal] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const listaProductos = useMemo(() => productos.slice(), [productos]);

  const toggleSeleccion = (nombre) => {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(nombre)) {
        nuevo.delete(nombre);
      } else {
        nuevo.add(nombre);
      }
      return nuevo;
    });
  };

  const abrirEdicion = (producto) => {
    if (isOffline) return;
    setMensaje('');
    setError('');
    const campoExtra = CAMPOS_EXTRA[producto.tipo];
    setEditandoNombre(producto.nombre);
    setImagenOriginal(producto.imagen || '');
    setArchivo(null);
    setFormData({
      tipo: producto.tipo || '',
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      descripcion: producto.descripcion || '',
      extra: campoExtra ? (producto[campoExtra] || '') : (producto.extra || ''),
      imagen: producto.imagen || ''
    });
  };

  const cerrarEdicion = () => {
    setEditandoNombre(null);
    setImagenOriginal('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const leerArchivoComoDataUrl = (archivoParaLeer) => new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error('No se pudo leer la imagen'));
    lector.readAsDataURL(archivoParaLeer);
  });

  const handleGuardar = async () => {
    if (isOffline || !editandoNombre) return;

    setCargando(true);
    setError('');
    setMensaje('');

    try {
      const imagenNueva = archivo ? await leerArchivoComoDataUrl(archivo) : null;
      const payload = {
        tipo: formData.tipo,
        nombre: formData.nombre,
        precio: Number.isFinite(Number(formData.precio)) ? Number(formData.precio) : formData.precio,
        descripcion: formData.descripcion,
        imagen: imagenNueva || imagenOriginal
      };

      const campoExtra = CAMPOS_EXTRA[formData.tipo];
      if (campoExtra) {
        payload[campoExtra] = formData.extra;
      }

      const respuesta = await fetch(`${API_URL}/api/productos/${encodeURIComponent(editandoNombre)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo actualizar el producto');
      }

      setMensaje('Producto actualizado correctamente');
      setEditandoNombre(null);
      setArchivo(null);
      await onActualizarProductos();
    } catch (err) {
      setError(err.message || 'Error al actualizar el producto');
    } finally {
      setCargando(false);
    }
  };

  const handleBorrarSeleccionados = async () => {
    if (isOffline || seleccionados.size === 0) return;

    setCargando(true);
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch(`${API_URL}/api/productos/borrar-multiples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres: Array.from(seleccionados) })
      });

      if (!respuesta.ok) {
        throw new Error('No se pudieron borrar los productos seleccionados');
      }

      setSeleccionados(new Set());
      setEditandoNombre(null);
      setMensaje('Productos eliminados correctamente');
      await onActualizarProductos();
    } catch (err) {
      setError(err.message || 'Error al borrar productos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-3">Editar/Borrar productos</h3>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleBorrarSeleccionados}
          disabled={isOffline || seleccionados.size === 0 || cargando}
        >
          Borrar todos los seleccionados
        </button>
        <div className="small text-muted">Seleccionados: {seleccionados.size}</div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      {listaProductos.length === 0 ? (
        <div className="alert alert-warning">No hay productos para mostrar.</div>
      ) : (
        <div className="list-group">
          {listaProductos.map((producto) => {
            const esEditando = editandoNombre === producto.nombre;
            const etiquetaExtra = ETIQUETAS_EXTRA[producto.tipo] || 'Dato extra';

            return (
              <div key={producto._id || producto.nombre} className="list-group-item">
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="checkbox"
                    checked={seleccionados.has(producto.nombre)}
                    onChange={() => toggleSeleccion(producto.nombre)}
                    disabled={cargando}
                  />
                  <img
                    src={resolverImagen(producto.imagen)}
                    alt={producto.nombre}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-bold">{producto.nombre}</div>
                    <div className="small text-muted">{producto.tipo}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => (esEditando ? cerrarEdicion() : abrirEdicion(producto))}
                    disabled={isOffline || cargando}
                  >
                    {esEditando ? 'Cerrar' : (isOffline ? 'Editar (Sin conexion)' : 'Editar')}
                  </button>
                </div>

                {esEditando && (
                  <div className="mt-3 border-top pt-3">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Tipo de producto</label>
                        <input
                          type="text"
                          className="form-control"
                          name="tipo"
                          value={formData.tipo}
                          disabled
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Nombre</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          disabled={cargando || isOffline}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Precio (€)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="precio"
                          value={formData.precio}
                          onChange={handleChange}
                          step="0.01"
                          disabled={cargando || isOffline}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Descripcion</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleChange}
                          disabled={cargando || isOffline}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">{etiquetaExtra}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="extra"
                          value={formData.extra}
                          onChange={handleChange}
                          disabled={cargando || isOffline}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Imagen</label>
                        <CampoDragDrop
                          alSeleccionarImagen={setArchivo}
                          archivoSeleccionado={archivo}
                          isOffline={isOffline || cargando}
                        />
                        <div className="small text-muted mt-1">Si no cambias la imagen, se mantiene la actual.</div>
                        {imagenOriginal && (
                          <div className="mt-2">
                            <img
                              src={resolverImagen(imagenOriginal)}
                              alt="Imagen actual"
                              style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={handleGuardar}
                        disabled={isOffline || cargando}
                      >
                        {cargando ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary ms-2"
                        onClick={cerrarEdicion}
                        disabled={cargando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
