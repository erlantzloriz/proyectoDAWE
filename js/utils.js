export const truncarTexto = (texto, limite) => {
    if (texto.length > limite) {
        return texto.substring(0, limite) + "...";
    }
    return texto;
};
 
export const calcularTotalPaginas = (totalItems, itemsPorPagina) => {
    return Math.ceil(totalItems / itemsPorPagina);
};

export const generarUrlImagen = (archivo) => {
    if (!archivo) return null;
    return URL.createObjectURL(archivo);
};

export const esImagenValida = (archivo) => {
    const tiposValidos = ['image/jpeg', 'image/jpg', 'image/png'];
    return tiposValidos.includes(archivo.type);
};

export function generarId(nombre) {
    let hash = 0;
    if (nombre.length === 0) return hash;
    for (let i = 0; i < nombre.length; i++) {
        const char = nombre.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return "id_" + Math.abs(hash);
}