// Este código es para un entorno de desarrollo. En producción,
// es mejor gestionar las claves de forma más segura (por ejemplo, con variables de entorno).
const SUPABASE_URL = "https://nebwwmhqaupmfsgbules.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYnd3bWhxYXVwbWZzZ2J1bGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDUzMjUsImV4cCI6MjA3MDA4MTMyNX0.wSufUYgkxjGZxlbpqonqbdlnN1nzWXZ-Sd5zgcZeMAc";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cachear las referencias a los elementos del DOM al inicio
// Esto evita buscarlos cada vez que se llama a la función.
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const regEmailInput = document.getElementById("reg-email");
const regPasswordInput = document.getElementById("reg-password");
const loginEmailInput = document.getElementById("email");
const loginPasswordInput = document.getElementById("password");

// Agregar listeners para manejar el envío de los formularios
// Esto es más limpio que usar 'onclick' en el HTML
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault(); // Previene el envío por defecto del formulario
  login();
});

registerForm?.addEventListener("submit", (e) => {
  e.preventDefault(); // Previene el envío por defecto del formulario
  register();
});

// Función para alternar la visibilidad de los formularios
function toggleForms() {
  if (loginForm && registerForm) {
    const isLoginVisible = loginForm.style.display !== "none";
    loginForm.style.display = isLoginVisible ? "none" : "block";
    registerForm.style.display = isLoginVisible ? "block" : "none";
  }
}

async function register() {
  // Asegurarse de que los elementos existen antes de continuar
  if (!regEmailInput || !regPasswordInput) {
    console.error("No se encontraron los elementos del formulario de registro.");
    return;
  }
  
  const email = regEmailInput.value.trim();
  const password = regPasswordInput.value.trim();

  // Validación básica del lado del cliente
  if (!email || !password) {
    alert("Por favor, completa todos los campos para registrarte.");
    return;
  }

  // Deshabilitar el formulario mientras se envía la petición
  setFormState(registerForm, true);

  const { error } = await client.auth.signUp({ email, password });

  // Volver a habilitar el formulario
  setFormState(registerForm, false);

  if (error) {
    // Manejo de errores más específico
    if (error.message.includes("Password should be at least 6 characters")) {
      alert("La contraseña debe tener al menos 6 caracteres.");
    } else if (error.message.includes("duplicate key value")) {
      alert("El correo electrónico ya está registrado.");
    } else {
      alert(`Error en el registro: ${error.message}`);
    }
    console.error("Error en el registro:", error);
  } else {
    alert("¡Registro exitoso! Por favor, verifica tu correo electrónico para confirmar tu cuenta. Si no está en tu bandeja de entrada principal, revisa la carpeta de spam.");
    toggleForms();
    registerForm.reset(); // Limpiar el formulario
  }
}

async function login() {
  if (!loginEmailInput || !loginPasswordInput) {
    console.error("No se encontraron los elementos del formulario de inicio de sesión.");
    return;
  }

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!email || !password) {
    alert("Por favor, ingresa tu correo y contraseña.");
    return;
  }
  
  // Deshabilitar el formulario mientras se envía la petición
  setFormState(loginForm, true);

  const { error } = await client.auth.signInWithPassword({ email, password });
  
  // Volver a habilitar el formulario
  setFormState(loginForm, false);

  if (error) {
    // El mensaje de error de Supabase para credenciales inválidas es genérico,
    // por lo que no es necesario ser más específico.
    alert("Error al iniciar sesión: Correo o contraseña incorrectos.");
    console.error("Error al iniciar sesión:", error);
  } else {
    alert("Sesión iniciada con éxito.");
    // Redireccionar al dashboard después del inicio de sesión
    window.location.href = "dashboard.html"; 
  }
}

// Función auxiliar para habilitar/deshabilitar un formulario y sus elementos
function setFormState(form, isDisabled) {
  if (form) {
    const inputs = form.querySelectorAll("input, button");
    inputs.forEach(input => {
      input.disabled = isDisabled;
    });
  }
}

// Asegúrate de que las funciones estén disponibles globalmente para los botones
// que podrían usar 'onclick' si no has migrado a addEventListener.
// La mejor práctica es usar listeners como se hizo arriba.
window.toggleForms = toggleForms;
window.register = register;
window.login = login;