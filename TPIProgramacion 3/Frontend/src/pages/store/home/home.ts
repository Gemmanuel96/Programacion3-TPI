import type { ICategorias } from "../../../types/Categorias";
import type { Product } from "../../../types/Product";
import { logout } from "../../../utils/auth";

//Iniciamos un carrito si no existe
if (!localStorage.getItem("carrito")) {
    localStorage.setItem("carrito", JSON.stringify([]))
}

//Traemos los productos de la base de datos
const resCategorias = await fetch("/data/categorias.json");
const categorias: ICategorias[] = await resCategorias.json();

const resProductos = await fetch("/data/productos.json");
const productos: Product[] = await resProductos.json();



//Evento para mostrar todas las categorias y filtrar productos por categoria
function mostrarCategorias() {
    categorias.forEach(categoria => {
        crearCategoria(categoria);
    });
    const allProductos = document.querySelector<HTMLLIElement>("#all");
    allProductos?.addEventListener("click", () => {
        // Quitar activo de todas
        const todas = document.querySelectorAll("#list-categorias li");
        todas.forEach(c => c.classList.remove("activo"));

        // Marcar solo "Todos"
        allProductos.classList.add("activo");

        // Mostrar todos los productos
        mostrarProductos(productos);
    });
};

mostrarCategorias();


function mostrarProductos(productos: Product[]) {

    const contenedorProductos = document.querySelector<HTMLDivElement>("#items-productos");

    if (contenedorProductos) {
        contenedorProductos.innerHTML = "";
    }

    // Recorremos y mostramos cada producto
    productos.forEach(productos => {
        const art = articulo(productos, categorias);
        contenedorProductos?.appendChild(art);
    })
}

// Mostramos todos los productos al inicio
mostrarProductos(productos);



// 🔹 Evento de búsqueda en vivo
const buscador = document.querySelector<HTMLInputElement>("#buscador");
const contenedorProductos = document.querySelector('#productos-items');

buscador?.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    // Filtramos productos por coincidencia en nombre
    const filtrados: Product[] = productos.filter((p: Product) => p.nombre.toLowerCase().includes(texto));

    if (filtrados.length === 0 && contenedorProductos) {
        contenedorProductos.innerHTML = "";
        const cartel = document.createElement("h2");
        cartel.textContent = "No hay coincidencias en su búsqueda";
        cartel.classList.add("mensaje");
        contenedorProductos.appendChild(cartel);
    } else {
        mostrarProductos(filtrados);
    }
})

// 🔹 Función para mostrar alerta temporal al agregar producto


// 🔹 Actualizamos el valor del carrito en la barra superior
const valorCarrito = document.querySelector<HTMLSpanElement>("#valor-carrito");

function mostrarValorCarrito() {
    const carrito = localStorage.getItem("carrito");
    const carritoProdu: Product[] = carrito ? JSON.parse(carrito) : [];
    if (valorCarrito) {
        valorCarrito.textContent = carritoProdu.length.toString();
    }
}

mostrarValorCarrito();






//Boton para salir de la sesion
const btnSesion = document.querySelector<HTMLElement>("#btn-sesion");
if (btnSesion) {
    btnSesion.addEventListener("click", () => {
        logout();
    })
}

function renderPrincipal(producto: Product) {

    c
    
}


//FUnciones
function crearCategoria(categoria: ICategorias) {

    const listaCategorias = document.querySelector('#list-categorias');

    const li = crearElemento('li', "", categoria.nombre);
    listaCategorias?.append(li);

    li?.addEventListener("click", (Event: MouseEvent) => {

        Event.preventDefault();

        // 🔹 Quitar activo de todas
        const todas = document.querySelectorAll("#list-categorias li");
        todas.forEach(c => c.classList.remove("activo"));

        // 🔹 Marcar solo la clickeada
        li.classList.add("activo");

        // 🔹 Filtrar productos
        const contenedor = document.querySelector<HTMLDivElement>("#items-productos");
        const categoriaFiltro = categoria.nombre;

        const filtrados = productos.filter((p: Product) =>
            p.categorias.some((catId: any) => {
                const cat = categorias.find(c => c.id === catId);
                return cat?.nombre === categoriaFiltro;
            })
        );

        if (contenedor) {
            contenedor.innerHTML = "";
            mostrarProductos(filtrados);
        }
    })


}

function crearElemento(tag: string, clase?: string, texto?: string): HTMLElement {
    const elemento = document.createElement(tag);
    if (clase) elemento.classList.add(clase);
    if (texto) elemento.textContent = texto;
    return elemento;
}

//Funcion de agregar o eliminar elemento
function crearControles(): HTMLElement {
    const box = crearElemento('div', 'boxControles');
    const btnAdd = crearElemento('button', 'btnControl', '+');
    const valor = crearElemento('span', 'valor', '0');
    const btnSub = crearElemento('button', 'btnControl', '-');
    box.append(btnAdd, valor, btnSub);
    return box;
}

function crearControlesAgregar(): HTMLElement {
    const box = crearElemento('div', 'boxControlesAgregar');
    const btnAgregar = crearElemento('button', 'btnAgregar', 'Agregar a carrito');
    const btnVolver = crearElemento('button', 'btnVolver', 'Volver');
    box.append(btnAgregar, btnVolver);

    btnVolver.addEventListener("click", () => {

        const contProductos = document.querySelector(".cont-productos") as HTMLElement;
        const contCategorias = document.querySelector(".cont-categorias") as HTMLElement;
        const render = document.querySelector(".render-producto") as HTMLElement;

        contProductos.style.display = 'flex';
        contCategorias.style.display = 'block';
        render.style.display = 'none';
    
    })

    return box;
}


function articulo(producto: Product, categorias: ICategorias[]): HTMLElement {

    const articulo = crearElemento('article', 'card');

    // Caja de imagen
    const boxImagen = crearElemento('div', 'box-imagen');
    articulo.appendChild(boxImagen);
    const imagen: HTMLImageElement = crearElemento('img', 'imagen') as HTMLImageElement;
    imagen.src = producto.imagen;
    boxImagen.appendChild(imagen);


    // Caja de detalles
    const boxCaracteristicas = crearElemento('div', 'box-caracteristicas');
    const textoCategoria = producto.categorias
        .map((catId: any) => {
            const cat = categorias.find(c => c.id === catId);
            return cat?.nombre;
        })
        .join(", ")

    const categoria = crearElemento('p', 'categoria', textoCategoria);
    const titulo = crearElemento('h3', 'titulo', producto.nombre);
    const descripcion = crearElemento('p', 'descripcion', producto.descripcion);
    boxCaracteristicas.append(categoria, titulo, descripcion);


    //Box de precio y disponibilidad
    const boxDetalles = crearElemento('div', 'box-detalles');
    const textoPrecio = `$${producto.precio}`;
    const precio = crearElemento('p', 'precio', textoPrecio);

    let disponible: HTMLElement;

    if (producto.disponible) {
        disponible = crearElemento('p', 'disponible', 'Disponible') as HTMLElement;
        disponible.style.backgroundColor = 'green';

    } else {
        disponible = crearElemento('p', 'disponible', 'No disponible') as HTMLElement;
        disponible.style.backgroundColor = 'red';
    }
    boxDetalles.append(precio, disponible);

    articulo.append(boxImagen, boxCaracteristicas, boxDetalles);

    imagen.addEventListener('click', () => {
        renderPrincipal(producto);
    })

    return articulo;
}

