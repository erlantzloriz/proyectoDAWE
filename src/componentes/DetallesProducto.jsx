import { obtenerAtributoExtra, resolverImagen } from '../utils.js';
import Valoraciones from './Valoraciones.jsx';

export default function DetallesProducto({ producto, onCerrar }) {
  const atributoExtra = obtenerAtributoExtra(producto);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  return (
    <div className="detalles-overlay" onClick={handleOverlayClick}>
      <div className="detalles-modal">
        <button className="btn-close btn-close-modal" onClick={onCerrar} />
        <div className="detalles-img-container">
          <img src={resolverImagen(producto.imagen)} alt={producto.nombre} />
        </div>
        <div className="detalles-info">
          <h3 className="mb-3 fw-bold">{producto.nombre}</h3>
          <p className="text-success fw-bold fs-4 mb-3">{producto.precio}€</p>
          {atributoExtra && (
            <p className="mb-3">
              <strong>{atributoExtra.label}:</strong>{' '}
              <span className="text-muted">{atributoExtra.valor}</span>
            </p>
          )}
          <h5 className="mb-2">Descripción:</h5>
          <p>{producto.descripcion}</p>

          <Valoraciones productoId={producto.id} />
        </div>
      </div>
    </div>
  );
}
