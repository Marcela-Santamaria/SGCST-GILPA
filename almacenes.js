// almacenes.js (Ventana de Consulta y Búsqueda)
const API_URL = 'http://localhost:3000/api';
const codigoInput = document.getElementById('codigo');
const nombreInput = document.getElementById('nombre');
const tbody = document.getElementById('almacenes-tbody');
const btnBuscar = document.querySelector('.btn-buscar');
const btnAbrir = document.getElementById('btn-abrir');

let allAlmacenes = []; // Variable global para guardar todos los almacenes

// =========================================================
// FUNCIONES DE CARGA Y VISUALIZACIÓN
// =========================================================

/**
 * Dibuja los almacenes en la tabla (ya sea todos o una lista filtrada).
 * @param {Array} almacenesList - Lista de almacenes a mostrar.
 */
function drawAlmacenesTable(almacenesList) {
    tbody.innerHTML = '';

    if (almacenesList.length === 0) {
         tbody.innerHTML = '<tr><td colspan="2">No hay almacenes para mostrar.</td></tr>';
         return;
    }

    almacenesList.forEach(almacen => {
        const row = tbody.insertRow();
        // Usamos el código para identificar la fila
        row.dataset.codigo = almacen.codigo;
        row.insertCell().textContent = almacen.codigo;
        row.insertCell().textContent = almacen.nombre;
    });
}


/**
 * Solicita la lista completa de almacenes al backend y la almacena.
 */
async function loadAlmacenesTable() {
    try {
        const response = await fetch(`${API_URL}/almacenes`);
        const data = await response.json();

        if (response.ok && data.success) {
            // Filtramos las columnas no necesarias para esta vista de consulta
            allAlmacenes = data.almacenes.map(a => ({ codigo: a.codigo, nombre: a.nombre }));
            drawAlmacenesTable(allAlmacenes);
        } else {
            tbody.innerHTML = `<tr><td colspan="2">Error al cargar almacenes: ${data.message}</td></tr>`;
        }

    } catch (error) {
        console.error('Error de conexión con el backend:', error);
        tbody.innerHTML = '<tr><td colspan="2">Error de conexión con el servidor.</td></tr>';
    }
}

// =========================================================
// MANEJADORES DE ACCIÓN
// =========================================================

/**
 * Filtra la lista de almacenes al hacer clic en 'Buscar'.
 */
function handleSearch() {
    const searchTermCodigo = codigoInput.value.trim().toLowerCase();
    const searchTermNombre = nombreInput.value.trim().toLowerCase();

    if (searchTermCodigo === '' && searchTermNombre === '') {
        drawAlmacenesTable(allAlmacenes);
        return;
    }

    const filteredList = allAlmacenes.filter(almacen => {
        const codigoMatch = almacen.codigo.toLowerCase().includes(searchTermCodigo);
        const nombreMatch = almacen.nombre.toLowerCase().includes(searchTermNombre);

        return codigoMatch || nombreMatch;
    });

    drawAlmacenesTable(filteredList);
}


/**
 * Maneja la redirección al hacer clic en 'Abrir'.
 */
function handleOpen() {
    const selectedRow = tbody.querySelector('.selected-row');
    if (!selectedRow) {
        alert('Por favor, selecciona un almacén de la tabla para abrirlo.');
        return;
    }
    const codigo = selectedRow.dataset.codigo;
    // Redirigir a la página de edición, pasando el código como parámetro de URL
    window.location.href = `almacenes_edicion.html?codigo=${codigo}`;
}

// =========================================================
// INICIALIZACIÓN
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    loadAlmacenesTable();

    // Listener para seleccionar una fila (para la función Abrir)
    tbody.addEventListener('click', (e) => {
        const targetRow = e.target.closest('tr');
        if (targetRow) {
            tbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected-row'));
            targetRow.classList.add('selected-row');
        }
    });

    if (btnBuscar) {
        btnBuscar.addEventListener('click', handleSearch);
    }

    if (btnAbrir) {
        btnAbrir.addEventListener('click', handleOpen);
    }
});
