import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

// Tipos de archivo permitidos ("image/jpeg,image/jpg,image/png")
const fileTypes = ["JPEG", "JPG", "PNG"];

export default function CampoDragDrop({ alSeleccionarImagen }) {
  const [estaArrastrando, setEstaArrastrando] = useState(false);

  // Esta función se ejecuta cuando la librería detecta que un archivo entra o sale de la zona
  const manejarCambioArrastre = (arrastrando) => {
    setEstaArrastrando(arrastrando);
  };

  return (
    <FileUploader
      handleChange={alSeleccionarImagen}
      name="foto-producto"
      types={fileTypes}
      onDraggingStateChange={manejarCambioArrastre}
      multiple={false}
      // Al pasar un componente hijo, anulamos el diseño por defecto de la librería
    >
      <div 
        className={`drop-zone mb-3 ${estaArrastrando ? 'dragover' : ''}`}
        style={{ minHeight: '80px' }} // Aseguramos que la caja no colapse cuando esté vacía
      >
        {/* Lógica de renderizado condicional del texto */}
        {estaArrastrando ? "Suelta la imagen" : ""}
      </div>
    </FileUploader>
  );
}