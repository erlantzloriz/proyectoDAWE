import { useEffect, useState } from 'react';

export default function MiCuenta({ usuario, setUsuario, isOffline }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    edad: ''
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const cargarPerfil = async () => {
    if (isOffline) return;

    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/perfil`, {
        credentials: 'include'
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo cargar el perfil');
      }

      const data = await respuesta.json();
      if (data.autenticado) {
        setUsuario(data.usuario);
        setFormData({
          nombre: data.usuario.nombre || '',
          email: data.usuario.email || '',
          telefono: data.usuario.telefono || '',
          direccion: data.usuario.direccion || '',
          edad: Number.isFinite(data.usuario.edad) ? data.usuario.edad : ''
        });
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el perfil');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        edad: Number.isFinite(usuario.edad) ? usuario.edad : ''
      });
    }
  }, [usuario]);

  useEffect(() => {
    cargarPerfil();
  }, []);

  useEffect(() => {
    if (!error) return;
    const timeoutId = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timeoutId);
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) return;

    setError('');
    setMensaje('');
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/usuarios/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          direccion: formData.direccion,
          edad: formData.edad === '' ? null : Number(formData.edad)
        })
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo actualizar el perfil');
      }

      setUsuario((prev) => ({
        ...prev,
        nombre: formData.nombre,
        telefono: formData.telefono,
        direccion: formData.direccion,
        edad: formData.edad === '' ? null : Number(formData.edad)
      }));

      setMensaje('Datos actualizados correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="p-4">
        <h3 className="mb-3">Mi cuenta</h3>
        <div className="alert alert-warning">Necesitas iniciar sesion para ver esta seccion.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="mb-3">Mi cuenta</h3>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={isOffline || cargando}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            disabled
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Telefono</label>
          <input
            type="text"
            className="form-control"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            disabled={isOffline || cargando}
          />
        </div>
        <div className="col-md-8">
          <label className="form-label">Direccion</label>
          <input
            type="text"
            className="form-control"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            disabled={isOffline || cargando}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Edad</label>
          <input
            type="number"
            className="form-control"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            min="0"
            step="1"
            disabled={isOffline || cargando}
          />
        </div>

        {error && (
          <div className="col-12">
            <div className="alert alert-danger mb-0">{error}</div>
          </div>
        )}

        {mensaje && (
          <div className="col-12">
            <div className="alert alert-success mb-0">{mensaje}</div>
          </div>
        )}

        <div className="col-12">
          <button type="submit" className="btn btn-dark" disabled={isOffline || cargando}>
            {cargando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary ms-2"
            onClick={cargarPerfil}
            disabled={isOffline || cargando}
          >
            Recargar datos
          </button>
        </div>
      </form>
    </div>
  );
}
