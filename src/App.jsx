import { useState, useEffect } from 'react';
import { listaProductos as productosIniciales, registrarNuevoProducto, MAX_COPIAS, guardarEnCarrito, borrarDelCarrito, cargarCarrito } from './tienda.js';
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


const PRODUCTOS_POR_PAGINA = 6;

function App() {
  // 1. Añadimos los estados correctos para manejar la reactividad
  const [productos, setProductos] = useState(productosIniciales);
  // Inicializamos el estado leyendo el localStorage
  const [carrito, setCarrito] = useState(() => cargarCarrito());
  
  // 2. Mantenemos el resto de tus estados (¡quitando forceUpdate!)
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [mensajeMax, setMensajeMax] = useState('');

  // 3. Importante: ahora filtramos sobre la variable de estado 'productos', no la global
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const productosEnPagina = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);
  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const handleNuevoProducto = (datos) => {
    const payload = {
      ...datos,
      precio: Number.parseFloat(datos.precio),
    };

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
          guardarEnCarrito(id, {
            nombre: actualizado.nombre,
            precio: actualizado.precio,
            imagen: actualizado.imagen,
            cantidad: actualizado.cantidad,
          });
          return nuevoCarrito;
        } else {
          setMensajeMax(`No puedes añadir más de ${MAX_COPIAS} unidades del mismo producto.`);
          setTimeout(() => setMensajeMax(''), 3000);
        }
      } else {
        const nuevoItem = {
          id,
          nombre: p.nombre,
          precio: p.precio,
          imagen: p.imagen,
          cantidad: 1,
        };
        const nuevoCarrito = [...prevCarrito, nuevoItem];
        guardarEnCarrito(id, {
          nombre: nuevoItem.nombre,
          precio: nuevoItem.precio,
          imagen: nuevoItem.imagen,
          cantidad: nuevoItem.cantidad,
        });
        return nuevoCarrito;
      }

      return prevCarrito;
    });
  };

  const handleEliminarDeCarrito = (id) => {
    setCarrito(prevCarrito => {
      const nuevoCarrito = prevCarrito.filter(item => String(item.id) !== String(id));
      borrarDelCarrito(id); // <--- BORRAR DE LOCALSTORAGE
      return nuevoCarrito;
    });
  };

  const handleCambiarCantidad = (id, cantidad) => {
    setCarrito(prevCarrito => {
      const idx = prevCarrito.findIndex(item => String(item.id) === String(id));
      if (idx === -1) return prevCarrito;

      if (isNaN(cantidad) || cantidad <= 0) {
        const nuevoCarrito = prevCarrito.filter(item => String(item.id) !== String(id));
        borrarDelCarrito(id); // <--- BORRAR DE LOCALSTORAGE
        return nuevoCarrito;
      } else if (cantidad > MAX_COPIAS) {
        const nuevoCarrito = [...prevCarrito];
        const actualizado = { ...nuevoCarrito[idx], cantidad: MAX_COPIAS };
        nuevoCarrito[idx] = actualizado;
        guardarEnCarrito(id, {
          nombre: actualizado.nombre,
          precio: actualizado.precio,
          imagen: actualizado.imagen,
          cantidad: actualizado.cantidad,
        });
        setMensajeMax(`No puedes añadir más de ${MAX_COPIAS} unidades del mismo producto.`);
        setTimeout(() => setMensajeMax(''), 3000);
        return nuevoCarrito;
      } else {
        const nuevoCarrito = [...prevCarrito];
        const actualizado = { ...nuevoCarrito[idx], cantidad };
        nuevoCarrito[idx] = actualizado;
        guardarEnCarrito(id, {
          nombre: actualizado.nombre,
          precio: actualizado.precio,
          imagen: actualizado.imagen,
          cantidad: actualizado.cantidad,
        });
        return nuevoCarrito;
      }
    });
  };

  const handleVaciarCarrito = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      // Borramos cada item del localStorage
      carrito.forEach(item => borrarDelCarrito(item.id));
      setCarrito([]);
    }
  };

  // Nuevo estado para controlar si hay internet
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateByNavigator = () => setIsOffline(!navigator.onLine);

    const internetCheckUrl = 'https://www.gstatic.com/generate_204';

    const checkConnectivity = async () => {
      if (!navigator.onLine) {
        setIsOffline(true);
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 3500);

        try {
          await fetch(`${internetCheckUrl}?t=${Date.now()}`, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal,
          });

          setIsOffline(false);
        } catch {
          setIsOffline(true);
        } finally {
          window.clearTimeout(timeoutId);
        }
      } catch {
        setIsOffline(true);
      }
    };

    const handleOnline = () => {
      updateByNavigator();
      checkConnectivity();
    };

    const handleOffline = () => {
      updateByNavigator();
    };

    updateByNavigator();
    checkConnectivity();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', checkConnectivity);

    const intervalId = window.setInterval(checkConnectivity, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', checkConnectivity);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="container container-principal shadow-lg">
      <Cabecera titulo="LA TIENDA DE DAWEWIWOWU" />
      
      <MenuNavegacion onAbrirCarrito={() => setCarritoAbierto(true)} isOffline={isOffline} />

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
        />

        <aside className="bg-light">
          <h3 className="border-bottom pb-2">Añadir Producto</h3>
          <FormularioNuevosProductos onRegistrar={handleNuevoProducto} isOffline={isOffline} />
        </aside>
      </div>

      <Pie contenido="&copy; Proyecto DAWE." />

      {/* Alertas y Carrito (se quedan a nivel global) */}
      {mensajeMax && !carritoAbierto && (
        <div className="alert alert-warning position-fixed bottom-0 end-0 m-3 shadow" role="alert" style={{ zIndex: 1060 }}>
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

      <PWABadge />
    </div>
  );
}

export default App;
