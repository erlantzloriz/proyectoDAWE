import { useState } from 'react';
// Asegúrate de que la ruta de importación coincida con donde tienes exportadas estas funciones de Firebase
import { auth, signInWithEmailAndPassword, signOut } from '../firebase.js'; 

export default function PanelAutenticacion({ usuarioLogueado, visitas, onLoginExitoso, onLogoutExitoso, isOffline }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) return;
    
    setErrorMsg('');
    setCargando(true);

    try {
      // Login con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, contrasena);
      const respuesta = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userCredential.user.email })
      });
      
      if (!respuesta.ok) throw new Error('Error en las credenciales o en el servidor');
      const data = await respuesta.json();
      if (onLoginExitoso) onLoginExitoso(data.usuario, data.visitas || 1);
    } catch (error) {
      setErrorMsg(error.message || 'Error en la autenticación');
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = async () => {
    if (isOffline) return;

    setErrorMsg('');
    setCargando(true);

    try {
      await fetch(`${API_URL}/api/usuarios/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      await signOut(auth);
      if (onLogoutExitoso) onLogoutExitoso();
    } catch (error) {
      setErrorMsg(error.message || 'Error al cerrar la sesión');
    } finally {
      setCargando(false);
    }
  };

  // Si el usuario ya está logueado, mostramos su panel
  if (usuarioLogueado) {
    return (
      <div className="p-3">
        <h5 className="mb-3">Panel de usuario</h5>
        <div className="border rounded p-2 mb-3 bg-light">
          <div className="fw-bold">Hola, {usuarioLogueado.nombre}</div>
          <div className="small">Rol: {usuarioLogueado.rol || 'sin rol'}</div>
          <div className="small">Visitas: {visitas}</div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger p-2 small mb-2">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          className="btn btn-outline-dark w-100"
          onClick={handleLogout}
          disabled={isOffline || cargando}
        >
          {cargando ? 'Cerrando sesion...' : 'Cerrar sesion'}
        </button>
      </div>
    );
  }

  // Formulario de login
  return (
    <form onSubmit={handleSubmit} className="p-2">
      <h5 className="mb-3">Iniciar Sesion</h5>

      <div className="mb-3">
        <label className="form-label small fw-bold">Email</label> 
        <input
          type="email"
          className="form-control"
          placeholder="Introduce tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isOffline || cargando} 
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
          disabled={isOffline || cargando} 
        />
      </div>

      {errorMsg && (
        <div className="alert alert-danger p-2 small mb-3">
          {errorMsg}
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary w-100 py-2 fw-bold text-white mb-2"
        disabled={isOffline || cargando}
      >
        {cargando ? 'Cargando...' : 'Entrar'}
      </button>
    </form>
  );
}