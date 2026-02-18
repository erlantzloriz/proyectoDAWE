import { Producto } from './Producto.js';

export class Pelicula extends Producto {
    #director;

    constructor(nombre, precio, descripcion, imagen, director) {
        super(nombre, precio, descripcion, imagen);
        this.#director = director;
    }

    get director() { return this.#director; }
    set director(valor) { this.#director = valor; }
}