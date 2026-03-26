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
    <div className={`dd-field mb-3 ${isOffline ? 'is-disabled' : ''}`}>
      <div className="dd-row">
        <FileUploader
          handleChange={handleSeleccion}
          name="foto-producto-select"
          types={fileTypes}
          multiple={false}
          classes="dd-select-uploader"
          disabled={isOffline}
        >
          <button type="button" className="dd-select-btn" disabled={isOffline}>
            Seleccionar archivo
          </button>
        </FileUploader>

        <div className="dd-file-name">
          {archivoSeleccionado ? archivoSeleccionado.name : 'Sin archivos seleccionados'}
        </div>
      </div>

      <div className="dd-help">O suelta la imagen aquí</div>

      <FileUploader
        handleChange={handleSeleccion}
        name="foto-producto-drop"
        types={fileTypes}
        hoverTitle="Suelta la imagen"
        onDraggingStateChange={setEstaArrastrando}
        multiple={false}
        classes="dd-drop-uploader"
        disabled={isOffline}
      >
        <div className={`dd-drop-target ${estaArrastrando && !isOffline ? 'dragover' : ''}`}>
          {estaArrastrando && !isOffline ? <span className="drop-zone-message"></span> : null}
        </div>
      </FileUploader>
    </div>
  );
}