import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

const fileTypes = ["JPEG", "JPG", "PNG"];

export default function CampoDragDrop({ alSeleccionarImagen, archivoSeleccionado, isOffline }) {
  const [estaArrastrando, setEstaArrastrando] = useState(false);

  const handleSeleccion = (archivo) => {
    alSeleccionarImagen(archivo);
    setEstaArrastrando(false);
  };

  return (
    <FileUploader
      handleChange={handleSeleccion}
      name="foto-producto"
      types={fileTypes}
      hoverTitle="Suelta la imagen"
      onDraggingStateChange={setEstaArrastrando}
      multiple={false}
      classes="drop-uploader"
      disabled={isOffline}
    >
      <div className={`drop-zone mb-3 ${isOffline ? 'is-disabled' : ''} ${estaArrastrando && !isOffline ? 'dragover' : ''}`}>
        {estaArrastrando && !isOffline ? (
          <span className="drop-zone-message">Suelta la imagen</span>
        ) : archivoSeleccionado ? (
          <div className="text-success">
            <strong>✓ {archivoSeleccionado.name}</strong>
            <div className="small mt-1">Clic para cambiar</div>
          </div>
        ) : (
          null
        )}
      </div>
    </FileUploader>
  );
}