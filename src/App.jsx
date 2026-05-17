import { useState, useEffect } from 'react';

import { 
  listaProductos as productosIniciales, 
  registrarNuevoProducto, 
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
import FormularioNuevosProductos from './componentes/FormularioNuevosProductos.jsx';
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

const PRODUCTOS_POR_PAGINA = 6;

function App() {

  const [usuario, setUsuario] = useState(null); // Contendrá el objeto del usuario {nombre, email, rol, etc.}
  const [visitas, setVisitas] = useState(1);     // Contador provisto por express-session
  // --- 1. ESTADOS (Siempre al principio) ---
  const [productos, setProductos] = useState(productosIniciales);
  const [carrito, setCarrito] = useState(() => cargarCarrito());
  const [favoritos, setFavoritos] = useState(() => cargarFavoritos()); // Movido aquí arriba
  const [favoritosAbiertos, setFavoritosAbiertos] = useState(false); // Movido aquí arriba
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [mensajeMax, setMensajeMax] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- 2. LÓGICA DE FILTRADO ---
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const productosEnPagina = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);

  // --- 3. MANEJADORES DE EVENTOS ---

  // --- EFECTO PARA RESTAURAR SESIÓN CON EXPRESS AL REFRESCAR ---
  useEffect(() => {
    const verificarSesionActiva = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/usuarios/perfil', {
          credentials: 'include' // Obligatorio para pasar las cookies de sesión
        });
        if (res.ok) {
          const datos = await res.json();
          if (datos.autenticado) {
            setUsuario(datos.usuario);
            setVisitas(datos.visitas); // Refleja el contador incrementado automáticamente por el servidor 
          }
        }
      } catch (error) {
        console.error("Error al recuperar la sesión del backend:", error);
      }
    };
    
    if (!isOffline) {
      verificarSesionActiva();
    }
  }, [isOffline]); // Se ejecuta al arrancar y si recuperamos la conexión

  // --- MANEJADORES DE LOGIN / LOGOUT ---
  const handleLoginExitoso = (datosUsuario, numeroVisitas) => {
    setUsuario(datosUsuario);
    setVisitas(numeroVisitas);
  };

  const handleLogoutExitoso = () => {
    setUsuario(null);
    setVisitas(1);
  };

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const handleNuevoProducto = (datos) => {
    const payload = { ...datos, precio: Number.parseFloat(datos.precio) };
    const nuevo = registrarNuevoProducto(payload);
    setProductos([...productosIniciales]);
    setProductoDetalle(nuevo);
  };

  const handleAgregarCarrito = (id) => {
    const p = productos.find(prod => prod.id === id);
    if (!p) return;

    setCarrito(prevCarrito => {
      const idx = prevCarrito.findIndex(item => String(item.id) === String(id));
      if (idx !== -1) {
        const itemActual = prevCarrito[idx];
        if (itemActual.cantidad < MAX_COPIAS) {
          const nuevoCarrito = [...prevCarrito];
          const actualizado = { ...itemActual, cantidad: itemActual.cantidad + 1 };
          nuevoCarrito[idx] = actualizado;
          guardarEnCarrito(id, actualizado);
          return nuevoCarrito;
        } else {
          setMensajeMax(`No puedes añadir más de ${MAX_COPIAS} unidades.`);
          setTimeout(() => setMensajeMax(''), 3000);
        }
      } else {
        const nuevoItem = { id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, cantidad: 1 };
        guardarEnCarrito(id, nuevoItem);
        return [...prevCarrito, nuevoItem];
      }
      return prevCarrito;
    });
  };

  const handleAlternarFavorito = (producto) => {
    setFavoritos(prevFavoritos => {
      const existe = prevFavoritos.find(item => String(item.id) === String(producto.id));
      if (existe) {
        const nuevosFavs = prevFavoritos.filter(item => String(item.id) !== String(producto.id));
        borrarDeFavoritos(producto.id);
        return nuevosFavs;
      } else {
        const nuevoFav = { id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen };
        guardarEnFavoritos(producto.id, nuevoFav);
        return [...prevFavoritos, nuevoFav];
      }
    });
  };

  const handleEliminarDeCarrito = (id) => {
    setCarrito(prevCarrito => {
      const nuevoCarrito = prevCarrito.filter(item => String(item.id) !== String(id));
      borrarDelCarrito(id);
      return nuevoCarrito;
    });
  };

  const handleVaciarCarrito = () => {
    if (window.confirm('¿Vaciar carrito?')) {
      carrito.forEach(item => borrarDelCarrito(item.id));
      setCarrito([]);
    }
  };

  const handleCambiarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 0) return;
    
    // Si la cantidad es 0, eliminar el producto del carrito
    if (nuevaCantidad === 0) {
      handleEliminarDeCarrito(id);
      return;
    }

    if (nuevaCantidad > MAX_COPIAS) {
      setMensajeMax(`No puedes añadir más de ${MAX_COPIAS} unidades.`);
      setTimeout(() => setMensajeMax(''), 3000);
      return;
    }

    setCarrito(prevCarrito => {
      const nuevoCarrito = prevCarrito.map(item => {
        if (String(item.id) === String(id)) {
          const actualizado = { ...item, cantidad: nuevaCantidad };
          guardarEnCarrito(id, actualizado);
          return actualizado;
        }
        return item;
      });
      return nuevoCarrito;
    });
  };

  // --- 4. EFECTOS (Conectividad) ---
  useEffect(() => {
    const checkConnectivity = async () => {
      if (!navigator.onLine) { setIsOffline(true); return; }
      try {
        await fetch('https://www.gstatic.com/generate_204', { mode: 'no-cors', cache: 'no-store' });
        setIsOffline(false);
      } catch { setIsOffline(true); }
    };

    window.addEventListener('online', checkConnectivity);
    window.addEventListener('offline', () => setIsOffline(true));
    const intervalId = setInterval(checkConnectivity, 10000);

    return () => {
      window.removeEventListener('online', checkConnectivity);
      window.removeEventListener('offline', () => setIsOffline(true));
      clearInterval(intervalId);
    };
  }, []);

  // --- 5. RENDER ---
  return (
    <div className="container container-principal shadow-lg">
      <Cabecera titulo="LA TIENDA DE DAWEWIWOWU" />
      
      {/* Un solo menú de navegación con todas las funciones */}
      <MenuNavegacion 
        onAbrirCarrito={() => setCarritoAbierto(true)} 
        onAbrirFavoritos={() => setFavoritosAbiertos(true)} 
        isOffline={isOffline} 
      />

      <div className="layout-tienda flex-grow-1">
        <EscaparateProductos
          busqueda={busqueda}
          onBusqueda={handleBusqueda}
          productosEnPagina={productosEnPagina}
          carrito={carrito}
          onAgregarCarrito={handleAgregarCarrito}
          productoDetalle={productoDetalle}
          setProductoDetalle={setProductoDetalle}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalProductos={productosFiltrados.length}
          productosPorPagina={PRODUCTOS_POR_PAGINA}
          onCambiarPagina={setPaginaActual}
          favoritos={favoritos}
          onAlternarFavorito={handleAlternarFavorito}
        />

        <aside className="bg-light p-3 border-start">
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
          onEliminar={(id) => handleAlternarFavorito({ id })}
        />
      )}
      <PWABadge />
    </div>
  );
}

export default App;