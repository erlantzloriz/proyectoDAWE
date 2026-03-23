export default function MenuNavegacion({ onAbrirCarrito, isOffline }) {
  return (
    <nav className="navbar navbar-light bg-light sticky-top px-3 shadow-sm d-flex justify-content-between">
      <ul className="nav-lista mb-0">
        <li><a href="#" className="nav-link">Inicio</a></li>
        <li>
          <a
            href="#"
            className="nav-link"
            onClick={(e) => { e.preventDefault(); onAbrirCarrito(); }}
          >
            🛒 Carrito
          </a>
        </li>
      </ul>
      
      {/* Cartel rojo que solo se muestra si isOffline es true */}
      {isOffline && (
        <div style={{ backgroundColor: 'red', color: 'white', border: '1px solid white', padding: '5px 15px', fontWeight: 'bold' }}>
          Estás offline
        </div>
      )}
    </nav>
  );
}