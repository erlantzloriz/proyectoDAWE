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

import Carrito from './componentes/Carrito.jsx';
import PWABadge from './PWABadge.jsx';
import './assets/style.css';
import './App.css';
import Cabecera from './componentes/Cabecera.jsx';
import MenuNavegacion from './componentes/MenuNavegacion.jsx';
import EscaparateProductos from './componentes/EscaparateProductos.jsx';
import Pie from './componentes/Pie.jsx';
import Favoritos from './componentes/Favoritos.jsx';
import PanelAutenticacion from './componentes/PanelAutenticacion.jsx';
import MiCuenta from './componentes/MiCuenta.jsx';
import EditarBorrarProductos from './componentes/EditarBorrarProductos.jsx';
import FormularioNuevosProductos from './componentes/FormularioNuevosProductos.jsx';

const PRODUCTOS_POR_PAGINA = 6;
const PRODUCTOS_CACHE_KEY = 'productos_cache';

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [visitas, setVisitas] = useState(0);
  const [productos, setProductos] = useState([]); // Ahora empieza vacío y se llena desde MongoDB
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  const comprobarConexionAPI = async () => {
    try {
      await fetch(`${API_URL}/api/productos`, {
        cache: 'no-store',
        headers: { 'x-skip-sw': '1' }
      });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    }
  };

  const cargarSesionActiva = async () => {
    if (isOffline || !navigator.onLine) return;

    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/perfil`, {
        credentials: 'include',
        headers: { 'x-skip-sw': '1' }
      });

      if (!respuesta.ok) return;
      const data = await respuesta.json();
      if (data.autenticado) {
        setUsuario(data.usuario);
        setVisitas(data.visitas || 1);
      }
    } catch {
      // Silencioso: si falla la sesion, se mantiene el estado actual
    }
  };

  // 1. Efecto para cargar los productos desde la API de MongoDB
  const cargarProductosDesdeAPI = async () => {
    try {
      setCargandoProductos(true);
      const cacheLocal = localStorage.getItem(PRODUCTOS_CACHE_KEY);
      if (cacheLocal) {
        try {
          setProductos(JSON.parse(cacheLocal));
        } catch {
          localStorage.removeItem(PRODUCTOS_CACHE_KEY);
        }
      }

      if (isOffline || !navigator.onLine) {
        setIsOffline(true);
        return;
      }

      const respuesta = await fetch(`${API_URL}/api/productos`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setProductos(datos);
        localStorage.setItem(PRODUCTOS_CACHE_KEY, JSON.stringify(datos));
      }
    } catch (error) {
      console.error("Error al conectar con la API de productos:", error);
      setIsOffline(true);
    } finally {
      setCargandoProductos(false);
    }
  };

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    comprobarConexionAPI();
    cargarProductosDesdeAPI();
    cargarSesionActiva();

    setCarrito(cargarCarrito());
    setFavoritos(cargarFavoritos());

    const handleOnline = () => {
      comprobarConexionAPI();
      cargarProductosDesdeAPI();
      cargarSesionActiva();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handlers para el Login y Logout
  const handleLoginExitoso = (datosUsuario, numVisitas = 1) => {
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
    const id = producto._id || producto.id;
    if (!id) return;
    const itemEnCarrito = carrito.find(item => String(item.id) === String(id));
    const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;

    if (cantidadActual >= MAX_COPIAS) {
      setMensajeMax(`No se pueden añadir más de ${MAX_COPIAS} copias de un producto.`);
      setTimeout(() => setMensajeMax(''), 3000);
      return;
    }

    const nuevaCantidad = cantidadActual + 1;
    const itemActualizado = {
      id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: nuevaCantidad
    };
    guardarEnCarrito(id, itemActualizado);
    setCarrito(cargarCarrito());
  };

  const handleEliminarDeCarrito = (id) => {
    borrarDelCarrito(id);
    setCarrito(cargarCarrito());
  };

  const handleCambiarCantidad = (id, cambio) => {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    const nuevaCantidad = cambio;
    if (nuevaCantidad > MAX_COPIAS) {
      setMensajeMax(`No se pueden añadir más de ${MAX_COPIAS} copias.`);
      setTimeout(() => setMensajeMax(''), 3000);
      return;
    }
    if (!Number.isFinite(nuevaCantidad) || nuevaCantidad <= 0) {
      handleEliminarDeCarrito(id);
      return;
    }
    item.cantidad = nuevaCantidad;
    localStorage.setItem(`producto_${id}`, JSON.stringify(item));
    setCarrito(cargarCarrito());
  };

  const handleVaciarCarrito = () => {
    carrito.forEach(item => borrarDelCarrito(item.id));
    setCarrito([]);
  };

  const handleAlternarFavorito = (productoOrId) => {
    const esObjeto = typeof productoOrId === 'object' && productoOrId !== null;
    const id = esObjeto ? (productoOrId._id || productoOrId.id) : productoOrId;
    if (!id) return;

    const esFavorito = favoritos.some(f => String(f.id) === String(id));
    if (esFavorito) {
      borrarDeFavoritos(id);
    } else {
      const producto = esObjeto
        ? productoOrId
        : productos.find(p => String(p._id || p.id) === String(id));
      if (!producto) return;
      guardarEnFavoritos(id, producto);
    }
    setFavoritos(cargarFavoritos());
  };

  const handleRegistrarProducto = async (nuevoProducto) => {
    if (isOffline) return;

    try {
      const respuesta = await fetch(`${API_URL}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo registrar el producto');
      }

      await cargarProductosDesdeAPI();
      setSeccionActual('inicio');
    } catch (error) {
      console.error('Error al registrar el producto:', error);
    }
  };

  return (
    <div className="container-principal">
      <Cabecera titulo="LA TIENDA DE DAWEWIWOWU" />

      <MenuNavegacion 
        onAbrirCarrito={() => setCarritoAbierto(true)}
        onAbrirFavoritos={() => setFavoritosAbiertos(true)}
        isOffline={isOffline}
        usuarioLogueado={usuario}
        seccionActual={seccionActual}
        onCambiarSeccion={setSeccionActual}
      />

      <div className="layout-tienda">
        <main>
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
            </>
          )}

          {seccionActual === 'mi-cuenta' && (
            <MiCuenta usuario={usuario} setUsuario={setUsuario} isOffline={isOffline} />
          )}

          {seccionActual === 'anadir-producto' && (
            <FormularioNuevosProductos onRegistrar={handleRegistrarProducto} isOffline={isOffline} />
          )}

          {seccionActual === 'editar-productos' && (
            <EditarBorrarProductos productos={productos} onActualizarProductos={cargarProductosDesdeAPI} isOffline={isOffline} />
          )}
        </main>

        <aside>
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

    </div>
  );
}

export default App;