export default function BuscadorProductos({ busqueda, onBusqueda }) {
  return (
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
  );
}