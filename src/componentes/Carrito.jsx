import { truncarTexto, resolverImagen } from '../utils.js';

export default function Carrito({ carrito, onCerrar, onEliminar, onCambiarCantidad, onVaciar }) {
  const entries = Object.entries(carrito);
  const total = entries.reduce((sum, [, item]) => sum + item.precio * item.cantidad, 0);

  return (
    <>
      <div className="offcanvas-backdrop" onClick={onCerrar} />
      <div className="offcanvas-panel">
        <div className="offcanvas-header border-bottom d-flex justify-content-between align-items-center p-3">
          <h5 className="mb-0">Tu Carrito</h5>
          <button className="btn-close" onClick={onCerrar} />
        </div>
        <div className="offcanvas-body p-3">
          {entries.length === 0 ? (
            <p className="text-muted text-center mt-4">El carrito está vacío.</p>
          ) : (
            <>
              {entries.map(([id, item]) => {
                const subtotal = item.precio * item.cantidad;
                return (
                  <div key={id} className="producto-carrito mb-3 pb-3 border-bottom">
                    <div className="d-flex gap-2 align-items-start">
                      <img
                        src={resolverImagen(item.imagen)}
                        width="60"
                        height="60"
                        className="rounded"
                        style={{ objectFit: 'cover' }}
                        alt={item.nombre}
                      />
                      <div className="flex-grow-1">
                        <strong className="d-block mb-1">{truncarTexto(item.nombre, 30)}</strong>
                        <div className="small text-muted">
                          {item.precio}€ x{' '}
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.cantidad}
                            className="cantidad-carrito form-control form-control-sm d-inline-block"
                            style={{ width: '60px' }}
                            onChange={(e) => onCambiarCantidad(id, parseInt(e.target.value))}
                          />
                          {' '}= <strong>{subtotal.toFixed(2)}€</strong>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onEliminar(id)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Total:</h5>
                  <h5 className="mb-0 text-success">{total.toFixed(2)}€</h5>
                </div>
                <button className="btn btn-success w-100 mb-2">Finalizar Compra</button>
                <button className="btn btn-outline-danger w-100 btn-sm" onClick={onVaciar}>
                  Vaciar Carrito
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
