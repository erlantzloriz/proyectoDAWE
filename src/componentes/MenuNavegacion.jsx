export default function MenuNavegacion({ onAbrirCarrito }) {
  return (
    <nav className="navbar navbar-light bg-light sticky-top px-3 shadow-sm">
      <ul className="nav-lista">
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
    </nav>
  );
}