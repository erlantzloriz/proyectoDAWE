import { Videojuego } from './clases/Videojuego.js';
import { JuegoMesa } from './clases/JuegoMesa.js';
import { Libro } from './clases/Libro.js';
import { Musica } from './clases/Musica.js';
import { Pelicula } from './clases/Pelicula.js';

export const DIVISA = '€';
export const MAX_COPIAS = 20;

export let listaProductos = [
    new Videojuego("Super Mario World", 20, "Aventura en 16 bits.", "imagenes/mario.jpg", "Nintendo"),
    new Videojuego("Zelda: A Link to the Past", 25, "Acción épica.", "imagenes/zelda.jpg", "Nintendo"),
    new Videojuego("Street Fighter II", 31, "Lucha clásica.", "imagenes/sf2.jpg", "Capcom"),
    
    new JuegoMesa("Catan", 40, "Estrategia y comercio.", "imagenes/catan.jpg", "4 jugadores"),
    new JuegoMesa("Monopoly", 30, "Negociación de propiedades.", "imagenes/monopoly.jpg", "6 jugadores"),
    new JuegoMesa("Dixit", 28, "Juego de cartas e imaginación.", "imagenes/dixit.jpg", "8 jugadores"),

    new Libro("Maus", 27.5, "Novela gráfica histórica.", "imagenes/maus.jpg", "Reservoir Books"),
    new Libro("13, Rúe del Percebe", 29, "Cómic clásico español.", "imagenes/13rue.jpg", "Bruguera"),
    new Libro("El Quijote", 15, "Clásico literario.", "imagenes/quijote.jpg", "Espasa"),

    new Musica("Abbey Road", 35, "Álbum de The Beatles.", "imagenes/beatles.jpg", "The Beatles"),
    new Musica("Thriller", 25, "Rey del pop.", "imagenes/thriller.jpg", "Michael Jackson"),
    new Musica("Discovery", 45, "Electrónica Daft Punk.", "imagenes/daft.jpg", "Daft Punk"),

    new Pelicula("Metrópolis", 18, "Cine expresionista.", "imagenes/metropolis.jpg", "Fritz Lang"),
    new Pelicula("El Padrino", 20, "Drama criminal.", "imagenes/padrino.jpg", "F.F. Coppola"),
    new Pelicula("Pulp Fiction", 22, "Cine de culto.", "imagenes/pulp.jpg", "Quentin Tarantino")
];

export async function cargarCatalogo() {
    try {
        const res = await fetch('./datos.json'); 
        if (!res.ok) throw new Error("No se encuentra el archivo datos.json");
        const datos = await res.json();
        
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
            // Parseamos cada elemento y lo guardamos en un array
            const producto = JSON.parse(localStorage.getItem(clave));
            carritoCargado.push({ id, ...producto });
        }
    }
    return carritoCargado;
}

export function registrarNuevoProducto(datos) {
    let nuevo;
    if (datos.tipo === "Videojuego") {
        nuevo = new Videojuego(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    } else if (datos.tipo === "JuegoMesa") {
        nuevo = new JuegoMesa(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    } else if (datos.tipo === "Libro") {
        nuevo = new Libro(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    } else if (datos.tipo === "Musica") {
        nuevo = new Musica(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    } else if (datos.tipo === "Pelicula") {
        nuevo = new Pelicula(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    } else {
        nuevo = new JuegoMesa(datos.nombre, datos.precio, datos.descripcion, datos.imagen, datos.extra);
    }
    
    listaProductos.push(nuevo);
    return nuevo;
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
            const producto = JSON.parse(localStorage.getItem(clave));
            favoritosCargados.push({ id, ...producto });
        }
    }
    return favoritosCargados;
}