const SUPABASE_URL = "https://nebwwmhqaupmfsgbules.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYnd3bWhxYXVwbWZzZ2J1bGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDUzMjUsImV4cCI6MjA3MDA4MTMyNX0.wSufUYgkxjGZxlbpqonqbdlnN1nzWXZ-Sd5zgcZeMAc";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    cargarEstudiantes();
    listarArchivos();
    // No es necesario asignar el onclick aquí, ya se hace en resetearFormulario
    // document.querySelector("#formulario-estudiantes button").onclick = agregarEstudiante;
    resetearFormulario(); // Inicializa el formulario en modo 'agregar'
});

// ====================
// FUNCIONES DE ESTUDIANTES
// ====================

let idEstudianteAEditar = null;

async function agregarOActualizarEstudiante() {
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const clase = document.getElementById("clase").value.trim();

    if (!nombre || !correo || !clase) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const { data: { user } } = await client.auth.getUser();

        if (!user) {
            alert("No estás autenticado.");
            return;
        }

        let error;
        if (idEstudianteAEditar) {
            // Modo de edición
            ({ error } = await client.from("estudiantes")
                .update({ nombre: nombre, correo: correo, clase: clase })
                .eq("id", idEstudianteAEditar));
            alert("Estudiante actualizado correctamente.");
        } else {
            // Modo de agregar
            ({ error } = await client.from("estudiantes")
                .insert({ nombre, correo, clase, user_id: user.id }));
            alert("Estudiante agregado correctamente.");
        }

        if (error) throw error;

        resetearFormulario();
        cargarEstudiantes();
    } catch (error) {
        alert("Error al guardar estudiante: " + error.message);
    }
}

async function cargarEstudiantes() {
    try {
        const { data, error } = await client
            .from("estudiantes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        const lista = document.getElementById("lista-estudiantes");
        lista.innerHTML = "";
        
        if (data.length === 0) {
            lista.innerHTML = `<li class="list-empty">No hay estudiantes registrados.</li>`;
            return;
        }

        // También llenamos el select de archivos
        const selectEstudiante = document.getElementById("estudiante");
        selectEstudiante.innerHTML = "";
        
        data.forEach((est) => {
            // Item de la lista de estudiantes
            const item = document.createElement("li");
            item.innerHTML = `
                <span>${est.nombre} (${est.clase}) - ${est.correo}</span>
                <div class="btn-group">
                    <button class="btn btn-small edit" onclick="prepararEdicion('${est.id}', '${est.nombre}', '${est.correo}', '${est.clase}')">Editar</button>
                    <button class="btn btn-small delete" onclick="eliminarEstudiante('${est.id}')">Eliminar</button>
                </div>
            `;
            lista.appendChild(item);

            // Opción para el select de archivos
            const option = document.createElement("option");
            option.value = est.id;
            option.textContent = `${est.nombre} (${est.clase})`;
            selectEstudiante.appendChild(option);
        });
    } catch (error) {
        alert("Error al cargar estudiantes: " + error.message);
    }
}

async function eliminarEstudiante(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar a este estudiante?")) {
        return;
    }

    try {
        const { error } = await client.from("estudiantes").delete().eq("id", id);
        if (error) throw error;
        alert("Estudiante eliminado correctamente.");
        cargarEstudiantes();
    } catch (error) {
        alert("Error al eliminar estudiante: " + error.message);
    }
}

function prepararEdicion(id, nombre, correo, clase) {
    document.getElementById("nombre").value = nombre;
    document.getElementById("correo").value = correo;
    document.getElementById("clase").value = clase;
    idEstudianteAEditar = id;

    const btnAccion = document.getElementById("btn-accion-estudiante");
    btnAccion.textContent = "Actualizar";
    btnAccion.onclick = agregarOActualizarEstudiante;

    // Crear y añadir el botón de cancelar si no existe
    let btnCancelar = document.getElementById("btn-cancelar");
    if (!btnCancelar) {
        btnCancelar = document.createElement("button");
        btnCancelar.id = "btn-cancelar";
        btnCancelar.type = "button";
        btnCancelar.textContent = "Cancelar";
        btnCancelar.classList.add("btn", "btn-secondary");
        btnCancelar.onclick = resetearFormulario;
        document.querySelector(".btn-group").appendChild(btnCancelar);
    }
}

function resetearFormulario() {
    document.getElementById("formulario-estudiantes").reset();
    idEstudianteAEditar = null;

    const btnAccion = document.getElementById("btn-accion-estudiante");
    btnAccion.textContent = "Agregar";
    btnAccion.onclick = agregarOActualizarEstudiante;

    // Remover el botón de cancelar si existe
    const btnCancelar = document.getElementById("btn-cancelar");
    if (btnCancelar) {
        btnCancelar.remove();
    }
}

// ====================
// FUNCIONES DE ARCHIVOS
// ====================

async function subirArchivo() {
    const archivoInput = document.getElementById("archivo");
    const archivo = archivoInput.files[0];
    const estudianteId = document.getElementById("estudiante").value;

    if (!archivo) {
        alert("Selecciona un archivo primero.");
        return;
    }
    
    if (!estudianteId) {
        alert("Selecciona un estudiante.");
        return;
    }

    try {
        const { data: { user } } = await client.auth.getUser();

        if (!user) {
            alert("Sesión no válida.");
            return;
        }

        const nombreRuta = `${user.id}/${estudianteId}/${archivo.name}`;
        const { error } = await client.storage
            .from("tareas")
            .upload(nombreRuta, archivo, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) throw error;

        alert("Archivo subido correctamente.");
        listarArchivos();
    } catch (error) {
        alert("Error al subir archivo: " + error.message);
    }
}

async function listarArchivos() {
    const lista = document.getElementById("lista-archivos");
    lista.innerHTML = "";
    
    try {
        const { data: { user } } = await client.auth.getUser();

        if (!user) {
            lista.innerHTML = "<li>Sesión no válida.</li>";
            return;
        }

        const { data, error } = await client.storage
            .from("tareas")
            .list(user.id, { limit: 20, search: '*/' }); // Búsqueda más precisa
        
        if (error) throw error;
        
        if (data.length === 0) {
            lista.innerHTML = "<li>No hay archivos subidos.</li>";
            return;
        }

        // Se usa Promise.all para manejar múltiples llamadas asíncronas de manera eficiente
        const itemsPromises = data.map(async (archivo) => {
            const item = document.createElement("li");
            const nombreArchivo = archivo.name;
            const partesRuta = archivo.id.split('/');
            const nombreEstudiante = partesRuta[partesRuta.length - 2]; // OBTENER EL NOMBRE DEL ESTUDIANTE A PARTIR DE LA RUTA
            
            try {
                const { data: signedUrlData, error: signedUrlError } = await client.storage
                    .from("tareas")
                    .createSignedUrl(`${user.id}/${archivo.id}`, 60);

                if (signedUrlError) throw signedUrlError;
                
                const publicUrl = signedUrlData.signedUrl;
                const esImagen = nombreArchivo.match(/\.(jpg|jpeg|png|gif)$/i);
                const esPDF = nombreArchivo.match(/\.pdf$/i);
                
                let content = `<span>${nombreArchivo} (${nombreEstudiante})</span>`;
                if (esImagen) {
                    content += `<br><a href="${publicUrl}" target="_blank"><img src="${publicUrl}" width="150" style="border:1px solid #ccc; margin:5px;" /></a>`;
                } else if (esPDF) {
                    content += `<br><a href="${publicUrl}" target="_blank">Ver PDF</a>`;
                } else {
                    content += `<br><a href="${publicUrl}" target="_blank">Ver Archivo</a>`;
                }
                item.innerHTML = content;
            } catch (error) {
                item.innerHTML = `<span>${nombreArchivo}</span><br><span>Error al generar enlace</span>`;
                console.error("Error al generar URL firmada:", error.message);
            }
            
            return item;
        });

        Promise.all(itemsPromises).then(items => {
            items.forEach(item => lista.appendChild(item));
        });
    } catch (error) {
        lista.innerHTML = `<li>Error al listar archivos: ${error.message}</li>`;
    }
}


// ====================
// FUNCIÓN DE AUTENTICACIÓN
// ====================

async function cerrarSesion() {
    try {
        const { error } = await client.auth.signOut();
        if (error) throw error;

        // Limpiar el estado de autenticación y redirigir
        window.location.href = "index.html";
    } catch (error) {
        alert("Error al cerrar sesión: " + error.message);
    }
}