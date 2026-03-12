import { useState } from 'react';
import { listaProductos, agregarAlCarrito, registrarNuevoProducto, carrito } from './tienda.js';
import TarjetaProducto from './componentes/TarjetaProducto.jsx';
import Paginacion from './componentes/Paginacion.jsx';
import FormularioProducto from './componentes/FormularioProducto.jsx';
import Carrito from './componentes/Carrito.jsx';
import DetallesProducto from './componentes/DetallesProducto.jsx';
import PWABadge from './PWABadge.jsx';
import './assets/style.css';
import './App.css';

const PRODUCTOS_POR_PAGINA = 6;

function App() {
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [, forceUpdate] = useState(0);

  const productosFiltrados = listaProductos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const productosEnPagina = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const handleAgregarCarrito = (id) => {
    agregarAlCarrito(id);
    forceUpdate(n => n + 1);
  };

  const handleNuevoProducto = (datos) => {
    registrarNuevoProducto(datos);
    setBusqueda('');
    setPaginaActual(1);
    forceUpdate(n => n + 1);
  };

  const handleEliminarDeCarrito = (id) => {
    delete carrito[id];
    forceUpdate(n => n + 1);
  };

  const handleCambiarCantidad = (id, cantidad) => {
    if (isNaN(cantidad) || cantidad <= 0) {
      delete carrito[id];
    } else if (cantidad > 20) {
      carrito[id].cantidad = 20;
    } else {
      carrito[id].cantidad = cantidad;
    }
    forceUpdate(n => n + 1);
  };

  const handleVaciarCarrito = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      Object.keys(carrito).forEach(key => delete carrito[key]);
      forceUpdate(n => n + 1);
    }
  };

  return (
    <div className="container container-principal shadow-lg">
      <header className="py-4 border-bottom">
        <h1 className="text-center display-4 fw-bold">LA TIENDA DE DAWEWIWOWU</h1>
      </header>

      <nav className="navbar navbar-light bg-light sticky-top px-3 shadow-sm">
        <ul className="nav-lista">
          <li><a href="#" className="nav-link">Inicio</a></li>
          <li>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => { e.preventDefault(); setCarritoAbierto(true); }}
            >
              🛒 Carrito
            </a>
          </li>
        </ul>
      </nav>

      <div className="layout-tienda flex-grow-1">
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
              onChange={handleBusqueda}
            />
          </div>

          <div className="row row-cols-1 row-cols-md-3 g-4">
            {productosEnPagina.map(p => (
              <TarjetaProducto
                key={p.id}
                producto={p}
                cantidadEnCarrito={carrito[p.id]?.cantidad || 0}
                onAgregarCarrito={handleAgregarCarrito}
                onVerDetalles={setProductoDetalle}
              />
            ))}
          </div>

          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalProductos={productosFiltrados.length}
            productosPorPagina={PRODUCTOS_POR_PAGINA}
            onCambiarPagina={setPaginaActual}
          />
        </main>

        <aside className="bg-light">
          <h3 className="border-bottom pb-2">Añadir Producto</h3>
          <FormularioProducto onRegistrar={handleNuevoProducto} />
        </aside>
      </div>

      <footer className="py-3 bg-dark text-white text-center mt-auto">
        <p className="mb-0">&copy; Proyecto DAWE.</p>
      </footer>

      {carritoAbierto && (
        <Carrito
          carrito={carrito}
          onCerrar={() => setCarritoAbierto(false)}
          onEliminar={handleEliminarDeCarrito}
          onCambiarCantidad={handleCambiarCantidad}
          onVaciar={handleVaciarCarrito}
        />
      )}

      {productoDetalle && (
        <DetallesProducto
          producto={productoDetalle}
          onCerrar={() => setProductoDetalle(null)}
        />
      )}

      <PWABadge />
    </div>
  );
}

export default App;
