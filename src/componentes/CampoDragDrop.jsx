import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

const fileTypes = ["JPEG", "JPG", "PNG"];

export default function CampoDragDrop({ alSeleccionarImagen, archivoSeleccionado }) {
  const [estaArrastrando, setEstaArrastrando] = useState(false);

  return (
    <FileUploader
      handleChange={alSeleccionarImagen}
      name="foto-producto"
      types={fileTypes}
      onDraggingStateChange={setEstaArrastrando}
      multiple={false}
    >
      <div
        className={`drop-zone mb-3 ${estaArrastrando ? 'dragover' : ''}`}
        style={{ minHeight: '80px' }}
      >
        {estaArrastrando ? (
          'Suelta la imagen'
        ) : archivoSeleccionado ? (
          <div className="text-success">
            <strong>✓ {archivoSeleccionado.name}</strong>
            <div className="small mt-1">Clic para cambiar</div>
          </div>
        ) : (
          'Arrastra tu imagen aquí o haz clic'
        )}
      </div>
    </FileUploader>
  );
}