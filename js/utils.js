
// Trunca una cadena de texto a un número máximo de líneas/caracteres añadiendo "..." automáticamente si se excede.(Requisito 3.6.1)

export const truncarTexto = (texto, limite) => {
    if (texto.length > limite) {
        return texto.substring(0, limite) + "...";
    }
    return texto;
};

//Calcula el número total de páginas necesarias.(Requisito 5.2)
 
export const calcularTotalPaginas = (totalItems, itemsPorPagina) => {
    return Math.ceil(totalItems / itemsPorPagina);
};

//Genera una URL temporal para previsualizar imágenes subidas.(Requisito 5.3)
 
export const generarUrlImagen = (archivo) => {
    if (!archivo) return null;
    return URL.createObjectURL(archivo);
};

//Valida si un archivo es de tipo JPG, JPEG o PNG. (Requisito 5.3)
 
export const esImagenValida = (archivo) => {
    const tiposValidos = ['image/jpeg', 'image/jpg', 'image/png'];
    return tiposValidos.includes(archivo.type);
};

// Función para hashear el nombre y generar ID único (Requisito 4.1.1)
export function generarId(nombre) {
    let hash = 0;
    if (nombre.length === 0) return hash;
    for (let i = 0; i < nombre.length; i++) {
        const char = nombre.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a 32bit integer
    }
    return "id_" + Math.abs(hash);
}