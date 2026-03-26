export default function MenuNavegacion({ onAbrirCarrito, onAbrirFavoritos, isOffline }) {
  return (
    <nav className="navbar navbar-light bg-light sticky-top px-3 shadow-sm d-flex justify-content-between">
      <ul className="nav-lista mb-0 d-flex gap-3 list-unstyled">
        <li><a href="#" className="nav-link">Inicio</a></li>
        <li>
          <a
            href="#"
            className="nav-link"
            onClick={(e) => { e.preventDefault(); onAbrirFavoritos(); }}
          >
            ⭐ Favoritos
          </a>
        </li>
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
      
      {isOffline && (
        <div style={{ backgroundColor: 'red', color: 'white', border: '1px solid white', padding: '5px 15px', fontWeight: 'bold' }}>
          Estás offline
        </div>
      )}
    </nav>
  );
}