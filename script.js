// =========================================================
// CONFIGURACIÓN Y SELECTORES
// =========================================================
const API_URL = 'http://localhost:3000/api'; // La dirección de tu servidor Node.js
const navButtons = document.querySelector('.nav-buttons');
const loginForm = document.querySelector('.login-form');
const container = document.querySelector('.container');
const forgotPasswordLink = document.querySelector('.forgot-password');

// HTML para el formulario de registro (Utilizado para cambiar la vista)
const registerFormHTML = `
    <form class="register-form">
        <h2>REGISTRO USUARIO</h2>

        <label for="reg-usuario">Nombre usuario</label>
        <input type="text" id="reg-usuario" name="usuario" placeholder="Ingrese el nombre de usuario" required>

        <label for="reg-rol">Rol</label>
        <input type="text" id="reg-rol" name="rol" placeholder="Ej: Administrador, Operador" required>

        <label for="reg-contrasena">Contraseña</label>
        <input type="password" id="reg-contrasena" name="contrasena" placeholder="Cree una contraseña" required>

        <label for="reg-confirmar">Confirmar Contraseña</label>
        <input type="password" id="reg-confirmar" name="confirmar" placeholder="Confirme la contraseña" required>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-action">Guardar</button>
            <button type="button" class="btn btn-secondary btn-action" id="btn-regresar">Regresar</button>
        </div>
    </form>
`;


// =========================================================
// MANEJADORES DE EVENTOS (COMUNICACIÓN CON EL BACKEND)
// =========================================================

/**
 * Función para registrar un nuevo usuario (Envia datos al servidor Node.js).
 */
async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;

    const usuario = form.elements['usuario'].value.trim();
    const rol = form.elements['rol'].value.trim();
    const contrasena = form.elements['contrasena'].value.trim();
    const confirmar = form.elements['confirmar'].value.trim();

    if (contrasena !== confirmar) {
        alert('❌ Error: La Contraseña y la Confirmación no coinciden.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario, rol, contrasena }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`✅ ${data.message}`);
            switchView('login');
        } else {
            alert(`❌ Error al registrar: ${data.message || 'Error desconocido del servidor.'}`);
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('❌ Error de conexión con el servidor. Asegúrate de que Node.js esté corriendo en el puerto 3000.');
    }
}


/**
 * Función para iniciar sesión (Consulta datos al servidor Node.js y redirige al menú).
 */
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const usuario = form.elements['usuario'].value.trim();
    const contrasena = form.elements['contrasena'].value.trim();

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario, contrasena }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`🎉 ¡Bienvenido, ${usuario}! Rol: ${data.user.rol}`);
            // REDIRECCIÓN al menú principal tras login exitoso
            window.location.href = 'menu.html';
        } else {
            alert(`❌ Error de inicio de sesión: ${data.message}`);
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('❌ Error de conexión con el servidor. Asegúrate de que Node.js esté corriendo en el puerto 3000.');
    }
}


// =========================================================
// FUNCIONALIDAD DE INTERFAZ (VISTAS)
// =========================================================

// Helper para crear un elemento DOM a partir de una cadena HTML
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function addRegisterListeners() {
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);

        const regresarBtn = document.getElementById('btn-regresar');
        regresarBtn.addEventListener('click', () => {
            switchView('login'); // Volver al login
        });
    }
}

/**
 * Cambia la interfaz entre el formulario de Login y el de Registro.
 */
function switchView(mode) {
    const loginBtn = navButtons.querySelector('.btn-primary');
    const registerBtn = navButtons.querySelector('.btn-secondary');
    const currentForm = container.querySelector('.register-form') || container.querySelector('.login-form');

    if (mode === 'login') {
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');

        if (currentForm && currentForm !== loginForm) {
            container.replaceChild(loginForm, currentForm);
        }

        forgotPasswordLink.style.display = 'block';
        loginForm.style.display = 'block';
        loginForm.addEventListener('submit', handleLogin);

    } else if (mode === 'register') {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');

        if (currentForm) {
            currentForm.style.display = 'none';
        }

        const newRegisterForm = createElementFromHTML(registerFormHTML);
        container.insertBefore(newRegisterForm, forgotPasswordLink);
        forgotPasswordLink.style.display = 'none';

        addRegisterListeners(); // Añadir listeners para Guardar y Regresar
    }
}

// =========================================================
// FUNCIONES ESPECÍFICAS DEL DASHBOARD
// =========================================================

/**
 * Solicita la lista de usuarios al backend y la dibuja en la tabla (Usada en dashboard.html).
 */
async function loadUsersTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();

        if (response.ok && data.success) {
            tbody.innerHTML = '';

            if (data.users.length === 0) {
                 tbody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
                 return;
            }

            data.users.forEach((user, index) => {
                const row = tbody.insertRow();

                row.insertCell().textContent = index + 1;
                row.insertCell().textContent = user.usuario;
                row.insertCell().textContent = user.rol;

                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button class="btn-action-edit">Editar</button>
                    <button class="btn-action-delete">Eliminar</button>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4">Error al cargar los usuarios: ${data.message}</td></tr>`;
        }

    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        tbody.innerHTML = '<tr><td colspan="4">Error de conexión con el servidor.</td></tr>';
    }
}


// =========================================================
// INICIALIZACIÓN
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica para INDEX.HTML (Login/Registro)
    if (document.querySelector('.container')) {
        switchView('login');

        navButtons.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                if (e.target.textContent.includes('Iniciar Sesion')) {
                    switchView('login');
                } else if (e.target.textContent.includes('Registrarse')) {
                    switchView('register');
                }
            }
        });
    }

    // 2. Lógica para DASHBOARD.HTML (Carga de tabla y exportación)
    if (document.querySelector('.dashboard-container')) {
        loadUsersTable();

        const exportBtn = document.getElementById('exportar-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                // Llama a la ruta de descarga del backend
                window.location.href = `${API_URL}/export/csv`;
            });
        }
    }

    // NOTA: menu.html solo necesita el script básico de redirección en su propio archivo HTML.
});
