import TarjetaProducto from './TarjetaProducto.jsx';
import DetallesProducto from './DetallesProducto.jsx';

export default function EscaparateProductos({
  busqueda,
  onBusqueda,
  productosEnPagina,
  carrito,
  onAgregarCarrito,
  productoDetalle,
  setProductoDetalle,
  paginaActual,
  totalPaginas,
  totalProductos,
  productosPorPagina,
  onCambiarPagina,
  favoritos,        // <--- Recibimos favoritos
  onAlternarFavorito // <--- Recibimos la función
}) {
  return (
    <main className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          {busqueda ? `Buscando por: ${busqueda}` : 'Todos los productos'}
        </h2>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar productos por nombre..."
          style={{ maxWidth: '300px' }}
          value={busqueda}
          onChange={onBusqueda}
        />
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {productosEnPagina.map(p => {
          const productoId = p._id || p.id;
          return (
          <TarjetaProducto
            key={productoId}
            producto={p}
            cantidadEnCarrito={carrito.find(item => String(item.id) === String(productoId))?.cantidad || 0}
            onAgregarCarrito={onAgregarCarrito}
            onVerDetalles={setProductoDetalle}
            favoritos={favoritos}        // <--- Pasamos favoritos a la tarjeta
            onAlternarFavorito={onAlternarFavorito} // <--- Pasamos la función
          />
        );
        })}
      </div>

      {totalProductos > 0 && (() => {
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = Math.min(inicio + productosPorPagina, totalProductos);
        const mostrados = fin - inicio;

        return (
          <div className="mt-5 py-4 border-top">
            <div className="text-center text-muted mb-3 small">
              Mostrando {mostrados} de {totalProductos} productos.
            </div>
            <div className="d-flex justify-content-center align-items-center" id="paginacion-btns">
              {paginaActual > 1 && (
                <button
                  className="btn btn-sm btn-outline-dark m-1"
                  onClick={() => onCambiarPagina(paginaActual - 1)}
                >
                  Anterior
                </button>
              )}
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(i => (
                <button
                  key={i}
                  className={`btn btn-sm m-1 ${i === paginaActual ? 'btn-dark' : 'btn-outline-dark'}`}
                  onClick={() => onCambiarPagina(i)}
                >
                  {i}
                </button>
              ))}
              {totalPaginas > 1 && paginaActual < totalPaginas && (
                <button
                  className="btn btn-sm btn-outline-dark m-1"
                  onClick={() => onCambiarPagina(paginaActual + 1)}
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {productoDetalle && (
        <DetallesProducto
          producto={productoDetalle}
          onCerrar={() => setProductoDetalle(null)}
        />
      )}
    </main>
  );
}