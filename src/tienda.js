export const DIVISA = '€';
export const MAX_COPIAS = 20;

// 1. Guardar o actualizar un elemento del carrito en localStorage
export function guardarEnCarrito(id, productoCarrito) {
    // Se guarda el objeto JS como string 
    localStorage.setItem(`producto_${id}`, JSON.stringify(productoCarrito));
}

// 2. Borrar un producto por su ID del localStorage
export function borrarDelCarrito(id) {
    // Borra usando el substring 'producto_' seguido del ID 
    localStorage.removeItem(`producto_${id}`);
}

// 3. Cargar todo el carrito desde localStorage
export function cargarCarrito() {
    const carritoCargado = [];
    
    // Asumimos que puede haber más elementos en localStorage y filtramos 
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        
        if (clave && clave.startsWith('producto_')) {
            const id = clave.replace('producto_', '');
            const valor = localStorage.getItem(clave);
            if (!valor || valor === 'undefined' || valor === 'null') {
                localStorage.removeItem(clave);
                continue;
            }
            let producto;
            try {
                producto = JSON.parse(valor);
            } catch {
                localStorage.removeItem(clave);
                continue;
            }
            carritoCargado.push({ id, ...producto });
        }
    }
    return carritoCargado;
}


export function guardarEnFavoritos(id, productoFavorito) {
    localStorage.setItem(`favorito_${id}`, JSON.stringify(productoFavorito));
}

export function borrarDeFavoritos(id) {
    localStorage.removeItem(`favorito_${id}`);
}

export function cargarFavoritos() {
    const favoritosCargados = [];
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith('favorito_')) {
            const id = clave.replace('favorito_', '');
            const valor = localStorage.getItem(clave);
            if (!valor || valor === 'undefined' || valor === 'null') {
                localStorage.removeItem(clave);
                continue;
            }
            let producto;
            try {
                producto = JSON.parse(valor);
            } catch {
                localStorage.removeItem(clave);
                continue;
            }
            favoritosCargados.push({ id, ...producto });
        }
    }
    return favoritosCargados;
}

// Funciones para valoraciones
export function guardarValoracion(idProducto, valoracion) {
    // valoracion debe tener: { puntuacion, comentario, fecha }
    localStorage.setItem(`valoracion_${idProducto}`, JSON.stringify(valoracion));
}

export function cargarValoracion(idProducto) {
    const valoracion = localStorage.getItem(`valoracion_${idProducto}`);
    return valoracion ? JSON.parse(valoracion) : null;
}

export function cargarTodasValoraciones() {
    const valoraciones = [];
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith('valoracion_')) {
            const idProducto = clave.replace('valoracion_', '');
            const valoracion = JSON.parse(localStorage.getItem(clave));
            valoraciones.push({ idProducto, ...valoracion });
        }
    }
    return valoraciones;
}