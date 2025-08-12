// Configuración de Supabase
const SUPABASE_URL = "https://nebwwmhqaupmfsgbules.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYnd3bWhxYXVwbWZzZ2J1bGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDUzMjUsImV4cCI6MjA3MDA4MTMyNX0.wSufUYgkxjGZxlbpqonqbdlnN1nzWXZ-Sd5zgcZeMAc";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

function toggleForms() {
  if (loginForm && registerForm) {
    loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
    registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
  }
}

async function register() {
  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  
  if (!emailInput || !passwordInput) {
    console.error("No se encontraron los elementos del formulario de registro.");
    return;
  }
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Por favor, completa todos los campos para registrarte.");
    return;
  }

  const { error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert("Error en el registro: " + error.message);
  } else {
    alert("¡Registro exitoso! Por favor, verifica tu correo electrónico para confirmar tu cuenta. Si no está en tu bandeja de entrada principal, revisa la carpeta de spam.");
    toggleForms();
  }
}

async function login() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  
  if (!emailInput || !passwordInput) {
    console.error("No se encontraron los elementos del formulario de inicio de sesión.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Por favor, ingresa tu correo y contraseña.");
    return;
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Error al iniciar sesión: " + error.message);
  } else {
    alert("Sesión iniciada con éxito.");
    // No es necesario guardar el token manualmente, Supabase lo hace por ti.
    window.location.href = "dashboard.html"; 
  }
}

// Asegúrate de que las funciones estén disponibles globalmente
window.toggleForms = toggleForms;
window.register = register;
window.login = login;