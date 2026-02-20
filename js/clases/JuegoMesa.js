import { Producto } from './Producto.js';

export class JuegoMesa extends Producto {
    #jugadores;

    constructor(nombre, precio, descripcion, imagen, jugadores) {
        super(nombre, precio, descripcion, imagen);
        this.#jugadores = jugadores; 
    }

    get jugadores() { return this.#jugadores; }
    set jugadores(valor) { this.#jugadores = valor; }
}