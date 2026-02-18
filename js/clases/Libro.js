import { Producto } from './Producto.js';

export class Libro extends Producto {
    #editorial;

    constructor(nombre, precio, descripcion, imagen, editorial) {
        super(nombre, precio, descripcion, imagen);
        this.#editorial = editorial;
    }

    get editorial() { return this.#editorial; }
    set editorial(valor) { this.#editorial = valor; }
}