# Documentación del Frontend - Sistema de Gestión OKR

## Información General

**Tecnología:** React 18.2.0 con React Router DOM 6.22.1
**Gestión de Estado:** Context API + Hooks personalizados
**HTTP Client:** Axios 1.7.7
**Autenticación:** JWT (JSON Web Tokens)
**Proxy:** http://127.0.0.1:8000/

---

## 1. ESTRUCTURA DEL PROYECTO

```
frontend/
├── public/
│   ├── index.html
│   ├── faviconlogo.png
│   ├── manifest.json
│   ├── robots.txt
│   └── static/
│       ├── css/
│       ├── img/
│       └── vendor/
├── src/
│   ├── components/          # Componentes principales
│   │   ├── forms/          # Formularios
│   │   ├── modals/         # Modales
│   │   └── *.jsx          # Componentes individuales
│   ├── contexts/           # Contextos de React
│   ├── hooks/             # Hooks personalizados
│   ├── pages/             # Páginas principales
│   ├── stylesheets/       # Archivos CSS
│   ├── utils/             # Utilidades y servicios
│   ├── img/               # Imágenes del proyecto
│   ├── App.jsx            # Componente principal
│   ├── index.jsx          # Punto de entrada
│   └── index.css          # Estilos globales
├── package.json
└── README.md
```

---

## 2. CONFIGURACIÓN Y DEPENDENCIAS

### 2.1 Dependencias Principales
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.1",
  "axios": "^1.7.7",
  "react-datepicker": "^7.3.0",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0",
  "aos": "^2.3.4",
  "iconoir-react": "^7.5.0",
  "react-slick": "^0.30.2"
}
```

### 2.2 Scripts Disponibles
```bash
npm start      # Inicia el servidor de desarrollo
npm run build  # Construye la aplicación para producción
npm test       # Ejecuta las pruebas
npm run eject  # Expone la configuración de webpack
```

---

## 3. RUTAS Y NAVEGACIÓN

### 3.1 Estructura de Rutas
```jsx
<Routes>
  <Route path='/' element={<LoginRegister />} />
  <Route path='/dashboard/missions' element={
    <ProtectedRoute>
      <MissionsDashboard />
    </ProtectedRoute>
  } />
  <Route path='/dashboard/projects' element={
    <ProtectedRoute>
      <ProjectsDashboard />
    </ProtectedRoute>
  } />
  <Route path='/login/' element={<LoginRegister />} />
  <Route path='/forgot-password/' element={<PasswordReset />} />
  <Route path='/change-password/' element={<ChangePassword />} />
  <Route path='*' element={<NotFound />} />
</Routes>
```

### 3.2 Rutas Protegidas
- `/dashboard/missions` - Dashboard de misiones (requiere autenticación)
- `/dashboard/projects` - Dashboard de proyectos (requiere autenticación)

### 3.3 Rutas Públicas
- `/` - Página de login/registro
- `/login/` - Página de login/registro
- `/forgot-password/` - Recuperación de contraseña
- `/change-password/` - Cambio de contraseña

---

## 4. COMPONENTES PRINCIPALES

### 4.1 Componentes de Autenticación

#### LoginRegister.jsx
**Ubicación:** `src/pages/AllPages.jsx`
**Propósito:** Página principal de autenticación que incluye login y registro
**Características:**
- Formulario de login
- Formulario de registro
- Validación de campos
- Manejo de errores
- Redirección automática

#### ProtectedRoute.jsx
**Ubicación:** `src/components/ProtectedRoute.jsx`
**Propósito:** Componente de protección de rutas
**Funcionalidad:**
- Verifica si el usuario está autenticado
- Redirige al login si no está autenticado
- Renderiza el componente hijo si está autenticado

### 4.2 Componentes de Dashboard

#### MissionsDashboard.jsx
**Ubicación:** `src/components/MissionsDashboard.jsx`
**Propósito:** Dashboard principal para gestionar misiones
**Funcionalidades:**
- Lista de misiones del usuario
- Crear nueva misión
- Editar misión existente
- Eliminar misión
- Filtros y búsqueda
- Paginación

#### ProjectsDashboard.jsx
**Ubicación:** `src/components/ProjectsDashboard.jsx`
**Propósito:** Dashboard principal para gestionar proyectos
**Funcionalidades:**
- Lista de proyectos del usuario
- Crear nuevo proyecto
- Editar proyecto existente
- Eliminar proyecto
- Filtros y búsqueda
- Paginación

### 4.3 Componentes de Gestión

#### ProjectDetails.jsx
**Ubicación:** `src/components/ProjectDetails.jsx`
**Propósito:** Vista detallada de un proyecto/misión
**Funcionalidades:**
- Información completa del proyecto
- Gestión de épicas (para misiones)
- Gestión de objetivos
- Gestión de OKRs
- Gestión de actividades
- Gestión de tareas
- Miembros del proyecto
- Historial de cambios

#### ProjectCard.jsx
**Ubicación:** `src/components/ProjectCard.jsx`
**Propósito:** Tarjeta de presentación de proyecto/misión
**Características:**
- Información resumida del proyecto
- Progreso visual
- Acciones rápidas (editar, eliminar)
- Diseño responsivo

### 4.4 Componentes de Formularios

#### MissionForm.jsx
**Ubicación:** `src/components/MissionForm.jsx`
**Propósito:** Formulario para crear/editar misiones
**Campos:**
- Nombre de la misión
- Descripción
- Fecha de inicio
- Fecha de fin
- Color
- Miembros

#### ProjectForm.jsx
**Ubicación:** `src/components/forms/BaseForm.jsx`
**Propósito:** Formulario base para proyectos
**Campos:**
- Nombre del proyecto
- Descripción
- Fecha de inicio
- Fecha de fin
- Color
- Tipo (misión/proyecto)

#### ObjectiveForm.jsx
**Ubicación:** `src/components/ObjectiveForm.jsx`
**Propósito:** Formulario para crear/editar objetivos
**Campos:**
- Título del objetivo
- Descripción
- Épica asociada (opcional)
- Proyecto asociado (opcional)

### 4.5 Componentes de Modales

#### BaseModal.jsx
**Ubicación:** `src/components/modals/BaseModal.jsx`
**Propósito:** Modal base reutilizable
**Características:**
- Overlay con backdrop
- Animaciones de entrada/salida
- Cierre con ESC o clic fuera
- Diseño responsivo

#### EpicModal.jsx
**Ubicación:** `src/components/modals/EpicModal.jsx`
**Propósito:** Modal para crear/editar épicas
**Funcionalidades:**
- Formulario de épica
- Validación de campos
- Integración con API

#### ObjectiveModal.jsx
**Ubicación:** `src/components/modals/ObjectiveModal.jsx`
**Propósito:** Modal para crear/editar objetivos
**Funcionalidades:**
- Formulario de objetivo
- Selección de épica/proyecto
- Validación de campos

#### OKRModal.jsx
**Ubicación:** `src/components/modals/OKRModal.jsx`
**Propósito:** Modal para crear/editar OKRs
**Funcionalidades:**
- Formulario de OKR
- Definición de resultados clave
- Valores objetivo y actual

#### ActivityModal.jsx
**Ubicación:** `src/components/modals/ActivityModal.jsx`
**Propósito:** Modal para crear/editar actividades
**Funcionalidades:**
- Formulario de actividad
- Fechas de inicio y fin
- Descripción detallada

#### TaskModal.jsx
**Ubicación:** `src/components/modals/TaskModal.jsx`
**Propósito:** Modal para crear/editar tareas
**Funcionalidades:**
- Formulario de tarea
- Asignación de usuarios
- Estado de la tarea
- Descripción

### 4.6 Componentes de Gestión de Datos

#### StrategicObjectives.jsx
**Ubicación:** `src/components/StrategicObjectives.jsx`
**Propósito:** Gestión de objetivos estratégicos
**Funcionalidades:**
- Lista de objetivos
- Crear/editar/eliminar objetivos
- Asociar con épicas o proyectos
- Visualización jerárquica

#### KeyResults.jsx
**Ubicación:** `src/components/KeyResults.jsx`
**Propósito:** Gestión de resultados clave (OKRs)
**Funcionalidades:**
- Lista de OKRs por objetivo
- Crear/editar/eliminar OKRs
- Seguimiento de progreso
- Gráficos de progreso

#### Tasks.jsx
**Ubicación:** `src/components/Tasks.jsx`
**Propósito:** Gestión de tareas
**Funcionalidades:**
- Lista de tareas por actividad
- Crear/editar/eliminar tareas
- Asignar usuarios
- Cambiar estado
- Comentarios

#### Activities.jsx
**Ubicación:** `src/components/Activities.jsx`
**Propósito:** Gestión de actividades
**Funcionalidades:**
- Lista de actividades por OKR
- Crear/editar/eliminar actividades
- Seguimiento de fechas
- Progreso automático

### 4.7 Componentes de UI

#### Header.jsx
**Ubicación:** `src/components/Header.jsx`
**Propósito:** Encabezado de la aplicación
**Funcionalidades:**
- Navegación principal
- Información del usuario
- Menú desplegable
- Logout

#### Navigation.jsx
**Ubicación:** `src/components/Navigation.jsx`
**Propósito:** Navegación lateral
**Funcionalidades:**
- Menú de navegación
- Enlaces a secciones principales
- Indicador de página activa
- Colapso/expansión

#### Footer.jsx
**Ubicación:** `src/components/Footer.jsx`
**Propósito:** Pie de página
**Contenido:**
- Información de copyright
- Enlaces útiles
- Información de contacto

#### Notifications.jsx
**Ubicación:** `src/components/Notifications.jsx`
**Propósito:** Sistema de notificaciones
**Funcionalidades:**
- Mostrar notificaciones
- Diferentes tipos (éxito, error, info)
- Auto-ocultar
- Animaciones

---

## 5. CONTEXTOS Y GESTIÓN DE ESTADO

### 5.1 AuthContext.js
**Ubicación:** `src/contexts/AuthContext.js`
**Propósito:** Gestión global del estado de autenticación
**Estado:**
```javascript
{
  user: null | UserObject,
  loading: boolean,
  login: function,
  logout: function,
  clearAuthData: function
}
```

**Funcionalidades:**
- Autenticación automática al cargar
- Sincronización entre pestañas
- Manejo de tokens expirados
- Persistencia en localStorage

### 5.2 Uso del Contexto
```javascript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const { user, login, logout } = useContext(AuthContext);
```

---

## 6. HOOKS PERSONALIZADOS

### 6.1 useAuth.js
**Ubicación:** `src/hooks/useAuth.js`
**Propósito:** Hook para acceder al contexto de autenticación
**Retorna:**
```javascript
{
  user,
  login,
  logout,
  clearAuthData,
  loading
}
```

### 6.2 useAuthCleanup.js
**Ubicación:** `src/hooks/useAuthCleanup.js`
**Propósito:** Limpieza automática de datos de autenticación
**Funcionalidades:**
- Limpieza al cerrar pestaña
- Limpieza al expirar tokens
- Sincronización entre pestañas

### 6.3 useCRUD.js
**Ubicación:** `src/hooks/useCRUD.js`
**Propósito:** Hook para operaciones CRUD genéricas
**Funcionalidades:**
- Crear recursos
- Leer recursos
- Actualizar recursos
- Eliminar recursos
- Manejo de estados de carga y error

### 6.4 useForm.js
**Ubicación:** `src/hooks/useForm.js`
**Propósito:** Hook para manejo de formularios
**Funcionalidades:**
- Estado del formulario
- Validación de campos
- Manejo de errores
- Reset del formulario

---

## 7. SERVICIOS Y UTILIDADES

### 7.1 apiServices.js
**Ubicación:** `src/utils/apiServices.js`
**Propósito:** Servicios de comunicación con la API

#### Configuración de Axios
```javascript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Interceptores
- **Request:** Agrega token de autorización y CSRF
- **Response:** Maneja renovación automática de tokens

#### Servicios Disponibles

##### Autenticación
```javascript
// Registro de usuario
export const registerUser = async (username, email, first_name, last_name, phone, city, role, password, password2)

// Login de usuario
export const loginUser = async (username, password)

// Logout de usuario
export const logoutUser = async ()

// Obtener detalles del usuario
export const getUserDetails = async ()

// Cambiar contraseña
export const changePassword = async (currentPassword, newPassword, newPassword2)

// Solicitar reset de contraseña
export const sendPasswordResetEmail = async (email)
```

##### Proyectos y Misiones
```javascript
// Obtener misiones del usuario
export const getUserMissions = async (page = 1)

// Obtener proyectos del usuario
export const getUserProjects = async (page = 1)

// Obtener detalles de proyecto
export const getProjectDetails = async (projectId, type = "project")

// Crear misión
export const createMission = async (missionData)

// Crear proyecto
export const createProject = async (projectData)

// Actualizar misión
export const updateMission = async (missionId, missionData)

// Actualizar proyecto
export const updateProject = async (projectId, projectData)

// Eliminar misión
export const deleteMission = async (missionId)

// Eliminar proyecto
export const deleteProject = async (projectId)
```

##### Épicas
```javascript
// Obtener épicas
export const getEpics = async (projectId)

// Crear épica
export const createEpic = async (epicData)

// Actualizar épica
export const updateEpic = async (epicId, epicData)

// Eliminar épica
export const deleteEpic = async (epicId)
```

##### Objetivos
```javascript
// Obtener objetivos
export const getObjectives = async (epicId)

// Crear objetivo
export const createObjective = async (objectiveData)

// Actualizar objetivo
export const updateObjective = async (objectiveId, objectiveData)

// Eliminar objetivo
export const deleteObjective = async (objectiveId)
```

##### OKRs
```javascript
// Obtener OKRs
export const getOKRs = async (objectiveId)

// Crear OKR
export const createOKR = async (data)

// Actualizar OKR
export const updateOKR = async (okrId, data)

// Eliminar OKR
export const deleteOKR = async (okrId)
```

##### Actividades
```javascript
// Obtener actividades
export const getActivities = async (okrId)

// Crear actividad
export const createActivity = async (data)

// Actualizar actividad
export const updateActivity = async (activityId, data)

// Eliminar actividad
export const deleteActivity = async (activityId)
```

##### Tareas
```javascript
// Obtener tareas
export const getTasks = async (activityId)

// Crear tarea
export const createTask = async (taskData)

// Actualizar tarea
export const updateTask = async (taskId, taskData)

// Eliminar tarea
export const deleteTask = async (taskId)
```

### 7.2 baseService.js
**Ubicación:** `src/utils/baseService.js`
**Propósito:** Configuración base para servicios HTTP
**Funcionalidades:**
- Configuración de Axios
- Manejo de errores global
- Interceptores de request/response

---

## 8. ESTILOS Y CSS

### 8.1 Estructura de Estilos
```
src/stylesheets/
├── activities.css
├── App.css
├── auth.css
├── dashboard.css
├── footer.css
├── header.css
├── keyresults.css
├── login.css
├── mission.css
├── modal.css
├── navigation.css
├── notfound.css
├── notifications.css
├── objective.css
├── popup.css
├── profile.css
├── project-card.css
├── projectcard.css
├── projectdetails.css
├── results.css
├── strategicobjectives.css
└── tasks.css
```

### 8.2 Framework CSS
- **Bootstrap 5:** Framework CSS principal
- **Bootstrap Icons:** Iconografía
- **Boxicons:** Iconografía adicional
- **Animate.css:** Animaciones
- **AOS:** Animaciones al hacer scroll

### 8.3 Características de Diseño
- **Responsive:** Diseño adaptativo para móviles
- **Moderno:** Interfaz limpia y profesional
- **Accesible:** Cumple estándares de accesibilidad
- **Consistente:** Diseño uniforme en toda la aplicación

---

## 9. FUNCIONALIDADES PRINCIPALES

### 9.1 Sistema de Autenticación
- **Login/Registro:** Formularios integrados
- **JWT:** Tokens de acceso y refresh
- **Persistencia:** Datos guardados en localStorage
- **Auto-logout:** Expiración automática de sesión
- **Sincronización:** Entre múltiples pestañas

### 9.2 Gestión de Proyectos
- **CRUD Completo:** Crear, leer, actualizar, eliminar
- **Tipos:** Misiones y proyectos
- **Miembros:** Gestión de equipos
- **Progreso:** Seguimiento automático
- **Filtros:** Búsqueda y filtrado

### 9.3 Gestión de OKRs
- **Jerarquía:** Proyecto → Épica → Objetivo → OKR → Actividad → Tarea
- **Progreso Automático:** Cálculo basado en tareas
- **Visualización:** Gráficos y métricas
- **Seguimiento:** Historial de cambios

### 9.4 Gestión de Tareas
- **Estados:** Backlog, In Progress, Completed
- **Asignación:** Usuarios responsables
- **Comentarios:** Sistema de comunicación
- **Subtareas:** Tareas anidadas
- **Archivado:** Gestión de tareas completadas

### 9.5 Sistema de Notificaciones
- **Tipos:** Éxito, Error, Información, Advertencia
- **Auto-ocultar:** Desaparición automática
- **Posicionamiento:** Esquinas de la pantalla
- **Animaciones:** Entrada y salida suaves

---

## 10. FLUJO DE DATOS

### 10.1 Flujo de Autenticación
1. Usuario ingresa credenciales
2. API valida y devuelve tokens JWT
3. Tokens se almacenan en localStorage
4. Contexto de autenticación se actualiza
5. Usuario es redirigido al dashboard

### 10.2 Flujo de Creación de Proyecto
1. Usuario completa formulario
2. Validación de campos en frontend
3. Envío a API con token de autorización
4. API crea proyecto en base de datos
5. Respuesta exitosa actualiza la UI
6. Usuario es redirigido al proyecto creado

### 10.3 Flujo de Gestión de OKRs
1. Usuario selecciona proyecto/misión
2. Carga de datos jerárquicos (épicas → objetivos → OKRs)
3. Creación/edición de elementos
4. Cálculo automático de progreso
5. Actualización en tiempo real

---

## 11. MANEJO DE ERRORES

### 11.1 Tipos de Errores
- **Errores de Red:** Problemas de conectividad
- **Errores de Autenticación:** Tokens expirados
- **Errores de Validación:** Datos incorrectos
- **Errores del Servidor:** Problemas en backend

### 11.2 Estrategias de Manejo
- **Interceptores Axios:** Manejo global de errores
- **Try-Catch:** Manejo local en componentes
- **Notificaciones:** Feedback visual al usuario
- **Fallbacks:** Estados de error en UI

### 11.3 Recuperación de Errores
- **Reintentos automáticos:** Para errores de red
- **Renovación de tokens:** Para errores 401
- **Redirección:** Para errores de autenticación
- **Limpieza de estado:** Para errores críticos

---

## 12. OPTIMIZACIONES Y RENDIMIENTO

### 12.1 Optimizaciones de React
- **React.memo:** Memoización de componentes
- **useMemo:** Memoización de cálculos
- **useCallback:** Memoización de funciones
- **Lazy Loading:** Carga diferida de componentes

### 12.2 Optimizaciones de Red
- **Caché:** Datos en memoria
- **Paginación:** Carga incremental
- **Debouncing:** Reducción de requests
- **Compresión:** Datos comprimidos

### 12.3 Optimizaciones de UI
- **Virtualización:** Para listas grandes
- **Lazy Images:** Carga diferida de imágenes
- **Code Splitting:** División de bundle
- **Service Workers:** Caché offline

---

## 13. SEGURIDAD

### 13.1 Medidas de Seguridad
- **HTTPS:** Comunicación encriptada
- **JWT:** Tokens seguros
- **CSRF Protection:** Protección contra CSRF
- **XSS Prevention:** Sanitización de datos
- **Input Validation:** Validación en frontend

### 13.2 Gestión de Tokens
- **Access Token:** Corta duración (15 min)
- **Refresh Token:** Larga duración (7 días)
- **Auto-refresh:** Renovación automática
- **Secure Storage:** localStorage con validación

---

## 14. DESPLIEGUE Y CONFIGURACIÓN

### 14.1 Variables de Entorno
```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api/
REACT_APP_API_URL=http://localhost:3000/api
```

### 14.2 Scripts de Despliegue
```bash
# Desarrollo
npm start

# Producción
npm run build

# Pruebas
npm test
```

### 14.3 Configuración de Proxy
```json
{
  "proxy": "http://127.0.0.1:8000/"
}
```

---

## 15. PRUEBAS Y TESTING

### 15.1 Herramientas de Testing
- **Jest:** Framework de testing
- **React Testing Library:** Testing de componentes
- **User Event:** Simulación de interacciones
- **MSW:** Mock Service Worker

### 15.2 Tipos de Pruebas
- **Unit Tests:** Pruebas de funciones individuales
- **Component Tests:** Pruebas de componentes React
- **Integration Tests:** Pruebas de flujos completos
- **E2E Tests:** Pruebas end-to-end

---

## 16. MANTENIMIENTO Y ACTUALIZACIONES

### 16.1 Actualización de Dependencias
```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Actualizar a versiones mayores
npm audit fix
```

### 16.2 Monitoreo de Errores
- **Console Logs:** Logs de desarrollo
- **Error Boundaries:** Captura de errores React
- **Analytics:** Seguimiento de errores en producción

### 16.3 Documentación de Código
- **JSDoc:** Documentación de funciones
- **README:** Documentación del proyecto
- **Storybook:** Documentación de componentes

---

## 17. CONSIDERACIONES FUTURAS

### 17.1 Mejoras Planificadas
- **PWA:** Progressive Web App
- **Offline Mode:** Funcionalidad offline
- **Real-time:** WebSockets para actualizaciones
- **Mobile App:** Aplicación móvil nativa

### 17.2 Escalabilidad
- **Micro-frontends:** Arquitectura modular
- **State Management:** Redux/Zustand
- **Performance:** Optimizaciones avanzadas
- **Internationalization:** Multiidioma

---

## 18. CONCLUSIÓN

El frontend del Sistema de Gestión OKR es una aplicación React moderna y robusta que proporciona una interfaz de usuario intuitiva y funcional para la gestión completa de proyectos, misiones, OKRs y tareas. 

**Características Destacadas:**
- ✅ Arquitectura modular y escalable
- ✅ Gestión de estado eficiente con Context API
- ✅ Sistema de autenticación seguro con JWT
- ✅ Interfaz de usuario moderna y responsiva
- ✅ Integración completa con el backend Django
- ✅ Manejo robusto de errores
- ✅ Optimizaciones de rendimiento
- ✅ Código limpio y mantenible

La aplicación está diseñada para ser fácil de usar, mantener y extender, proporcionando una base sólida para futuras mejoras y funcionalidades adicionales.
