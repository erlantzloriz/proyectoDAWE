import { useState } from 'react';
import { truncarTexto, obtenerAtributoExtra, resolverImagen } from '../utils.js';

export default function TarjetaProducto({ 
  producto, 
  cantidadEnCarrito, 
  onAgregarCarrito, 
  onVerDetalles,
  favoritos = [], // Valor por defecto para evitar errores
  onAlternarFavorito 
}) {
  const [avisoVisible, setAvisoVisible] = useState(false);
  const atributoExtra = obtenerAtributoExtra(producto);
  const desactivado = cantidadEnCarrito >= 20;

  // Comprobar si este producto ya es favorito
  const esFavorito = favoritos.some(fav => String(fav.id) === String(producto.id));

  const handleAgregar = () => {
    if (desactivado) return;
    onAgregarCarrito(producto.id);
    setAvisoVisible(true);
    setTimeout(() => setAvisoVisible(false), 1000);
  };

  return (
    <div className="col">
      <div className="card h-100 producto position-relative shadow-sm">
        
        {/* BOTÓN DE FAVORITO (Arriba a la izquierda) */}
        <button
          className="btn-favorito-icon position-absolute top-0 start-0 m-2 border-0 bg-white rounded-circle shadow-sm"
          style={{ 
            zIndex: 15, // Un z-index alto para que esté por encima de la imagen
            width: '35px', 
            height: '35px', 
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => onAlternarFavorito(producto)}
          title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {esFavorito ? '⭐' : '☆'}
        </button>

        {/* Aviso de "Añadido" (Un poco más abajo a la izquierda para no chocar) */}
        {avisoVisible && (
          <span className="badge bg-success position-absolute m-2" style={{ zIndex: 10, top: '45px', start: '0' }}>
            ¡Añadido!
          </span>
        )}

        {/* BOTÓN DE CARRITO (Se queda donde estaba) */}
        <button
          className={`btn-carrito-icon ${desactivado ? 'disabled' : ''}`}
          onClick={handleAgregar}
          disabled={desactivado}
          style={{ zIndex: 5 }}
        >
          🛒
        </button>

        <img
          src={resolverImagen(producto.imagen)}
          className="card-img-top img-detalles"
          style={{ cursor: 'pointer', height: '200px', objectFit: 'cover' }}
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