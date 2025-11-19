// inventario_registro.js

const API_URL = 'http://localhost:3000/api';
const almacenDisplay = document.getElementById('almacen-display');
const nFacturaInput = document.getElementById('n-factura');
const registroTbody = document.getElementById('registro-tbody-items');
const btnGuardar = document.getElementById('guardar-registro');
const btnAddRow = document.getElementById('add-row');
const btnDeleteRow = document.getElementById('delete-row');
const btnSalir = document.getElementById('btn-salir');

let currentAlmacenCodigo = null;

// =========================================================
// UTILIDADES
// =========================================================

/**
 * Obtiene los parámetros de la URL (código y nombre del almacén) y actualiza la UI.
 */
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    currentAlmacenCodigo = params.get('almacenCodigo');
    const almacenNombre = decodeURIComponent(params.get('almacenNombre') || '');

    if (currentAlmacenCodigo) {
        almacenDisplay.value = almacenNombre;
    } else {
        almacenDisplay.value = 'Error: Almacén no especificado';
    }
}

/**
 * Agrega una fila vacía a la tabla de registro de ítems.
 * @param {object} itemData - Datos opcionales para llenar la fila (ej. valores por defecto).
 */
function addEditableRow(itemData = {}) {
    const row = registroTbody.insertRow();

    // Columnas editables
    const fields = ['codigo', 'descripcion', 'cantidad', 'unidad', 'proveedor'];
    const defaultValues = {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        unidad: 'KG',
        proveedor: ''
    };

    fields.forEach(field => {
        const cell = row.insertCell();
        cell.contentEditable = 'true';
        cell.textContent = itemData[field] !== undefined ? itemData[field] : defaultValues[field];
        cell.dataset.field = field; // Para identificar la celda
    });
}

// =========================================================
// MANEJADORES DE ACCIÓN
// =========================================================

/**
 * Elimina la fila seleccionada de la tabla.
 */
function handleDeleteRow() {
    const selectedRow = registroTbody.querySelector('.selected-row');
    if (!selectedRow) {
        alert('Por favor, selecciona una fila para eliminar.');
        return;
    }
    selectedRow.remove();
}

/**
 * Recorre la tabla, extrae todos los datos de los ítems y los envía al servidor.
 */
async function handleSave() {
    const nFactura = nFacturaInput.value.trim();
    if (!nFactura) {
        alert('❌ Por favor, ingrese el Número de Factura.');
        return;
    }

    if (!currentAlmacenCodigo) {
        alert('❌ Error interno: El código del almacén no está disponible.');
        return;
    }

    const rows = registroTbody.querySelectorAll('tr');
    if (rows.length === 0) {
        alert('❌ Agregue al menos un ítem a la factura antes de guardar.');
        return;
    }

    const itemsToRegister = [];
    rows.forEach(row => {
        const cells = row.cells;
        const codigo = cells[0].textContent.trim();
        const descripcion = cells[1].textContent.trim();
        const cantidad = cells[2].textContent.trim();
        const unidad = cells[3].textContent.trim();
        const proveedor = cells[4].textContent.trim();

        // Validación de campos esenciales del ítem
        if (!codigo || !descripcion || !cantidad || !unidad) {
            alert('❌ Todos los campos de Código, Descripción, Cantidad y Unidad deben estar llenos.');
            throw new Error('Validación fallida: Campos de ítem incompletos.');
        }

        itemsToRegister.push({
            almacen_codigo: currentAlmacenCodigo,
            n_factura: nFactura,
            fecha_registro: new Date().toLocaleDateString('es-CO'),
            codigo: codigo,
            descripcion: descripcion,
            cantidad: parseFloat(cantidad) || 0, // Asegura que sea número
            unidad: unidad,
            proveedor: proveedor,
            operacion: 'ENTRADA' // Marcamos el tipo de operación
        });
    });

    // Enviar la lista de nuevos ítems al backend para agregar al inventario.csv
    try {
        const response = await fetch(`${API_URL}/inventario/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: itemsToRegister }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`✅ ¡Entrada de inventario guardada exitosamente! ${data.message}`);
            // Limpiar la tabla y formulario después de guardar
            nFacturaInput.value = '';
            registroTbody.innerHTML = '';
        } else {
            alert(`❌ Error al guardar la entrada: ${data.message}`);
        }

    } catch (error) {
        console.error('Error de red al guardar la entrada:', error);
        alert('❌ Error de conexión con el servidor.');
    }
}

/**
 * Redirige de vuelta a la ventana de ítems del almacén actual.
 */
function handleSalir() {
    // Redirige a la ventana de ítems (donde se presionó 'Nuevo')
    window.location.href = `inventario_items.html?almacenCodigo=${currentAlmacenCodigo}&almacenNombre=${encodeURIComponent(almacenDisplay.value)}`;
}


// =========================================================
// INICIALIZACIÓN
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    getUrlParameters();

    // Por defecto, añadir una fila vacía al inicio
    addEditableRow();

    // 1. Listener para seleccionar una fila
    registroTbody.addEventListener('click', (e) => {
        const targetRow = e.target.closest('tr');
        if (targetRow) {
            registroTbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected-row'));
            targetRow.classList.add('selected-row');
        }
    });

    // 2. Listener para Agregar fila
    if (btnAddRow) {
        btnAddRow.addEventListener('click', () => addEditableRow());
    }

    // 3. Listener para Eliminar fila
    if (btnDeleteRow) {
        btnDeleteRow.addEventListener('click', handleDeleteRow);
    }

    // 4. Listener para Guardar
    if (btnGuardar) {
        btnGuardar.addEventListener('click', handleSave);
    }

    // 5. Listener para Salir
    if (btnSalir) {
        btnSalir.addEventListener('click', handleSalir);
    }
});
