import { useState } from 'react';
import { guardarValoracion, cargarValoracion } from '../tienda.js';

export default function Valoraciones({ productoId }) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [valoracion, setValoracion] = useState(() => cargarValoracion(productoId));

  const handleEnviar = () => {
    if (!comentario.trim()) {
      alert('Por favor, añade un comentario');
      return;
    }

    const nuevaValoracion = {
      puntuacion: parseInt(puntuacion),
      comentario: comentario.trim(),
      fecha: new Date().toLocaleDateString('es-ES'),
    };

    guardarValoracion(productoId, nuevaValoracion);
    setValoracion(nuevaValoracion);
    setComentario('');
    setPuntuacion(5);
    setMostrarFormulario(false);
  };

  const handleLimpiar = () => {
    if (window.confirm('¿Eliminar esta valoración?')) {
      localStorage.removeItem(`valoracion_${productoId}`);
      setValoracion(null);
    }
  };

  const obtenerEstrella = (puntuacion) => {
    return '⭐'.repeat(puntuacion) + '☆'.repeat(10 - puntuacion);
  };

  return (
    <div className="valoraciones-section mt-4 pt-3 border-top">
      <h5 className="mb-3">Valoración del Producto</h5>

      {valoracion ? (
        <div className="valoracion-existente bg-light p-3 rounded mb-3">
          <div className="mb-2">
            <strong>Tu puntuación:</strong>
            <div className="fs-5 text-warning">{obtenerEstrella(valoracion.puntuacion)}</div>
            <small className="text-muted">{valoracion.puntuacion}/10</small>
          </div>
          <div className="mb-2">
            <strong>Tu comentario:</strong>
            <p className="mb-0 mt-1">{valoracion.comentario}</p>
          </div>
          <small className="text-muted">Valorado el: {valoracion.fecha}</small>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-warning me-2"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              Editar
            </button>
            <button className="btn btn-sm btn-danger" onClick={handleLimpiar}>
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted mb-3">Aún no has valorado este producto.</p>
      )}

      {mostrarFormulario && (
        <div className="formulario-valoracion bg-light p-3 rounded">
          <div className="mb-3">
            <label className="form-label">
              <strong>Puntuación (1-10):</strong>
            </label>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="range"
                className="form-range"
                min="1"
                max="10"
                value={puntuacion}
                onChange={(e) => setPuntuacion(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
              <span className="fs-5 text-warning">{obtenerEstrella(puntuacion)}</span>
              <strong>{puntuacion}/10</strong>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              <strong>Comentario:</strong>
            </label>
            <textarea
              className="form-control"
              rows="4"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos tu opinión sobre este producto..."
              maxLength="500"
            />
            <small className="text-muted d-block mt-1">
              {comentario.length}/500 caracteres
            </small>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={handleEnviar}>
              Guardar Valoración
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setMostrarFormulario(false);
                setComentario('');
                setPuntuacion(5);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!mostrarFormulario && !valoracion && (
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setMostrarFormulario(true)}
        >
          Añadir Valoración
        </button>
      )}
    </div>
  );
}
