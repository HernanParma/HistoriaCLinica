// js/production-config.js
// Configuración específica para producción con HTTPS
if (typeof CONFIG === 'undefined') {
    // En producción, usar la URL específica
    const API_BASE_URL = 'https://historia.runasp.net';
  
    var CONFIG = {
      API_BASE_URL,
      API_ENDPOINTS: {
        LOGIN: '/api/usuarios/login',
        REGISTER: '/api/usuarios/registrar',
        VERIFY: '/api/usuarios/verificar',
        PATIENTS: '/api/pacientes'
      },
      VALIDATION: {
        DNI_MIN_LENGTH: 7,
        DNI_MAX_LENGTH: 8,
        PASSWORD_MIN_LENGTH: 6,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[\d\s\-\+\(\)]+$/
      },
      MESSAGES: {
        SUCCESS: {
          LOGIN: '¡Login exitoso! Redirigiendo...',
          USER_REGISTERED: 'Usuario registrado exitosamente.',
          PATIENT_REGISTERED: 'Paciente registrado exitosamente'
        },
        ERROR: {
          LOGIN_FAILED: 'Usuario o contraseña incorrectos',
          CONNECTION_ERROR: 'Error de conexión. Intente nuevamente.',
          REQUIRED_FIELDS: 'Por favor complete todos los campos obligatorios',
          PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
          PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
          USERNAME_EXISTS: 'El nombre de usuario ya existe. Intente con otro.',
          USER_REGISTRATION_FAILED: 'Error al registrar usuario. Intente nuevamente.',
          INVALID_DNI: 'DNI debe tener 7 u 8 dígitos',
          INVALID_EMAIL: 'Formato de email inválido',
          INVALID_PHONE: 'Formato de teléfono inválido',
          PATIENT_REGISTRATION_FAILED: 'Error al registrar paciente. Intente nuevamente.'
        },
        INFO: {
          LOADING: 'Cargando...',
          PROCESSING: 'Procesando...',
          REGISTERING: 'Registrando...',
          VERIFYING: 'Verificando...'
        }
      },
      TIMEOUTS: {
        MESSAGE_DISPLAY: 5000,
        REDIRECT_DELAY: 1000,
        USER_REDIRECT_DELAY: 2000,
        ANIMATION_DURATION: 500
      },
      STORAGE_KEYS: {
        IS_LOGGED_IN: 'isLoggedIn',
        USERNAME: 'username',
        USER_TOKEN: 'userToken'
      },
      FORMS: {
        REQUIRED_FIELDS: {
          LOGIN: ['username', 'password'],
          USER_REGISTRATION: ['newUsername', 'newPassword', 'confirmPassword'],
          PATIENT: ['dni', 'numeroAfiliado', 'nombre', 'apellido']
        }
      },
      NAVIGATION: {
        LOGIN: 'login',
        USER_REGISTRATION: 'userRegistration',
        PATIENT_REGISTRATION: 'patientRegistration'
      }
    };
  }
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG };
  }

