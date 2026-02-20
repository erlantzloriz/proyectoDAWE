import { listaProductos, agregarAlCarrito, registrarNuevoProducto, carrito } from './tienda.js';
import { truncarTexto } from './utils.js';

let paginaActual = 1;
const PRODUCTOS_POR_PAGINA = 6;
let productosFiltrados = [...listaProductos];

// Selectores
const gridProductos = document.getElementById("productos");
const buscador = document.getElementById("buscador");
const tituloMain = document.getElementById("titulo-main");
const selectorTipo = document.getElementById("tipo-nuevo");
const contenedorExtra = document.getElementById("contenedor-extra");
const labelExtra = document.getElementById("label-extra");
const form = document.getElementById("form-producto");
const carritoBody = document.getElementById("carrito-body");

document.addEventListener("DOMContentLoaded", () => {
    renderizarTienda();
    configurarEventosGlobales();
    renderCarrito();
});

function renderizarTienda() {
    if (!gridProductos) return;
    gridProductos.innerHTML = "";

    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const items = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

    items.forEach(p => {
        const col = document.createElement("div");
        col.className = "col";
        
        // Obtener el atributo extra específico del producto
        const atributoExtra = obtenerAtributoExtra(p);
        
        col.innerHTML = `
            <div class="card h-100 producto position-relative">
                <button class="btn-carrito-icon" data-id="${p.id}">🛒</button>
                <img src="${p.imagen || 'imagenes/productos/default.jpg'}" class="card-img-top img-detalles" style="cursor:pointer">
                <div class="card-body">
                    <h5 class="card-title">${truncarTexto(p.nombre, 20)}</h5>
                    <p class="fw-bold text-success">${p.precio}€</p>
                    ${atributoExtra ? `<p class="text-muted small mb-2"><strong>${atributoExtra.label}:</strong> ${atributoExtra.valor}</p>` : ''}
                    <p class="card-text small">${truncarTexto(p.descripcion, 60)}</p>
                </div>
            </div>
        `;
        // Evento para detalles
        col.querySelector(".img-detalles").onclick = () => mostrarDetalles(p);
        gridProductos.appendChild(col);
    });

    actualizarPaginacion();
}

// Función para obtener el atributo extra específico de cada tipo de producto
function obtenerAtributoExtra(producto) {
    if (producto.compania !== undefined) {
        return { label: "Compañía", valor: producto.compania };
    } else if (producto.jugadores !== undefined) {
        return { label: "Jugadores", valor: producto.jugadores };
    } else if (producto.editorial !== undefined) {
        return { label: "Editorial", valor: producto.editorial };
    } else if (producto.artista !== undefined) {
        return { label: "Artista", valor: producto.artista };
    } else if (producto.director !== undefined) {
        return { label: "Director", valor: producto.director };
    }
    return null;
}

// Delegación de eventos para el carrito
function configurarEventosGlobales() {
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-carrito-icon")) {
            const id = e.target.getAttribute("data-id");
            agregarAlCarrito(id);
            mostrarAvisoAñadido(e.target);
            renderCarrito();
        }
        
        // Evento para eliminar del carrito
        if (e.target.classList.contains("btn-eliminar-carrito")) {
            const id = e.target.getAttribute("data-id");
            delete carrito[id];
            renderCarrito();
        }
        
        // Evento para vaciar carrito completo
        if (e.target.classList.contains("btn-vaciar-carrito")) {
            if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
                Object.keys(carrito).forEach(key => delete carrito[key]);
                renderCarrito();
            }
        }
    });
    
    // Evento para cambiar cantidad en el carrito usando "input" para actualización en tiempo real
    document.addEventListener("input", (e) => {
        if (e.target.classList.contains("cantidad-carrito")) {
            const id = e.target.getAttribute("data-id");
            let cantidad = parseInt(e.target.value);
            
            if (isNaN(cantidad) || cantidad <= 0) {
                delete carrito[id];
                renderCarrito();
            } else if (cantidad > 20) {
                e.target.value = 20;
                carrito[id].cantidad = 20;
                renderCarrito();
            } else {
                carrito[id].cantidad = cantidad;
                renderCarrito();
            }
        }
    });

    // Manejo del selector de tipo
    selectorTipo.onchange = () => {
        const tipo = selectorTipo.value;
        if (!tipo) {
            contenedorExtra.style.display = "none";
        } else {
            contenedorExtra.style.display = "block";
            const etiquetas = { "Videojuego": "Compañía", "Libro": "Editorial", "Musica": "Artista", "Pelicula": "Director", "JuegoMesa": "Jugadores" };
            labelExtra.textContent = etiquetas[tipo] || "Dato Extra";
        }
    };
    
    // Configurar drag & drop para subir imágenes
    configurarDragAndDrop();
}

// Funcionalidad Drag & Drop
function configurarDragAndDrop() {
    const dropZone = document.getElementById("drop-zone");
    const fotoInput = document.getElementById("foto-producto");
    
    if (!dropZone || !fotoInput) return;
    
    // Prevenir comportamiento por defecto del navegador
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Resaltar zona al arrastrar
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });
    
    // Manejar el archivo soltado
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            if (validarTipoImagen(files[0])) {
                fotoInput.files = files;
                actualizarNombreArchivo(files[0]);
            } else {
                mostrarErrorImagen();
            }
        }
    }, false);
    
    // Actualizar nombre cuando se selecciona archivo normalmente
    fotoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            if (validarTipoImagen(e.target.files[0])) {
                actualizarNombreArchivo(e.target.files[0]);
            } else {
                mostrarErrorImagen();
                e.target.value = ''; // Limpiar el input
            }
        }
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function validarTipoImagen(file) {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    return tiposPermitidos.includes(file.type);
}

function mostrarErrorImagen() {
    const dropZone = document.getElementById("drop-zone");
    if (dropZone) {
        dropZone.innerHTML = `
            <div class="text-danger">
                <strong>✕ Error: Solo se permiten imágenes JPG/JPEG o PNG</strong>
                <div class="small mt-1">Formatos permitidos: JPG, JPEG, PNG</div>
            </div>
        `;
        // Volver al estado normal después de 3 segundos
        setTimeout(() => {
            dropZone.innerHTML = "Arrastra tu imagen aquí o haz clic";
        }, 3000);
    }
}

function actualizarNombreArchivo(file) {
    const dropZone = document.getElementById("drop-zone");
    if (dropZone && file) {
        dropZone.innerHTML = `
            <div class="text-success">
                <strong>✓ ${file.name}</strong>
                <div class="small mt-1">Clic para cambiar</div>
            </div>
        `;
    }
}

// Lógica de Paginación
function actualizarPaginacion() {
    const total = productosFiltrados.length;
    const info = document.getElementById("info-paginacion");
    info.textContent = `Mostrando ${Math.min(PRODUCTOS_POR_PAGINA, total)} de ${total} productos.`;

    const contenedorBtns = document.getElementById("paginacion-btns");
    contenedorBtns.innerHTML = "";
    
    const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA);
    
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm m-1 ${i === paginaActual ? 'btn-dark' : 'btn-outline-dark'}`;
        btn.textContent = i;
        btn.onclick = () => { paginaActual = i; renderizarTienda(); };
        contenedorBtns.appendChild(btn);
    }
}

// Buscador
buscador.oninput = () => {
    const q = buscador.value.toLowerCase().trim();
    tituloMain.textContent = q === "" ? "Todos los productos" : `Buscando: ${q}`;
    productosFiltrados = listaProductos.filter(p => p.nombre.toLowerCase().includes(q));
    paginaActual = 1;
    renderizarTienda();
};

// Formulario
form.onsubmit = (e) => {
    e.preventDefault();
    
    // Validar imagen si se ha seleccionado una
    const fotoInput = document.getElementById("foto-producto");
    if (fotoInput.files[0] && !validarTipoImagen(fotoInput.files[0])) {
        mostrarErrorImagen();
        return; // Detener el envío del formulario
    }
    
    const datos = {
        tipo: selectorTipo.value,
        nombre: document.getElementById("nombre-nuevo").value,
        precio: document.getElementById("precio-nuevo").value,
        descripcion: document.getElementById("desc-nuevo").value,
        extra: document.getElementById("extra-nuevo").value,
        imagen: fotoInput.files[0] ? URL.createObjectURL(fotoInput.files[0]) : null
    };
    registrarNuevoProducto(datos);
    productosFiltrados = [...listaProductos];
    renderizarTienda();
    form.reset();
    contenedorExtra.style.display = "none";
    
    // Resetear el drop-zone
    const dropZone = document.getElementById("drop-zone");
    if (dropZone) {
        dropZone.innerHTML = "Arrastra tu imagen aquí o haz clic";
    }
};

function mostrarAvisoAñadido(nodo) {
    const aviso = document.createElement("span");
    aviso.className = "badge bg-success position-absolute top-0 start-0 m-2";
    aviso.textContent = "¡Añadido!";
    nodo.parentElement.appendChild(aviso);
    setTimeout(() => aviso.remove(), 1000);
}

function mostrarDetalles(p) {
    const modal = document.createElement("div");
    modal.className = "detalles-overlay";
    const atributoExtra = obtenerAtributoExtra(p);
    
    modal.innerHTML = `
        <div class="detalles-modal p-4">
            <button class="btn-close float-end" id="close-modal"></button>
            <div class="row">
                <div class="col-md-5"><img src="${p.imagen || 'imagenes/productos/default.jpg'}" class="img-fluid"></div>
                <div class="col-md-7">
                    <h3>${p.nombre}</h3>
                    <p class="text-success fw-bold fs-4">${p.precio}€</p>
                    ${atributoExtra ? `<p class="mb-2"><strong>${atributoExtra.label}:</strong> <span class="text-muted">${atributoExtra.valor}</span></p>` : ''}
                    <div style="max-height:200px; overflow-y:auto">
                        <h5>Descripción:</h5>
                        <p>${p.descripcion}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("close-modal").onclick = () => modal.remove();
}

// Renderizar el carrito
function renderCarrito() {
    if (!carritoBody) return;
    
    carritoBody.innerHTML = "";
    const productosEntries = Object.entries(carrito);
    
    if (productosEntries.length === 0) {
        carritoBody.innerHTML = '<p class="text-muted text-center mt-4">El carrito está vacío.</p>';
        return;
    }
    
    let total = 0;
    
    productosEntries.forEach(([id, item]) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        const div = document.createElement("div");
        div.className = "producto-carrito mb-3 pb-3 border-bottom";
        div.innerHTML = `
            <div class="d-flex gap-2 align-items-start">
                <img src="${item.imagen || 'imagenes/productos/default.jpg'}" width="60" height="60" class="rounded" style="object-fit: cover;">
                <div class="flex-grow-1">
                    <strong class="d-block mb-1">${truncarTexto(item.nombre, 30)}</strong>
                    <div class="small text-muted">${item.precio}€ x 
                        <input type="number" min="1" max="20" value="${item.cantidad}" 
                               data-id="${id}" class="cantidad-carrito form-control form-control-sm d-inline-block" 
                               style="width: 60px;">
                        = <strong class="subtotal-${id}">${subtotal.toFixed(2)}€</strong>
                    </div>
                </div>
                <button class="btn btn-sm btn-danger btn-eliminar-carrito" data-id="${id}" title="Eliminar">✕</button>
            </div>
        `;
        carritoBody.appendChild(div);
    });
    
    const totalDiv = document.createElement("div");
    totalDiv.className = "mt-3 pt-3 border-top";
    totalDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Total:</h5>
            <h5 class="mb-0 text-success">${total.toFixed(2)}€</h5>
        </div>
        <button class="btn btn-success w-100 mb-2">Finalizar Compra</button>
        <button class="btn btn-outline-danger w-100 btn-sm btn-vaciar-carrito">Vaciar Carrito</button>
    `;
    carritoBody.appendChild(totalDiv);
}