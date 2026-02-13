import { Producto } from './Producto.js';

export class JuegoMesa extends Producto {
    constructor(nombre, precio, descripcion, imagen, jugadores) {
        super(nombre, precio, descripcion, imagen);
        this._jugadores = jugadores; 
    }

    get jugadores() { return this._jugadores; }
    set jugadores(valor) { this._jugadores = valor; }
}