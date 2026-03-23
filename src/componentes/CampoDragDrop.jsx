import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

const fileTypes = ["JPEG", "JPG", "PNG"];

export default function CampoDragDrop({ alSeleccionarImagen, archivoSeleccionado, isOffline }) {
  const [estaArrastrando, setEstaArrastrando] = useState(false);

  return (
    <FileUploader
      handleChange={alSeleccionarImagen}
      name="foto-producto"
      types={fileTypes}
      onDraggingStateChange={setEstaArrastrando}
      multiple={false}
      disabled={isOffline} // Deshabilita la subida
    >
      <div
        className={`drop-zone mb-3 ${estaArrastrando && !isOffline ? 'dragover' : ''}`}
        style={{ 
          minHeight: '80px',
          backgroundColor: isOffline ? '#e9ecef' : '', // Fondo gris si offline
          cursor: isOffline ? 'not-allowed' : 'pointer'
        }}
      >
        {estaArrastrando && !isOffline ? (
          'Suelta la imagen'
        ) : archivoSeleccionado ? (
          <div className="text-success">
            <strong>✓ {archivoSeleccionado.name}</strong>
            <div className="small mt-1">Clic para cambiar</div>
          </div>
        ) : (
          '' // Sin texto inicialmente según el PDF
        )}
      </div>
    </FileUploader>
  );
}