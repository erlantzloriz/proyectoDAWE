import { Videojuego } from './clases/Videojuego.js';
import { JuegoMesa } from './clases/JuegoMesa.js';

export let listaProductos = [];
export let carrito = {};

export async function cargarCatalogo() {
    try {
        const res = await fetch('./datos.json'); 
        if (!res.ok) throw new Error("No se encuentra el archivo datos.json");
        const datos = await res.json();
        
        // Limpiamos la lista antes de cargar para evitar duplicados
        listaProductos = []; 

        datos.forEach(p => {
            let prod;
            if (p.tipo === "Videojuego") {
                prod = new Videojuego(p.nombre, p.precio, p.descripcion, p.imagen, p.extra);
            } else {
                prod = new JuegoMesa(p.nombre, p.precio, p.descripcion, p.imagen, p.extra);
            }
            listaProductos.push(prod);
        });
    } catch (e) {
        console.error("Error en tienda.js:", e);
    }
}

export function agregarAlCarrito(id) {
    const p = listaProductos.find(prod => prod.id === id);
    if (!p) return;
    if (carrito[id]) {
        if (carrito[id].cantidad < 20) carrito[id].cantidad++;
    } else {
        carrito[id] = { nombre: p.nombre, precio: p.precio, imagen: p.imagen, cantidad: 1 };
    }
}

export function registrarNuevoProducto(datos) {
    let nuevo;
    if (datos.tipo === "Videojuego") {
        nuevo = new Videojuego(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    } else if (datos.tipo === "JuegoMesa") {
        nuevo = new JuegoMesa(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    } else {
        // Por si añades clase Puzzle más tarde
        nuevo = new JuegoMesa(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    }
    
    listaProductos.push(nuevo);
    return nuevo;
}