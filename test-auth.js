/**
 * Script de prueba para el sistema de autenticación
 * Este archivo contiene ejemplos de cómo probar todas las funcionalidades
 */

const API_BASE = 'http://localhost:3000/api/auth';

// Datos de prueba
const testUser = {
    email: 'test@ejemplo.com',
    password: 'password123',
    nombre: 'Usuario',
    apellido: 'Prueba'
};

/**
 * Prueba el registro de usuario
 */
async function testRegister() {
    console.log('🔄 Probando registro de usuario...');
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Registro exitoso:', result.data.user);
            console.log('🔑 Token generado:', result.data.token.substring(0, 20) + '...');
            return result.data.token;
        } else {
            console.log('❌ Error en registro:', result.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return null;
    }
}

/**
 * Prueba el login de usuario
 */
async function testLogin() {
    console.log('🔄 Probando login de usuario...');
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Login exitoso:', result.data.user);
            console.log('🔑 Token generado:', result.data.token.substring(0, 20) + '...');
            return result.data.token;
        } else {
            console.log('❌ Error en login:', result.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return null;
    }
}

/**
 * Prueba el acceso al perfil con token
 */
async function testProfile(token) {
    console.log('🔄 Probando acceso al perfil...');
    
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Perfil obtenido:', result.data.user);
            return true;
        } else {
            console.log('❌ Error al obtener perfil:', result.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

/**
 * Prueba la verificación de token
 */
async function testVerifyToken(token) {
    console.log('🔄 Probando verificación de token...');
    
    try {
        const response = await fetch(`${API_BASE}/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        
        if (result.success && result.data.valid) {
            console.log('✅ Token válido:', result.data.decoded.email);
            return true;
        } else {
            console.log('❌ Token inválido');
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

/**
 * Ejecuta todas las pruebas en secuencia
 */
async function runAllTests() {
    console.log('🚀 Iniciando pruebas del sistema de autenticación\\n');
    
    // Prueba 1: Registro
    const registerToken = await testRegister();
    console.log('');
    
    if (!registerToken) {
        console.log('⚠️  El registro falló, probando login con usuario existente...');
        
        // Prueba 2: Login (si el registro falló, el usuario ya existe)
        const loginToken = await testLogin();
        console.log('');
        
        if (!loginToken) {
            console.log('❌ No se pudo autenticar el usuario');
            return;
        }
        
        // Usar token del login para las siguientes pruebas
        await testProfile(loginToken);
        console.log('');
        await testVerifyToken(loginToken);
    } else {
        // Usar token del registro para las siguientes pruebas
        await testProfile(registerToken);
        console.log('');
        await testVerifyToken(registerToken);
    }
    
    console.log('\\n🎉 Pruebas completadas!');
}

// Ejecutar las pruebas si este archivo se ejecuta directamente
if (typeof window === 'undefined') {
    // Estamos en Node.js, necesitamos fetch
    const fetch = require('node-fetch');
    runAllTests();
} else {
    // Estamos en el navegador
    console.log('Para ejecutar las pruebas en el navegador, llama a: runAllTests()');
}

// Exportar funciones para uso en el navegador
if (typeof window !== 'undefined') {
    window.authTests = {
        runAllTests,
        testRegister,
        testLogin,
        testProfile,
        testVerifyToken
    };
}
