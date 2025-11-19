// almacenes_edicion.js (Ventana de Edición Masiva)

const API_URL = 'http://localhost:3000/api';
const tbodyEdicion = document.getElementById('almacenes-tbody-edicion');
const btnGuardar = document.getElementById('guardar-cambios');
const btnAddRow = document.getElementById('add-row');
const btnDeleteRow = document.getElementById('delete-row');

let allAlmacenes = []; // Almacena todos los datos leídos/editados

// =========================================================
// FUNCIONES DE DIBUJO Y EDICIÓN
// =========================================================

/**
 * Crea una fila de tabla a partir de un objeto de almacén.
 */
function createAlmacenRow(almacen) {
    const row = tbodyEdicion.insertRow();

    row.dataset.originalCode = almacen.codigo;
    row.dataset.originalName = almacen.nombre;

    // Columna Fecha (No editable)
    row.insertCell().textContent = almacen.fecha || new Date().toLocaleDateString('es-CO');

    // Columna Código (Editable)
    row.insertCell().textContent = almacen.codigo;
    row.cells[1].contentEditable = 'true';

    // Columna Nombre (Editable)
    row.insertCell().textContent = almacen.nombre;
    row.cells[2].contentEditable = 'true';

    // Columna Operario (Editable)
    row.insertCell().textContent = almacen.operario || '1000';
    row.cells[3].contentEditable = 'true';

    return row;
}

/**
 * Dibuja todos los almacenes desde el array 'allAlmacenes'.
 */
function drawAlmacenesTable() {
    tbodyEdicion.innerHTML = '';

    if (allAlmacenes.length === 0) {
        tbodyEdicion.innerHTML = '<tr><td colspan="4">No hay almacenes registrados.</td></tr>';
        return;
    }

    allAlmacenes.forEach(almacen => createAlmacenRow(almacen));
}

// =========================================================
// MANEJADORES DE DATOS Y ACCIONES
// =========================================================

/**
 * Solicita la lista de almacenes al backend.
 */
async function loadAlmacenesData() {
    try {
        const response = await fetch(`${API_URL}/almacenes`);
        const data = await response.json();

        if (response.ok && data.success) {
            allAlmacenes = data.almacenes;
            drawAlmacenesTable();
        } else {
            tbodyEdicion.innerHTML = `<tr><td colspan="4">Error al cargar almacenes: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error de conexión al cargar datos:', error);
        tbodyEdicion.innerHTML = '<tr><td colspan="4">Error de conexión con el servidor. (Verifique Node.js)</td></tr>';
    }
}

/**
 * Agrega una nueva fila (vacía) a la tabla.
 */
function handleAddRow() {
    const newAlmacen = {
        fecha: new Date().toLocaleDateString('es-CO'),
        codigo: 'NUEVO', // Marcador temporal para el usuario
        nombre: 'Nuevo Registro',
        operario: '1000'
    };

    allAlmacenes.push(newAlmacen);
    drawAlmacenesTable();
}

/**
 * Elimina la fila seleccionada.
 */
function handleDeleteRow() {
    const selectedRow = tbodyEdicion.querySelector('.selected-row');
    if (!selectedRow) {
        alert('Por favor, haz clic en una fila para seleccionarla antes de eliminar.');
        return;
    }

    // Obtener los valores actuales de la fila que va a ser eliminada
    const currentCode = selectedRow.cells[1].textContent.trim();
    const currentName = selectedRow.cells[2].textContent.trim();

    // Eliminar del array allAlmacenes basándose en una coincidencia
    allAlmacenes = allAlmacenes.filter(a => !(a.codigo === currentCode && a.nombre === currentName));

    drawAlmacenesTable();
}


/**
 * Recorre la tabla, extrae todos los datos (editados y nuevos) y los envía al servidor.
 */
async function handleSave() {
    const rows = tbodyEdicion.querySelectorAll('tr');
    const dataToSave = [];

    // Recolectar datos de la tabla (incluyendo edits)
    rows.forEach(row => {
        const cells = row.cells;
        dataToSave.push({
            fecha: cells[0].textContent.trim(),
            codigo: cells[1].textContent.trim(),
            nombre: cells[2].textContent.trim(),
            operario: cells[3].textContent.trim(),
        });
    });

    // Validar campos obligatorios
    if (dataToSave.some(d => !d.codigo || !d.nombre)) {
        alert('❌ Error: Todos los campos de Código y Nombre deben estar diligenciados antes de guardar.');
        return;
    }

    // Validar duplicados de Código (Revisión de unicidad)
    const codes = dataToSave.map(d => d.codigo);
    const hasDuplicates = (new Set(codes)).size !== codes.length;
    if (hasDuplicates) {
        alert('❌ Error: Hay códigos de almacén duplicados en la tabla. Corrígelos antes de guardar.');
        return;
    }


    // Enviar la lista completa al backend para reescribir el archivo
    try {
        const response = await fetch(`${API_URL}/almacenes/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ almacenes: dataToSave }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`✅ ¡Guardado exitoso! ${data.message}`);
            // Recargar para refrescar la vista después del guardado
            loadAlmacenesData();
        } else {
            alert(`❌ Error al guardar: ${data.message}`);
        }

    } catch (error) {
        console.error('Error de red al guardar:', error);
        alert('❌ Error de conexión con el servidor. (Verifique que Node.js esté ejecutándose)');
    }
}


// =========================================================
// INICIALIZACIÓN Y LISTENERS
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Cargar los datos iniciales
    loadAlmacenesData();

    // 1. Listener para seleccionar una fila
    tbodyEdicion.addEventListener('click', (e) => {
        const targetRow = e.target.closest('tr');
        if (targetRow) {
            tbodyEdicion.querySelectorAll('tr').forEach(row => row.classList.remove('selected-row'));
            targetRow.classList.add('selected-row');
        }
    });

    // 2. Listener para Agregar
    if (btnAddRow) {
        btnAddRow.addEventListener('click', handleAddRow);
    }

    // 3. Listener para Eliminar
    if (btnDeleteRow) {
        btnDeleteRow.addEventListener('click', handleDeleteRow);
    }

    // 4. Listener para Guardar
    if (btnGuardar) {
        btnGuardar.addEventListener('click', handleSave);
    }
});
