import { useState } from 'react';
import { auth, signInWithEmailAndPassword, signOut as firebaseSignOut } from '../utils.js';

export default function PanelAutenticacion({ usuarioLogueado, visitas, onLoginExitoso, onLogoutExitoso, isOffline }) {
  // Estados locales para el formulario de login
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  // Manejador del inicio de sesión 
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isOffline) return; // Si estamos sin conexión, el formulario no funciona 
    
    setErrorMsg('');
    setCargando(true);

    try {
      // 1. Autenticar en Firebase con email y contraseña 
      const userCredential = await signInWithEmailAndPassword(auth, email, contrasena);
      const firebaseUser = userCredential.user;

      // 2. Comunicar el éxito al servidor Express para inicializar la sesión en la BD de MongoDB 
      const respuesta = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: firebaseUser.email }),
        // Crucial para enviar y recibir la cookie de sesión (connect.sid)
        credentials: 'include' 
      });

      const datosServidor = await respuesta.json();

      if (!respuesta.ok) {
        // Si no existe el usuario en la colección usuarios de MongoDB
        throw new Error(datosServidor.error || 'Error de sincronización con el servidor.');
      }

      // 3. Informar al componente App de los datos del perfil y visitas devueltos por Express 
      onLoginExitoso(datosServidor.usuario, datosServidor.visitas);
      
      // Limpiar campos
      setEmail('');
      setContrasena('');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Credenciales incorrectas o usuario no registrado.');
    } finally {
      setCargando(false);
    }
  };

  // Manejador de cierre de sesión 
  const handleLogout = async () => {
    try {
      // 1. Cerrar sesión en Firebase
      await firebaseSignOut(auth);

      // 2. Destruir la sesión en Express
      await fetch('http://localhost:5000/api/usuarios/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // 3. Notificar al estado de App
      onLogoutExitoso();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // --- RENDERIZADO DINÁMICO ---

  // CASO A: El usuario está autenticado -> Mostrar PANEL DE USUARIO
if (usuarioLogueado) {
  return (
    <div className="panel-usuario-autenticado">
      <h3 className="border-bottom pb-2 mb-3">Bienvenide, {usuarioLogueado.nombre}</h3> 
      
      <div className="card p-3 bg-white mb-3 shadow-sm border" style={{ borderRadius: '8px' }}>
        {/* Si tiene rol de administrador lo mostramos */}
        {usuarioLogueado.rol === 'administrador' && (
          <p className="mb-1 fw-bold">Rol: <span className="text-muted fw-normal">Administradore</span></p> 
        )}
        <p className="mb-3 fw-bold">Número de visitas: <span className="badge bg-secondary fs-6">{visitas}</span></p> 

        <button 
          onClick={handleLogout} 
          className="btn btn-secondary w-100 py-2 fw-bold text-black"
          style={{ background: '#E5E7EB', border: '1px solid #9CA3AF', borderRadius: '6px' }}
        >
          Cerrar sesión
        </button>
      </div> 
    </div> 
  );
}

  // CASO B: El usuario no está autenticado -> Mostrar PANEL DE AUTENTICACIÓN 
  return (
    <div className="panel-autenticacion-login">
      <h3 className="border-bottom pb-2 mb-3">Inicio de sesión</h3> 
      
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label small fw-bold">Email</label> 
          <input
            type="email"
            className="form-control"
            placeholder="Introduce tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isOffline || cargando} // Deshabilitado si está offline o cargando 
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold">Contraseña</label> 
          <input
            type="password"
            className="form-control"
            placeholder="Introduce tu contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            disabled={isOffline || cargando} // Deshabilitado si está offline o cargando 
          />
        </div>

        {errorMsg && (
          <div className="alert alert-danger p-2 small mb-3">
            {errorMsg}
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary w-100 py-2 fw-bold text-black"
          disabled={isOffline || cargando}
          style={{ background: '#D1D5DB', border: '1px solid #9CA3AF', borderRadius: '6px' }}
        >
          {cargando ? 'Autenticando...' : 'Autenticarse'}
        </button> 
      </form>
    </div>
  );
}