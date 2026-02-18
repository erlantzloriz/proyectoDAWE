import { Producto } from './Producto.js';

export class Musica extends Producto {
    #artista;

    constructor(nombre, precio, descripcion, imagen, artista) {
        super(nombre, precio, descripcion, imagen);
        this.#artista = artista;
    }

    get artista() { return this.#artista; }
    set artista(valor) { this.#artista = valor; }
}