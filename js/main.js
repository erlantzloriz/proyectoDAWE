import { listaProductos, cargarCatalogo, agregarAlCarrito, registrarNuevoProducto } from './tienda.js';
import { calcularTotalPaginas, truncarTexto, esImagenValida } from './utils.js';

const contenedor = document.getElementById("productos");
const buscador = document.getElementById("buscador");
let paginaActual = 1;
let productosFiltrados = listaProductos;

async function init() {
    await cargarCatalogo();
    renderizarProductos(listaProductos);
}

function renderizarProductos(lista) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Si la lista está vacía, no intentamos iterar
    if (lista.length === 0) {
        contenedor.innerHTML = "<p class='p-3'>No se han encontrado productos.</p>";
        return;
    }

    // Lógica de Paginación (Requisito 5.2)
    const inicio = (paginaActual - 1) * 6; // 6 productos por página
    const fin = inicio + 6;
    const productosVisibles = lista.slice(inicio, fin);

    lista.forEach(prod => {
        // Validación de seguridad para evitar el error de 'prod is undefined'
        if (!prod) return;

        // Requisito 4.1.2: Acceder al atributo extra según la clase
        let valorExtra = "";
        if (prod instanceof Videojuego) valorExtra = `Compañía: ${prod.compania}`;
        else if (prod instanceof JuegoMesa) valorExtra = `Jugadores: ${prod.jugadores}`;
        else if (prod instanceof Libro) valorExtra = `Editorial: ${prod.editorial}`;
        else if (prod instanceof Musica) valorExtra = `Artista: ${prod.artista}`;
        else if (prod instanceof Pelicula) valorExtra = `Director: ${prod.director}`;

        contenedor.innerHTML += `
            <div class="col">
                <div class="card h-100 producto card-custom"> 
                    <button class="btn btn-carrito" data-id="${prod.id}">🛒</button>
                    <img src="${prod.imagen || 'imagenes/default.png'}" class="card-img-top">
                    <div class="card-body">
                        <h5>${truncarTexto(prod.nombre, 25)}</h5>
                        <p class="fw-bold">${prod.precio}€</p>
                        <p class="text-muted small">${valorExtra}</p>
                        <p class="card-text">${truncarTexto(prod.descripcion, 100)}</p>
                    </div>
                </div>
            </div>`;
    });
    
    configurarEventosBotones();
    renderizarPaginacion(lista.length); 
}


function renderizarPaginacion(totalProductos) {
    const totalPaginas = Math.ceil(totalProductos / 6);
    const navPaginacion = document.getElementById("paginacion-controls");
    
    // Texto informativo: "Mostrando X de Y productos" 
    let html = `<p>Mostrando ${Math.min(6, totalProductos)} de ${totalProductos} productos.</p>`;
    html += `<ul class="pagination">`;

    if (paginaActual > 1) {
        html += `<li class="page-item"><button class="page-link" id="btn-prev">Anterior</button></li>`;
    }

    for (let i = 1; i <= totalPaginas; i++) {
        html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <button class="page-link btn-page" data-page="${i}">${i}</button>
                 </li>`;
    }

    if (paginaActual < totalPaginas) {
        html += `<li class="page-item"><button class="page-link" id="btn-next">Siguiente</button></li>`;
    }

    navPaginacion.innerHTML = html + `</ul>`;

    // Eventos de los botones
    document.querySelectorAll(".btn-page").forEach(btn => {
        btn.onclick = () => { paginaActual = parseInt(btn.dataset.page); renderizarProductos(productosFiltrados); };
    });
    if(document.getElementById("btn-prev")) 
        document.getElementById("btn-prev").onclick = () => { paginaActual--; renderizarProductos(productosFiltrados); };
    if(document.getElementById("btn-next")) 
        document.getElementById("btn-next").onclick = () => { paginaActual++; renderizarProductos(productosFiltrados); };
}
    

function configurarEventosBotones() {
    document.querySelectorAll(".btn-carrito").forEach(btn => {
        btn.onclick = () => {
            agregarAlCarrito(btn.dataset.id);
            pintarCarrito();
            
            // Requisito: Aviso temporal de éxito
            const aviso = document.createElement("span");
            aviso.className = "badge bg-success position-absolute";
            aviso.textContent = "¡Añadido!";
            btn.parentElement.appendChild(aviso);
            setTimeout(() => aviso.remove(), 1500);
        };
    });
}

function pintarCarrito() {
    const cuerpo = document.getElementById("carrito-body");
    const items = Object.values(carrito);
    if (items.length === 0) {
        cuerpo.innerHTML = "<p>El carrito está vacío.</p>";
        return;
    }
    let html = "";
    let total = 0;
    items.forEach(item => {
        total += item.precio * item.cantidad;
        html += `<div class="mb-2 border-bottom pb-2">
            <strong>${item.nombre}</strong><br>
            ${item.cantidad} x ${item.precio}€ = ${(item.cantidad * item.precio).toFixed(2)}€
        </div>`;
    });
    cuerpo.innerHTML = html + `<div class="mt-2"><strong>Total: ${total.toFixed(2)}€</strong></div>`;
}

if (buscador) {
    buscador.oninput = () => {
        const query = buscador.value.toLowerCase();
        const tituloMain = document.getElementById("titulo-main"); 
        
        // Actualizar título 
        tituloMain.textContent = query === "" ? "Todos los productos" : `Buscando por: ${query}`;

        productosFiltrados = listaProductos.filter(p => 
            p.nombre.toLowerCase().includes(query)
        );
        paginaActual = 1; //  Volver a la página 1 al filtrar
        renderizarProductos(productosFiltrados);
    };
}

init();

const form = document.getElementById("form-producto");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const tipo = document.getElementById("tipo-nuevo").value;

        // Requisito: Validar selección de tipo 
        if (tipo === "" || tipo === "Escoge un tipo") {
            alert("Es necesario escoger un valor de tipo");
            return;
        }

        // 1. Capturar el archivo de imagen (Solo una vez)
        const archivoInput = document.querySelector('input[type="file"]');
        const archivo = archivoInput.files[0];
    
        // Requisito: Validar formato de imagen
        if (archivo && !['image/jpeg', 'image/png', 'image/jpg'].includes(archivo.type)) {
            alert("La imagen debe ser JPG/JPEG o PNG");
            return;
        }
        
        // Requisito: Crear URL temporal o usar la de por defecto 
        let imagenURL = "imagenes/productos/default.jpg"; 
        if (archivo) {
            imagenURL = URL.createObjectURL(archivo);
        }

        // 2. Recoger datos del formulario 
        const nuevoProdDatos = {
            tipo: tipo,
            nombre: document.getElementById("nombre-nuevo").value,
            precio: document.getElementById("precio-nuevo").value,
            descripcion: document.getElementById("desc-nuevo").value,
            extra: document.getElementById("extra-nuevo").value,
            imagen: imagenURL
        };

        // 3. Registrar en la lógica de la tienda 
        registrarNuevoProducto(nuevoProdDatos);

        // 4. Actualizar lista y paginación  
        productosFiltrados = [...listaProductos]; // Actualizamos la lista de búsqueda
        renderizarProductos(productosFiltrados);

        // 5. Limpiar formulario y mostrar mensaje temporal  
        form.reset();
        
        // Reemplazo del alert por un mensaje temporal en el formulario
        const avisoExito = document.getElementById("mensaje-exito"); // HAy que tener este ID en el HTML
        avisoExito.textContent = "¡Producto añadido con éxito!";
        avisoExito.style.display = "block";
        
        setTimeout(() => {
            avisoExito.style.display = "none";
        }, 2000); 
    });
}
