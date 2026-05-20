import { useState } from 'react';
// Asegúrate de que la ruta de importación coincida con donde tienes exportadas estas funciones de Firebase
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase.js'; 

export default function PanelAutenticacion({ usuarioLogueado, visitas, onLoginExitoso, onLogoutExitoso, isOffline }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
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
      if (esRegistro) {
        // 1. Crear en Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, contrasena);
        // 2. Guardar en MongoDB
        const respuesta = await fetch(`${API_URL}/api/usuarios/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userCredential.user.email, nombre })
        });
        
        if (!respuesta.ok) throw new Error('Error al guardar en la base de datos');
        const data = await respuesta.json();
        if (onLoginExitoso) onLoginExitoso(data.usuario);
        
      } else {
        // Lógica original de Login
        const userCredential = await signInWithEmailAndPassword(auth, email, contrasena);
        const respuesta = await fetch(`${API_URL}/api/usuarios/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userCredential.user.email })
        });
        
        if (!respuesta.ok) throw new Error('Error en las credenciales o en el servidor');
        const data = await respuesta.json();
        if (onLoginExitoso) onLoginExitoso(data.usuario);
      }
    } catch (error) {
      setErrorMsg(error.message || 'Error en la autenticación');
    } finally {
      setCargando(false);
    }
  };

  // Si el usuario ya está logueado, mostramos su panel
  if (usuarioLogueado) {
    return (
      <div className="p-3">
        <h5>Bienvenido, {usuarioLogueado.nombre}</h5>
        <p className="small text-muted">Visitas: {visitas}</p>
        {/* Aquí iría tu botón de Logout llamando a onLogoutExitoso */}
      </div>
    );
  }

  // Formulario dinámico (Login / Registro)
  return (
    <form onSubmit={handleSubmit} className="p-2">
      <h5 className="mb-3">{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h5>
      
      {esRegistro && (
        <div className="mb-3">
          <label className="form-label small fw-bold">Nombre</label>
          <input
            type="text"
            className="form-control"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required={esRegistro}
            disabled={isOffline || cargando}
          />
        </div>
      )}

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
        {cargando ? 'Cargando...' : (esRegistro ? 'Registrarse' : 'Entrar')}
      </button>

      <button 
        type="button" 
        className="btn btn-link w-100 p-0 text-decoration-none small"
        onClick={() => setEsRegistro(!esRegistro)}
        disabled={isOffline || cargando}
      >
        {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </form>
  );
}