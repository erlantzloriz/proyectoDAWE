import { listaProductos, agregarAlCarrito, registrarNuevoProducto, carrito } from './tienda.js';
import { truncarTexto } from './utils.js';

let paginaActual = 1;
const PRODUCTOS_POR_PAGINA = 6;
let productosFiltrados = [...listaProductos];

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
        
        // Verificar si el producto tiene 20 copias en el carrito
        const cantidadEnCarrito = carrito[p.id] ? carrito[p.id].cantidad : 0;
        const botonDesactivado = cantidadEnCarrito >= 20;
        
        col.innerHTML = `
            <div class="card h-100 producto position-relative">
                <button class="btn-carrito-icon ${botonDesactivado ? 'disabled' : ''}" data-id="${p.id}" ${botonDesactivado ? 'disabled' : ''}>🛒</button>
                <img src="${p.imagen || 'imagenes/productos/default.jpg'}" class="card-img-top img-detalles" style="cursor:pointer">
                <div class="card-body">
                    <h5 class="card-title">${truncarTexto(p.nombre, 20)}</h5>
                    <p class="fw-bold text-success">${p.precio}€</p>
                    ${atributoExtra ? `<p class="text-muted small mb-2"><strong>${atributoExtra.label}:</strong> ${atributoExtra.valor}</p>` : ''}
                    <p class="card-text small">${truncarTexto(p.descripcion, 60)}</p>
                </div>
            </div>
        `;
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
            // No hacer nada si el botón está desactivado
            if (e.target.disabled) return;
            
            const id = e.target.getAttribute("data-id");
            agregarAlCarrito(id);
            mostrarAvisoAñadido(e.target);
            renderCarrito();
            renderizarTienda();
        }
        
        // Evento para eliminar del carrito
        if (e.target.classList.contains("btn-eliminar-carrito")) {
            const id = e.target.getAttribute("data-id");
            delete carrito[id];
            renderCarrito();
            renderizarTienda();
        }
        
        // Evento para vaciar carrito completo
        if (e.target.classList.contains("btn-vaciar-carrito")) {
            if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
                Object.keys(carrito).forEach(key => delete carrito[key]);
                renderCarrito();
                renderizarTienda();
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
                renderizarTienda();
            } else if (cantidad > 20) {
                e.target.value = 20;
                carrito[id].cantidad = 20;
                renderCarrito(id);
                renderizarTienda();
            } else {
                carrito[id].cantidad = cantidad;
                renderCarrito();
                renderizarTienda();
            }
        }
    });

    // Manejo del selector de tipo de producto
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
        
        // Validar que solo se suba un archivo
        if (files.length > 1) {
            mostrarErrorMultiplesArchivos();
            return;
        }
        
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
                e.target.value = '';
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

function mostrarErrorMultiplesArchivos() {
    const dropZone = document.getElementById("drop-zone");
    if (dropZone) {
        dropZone.innerHTML = `
            <div class="text-danger">
                <strong>✕ Error: Solo se permite subir 1 archivo</strong>
                <div class="small mt-1">Arrastra solo una imagen</div>
            </div>
        `;
        // Volver al estado normal después de 2 segundos
        setTimeout(() => {
            dropZone.innerHTML = "Arrastra tu imagen aquí o haz clic";
        }, 2000);
    }
}

function actualizarNombreArchivo(file) {
    const dropZone = document.getElementById("drop-zone");
    if (dropZone && file) {
        dropZone.innerHTML = `
            <div class="text-success">
                <strong>✓ ${file.name}</strong>
                <div class="small mt-1">Imagen cargada correctamente</div>
            </div>
        `;
        // Después de 1.5 segundos, cambiar solo el mensaje pero mantener el nombre del archivo
        setTimeout(() => {
            dropZone.innerHTML = `
                <div class="text-success">
                    <strong>✓ ${file.name}</strong>
                    <div class="small mt-1">Clic para cambiar</div>
                </div>
            `;
        }, 1500);
    }
}

function mostrarMensajeExito() {
    const form = document.getElementById("form-producto");
    if (!form) return;
    
    // Crear mensaje de éxito
    const mensaje = document.createElement("div");
    mensaje.className = "alert alert-success mt-3 mb-0";
    mensaje.innerHTML = `
        <strong>✓ ¡Producto registrado con éxito!</strong>
        <div class="small">El producto se ha añadido a la tienda</div>
    `;
    
    form.parentElement.appendChild(mensaje);
    
    // Eliminar después de 2 segundos
    setTimeout(() => {
        if (mensaje.parentElement) {
            mensaje.remove();
        }
    }, 2000);
}

function actualizarPaginacion() {
    const total = productosFiltrados.length;
    const info = document.getElementById("info-paginacion");
    
    // Calcular cuántos productos se están mostrando realmente en la página actual
    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const fin = Math.min(inicio + PRODUCTOS_POR_PAGINA, total);
    const mostrados = fin - inicio;
    
    info.textContent = `Mostrando ${mostrados} de ${total} productos.`;

    const contenedorBtns = document.getElementById("paginacion-btns");
    contenedorBtns.innerHTML = "";
    
    const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA);
    
    // Botón "Anterior" (solo si estamos en página 2 o superior)
    if (paginaActual > 1) {
        const btnAnterior = document.createElement("button");
        btnAnterior.className = "btn btn-sm btn-outline-dark m-1";
        btnAnterior.textContent = "Anterior";
        btnAnterior.onclick = () => { paginaActual--; renderizarTienda(); };
        contenedorBtns.appendChild(btnAnterior);
    }
    
    // Botones numerados
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm m-1 ${i === paginaActual ? 'btn-dark' : 'btn-outline-dark'}`;
        btn.textContent = i;
        btn.onclick = () => { paginaActual = i; renderizarTienda(); };
        contenedorBtns.appendChild(btn);
    }
    
    // Botón "Siguiente" (solo si hay al menos 2 páginas y no estamos en la última)
    if (totalPaginas > 1 && paginaActual < totalPaginas) {
        const btnSiguiente = document.createElement("button");
        btnSiguiente.className = "btn btn-sm btn-outline-dark m-1";
        btnSiguiente.textContent = "Siguiente";
        btnSiguiente.onclick = () => { paginaActual++; renderizarTienda(); };
        contenedorBtns.appendChild(btnSiguiente);
    }
}

buscador.oninput = () => {
    const q = buscador.value.toLowerCase().trim();
    tituloMain.textContent = q === "" ? "Todos los productos" : `Buscando por: ${q}`;
    productosFiltrados = listaProductos.filter(p => p.nombre.toLowerCase().includes(q));
    paginaActual = 1;
    renderizarTienda();
};

form.onsubmit = (e) => {
    e.preventDefault();
    
    // Validar imagen si se ha seleccionado una
    const fotoInput = document.getElementById("foto-producto");
    if (fotoInput.files[0] && !validarTipoImagen(fotoInput.files[0])) {
        mostrarErrorImagen();
        return; 
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
    
    const dropZone = document.getElementById("drop-zone");
    if (dropZone) {
        dropZone.innerHTML = "Arrastra tu imagen aquí o haz clic";
    }
    
    mostrarMensajeExito();
};

function mostrarAvisoAñadido(nodo) {
    const aviso = document.createElement("span");
    aviso.className = "badge bg-success position-absolute top-0 start-0 m-2";
    aviso.textContent = "¡Añadido!";
    nodo.parentElement.appendChild(aviso);
    setTimeout(() => aviso.remove(), 1000);
}

function mostrarAvisoLimite(id) {
    // Buscar el contenedor del producto usando el data-producto-id
    const productoDiv = document.querySelector(`.producto-carrito[data-producto-id="${id}"]`);
    if (!productoDiv) {
        console.log('No se encontró el producto con id:', id);
        return;
    }
    
    // Verificar si ya existe un aviso para no duplicar
    const avisoExistente = productoDiv.querySelector('.aviso-limite');
    if (avisoExistente) return;
    
    // Crear el aviso
    const aviso = document.createElement("div");
    aviso.className = "aviso-limite alert alert-danger py-2 px-3 mt-2 mb-0 small";
    aviso.style.fontSize = "0.85rem";
    aviso.textContent = "No se permiten más de 20 copias.";
    
    productoDiv.appendChild(aviso);
    
    // Eliminar después de 2 segundos
    setTimeout(() => {
        if (aviso.parentElement) {
            aviso.remove();
        }
    }, 2000);
}

function mostrarDetalles(p) {
    const modal = document.createElement("div");
    modal.className = "detalles-overlay";
    const atributoExtra = obtenerAtributoExtra(p);
    
    modal.innerHTML = `
        <div class="detalles-modal">
            <button class="btn-close btn-close-modal" id="close-modal"></button>
            <div class="detalles-img-container">
                <img src="${p.imagen || 'imagenes/productos/default.jpg'}" alt="${p.nombre}">
            </div>
            <div class="detalles-info">
                <h3 class="mb-3 fw-bold">${p.nombre}</h3>
                <p class="text-success fw-bold fs-4 mb-3">${p.precio}€</p>
                ${atributoExtra ? `<p class="mb-3"><strong>${atributoExtra.label}:</strong> <span class="text-muted">${atributoExtra.valor}</span></p>` : ''}
                <h5 class="mb-2">Descripción:</h5>
                <p class="text-justify">${p.descripcion}</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("close-modal").onclick = () => modal.remove();
    
    // Cerrar al hacer clic en el overlay (fondo)
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function renderCarrito(idConAviso = null) {
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
        div.setAttribute('data-producto-id', id);
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
    
    // Si hay un ID con aviso, mostrarlo después de que el DOM se actualice
    if (idConAviso) {
        setTimeout(() => mostrarAvisoLimite(idConAviso), 50);
    }
}