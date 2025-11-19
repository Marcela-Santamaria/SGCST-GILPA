// inventario_almacenes.js

const API_URL = 'http://localhost:3000/api';
const almacenSearchInput = document.getElementById('almacen-search');
const almacenListUl = document.getElementById('almacen-list');

let allAlmacenes = []; // Almacenará todos los almacenes para filtrado
let selectedAlmacenCodigo = null; // Guardará el código del almacén seleccionado

// =========================================================
// FUNCIONES DE DIBUJO Y SELECCIÓN
// =========================================================

/**
 * Dibuja la lista de almacenes en la interfaz.
 * @param {Array} almacenesToDisplay - Lista de almacenes a mostrar.
 */
function drawAlmacenesList(almacenesToDisplay) {
    almacenListUl.innerHTML = ''; // Limpiar la lista existente

    if (almacenesToDisplay.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No hay almacenes disponibles.';
        li.classList.add('almacen-list-item');
        almacenListUl.appendChild(li);
        return;
    }

    almacenesToDisplay.forEach(almacen => {
        const li = document.createElement('li');
        li.textContent = `${almacen.codigo} ${almacen.nombre}`;
        li.classList.add('almacen-list-item');
        li.dataset.codigo = almacen.codigo; // Guardar el código en el dataset

        // Marcar como seleccionado si coincide
        if (almacen.codigo === selectedAlmacenCodigo) {
            li.classList.add('selected');
        }

        almacenListUl.appendChild(li);
    });
}

// =========================================================
// MANEJADORES DE DATOS Y ACCIONES
// =========================================================

/**
 * Carga todos los almacenes desde el backend.
 */
async function loadAlmacenes() {
    try {
        const response = await fetch(`${API_URL}/almacenes`);
        const data = await response.json();

        if (response.ok && data.success) {
            allAlmacenes = data.almacenes;
            drawAlmacenesList(allAlmacenes);
        } else {
            const li = document.createElement('li');
            li.textContent = `Error al cargar almacenes: ${data.message}`;
            almacenListUl.appendChild(li);
        }
    } catch (error) {
        console.error('Error de conexión al cargar almacenes:', error);
        const li = document.createElement('li');
        li.textContent = 'Error de conexión con el servidor.';
        almacenListUl.appendChild(li);
    }
}

/**
 * Filtra la lista de almacenes basándose en la entrada del usuario.
 */
function filterAlmacenes() {
    const searchTerm = almacenSearchInput.value.toLowerCase().trim();
    const filteredAlmacenes = allAlmacenes.filter(almacen =>
        almacen.codigo.toLowerCase().includes(searchTerm) ||
        almacen.nombre.toLowerCase().includes(searchTerm)
    );
    drawAlmacenesList(filteredAlmacenes);
}

/**
 * Maneja el clic en un elemento de la lista de almacenes.
 * Selecciona el almacén y redirige a la ventana de ítems.
 */
function handleAlmacenClick(event) {
    const clickedItem = event.target.closest('.almacen-list-item');
    if (clickedItem && clickedItem.dataset.codigo) {
        // Desmarcar cualquier otro elemento seleccionado
        almacenListUl.querySelectorAll('.almacen-list-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Marcar el elemento actual como seleccionado
        clickedItem.classList.add('selected');
        selectedAlmacenCodigo = clickedItem.dataset.codigo;

        // Redirigir a la ventana de ítems, pasando el código del almacén
        window.location.href = `inventario_items.html?almacenCodigo=${selectedAlmacenCodigo}&almacenNombre=${encodeURIComponent(clickedItem.textContent)}`;
    }
}

// =========================================================
// INICIALIZACIÓN Y LISTENERS
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    loadAlmacenes(); // Cargar todos los almacenes al iniciar

    // Listener para el campo de búsqueda/filtro
    almacenSearchInput.addEventListener('input', filterAlmacenes);

    // Listener para los clics en los ítems de la lista
    almacenListUl.addEventListener('click', handleAlmacenClick);
});
