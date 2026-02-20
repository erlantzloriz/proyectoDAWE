import { Producto } from './Producto.js';

export class Videojuego extends Producto {
    constructor(nombre, precio, descripcion, imagen, compania) {
        super(nombre, precio, descripcion, imagen);
        this._compania = compania; 
    }

    get compania() { return this._compania; }
    set compania(valor) { this._compania = valor; }
}