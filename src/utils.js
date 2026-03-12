const modulos = import.meta.glob('./assets/imagenes/*.{jpg,jpeg,png}', { eager: true, import: 'default' });
import noImage from './assets/imagenes/no-image.svg';

export function resolverImagen(ruta) {
    if (!ruta) return noImage;
    if (ruta.startsWith('blob:') || ruta.startsWith('http') || ruta.startsWith('data:')) return ruta;
    const nombre = ruta.split('/').pop();
    const key = `./assets/imagenes/${nombre}`;
    return modulos[key] || ruta;
}

export function truncarTexto(texto, limite) {
    if (texto.length > limite) {
        return texto.substring(0, limite) + "...";
    }
    return texto;
}

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

export function obtenerAtributoExtra(producto) {
    if (producto.compania !== undefined) {
        return { label: "Compañía", valor: producto.compania };
    } else if (producto.jugadores !== undefined) {
        return { label: "Jugadores", valor: producto.jugadores };
    } else if (producto.editorial !== undefined) {
        return { label: "Editorial", valor: producto.editorial };
    } else if (producto.artista !== undefined) {
        return { label: "Artista", valor: producto.artista };
    } else if (producto.director !== undefined) {
        return { label: "Director", valor: producto.director };
    }
    return null;
}
