// src/componentes/MenuNavegacion.jsx

export default function MenuNavegacion({ onAbrirCarrito, onAbrirFavoritos, isOffline, usuarioLogueado, seccionActual, onCambiarSeccion }) {
  
  const esAdmin = usuarioLogueado && usuarioLogueado.rol === 'administrador';

  return (
    <nav className="navbar navbar-light bg-light sticky-top px-3 shadow-sm d-flex justify-content-between">
      <ul className="nav-lista mb-0 d-flex gap-3 list-unstyled align-items-center">
        <li>
          <a 
            href="#" 
            className={`nav-link ${seccionActual === 'inicio' ? 'fw-bold border-bottom border-dark' : ''}`}
            onClick={(e) => { e.preventDefault(); onCambiarSeccion('inicio'); }}
          >
            Inicio
          </a>
        </li>
        
        {/* Pestaña Mi Cuenta visible para cualquier usuario autenticado */}
        {usuarioLogueado && (
          <li>
            <a 
              href="#" 
              className={`nav-link ${seccionActual === 'mi-cuenta' ? 'fw-bold border-bottom border-dark' : ''}`}
              onClick={(e) => { e.preventDefault(); onCambiarSeccion('mi-cuenta'); }}
            >
              👤 Mi cuenta
            </a>
          </li>
        )}

        {/* Pestañas de gestión exclusivas para Administradores */}
        {esAdmin && (
          <>
            <li>
              <a 
                href="#" 
                className={`nav-link ${isOffline ? 'disabled text-muted text-decoration-line-through' : ''} ${seccionActual === 'anadir-producto' ? 'fw-bold border-bottom border-dark' : ''}`}
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (!isOffline) onCambiarSeccion('anadir-producto'); 
                }}
              >
                ➕ Añadir un producto {isOffline && '(No disponible)'}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-link ${seccionActual === 'editar-productos' ? 'fw-bold border-bottom border-dark' : ''}`}
                style={isOffline ? { color: 'orange', textDecoration: 'underline' } : {}} 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onCambiarSeccion('editar-productos'); 
                }}
              >
                ⚙️ {isOffline ? 'Ver productos (Sin Conexión)' : 'Editar/Borrar productos'}
              </a>
            </li>
          </>
        )}

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