const buscador = document.getElementById("buscador");
const titulo = document.getElementById("titulo-main");
const contenedorProductos = document.getElementById("productos");

// Guardamos todos los productos originales
const productos = Array.from(contenedorProductos.children);

buscador.addEventListener("input", () => {
    const texto = buscador.value.trim().toLowerCase();

    // Actualizar título
    if (texto === "") {
        titulo.textContent = "Todos los productos";
    } else {
        titulo.textContent = `Buscando por: ${buscador.value}`;
    }

    // Filtrar productos
    productos.forEach(producto => {
        const nombre = producto
            .querySelector(".card-title")
            .textContent
            .toLowerCase();

        if (nombre.includes(texto)) {
            producto.style.display = "block";
        } else {
            producto.style.display = "none";
        }
    });
});

const botonesCarrito = document.querySelectorAll(".btn-carrito");
const cuerpoCarrito = document.querySelector(".offcanvas-body");

const carrito = {};

// Renderizar carrito
function renderCarrito() {
    cuerpoCarrito.innerHTML = "";

    const productos = Object.values(carrito);

    if (productos.length === 0) {
        cuerpoCarrito.innerHTML = "<p>No hay productos en el carrito.</p>";
        return;
    }

    let total = 0;

    productos.forEach(prod => {
        const subtotal = prod.precio * prod.cantidad;
        total += subtotal;

        const div = document.createElement("div");
        div.classList.add("producto-carrito");

        div.innerHTML = `
            <div class="d-flex gap-2 align-items-center mb-3">
                <img src="${prod.imagen}" width="60">
                <div>
                    <strong>${prod.nombre}</strong><br>
                    ${prod.precio}€ x 
                    <input type="number" min="0" max="20" value="${prod.cantidad}" 
                           data-nombre="${prod.nombre}" class="cantidad">
                    = ${subtotal}€
                </div>
            </div>
        `;

        cuerpoCarrito.appendChild(div);
    });

    const totalDiv = document.createElement("hr");
    cuerpoCarrito.appendChild(totalDiv);

    const totalTexto = document.createElement("p");
    totalTexto.innerHTML = `<strong>Total: ${total}€</strong>`;
    cuerpoCarrito.appendChild(totalTexto);

    activarEventosCantidad();
}

// Añadir producto
botonesCarrito.forEach(boton => {
    boton.addEventListener("click", () => {
        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);
        const imagen = boton.dataset.imagen;

        if (!carrito[nombre]) {
            carrito[nombre] = {
                nombre,
                precio,
                imagen,
                cantidad: 1
            };
        } else if (carrito[nombre].cantidad < 20) {
            carrito[nombre].cantidad++;
        }

        renderCarrito();
    });
});

// Cambiar cantidad
function activarEventosCantidad() {
    document.querySelectorAll(".cantidad").forEach(input => {
        input.addEventListener("change", () => {
            const nombre = input.dataset.nombre;
            let valor = Number(input.value);

            if (valor <= 0) {
                delete carrito[nombre];
            } else if (valor > 20) {
                input.value = 20;
                carrito[nombre].cantidad = 20;
            } else {
                carrito[nombre].cantidad = valor;
            }

            renderCarrito();
        });
    });
}

