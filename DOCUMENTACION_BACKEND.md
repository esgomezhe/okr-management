# Documentación del Backend - Sistema de Gestión OKR

## Información General

**Base URL:** `http://localhost:8000/api/`

**Autenticación:** JWT (JSON Web Tokens)
- **Access Token:** Se envía en el header `Authorization: Bearer <token>`
- **Refresh Token:** Se usa para renovar el access token cuando expira

**Formato de Respuesta:** JSON

---

## 1. AUTENTICACIÓN Y USUARIOS

### 1.1 Registro de Usuario
**Endpoint:** `POST /api/users/register/`

**Descripción:** Registra un nuevo usuario en el sistema.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
    "user": {
        "username": "usuario123",
        "email": "usuario@ejemplo.com",
        "first_name": "Juan",
        "last_name": "Pérez"
    },
    "password": "contraseña123",
    "password2": "contraseña123",
    "phone": "+1234567890",
    "city": "Madrid",
    "role": "employee"
}
```

**Respuesta Exitosa (201):**
```json
{
    "id": 1,
    "user": {
        "id": 1,
        "username": "usuario123",
        "email": "usuario@ejemplo.com",
        "first_name": "Juan",
        "last_name": "Pérez"
    },
    "phone": "+1234567890",
    "city": "Madrid",
    "role": "employee",
    "avatar": null
}
```

### 1.2 Inicio de Sesión
**Endpoint:** `POST /api/users/login/`

**Descripción:** Autentica un usuario y devuelve tokens JWT.

**Body:**
```json
{
    "username": "usuario123",
    "password": "contraseña123"
}
```

**Respuesta Exitosa (200):**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "id": 1
}
```

### 1.3 Cerrar Sesión
**Endpoint:** `POST /api/users/logout/`

**Descripción:** Cierra la sesión del usuario invalidando el refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
    "detail": "Cerraste sesión exitosamente."
}
```

### 1.4 Obtener Perfil de Usuario
**Endpoint:** `GET /api/users/me/`

**Descripción:** Obtiene la información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta Exitosa (200):**
```json
{
    "id": 1,
    "user": {
        "id": 1,
        "username": "usuario123",
        "email": "usuario@ejemplo.com",
        "first_name": "Juan",
        "last_name": "Pérez"
    },
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+1234567890",
    "city": "Madrid",
    "role": "employee",
    "avatar": null
}
```

### 1.5 Actualizar Perfil de Usuario
**Endpoint:** `PUT /api/users/me/`

**Descripción:** Actualiza la información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
    "user": {
        "first_name": "Juan Carlos",
        "last_name": "Pérez García"
    },
    "phone": "+1234567891",
    "city": "Barcelona"
}
```

### 1.6 Cambiar Contraseña
**Endpoint:** `POST /api/users/change-password/`

**Descripción:** Cambia la contraseña del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
    "current_password": "contraseña123",
    "new_password": "nueva_contraseña456",
    "new_password2": "nueva_contraseña456"
}
```

**Respuesta Exitosa (200):**
```json
{
    "detail": "Contraseña cambiada exitosamente."
}
```

### 1.7 Solicitar Restablecimiento de Contraseña
**Endpoint:** `POST /api/users/password-reset/`

**Descripción:** Solicita el restablecimiento de contraseña por email.

**Body:**
```json
{
    "email": "usuario@ejemplo.com"
}
```

**Respuesta Exitosa (200):**
```json
{
    "message": "Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña."
}
```

### 1.8 Obtener Token CSRF
**Endpoint:** `GET /api/users/csrf/`

**Descripción:** Obtiene el token CSRF para formularios.

**Respuesta Exitosa (200):**
```json
{
    "detail": "CSRF cookie set"
}
```

---

## 2. GESTIÓN DE PROYECTOS

### 2.1 Listar Proyectos
**Endpoint:** `GET /api/okrs/projects/`

**Descripción:** Obtiene la lista de proyectos según el rol del usuario.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `tipo` (opcional): Filtra por tipo de proyecto (`mision` o `proyecto`)

**Respuesta Exitosa (200):**
```json
[
    {
        "id": 1,
        "name": "Proyecto Ejemplo",
        "description": "Descripción del proyecto",
        "created_by": 1,
        "created_by_name": "admin",
        "members": [
            {
                "id": 1,
                "user_id": 1,
                "username": "admin",
                "first_name": "Admin",
                "last_name": "User",
                "email": "admin@ejemplo.com",
                "role": "owner",
                "joined_at": "2024-01-01T00:00:00Z"
            }
        ],
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "color": "#FF5733",
        "tipo": "proyecto",
        "created": "2024-01-01T00:00:00Z",
        "updated": "2024-01-01T00:00:00Z",
        "epics": [],
        "objectives": []
    }
]
```

### 2.2 Crear Proyecto
**Endpoint:** `POST /api/okrs/projects/`

**Descripción:** Crea un nuevo proyecto.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
    "name": "Nuevo Proyecto",
    "description": "Descripción del nuevo proyecto",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "color": "#FF5733",
    "tipo": "proyecto"
}
```

### 2.3 Obtener Proyecto Específico
**Endpoint:** `GET /api/okrs/projects/{id}/`

**Descripción:** Obtiene los detalles de un proyecto específico.

### 2.4 Actualizar Proyecto
**Endpoint:** `PUT /api/okrs/projects/{id}/`

**Descripción:** Actualiza un proyecto existente.

### 2.5 Eliminar Proyecto
**Endpoint:** `DELETE /api/okrs/projects/{id}/`

**Descripción:** Elimina un proyecto.

### 2.6 Obtener Miembros del Proyecto
**Endpoint:** `GET /api/okrs/projects/{id}/members/`

**Descripción:** Obtiene la lista de miembros de un proyecto.

### 2.7 Agregar Miembro al Proyecto
**Endpoint:** `POST /api/okrs/projects/{id}/add_member/`

**Descripción:** Agrega un nuevo miembro al proyecto.

**Body:**
```json
{
    "user_id": 2,
    "role": "member"
}
```

### 2.8 Remover Miembro del Proyecto
**Endpoint:** `POST /api/okrs/projects/{id}/remove_member/`

**Descripción:** Remueve un miembro del proyecto.

**Body:**
```json
{
    "user_id": 2
}
```

### 2.9 Obtener Usuarios Disponibles
**Endpoint:** `GET /api/okrs/projects/available_users/`

**Descripción:** Obtiene la lista de usuarios disponibles para agregar al proyecto.

---

## 3. GESTIÓN DE ÉPICAS

### 3.1 Listar Épicas
**Endpoint:** `GET /api/okrs/epics/`

**Descripción:** Obtiene la lista de épicas según el rol del usuario.

**Query Parameters:**
- `project` (opcional): Filtra por ID del proyecto

### 3.2 Crear Épica
**Endpoint:** `POST /api/okrs/epics/`

**Descripción:** Crea una nueva épica.

**Body:**
```json
{
    "project": 1,
    "title": "Nueva Épica",
    "description": "Descripción de la épica"
}
```

### 3.3 Obtener Épica Específica
**Endpoint:** `GET /api/okrs/epics/{id}/`

### 3.4 Actualizar Épica
**Endpoint:** `PUT /api/okrs/epics/{id}/`

### 3.5 Eliminar Épica
**Endpoint:** `DELETE /api/okrs/epics/{id}/`

---

## 4. GESTIÓN DE OBJETIVOS

### 4.1 Listar Objetivos
**Endpoint:** `GET /api/okrs/objectives/`

**Descripción:** Obtiene la lista de objetivos según el rol del usuario.

**Query Parameters:**
- `epic_id` (opcional): Filtra por ID de la épica

### 4.2 Crear Objetivo
**Endpoint:** `POST /api/okrs/objectives/`

**Descripción:** Crea un nuevo objetivo.

**Body:**
```json
{
    "epic": 1,
    "title": "Nuevo Objetivo",
    "description": "Descripción del objetivo"
}
```

**O para objetivos de proyecto directo:**
```json
{
    "project": 1,
    "title": "Nuevo Objetivo",
    "description": "Descripción del objetivo"
}
```

### 4.3 Obtener Objetivo Específico
**Endpoint:** `GET /api/okrs/objectives/{id}/`

### 4.4 Actualizar Objetivo
**Endpoint:** `PUT /api/okrs/objectives/{id}/`

### 4.5 Eliminar Objetivo
**Endpoint:** `DELETE /api/okrs/objectives/{id}/`

---

## 5. GESTIÓN DE OKRs

### 5.1 Listar OKRs
**Endpoint:** `GET /api/okrs/okrs/`

**Descripción:** Obtiene la lista de OKRs según el rol del usuario.

**Query Parameters:**
- `objective_id` (opcional): Filtra por ID del objetivo

### 5.2 Crear OKR
**Endpoint:** `POST /api/okrs/okrs/`

**Descripción:** Crea un nuevo OKR.

**Body:**
```json
{
    "objective": 1,
    "key_result": "Aumentar ventas en un 20%",
    "target_value": 100
}
```

### 5.3 Obtener OKR Específico
**Endpoint:** `GET /api/okrs/okrs/{id}/`

### 5.4 Actualizar OKR
**Endpoint:** `PUT /api/okrs/okrs/{id}/`

### 5.5 Eliminar OKR
**Endpoint:** `DELETE /api/okrs/okrs/{id}/`

---

## 6. GESTIÓN DE ACTIVIDADES

### 6.1 Listar Actividades
**Endpoint:** `GET /api/okrs/activities/`

**Descripción:** Obtiene la lista de actividades según el rol del usuario.

**Query Parameters:**
- `okr_id` (opcional): Filtra por ID del OKR

### 6.2 Crear Actividad
**Endpoint:** `POST /api/okrs/activities/`

**Descripción:** Crea una nueva actividad.

**Body:**
```json
{
    "okr": 1,
    "name": "Nueva Actividad",
    "description": "Descripción de la actividad",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
}
```

### 6.3 Obtener Actividad Específica
**Endpoint:** `GET /api/okrs/activities/{id}/`

### 6.4 Actualizar Actividad
**Endpoint:** `PUT /api/okrs/activities/{id}/`

### 6.5 Eliminar Actividad
**Endpoint:** `DELETE /api/okrs/activities/{id}/`

---

## 7. GESTIÓN DE TAREAS

### 7.1 Listar Tareas
**Endpoint:** `GET /api/okrs/tasks/`

**Descripción:** Obtiene la lista de tareas según el rol del usuario.

**Query Parameters:**
- `activity_id` (opcional): Filtra por ID de la actividad

### 7.2 Crear Tarea
**Endpoint:** `POST /api/okrs/tasks/`

**Descripción:** Crea una nueva tarea.

**Body:**
```json
{
    "activity": 1,
    "title": "Nueva Tarea",
    "desc": "Descripción de la tarea",
    "assignee": 2,
    "status": "backlog"
}
```

### 7.3 Obtener Tarea Específica
**Endpoint:** `GET /api/okrs/tasks/{id}/`

### 7.4 Actualizar Tarea
**Endpoint:** `PUT /api/okrs/tasks/{id}/`

### 7.5 Eliminar Tarea
**Endpoint:** `DELETE /api/okrs/tasks/{id}/`

### 7.6 Obtener Mis Tareas
**Endpoint:** `GET /api/okrs/tasks/my_tasks/`

**Descripción:** Obtiene las tareas asignadas al usuario autenticado.

### 7.7 Obtener Tareas del Proyecto
**Endpoint:** `GET /api/okrs/tasks/project_tasks/`

**Descripción:** Obtiene las tareas de un proyecto específico.

**Query Parameters:**
- `project_id` (requerido): ID del proyecto

---

## 8. GESTIÓN DE LOGS

### 8.1 Listar Logs
**Endpoint:** `GET /api/okrs/logs/`

**Descripción:** Obtiene la lista de logs según el rol del usuario.

### 8.2 Crear Log
**Endpoint:** `POST /api/okrs/logs/`

**Descripción:** Crea un nuevo log.

**Body:**
```json
{
    "project": 1,
    "log_text": "Proyecto creado exitosamente",
    "log_type": "Project Created"
}
```

### 8.3 Obtener Log Específico
**Endpoint:** `GET /api/okrs/logs/{id}/`

### 8.4 Actualizar Log
**Endpoint:** `PUT /api/okrs/logs/{id}/`

### 8.5 Eliminar Log
**Endpoint:** `DELETE /api/okrs/logs/{id}/`

---

## 9. GESTIÓN DE COMENTARIOS

### 9.1 Listar Comentarios
**Endpoint:** `GET /api/okrs/comments/`

**Descripción:** Obtiene la lista de comentarios según el rol del usuario.

### 9.2 Crear Comentario
**Endpoint:** `POST /api/okrs/comments/`

**Descripción:** Crea un nuevo comentario.

**Body:**
```json
{
    "task": 1,
    "text": "Este es un comentario sobre la tarea"
}
```

### 9.3 Obtener Comentario Específico
**Endpoint:** `GET /api/okrs/comments/{id}/`

### 9.4 Actualizar Comentario
**Endpoint:** `PUT /api/okrs/comments/{id}/`

### 9.5 Eliminar Comentario
**Endpoint:** `DELETE /api/okrs/comments/{id}/`

---

## 10. CÓDIGOS DE ESTADO HTTP

- **200 OK:** Solicitud exitosa
- **201 Created:** Recurso creado exitosamente
- **204 No Content:** Solicitud exitosa sin contenido de respuesta
- **400 Bad Request:** Error en la solicitud del cliente
- **401 Unauthorized:** No autenticado
- **403 Forbidden:** No autorizado
- **404 Not Found:** Recurso no encontrado
- **500 Internal Server Error:** Error interno del servidor

---

## 11. ESTRUCTURA DE DATOS

### 11.1 Roles de Usuario
- `admin`: Administrador del sistema
- `manager`: Gerente/Manager
- `employee`: Empleado

### 11.2 Tipos de Proyecto
- `mision`: Misión (contiene épicas)
- `proyecto`: Proyecto (contiene objetivos directos)

### 11.3 Estados de Tarea
- `backlog`: En cola
- `in progress`: En progreso
- `completed`: Completada

### 11.4 Roles de Miembro de Proyecto
- `owner`: Propietario
- `manager`: Gerente
- `member`: Miembro
- `viewer`: Observador

### 11.5 Tipos de Log
- `Task Created`: Tarea creada
- `Task Updated`: Tarea actualizada
- `Project Created`: Proyecto creado
- `Epic Created`: Épica creada
- `Objective Created`: Objetivo creado
- `OKR Created`: OKR creado
- `Activity Created`: Actividad creada

---

## 12. EJEMPLOS DE USO CON JAVASCRIPT/FETCH

### 12.1 Iniciar Sesión
```javascript
const login = async (username, password) => {
    try {
        const response = await fetch('/api/users/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            return data;
        }
    } catch (error) {
        console.error('Error en login:', error);
    }
};
```

### 12.2 Obtener Proyectos
```javascript
const getProjects = async () => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/okrs/projects/', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error obteniendo proyectos:', error);
    }
};
```

### 12.3 Crear Proyecto
```javascript
const createProject = async (projectData) => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/okrs/projects/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error creando proyecto:', error);
    }
};
```

### 12.4 Actualizar Tarea
```javascript
const updateTask = async (taskId, taskData) => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/api/okrs/tasks/${taskId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error actualizando tarea:', error);
    }
};
```

---

## 13. NOTAS IMPORTANTES

1. **Autenticación:** Todos los endpoints (excepto login, register y password-reset) requieren autenticación JWT.

2. **Permisos:** Los permisos se basan en el rol del usuario y su membresía en proyectos.

3. **Progreso Automático:** El progreso de actividades y OKRs se calcula automáticamente basado en el estado de las tareas.

4. **Cascada de Eliminación:** Al eliminar épicas o actividades, se eliminan automáticamente todos los elementos relacionados.

5. **Filtros:** Muchos endpoints soportan filtros por query parameters para obtener datos específicos.

6. **Relaciones:** Los proyectos pueden ser de tipo "misión" (con épicas) o "proyecto" (con objetivos directos).

---

## 14. CONFIGURACIÓN DEL SERVIDOR

Para ejecutar el servidor de desarrollo:

```bash
# Activar entorno virtual
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000/`
