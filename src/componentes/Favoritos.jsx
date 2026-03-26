import { resolverImagen } from '../utils.js';

export default function Favoritos({ favoritos, onCerrar, onEliminar }) {
  return (
    <div className="position-fixed top-0 end-0 h-100 bg-white shadow-lg p-3 d-flex flex-column" style={{ width: '350px', zIndex: 1050 }}>
      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
        <h4 className="m-0">Tus Favoritos ⭐</h4>
        <button className="btn-close" onClick={onCerrar}></button>
      </div>

      <div className="flex-grow-1 overflow-auto">
        {favoritos.length === 0 ? (
          <p className="text-muted text-center mt-4">Aún no tienes favoritos.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {favoritos.map(item => (
              <li key={item.id} className="list-group-item d-flex align-items-center justify-content-between px-0">
                <div className="d-flex align-items-center gap-2">
                  <img src={resolverImagen(item.imagen)} alt={item.nombre} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <h6 className="m-0" style={{ fontSize: '0.9rem' }}>{item.nombre}</h6>
                    <small className="text-success">{item.precio}€</small>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger border-0" onClick={() => onEliminar(item.id)} title="Eliminar">
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}