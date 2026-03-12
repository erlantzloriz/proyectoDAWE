import { useState } from 'react';
import { truncarTexto, obtenerAtributoExtra, resolverImagen } from '../utils.js';

export default function TarjetaProducto({ producto, cantidadEnCarrito, onAgregarCarrito, onVerDetalles }) {
  const [avisoVisible, setAvisoVisible] = useState(false);
  const atributoExtra = obtenerAtributoExtra(producto);
  const desactivado = cantidadEnCarrito >= 20;

  const handleAgregar = () => {
    if (desactivado) return;
    onAgregarCarrito(producto.id);
    setAvisoVisible(true);
    setTimeout(() => setAvisoVisible(false), 1000);
  };

  return (
    <div className="col">
      <div className="card h-100 producto position-relative">
        {avisoVisible && (
          <span className="badge bg-success position-absolute top-0 start-0 m-2" style={{ zIndex: 10 }}>
            ¡Añadido!
          </span>
        )}
        <button
          className={`btn-carrito-icon ${desactivado ? 'disabled' : ''}`}
          onClick={handleAgregar}
          disabled={desactivado}
        >
          🛒
        </button>
        <img
          src={resolverImagen(producto.imagen)}
          className="card-img-top img-detalles"
          style={{ cursor: 'pointer' }}
          onClick={() => onVerDetalles(producto)}
          alt={producto.nombre}
        />
        <div className="card-body">
          <h5 className="card-title">{truncarTexto(producto.nombre, 20)}</h5>
          <p className="fw-bold text-success">{producto.precio}€</p>
          {atributoExtra && (
            <p className="text-muted small mb-2">
              <strong>{atributoExtra.label}:</strong> {atributoExtra.valor}
            </p>
          )}
          <p className="card-text small">{truncarTexto(producto.descripcion, 60)}</p>
        </div>
      </div>
    </div>
  );
}
