import { useState } from 'react';
import CampoDragDrop from './CampoDragDrop.jsx';

const ETIQUETAS_EXTRA = {
  Videojuego: 'Compañía',
  Libro: 'Editorial',
  Musica: 'Artista',
  Pelicula: 'Director',
  JuegoMesa: 'Jugadores',
};

export default function FormularioProducto({ onRegistrar, isOffline }) {
  const [tipo, setTipo] = useState('');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [extra, setExtra] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const datos = {
      tipo,
      nombre,
      precio,
      descripcion,
      extra,
      imagen: archivo ? URL.createObjectURL(archivo) : null,
    };
    onRegistrar(datos);
    setTipo('');
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setExtra('');
    setArchivo(null);
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 2000);
  };

 return (
    <>
      <form onSubmit={handleSubmit}>
        <select
          className="form-select mb-2"
          value={tipo}
          onChange={(e) => { setTipo(e.target.value); setExtra(''); }}
          required
          disabled={isOffline}
        >
          <option value="" disabled>Escoge un tipo</option>
          <option value="Videojuego">Videojuego</option>
          <option value="Libro">Libro</option>
          <option value="Musica">Música</option>
          <option value="Pelicula">Película</option>
          <option value="JuegoMesa">Juego de Mesa</option>
        </select>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={isOffline}
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Precio (€)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
          step="0.01"
          disabled={isOffline}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Descripción breve..."
          rows="3"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={isOffline}
        />

        {tipo && (
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">
              {ETIQUETAS_EXTRA[tipo] || 'Dato Extra'}
            </label>
            <input
              type="text"
              className="form-control"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              disabled={isOffline}
            />
          </div>
        )}

        {/* Le pasamos isOffline a nuestro componente hijo */}
        <CampoDragDrop alSeleccionarImagen={setArchivo} archivoSeleccionado={archivo} isOffline={isOffline} />

        <button type="submit" className="btn btn-dark w-100" disabled={isOffline}>
          Registrar Producto
        </button>
      </form>
      {mensajeExito && (
        <div className="alert alert-success mt-3 mb-0">
          <strong>✓ ¡Producto registrado con éxito!</strong>
          <div className="small">El producto se ha añadido a la tienda</div>
        </div>
      )}
    </>
  );
}
