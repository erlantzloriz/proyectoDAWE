// src/App.jsx

import { useState, useEffect } from 'react';

import { 
  MAX_COPIAS, 
  guardarEnCarrito, 
  borrarDelCarrito, 
  cargarCarrito, 
  guardarEnFavoritos, 
  borrarDeFavoritos, 
  cargarFavoritos 
} from './tienda.js';

import TarjetaProducto from './componentes/TarjetaProducto.jsx';
import Paginacion from './componentes/Paginacion.jsx';
import Carrito from './componentes/Carrito.jsx';
import DetallesProducto from './componentes/DetallesProducto.jsx';
import PWABadge from './PWABadge.jsx';
import './assets/style.css';
import './App.css';
import Cabecera from './componentes/Cabecera.jsx';
import MenuNavegacion from './componentes/MenuNavegacion.jsx';
import EscaparateProductos from './componentes/EscaparateProductos.jsx';
import Pie from './componentes/Pie.jsx';
import Favoritos from './componentes/Favoritos.jsx';
import PanelAutenticacion from './componentes/PanelAutenticacion.jsx';

// Marcadores de posición para las vistas que crearemos en los siguientes bloques
const MiCuenta = () => <div className="p-4"><h3>Sección Mi Cuenta (Bloque 2)</h3></div>;
const EditarBorrarProductos = () => <div className="p-4"><h3>Sección Administración Productos (Bloque 3)</h3></div>;
const FormularioNuevosProductos = () => <div className="p-4"><h3>Sección Añadir Productos (Bloque 3)</h3></div>;

const PRODUCTOS_POR_PAGINA = 6;

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [visitas, setVisitas] = useState(0);
  const [productos, setProductos] = useState([]); // Ahora empieza vacío y se llena desde MongoDB
  const [cargandoProductos, setCargandoProductos] = useState(true);

  // Estado para la navegación interna
  const [seccionActual, setSeccionActual] = useState('inicio'); 

  // Estados de interfaz heredados
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [favoritosAbiertos, setFavoritosAbiertos] = useState(false);
  const [mensajeMax, setMensajeMax] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // 1. Efecto para cargar los productos desde la API de MongoDB
  const cargarProductosDesdeAPI = async () => {
    try {
      setCargandoProductos(true);
      const respuesta = await fetch('http://localhost:5000/api/productos');
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setProductos(datos);
      }
    } catch (error) {
      console.error("Error al conectar con la API de productos:", error);
    } finally {
      setCargandoProductos(false);
    }
  };

  useEffect(() => {
    cargarProductosDesdeAPI();

    setCarrito(cargarCarrito());
    setFavoritos(cargarFavoritos());

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handlers para el Login y Logout
  const handleLoginExitoso = (datosUsuario, numVisitas) => {
    setUsuario(datosUsuario);
    setVisitas(numVisitas);
  };

  const handleLogoutExitoso = () => {
    setUsuario(null);
    setVisitas(0);
    setSeccionActual('inicio'); // Si se desloguea, vuelve a inicio por seguridad
  };

  // Lógica de filtrado sobre el array dinámico de productos
  const productosFiltrados = productos.filter(producto => {
    const coincideTexto = producto.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                          producto.descripcion.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideTipo = filtroTipo === '' || producto.tipo === filtroTipo;
    return coincideTexto && coincideTipo;
  });

  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceInicio + PRODUCTOS_POR_PAGINA);

  // Funciones del carrito y favoritos heredadas
  const handleAñadirAlCarrito = (producto) => {
    const itemEnCarrito = carrito.find(item => item.id === producto._id || item.id === producto.id);
    const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;

    if (cantidadActual >= MAX_COPIAS) {
      setMensajeMax(`No se pueden añadir más de ${MAX_COPIAS} copias de un producto.`);
      setTimeout(() => setMensajeMax(''), 3000);
      return;
    }

    const nuevoCarrito = guardarEnCarrito(producto);
    setCarrito(nuevoCarrito);
  };

  const handleEliminarDeCarrito = (id) => {
    const nuevoCarrito = borrarDelCarrito(id);
    setCarrito(nuevoCarrito);
  };

  const handleCambiarCantidad = (id, cambio) => {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad > MAX_COPIAS) {
      setMensajeMax(`No se pueden añadir más de ${MAX_COPIAS} copias.`);
      setTimeout(() => setMensajeMax(''), 3000);
      return;
    }
    if (nuevaCantidad <= 0) {
      handleEliminarDeCarrito(id);
      return;
    }
    item.cantidad = nuevaCantidad;
    localStorage.setItem(`carrito_${id}`, JSON.stringify(item));
    setCarrito(cargarCarrito());
  };

  const handleVaciarCarrito = () => {
    carrito.forEach(item => borrarDelCarrito(item.id));
    setCarrito([]);
  };

  const handleAlternarFavorito = (producto) => {
    const id = producto._id || producto.id;
    const esFavorito = favoritos.some(f => f.id === id);
    if (esFavorito) {
      borrarDeFavoritos(id);
    } else {
      guardarEnFavoritos(producto);
    }
    setFavoritos(cargarFavoritos());
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column p-0 app-container">
      <Cabecera 
        filtroTexto={filtroTexto} 
        onFiltroTextoChange={setFiltroTexto}
        filtroTipo={filtroTipo}
        onFiltroTipoChange={setFiltroTipo}
      />

      <MenuNavegacion 
        onAbrirCarrito={() => setCarritoAbierto(true)}
        onAbrirFavoritos={() => setFavoritosAbiertos(true)}
        isOffline={isOffline}
        usuarioLogueado={usuario}
        seccionActual={seccionActual}
        onCambiarSeccion={setSeccionActual}
      />

      <div className="flex-grow-1 d-flex cuerpo-principal">
        <main className="flex-grow-1 p-3 contenido-productos">
          {/* RENDERIZADO CONDICIONAL SEGÚN LA SECCIÓN SELECCIONADA */}
          {seccionActual === 'inicio' && (
            <>
              {cargandoProductos ? (
                <div className="text-center p-5"><h4>Cargando catálogo...</h4></div>
              ) : (
                <EscaparateProductos 
                  busqueda={filtroTexto}
                  onBusqueda={(e) => setFiltroTexto(e.target.value)}
                  productosEnPagina={productosPaginados}
                  carrito={carrito}
                  onAgregarCarrito={handleAñadirAlCarrito}
                  productoDetalle={productoSeleccionado}
                  setProductoDetalle={setProductoSeleccionado}
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  totalProductos={productosFiltrados.length}
                  productosPorPagina={PRODUCTOS_POR_PAGINA}
                  onCambiarPagina={setPaginaActual}
                  favoritos={favoritos}
                  onAlternarFavorito={handleAlternarFavorito}
                />
              )}
              <Paginacion 
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                totalProductos={productosFiltrados.length}
                productosPorPagina={PRODUCTOS_POR_PAGINA}
                onCambiarPagina={setPaginaActual}
                favoritos={favoritos}
                onAlternarFavorito={handleAlternarFavorito}
              />
            </>
          )}

          {seccionActual === 'mi-cuenta' && (
            <MiCuenta usuario={usuario} setUsuario={setUsuario} isOffline={isOffline} />
          )}

          {seccionActual === 'anadir-producto' && (
            <FormularioNuevosProductos onActualizarProductos={cargarProductosDesdeAPI} isOffline={isOffline} setSeccionActual={setSeccionActual} />
          )}

          {seccionActual === 'editar-productos' && (
            <EditarBorrarProductos productos={productos} onActualizarProductos={cargarProductosDesdeAPI} isOffline={isOffline} />
          )}
        </main>

        <aside className="bg-light p-3 border-start lateral-autenticacion">
          <PanelAutenticacion 
            usuarioLogueado={usuario}
            visitas={visitas}
            onLoginExitoso={handleLoginExitoso}
            onLogoutExitoso={handleLogoutExitoso}
            isOffline={isOffline}
          />
        </aside>
      </div>

      <Pie contenido="&copy; Proyecto DAWE." />
      <PWABadge />

      {mensajeMax && !carritoAbierto && (
        <div className="alert alert-warning position-fixed bottom-0 end-0 m-3 shadow" style={{ zIndex: 1060 }}>
          {mensajeMax}
        </div>
      )}

      {carritoAbierto && (
        <Carrito
          carrito={carrito}
          onCerrar={() => setCarritoAbierto(false)}
          onEliminar={handleEliminarDeCarrito}
          onCambiarCantidad={handleCambiarCantidad}
          onVaciar={handleVaciarCarrito}
          mensajeMax={mensajeMax}
        />
      )}

      {favoritosAbiertos && (
        <Favoritos
          favoritos={favoritos}
          onCerrar={() => setFavoritosAbiertos(false)}
          onEliminar={handleAlternarFavorito}
          onAñadirAlCarrito={handleAñadirAlCarrito}
        />
      )}

      {productoSeleccionado && (
        <DetallesProducto 
          producto={productoSeleccionado}
          onCerrar={() => setProductoSeleccionado(null)}
        />
      )}
    </div>
  );
}

export default App;