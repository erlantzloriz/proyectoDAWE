import { Producto } from './Producto.js';

export class Videojuego extends Producto {
    #compania;

    constructor(nombre, precio, descripcion, imagen, compania) {
        super(nombre, precio, descripcion, imagen);
        this.#compania = compania; 
    }

    get compania() { return this.#compania; }
    set compania(valor) { this.#compania = valor; }
}