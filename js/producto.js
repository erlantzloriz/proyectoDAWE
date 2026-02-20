import { generarId } from '../utils.js';

export class Producto {
    #id;
    #nombre;
    #precio;
    #descripcion;
    #imagen;

    constructor(nombre, precio, descripcion, imagen) {
        // Generar ID único (Requisito 4.1.1)
        this.#id = Math.random().toString(36).substr(2, 9);
        this.#nombre = nombre;
        this.#precio = precio;
        this.#descripcion = descripcion;
        this.#imagen = imagen;
    }

    get id() { return this.#id; }
    get nombre() { return this.#nombre; }
    set nombre(v) { this.#nombre = v; }
    get precio() { return this.#precio; }
    set precio(v) { this.#precio = v; }
    get descripcion() { return this.#descripcion; }
    set descripcion(v) { this.#descripcion = v; }
    get imagen() { return this.#imagen; }
    set imagen(v) { this.#imagen = v; }
}