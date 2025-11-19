// inventario_items.js

const API_URL = 'http://localhost:3000/api';
const almacenDisplay = document.getElementById('almacen-display');
const itemCodeSearchInput = document.getElementById('item-code-search');
const inventarioTbody = document.getElementById('inventario-tbody');
const btnBuscarItem = document.getElementById('btn-buscar-item');
const btnAbrirItem = document.getElementById('btn-abrir-item');
const btnNuevoItem = document.getElementById('btn-nuevo-item');

let currentAlmacenCodigo = null;
let currentAlmacenNombre = null;
let allInventarioItems = [];

// =========================================================
// FUNCIONES DE DIBUJO Y MANEJO DE URL
// =========================================================

/**
 * Obtiene los parámetros de la URL (código y nombre del almacén).
 */
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    currentAlmacenCodigo = params.get('almacenCodigo');
    currentAlmacenNombre = decodeURIComponent(params.get('almacenNombre') || '');

    if (currentAlmacenCodigo) {
        // Muestra solo el nombre en el input de solo lectura
        almacenDisplay.value = currentAlmacenNombre.split(/\s+/).slice(1).join(' ');
    } else {
        almacenDisplay.value = 'No se seleccionó almacén';
    }
}

/**
 * Dibuja los ítems de inventario en la tabla.
 * @param {Array} itemsToDisplay - Lista de ítems a mostrar.
 */
function drawInventarioTable(itemsToDisplay) {
    inventarioTbody.innerHTML = '';

    if (itemsToDisplay.length === 0) {
        inventarioTbody.innerHTML = '<tr><td colspan="4">No hay ítems registrados en este almacén.</td></tr>';
        return;
    }

    // Nota: El backend filtra, pero el frontend solo muestra los campos relevantes de Inventario
    itemsToDisplay.forEach(item => {
        const row = inventarioTbody.insertRow();
        row.dataset.itemCodigo = item.codigo;
        row.insertCell().textContent = item.codigo;
        row.insertCell().textContent = item.descripcion;
        row.insertCell().textContent = item.cantidad;
        row.insertCell().textContent = item.unidad;
    });
}

// =========================================================
// MANEJADORES DE DATOS Y ACCIONES
// =========================================================

/**
 * Carga los ítems de inventario para el almacén actual desde el backend.
 */
async function loadInventarioItems() {
    if (!currentAlmacenCodigo) return;

    try {
        const response = await fetch(`${API_URL}/inventario/${currentAlmacenCodigo}`);
        const data = await response.json();

        if (response.ok && data.success) {
            allInventarioItems = data.items;
            drawInventarioTable(allInventarioItems);
        } else {
            inventarioTbody.innerHTML = `<tr><td colspan="4">Error al cargar ítems: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error de conexión al cargar ítems:', error);
        inventarioTbody.innerHTML = '<tr><td colspan="4">Error de conexión con el servidor.</td></tr>';
    }
}

/**
 * Filtra los ítems de inventario basándose en el código o descripción.
 */
function handleSearchItems() {
    const searchTerm = itemCodeSearchInput.value.toLowerCase().trim();
    if (searchTerm === '') {
        drawInventarioTable(allInventarioItems);
        return;
    }

    const filteredItems = allInventarioItems.filter(item =>
        item.codigo.toLowerCase().includes(searchTerm) ||
        item.descripcion.toLowerCase().includes(searchTerm)
    );
    drawInventarioTable(filteredItems);
}

/**
 * Maneja el clic en 'Nuevo' para agregar un nuevo ítem de inventario.
 * Redirige a la ventana de registro masivo.
 */
function handleNuevoItem() {
    if (!currentAlmacenCodigo) {
        alert('Debe seleccionar un almacén válido primero.');
        return;
    }
    // Redirige a la nueva ventana de registro de entrada de inventario
    window.location.href = `inventario_registro.html?almacenCodigo=${currentAlmacenCodigo}&almacenNombre=${encodeURIComponent(almacenDisplay.value)}`;
}

/**
 * Maneja el clic en 'Abrir' para editar un ítem de inventario seleccionado (funcionalidad pendiente).
 */
function handleAbrirItem() {
    const selectedRow = inventarioTbody.querySelector('.selected-row');
    if (!selectedRow) {
        alert('Por favor, selecciona un ítem de la tabla para abrirlo.');
        return;
    }
    const itemCodigo = selectedRow.dataset.itemCodigo;
    alert(`Funcionalidad para abrir y editar el ítem con código: ${itemCodigo} no implementada aún.`);
}


// =========================================================
// INICIALIZACIÓN Y LISTENERS
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    getUrlParameters();
    loadInventarioItems();

    // Listener para seleccionar una fila
    inventarioTbody.addEventListener('click', (e) => {
        const targetRow = e.target.closest('tr');
        if (targetRow) {
            inventarioTbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected-row'));
            targetRow.classList.add('selected-row');
        }
    });

    // Listeners para los botones
    if (btnBuscarItem) {
        btnBuscarItem.addEventListener('click', handleSearchItems);
    }
    if (btnNuevoItem) {
        btnNuevoItem.addEventListener('click', handleNuevoItem);
    }
    if (btnAbrirItem) {
        btnAbrirItem.addEventListener('click', handleAbrirItem);
    }
});
