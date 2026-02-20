import { generarId } from '../utils.js';

export class Producto {
    constructor(nombre, precio, descripcion, imagen) {
        this._nombre = nombre;
        this._precio = precio;
        this._descripcion = descripcion;
        this._imagen = imagen || "imagenes/no-image.png"; 
        this._id = generarId(nombre); 
    }

    get id() { return this._id; }

    get nombre() { return this._nombre; }
    set nombre(valor) { this._nombre = valor; }

    get precio() { return this._precio; }
    set precio(valor) { this._precio = valor; }

    get descripcion() { return this._descripcion; }
    set descripcion(valor) { this._descripcion = valor; }

    get imagen() { return this._imagen; }
    set imagen(valor) { this._imagen = valor; }
}