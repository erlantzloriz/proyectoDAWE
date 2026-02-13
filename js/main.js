import { listaProductos, cargarCatalogo, agregarAlCarrito, registrarNuevoProducto } from './tienda.js';

const contenedor = document.getElementById("productos");
const buscador = document.getElementById("buscador");

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

    lista.forEach(prod => {
        // Validación de seguridad para evitar el error de 'prod is undefined'
        if (!prod) return;

        let extraLabel = "";
        // Comprobamos la clase real para cumplir con el enunciado
        if (prod.constructor.name === "Videojuego") {
            extraLabel = `Compañía: ${prod._compania || 'N/A'}`;
        } else if (prod.constructor.name === "JuegoMesa") {
            extraLabel = `Jugadores: ${prod._jugadores || 'N/A'}`;
        }

        contenedor.innerHTML += `
            <div class="col">
                <div class="card h-100 producto">
                    <button class="btn btn-carrito" data-id="${prod.id}">🛒</button>
                    <img src="${prod.imagen}" class="card-img-top" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="card-body">
                        <h5>${prod.nombre}</h5>
                        <p class="fw-bold">${prod.precio}€</p>
                        <p class="text-muted small">${extraLabel}</p>
                        <p class="card-text">${prod.descripcion}</p>
                    </div>
                </div>
            </div>`;
    });
    
    configurarEventosBotones();
}

function configurarEventosBotones() {
    document.querySelectorAll(".btn-carrito").forEach(btn => {
        btn.onclick = () => {
            agregarAlCarrito(btn.dataset.id);
            pintarCarrito();
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
        const filtrados = listaProductos.filter(p => 
            p.nombre.toLowerCase().includes(buscador.value.toLowerCase())
        );
        renderizarProductos(filtrados);
    };
}

init();

const form = document.getElementById("form-producto");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // 1. Capturar el archivo de imagen
        const archivoInput = document.querySelector('input[type="file"]');
        const archivo = archivoInput.files[0];
        
        // Creamos una URL temporal para la imagen (o una por defecto si no hay archivo)
        let imagenURL = "imagenes/productos/default.jpg"; 
        if (archivo) {
            imagenURL = URL.createObjectURL(archivo);
        }

        // 2. Recoger datos del formulario
        const nuevoProdDatos = {
            tipo: document.getElementById("tipo-nuevo").value,
            nombre: document.getElementById("nombre-nuevo").value,
            precio: document.getElementById("precio-nuevo").value,
            descripcion: document.getElementById("desc-nuevo").value,
            extra: document.getElementById("extra-nuevo").value,
            imagen: imagenURL
        };

        // 3. Registrar en la lógica de la tienda
        registrarNuevoProducto(nuevoProdDatos);

        // 4. Volver a pintar la lista
        renderizarProductos(listaProductos);

        // 5. Limpiar formulario
        form.reset();
        alert("Producto subido con éxito (en memoria)");
    });
}