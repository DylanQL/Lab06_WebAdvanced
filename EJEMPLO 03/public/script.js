document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos DOM
    const usuarioForm = document.getElementById('usuarioForm');
    const formTitle = document.getElementById('formTitle');
    const usuarioId = document.getElementById('usuarioId');
    const nombre = document.getElementById('nombre');
    const edad = document.getElementById('edad');
    const email = document.getElementById('email');
    const btnSave = document.getElementById('btnSave');
    const btnClear = document.getElementById('btnClear');
    const usuariosTableBody = document.getElementById('usuariosTableBody');
    const alertMessage = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noUsersMessage = document.getElementById('noUsersMessage');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    
    // Variables de estado
    let usuarioIdToDelete = null;
    
    // Cargar usuarios al inicio
    cargarUsuarios();
    
    // Event Listeners
    usuarioForm.addEventListener('submit', guardarUsuario);
    btnClear.addEventListener('click', limpiarFormulario);
    
    // Funciones
    async function cargarUsuarios() {
        try {
            mostrarCargando(true);
            const response = await fetch('/usuarios');
            const usuarios = await response.json();
            
            if (usuarios.length === 0) {
                mostrarMensajeNoUsuarios(true);
            } else {
                mostrarMensajeNoUsuarios(false);
                renderizarTabla(usuarios);
            }
        } catch (error) {
            mostrarAlerta(`Error al cargar usuarios: ${error.message}`, 'danger');
            console.error('Error al cargar usuarios:', error);
        } finally {
            mostrarCargando(false);
        }
    }
    
    function renderizarTabla(usuarios) {
        usuariosTableBody.innerHTML = '';
        
        usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            
            // Formatear fecha
            const fechaCreacion = new Date(usuario.createdAt);
            const fechaFormateada = fechaCreacion.toLocaleString();
            
            row.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.edad || 'N/A'}</td>
                <td>${usuario.email}</td>
                <td>${fechaFormateada}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-warning btn-sm btn-editar" data-id="${usuario._id}">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm btn-eliminar" data-id="${usuario._id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            usuariosTableBody.appendChild(row);
        });
        
        // Event listeners para botones de editar y eliminar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => editarUsuario(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => confirmarEliminar(btn.getAttribute('data-id')));
        });
    }
    
    async function guardarUsuario(e) {
        e.preventDefault();
        
        const usuarioData = {
            nombre: nombre.value,
            edad: edad.value ? parseInt(edad.value) : undefined,
            email: email.value
        };
        
        try {
            let response;
            let method;
            
            if (usuarioId.value) {
                // Actualizar usuario existente
                method = 'PUT';
                response = await fetch(`/usuarios/${usuarioId.value}`, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuarioData)
                });
            } else {
                // Crear nuevo usuario
                method = 'POST';
                response = await fetch('/usuarios', {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuarioData)
                });
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la operación');
            }
            
            const resultado = await response.json();
            
            // Mostrar mensaje de éxito
            const mensaje = usuarioId.value ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente';
            mostrarAlerta(mensaje, 'success');
            
            // Limpiar formulario y recargar usuarios
            limpiarFormulario();
            cargarUsuarios();
            
        } catch (error) {
            mostrarAlerta(`Error: ${error.message}`, 'danger');
            console.error('Error al guardar usuario:', error);
        }
    }
    
    async function editarUsuario(id) {
        try {
            mostrarCargando(true);
            const response = await fetch(`/usuarios/${id}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al obtener usuario');
            }
            
            const usuario = await response.json();
            
            // Llenar formulario con datos del usuario
            usuarioId.value = usuario._id;
            nombre.value = usuario.nombre;
            edad.value = usuario.edad || '';
            email.value = usuario.email;
            
            // Cambiar título y texto del botón
            formTitle.textContent = 'Editar Usuario';
            btnSave.textContent = 'Actualizar';
            
            // Hacer scroll al formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            mostrarAlerta(`Error: ${error.message}`, 'danger');
            console.error('Error al editar usuario:', error);
        } finally {
            mostrarCargando(false);
        }
    }
    
    function confirmarEliminar(id) {
        usuarioIdToDelete = id;
        deleteModal.show();
        
        // Configurar el evento para el botón de confirmar eliminación
        btnConfirmDelete.onclick = () => eliminarUsuario(usuarioIdToDelete);
    }
    
    async function eliminarUsuario(id) {
        try {
            const response = await fetch(`/usuarios/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar usuario');
            }
            
            // Ocultar modal y mostrar mensaje de éxito
            deleteModal.hide();
            mostrarAlerta('Usuario eliminado correctamente', 'success');
            
            // Recargar lista de usuarios
            cargarUsuarios();
            
        } catch (error) {
            mostrarAlerta(`Error: ${error.message}`, 'danger');
            console.error('Error al eliminar usuario:', error);
            deleteModal.hide();
        }
    }
    
    function limpiarFormulario() {
        usuarioId.value = '';
        usuarioForm.reset();
        formTitle.textContent = 'Crear Nuevo Usuario';
        btnSave.textContent = 'Guardar';
    }
    
    function mostrarAlerta(mensaje, tipo) {
        alertText.textContent = mensaje;
        alertMessage.classList.remove('alert-success', 'alert-danger', 'alert-warning');
        alertMessage.classList.add(`alert-${tipo}`, 'show');
        
        // Ocultar alerta después de 3 segundos
        setTimeout(() => {
            alertMessage.classList.remove('show');
        }, 3000);
    }
    
    function mostrarCargando(mostrar) {
        if (mostrar) {
            loadingSpinner.classList.remove('d-none');
        } else {
            loadingSpinner.classList.add('d-none');
        }
    }
    
    function mostrarMensajeNoUsuarios(mostrar) {
        if (mostrar) {
            noUsersMessage.classList.remove('d-none');
        } else {
            noUsersMessage.classList.add('d-none');
        }
    }
});
