import { Videojuego } from './clases/Videojuego.js';
import { JuegoMesa } from './clases/JuegoMesa.js';
import { Libro } from './clases/Libro.js';
import { Musica } from './clases/Musica.js';
import { Pelicula } from './clases/Pelicula.js';

export let carrito = {};

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