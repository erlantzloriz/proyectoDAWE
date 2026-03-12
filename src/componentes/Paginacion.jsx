export default function Paginacion({ paginaActual, totalPaginas, totalProductos, productosPorPagina, onCambiarPagina }) {
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = Math.min(inicio + productosPorPagina, totalProductos);
  const mostrados = fin - inicio;

  if (totalProductos === 0) return null;

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
}
