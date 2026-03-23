import TarjetaProducto from './TarjetaProducto.jsx';
import Paginacion from './Paginacion.jsx';
import BuscadorProductos from './BuscadorProductos.jsx';
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
  onCambiarPagina
}) {
  return (
    <main className="p-4">
      <BuscadorProductos busqueda={busqueda} onBusqueda={onBusqueda} />

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {productosEnPagina.map(p => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            cantidadEnCarrito={carrito[p.id]?.cantidad || 0}
            onAgregarCarrito={onAgregarCarrito}
            onVerDetalles={setProductoDetalle}
          />
        ))}
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalProductos={totalProductos}
        productosPorPagina={productosPorPagina}
        onCambiarPagina={onCambiarPagina}
      />

      {/* El modal de detalles se renderiza aquí dentro según el enunciado */}
      {productoDetalle && (
        <DetallesProducto
          producto={productoDetalle}
          onCerrar={() => setProductoDetalle(null)}
        />
      )}
    </main>
  );
}