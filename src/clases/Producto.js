import { generarId } from '../utils.js';

export class Producto {
    #id;
    #nombre;
    #precio;
    #descripcion;
    #imagen;

    constructor(nombre, precio, descripcion, imagen) {
        this.#nombre = nombre;
        this.#precio = precio;
        this.#descripcion = descripcion;
        this.#imagen = imagen || "imagenes/no-image.png"; 
        this.#id = generarId(nombre); 
    }

    get id() { return this.#id; }

    get nombre() { return this.#nombre; }
    set nombre(valor) { this.#nombre = valor; }

    get precio() { return this.#precio; }
    set precio(valor) { this.#precio = valor; }

    get descripcion() { return this.#descripcion; }
    set descripcion(valor) { this.#descripcion = valor; }

    get imagen() { return this.#imagen; }
    set imagen(valor) { this.#imagen = valor; }
}