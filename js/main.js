import { listaProductos, agregarAlCarrito, registrarNuevoProducto, carrito } from './tienda.js';
import { truncarTexto } from './utils.js';

// --- ESTADO GLOBAL ---
let paginaActual = 1;
const PRODUCTOS_POR_PAGINA = 6; // Máximo por página (Requisito 821)
let productosFiltrados = [...listaProductos];

// --- SELECTORES ---
const gridProductos = document.getElementById("productos");
const buscador = document.getElementById("buscador");
const tituloPrincipal = document.getElementById("titulo-main");
const selectorTipo = document.getElementById("tipo-nuevo");
const contenedorExtra = document.getElementById("contenedor-extra");
const labelExtra = document.getElementById("label-extra");
const dropZone = document.getElementById("drop-zone");
const inputFoto = document.getElementById("foto-producto");
const form = document.getElementById("form-producto");

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    renderizarTienda();
});

// --- RENDERIZADO DE TIENDA Y PAGINACIÓN ---
function renderizarTienda() {
    if (!gridProductos) return;
    gridProductos.innerHTML = "";

    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const itemsVisibles = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

    itemsVisibles.forEach(p => {
        const card = document.createElement("div");
        card.className = "col";
        card.innerHTML = `
            <div class="card h-100 producto position-relative">
                <button class="btn-carrito-icon" data-id="${p.id}">🛒</button>
                <img src="${p.imagen || 'imagenes/productos/default.jpg'}" class="card-img-top" alt="${p.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${truncarTexto(p.nombre, 25)}</h5>
                    <p class="fw-bold text-primary">${p.precio}€</p>
                    <p class="card-text small text-muted">${truncarTexto(p.descripcion, 80)}</p>
                </div>
            </div>
        `;
        // Requisito 740: Descripción extendida al pinchar la imagen
        card.querySelector("img").onclick = () => mostrarDetalles(p);
        card.querySelector(".btn-carrito-icon").onclick = (e) => {
            agregarAlCarrito(p.id);
            mostrarAvisoAñadido(e.target);
        };
        gridProductos.appendChild(card);
    });

    actualizarControlesPaginacion();
}

function actualizarControlesPaginacion() {
    const total = productosFiltrados.length;
    const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA);
    const infoPag = document.getElementById("info-paginacion");
    
    // Requisito 628: Mostrar cantidad actual y total
    infoPag.textContent = `Mostrando ${Math.min(PRODUCTOS_POR_PAGINA, total - (paginaActual-1)*PRODUCTOS_POR_PAGINA)} de ${total} productos.`;

    const contenedorBotones = document.getElementById("paginacion-btns");
    contenedorBotones.innerHTML = "";

    // Botón Anterior (Requisito 641)
    if (paginaActual > 1) {
        const btnPrev = crearBtnPagina("Anterior", () => { paginaActual--; renderizarTienda(); });
        contenedorBotones.appendChild(btnPrev);
    }

    // Botones numéricos (Requisito 632)
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = crearBtnPagina(i, () => { paginaActual = i; renderizarTienda(); }, i === paginaActual);
        contenedorBotones.appendChild(btn);
    }

    // Botón Siguiente (Requisito 634)
    if (paginaActual < totalPaginas) {
        const btnNext = crearBtnPagina("Siguiente", () => { paginaActual++; renderizarTienda(); });
        contenedorBotones.appendChild(btnNext);
    }
}

function crearBtnPagina(texto, accion, activo = false) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm mx-1 ${activo ? 'btn-dark' : 'btn-outline-dark'}`;
    btn.textContent = texto;
    btn.onclick = accion;
    return btn;
}

// --- BUSCADOR (Requisito 5.1) ---
buscador.oninput = () => {
    const query = buscador.value.trim().toLowerCase();
    tituloPrincipal.textContent = query === "" ? "Todos los productos" : `Buscando por: ${query}`;
    
    productosFiltrados = listaProductos.filter(p => p.nombre.toLowerCase().includes(query));
    paginaActual = 1; // Reset a página 1 (Requisito 818)
    renderizarTienda();
};

// --- FORMULARIO Y CAMPO EXTRA (Requisito 5.3) ---
selectorTipo.onchange = () => {
    const tipo = selectorTipo.value;
    if (!tipo || tipo === "Escoge un tipo") {
        contenedorExtra.style.display = "none";
    } else {
        contenedorExtra.style.display = "block";
        const labels = { "Videojuego": "Compañía", "Libro": "Editorial", "Musica": "Artista", "Pelicula": "Director", "JuegoMesa": "Jugadores" };
        labelExtra.textContent = labels[tipo] || "Dato Extra";
    }
};

// --- DRAG & DROP (Requisito 840) ---
dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add("dragover"); };
dropZone.ondragleave = () => dropZone.classList.remove("dragover");
dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
        inputFoto.files = e.dataTransfer.files;
        const txtOriginal = dropZone.textContent;
        dropZone.textContent = "¡Elemento añadido!"; // Requisito 688
        setTimeout(() => dropZone.textContent = txtOriginal, 1500);
    }
};

// --- GESTIÓN DEL FORMULARIO ---
form.onsubmit = (e) => {
    e.preventDefault();
    const datos = {
        tipo: selectorTipo.value,
        nombre: document.getElementById("nombre-nuevo").value,
        precio: document.getElementById("precio-nuevo").value,
        descripcion: document.getElementById("desc-nuevo").value,
        extra: document.getElementById("extra-nuevo").value,
        imagen: inputFoto.files[0] ? URL.createObjectURL(inputFoto.files[0]) : null
    };

    registrarNuevoProducto(datos);
    productosFiltrados = [...listaProductos];
    renderizarTienda();
    form.reset();
    contenedorExtra.style.display = "none";
};

function mostrarAvisoAñadido(btn) {
    const aviso = document.createElement("div");
    aviso.className = "aviso-añadido";
    aviso.textContent = "¡Añadido!";
    btn.parentElement.appendChild(aviso);
    setTimeout(() => aviso.remove(), 1500);
}

// Requisito 3.9: Modal de detalles
function mostrarDetalles(p) {
    const overlay = document.createElement("div");
    overlay.className = "detalles-overlay";
    overlay.innerHTML = `
        <div class="detalles-modal shadow-lg">
            <button class="btn-close-modal">×</button>
            <div class="row g-0 h-100">
                <div class="col-md-5 d-flex align-items-center justify-content-center bg-light">
                    <img src="${p.imagen || 'imagenes/productos/default.jpg'}" class="img-fluid p-3" style="max-height: 80%">
                </div>
                <div class="col-md-7 p-4 detalles-scroll">
                    <h3>${p.nombre}</h3>
                    <p class="h4 text-primary">${p.precio}€</p>
                    <hr>
                    <p><strong>Detalle:</strong> ${p.extra || 'N/A'}</p>
                    <p>${p.descripcion.repeat(5)}</p> </div>
            </div>
        </div>
    `;
    overlay.querySelector(".btn-close-modal").onclick = () => overlay.remove();
    document.body.appendChild(overlay);
}