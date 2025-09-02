# Gym Tracker

Una aplicación web fullstack para registrar y seguir la evolución de los pesos utilizados en ejercicios de gimnasio.

## Características

### Usuarios
- Registro e inicio de sesión con email y contraseña
- Cada usuario solo puede ver sus propios registros
- Autenticación JWT

### Ejercicios y Registros
- Catálogo básico de ejercicios predefinidos (press banca, sentadillas, peso muerto, etc.)
- Opción para agregar ejercicios personalizados
- Registro de entrenamientos con:
  - Ejercicio elegido
  - Fecha
  - Peso utilizado
  - Repeticiones y series
  - Notas opcionales

### Visualización y Progreso
- Gráficas interactivas para ver la evolución del peso por ejercicio
- Filtros por fecha y ejercicio
- Estadísticas: peso máximo, promedio y último registro por ejercicio

## Tecnologías

### Frontend
- **Next.js 15** con TypeScript
- **Tailwind CSS** para estilos
- **Recharts** para gráficos
- **React Hook Form** para formularios
- **Lucide React** para iconos

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** ORM
- **SQLite** (desarrollo) / **PostgreSQL** (producción)
- **JWT** para autenticación
- **Bcrypt** para hash de contraseñas

## Estructura del Proyecto

```
gym-tracker/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   │   ├── app/             # App Router de Next.js
│   │   │   ├── dashboard/   # Dashboard principal
│   │   │   ├── login/       # Página de login
│   │   │   ├── register/    # Página de registro
│   │   │   └── layout.tsx   # Layout principal
│   │   ├── components/      # Componentes React
│   │   │   ├── WorkoutForm.tsx
│   │   │   ├── WorkoutList.tsx
│   │   │   └── ProgressChart.tsx
│   │   ├── contexts/        # Contextos React
│   │   │   └── AuthContext.tsx
│   │   └── lib/            # Utilidades
│   │       └── api.ts      # Cliente API
│   └── package.json
├── backend/                 # API FastAPI
│   ├── main.py             # Punto de entrada de la API
│   ├── models.py           # Modelos de base de datos
│   ├── schemas.py          # Esquemas Pydantic
│   ├── database.py         # Configuración de base de datos
│   ├── seed_data.py        # Datos iniciales
│   ├── requirements.txt    # Dependencias Python
│   └── .env.example       # Variables de entorno
└── README.md
```

## Instalación y Configuración

### Requisitos Previos
- Node.js 18+ y npm
- Python 3.12+
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd gym-tracker
```

### 2. Configurar el Backend

```bash
cd backend

# Crear entorno virtual (si no existe)
python -m venv ../.venv

# Activar entorno virtual
# En Windows:
../.venv/Scripts/activate
# En Linux/Mac:
source ../.venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Crear base de datos con datos iniciales
python seed_data.py
```

### 3. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## Ejecución

### Iniciar el Backend
```bash
cd backend
# Activar entorno virtual si no está activo
../.venv/Scripts/activate  # Windows
# source ../.venv/bin/activate  # Linux/Mac

# Ejecutar servidor
python main.py
# O usando uvicorn directamente:
# uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

El backend estará disponible en: http://localhost:8001
- API docs: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

### Iniciar el Frontend
```bash
cd frontend
npm run dev
```

El frontend estará disponible en: http://localhost:3001

### Acceso desde Dispositivos Móviles

Para acceder a la aplicación desde dispositivos móviles en la misma red:

1. **Obtener tu IP local:**
   ```bash
   # Windows
   ipconfig
   # Linux/Mac
   ifconfig
   ```

2. **Configurar el Frontend:**
   ```bash
   # En frontend/.env.local
   NEXT_PUBLIC_API_URL=http://TU_IP_LOCAL:8001
   ```

3. **Acceder desde el móvil:**
   - Frontend: `http://TU_IP_LOCAL:3001`
   - Backend: `http://TU_IP_LOCAL:8001`

**Ejemplo:** Si tu IP es `192.168.0.220`:
- Frontend: `http://192.168.0.220:3001`
- Backend: `http://192.168.0.220:8001`

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Ejercicios
- `GET /api/exercises` - Listar ejercicios
- `POST /api/exercises` - Crear ejercicio personalizado

### Entrenamientos
- `GET /api/workouts` - Listar entrenamientos del usuario
- `POST /api/workouts` - Registrar nuevo entrenamiento
- `GET /api/progress/{exercise_id}` - Obtener progreso de un ejercicio

## Desarrollo

### Estructura de Archivos Clave

**Frontend:**
- `src/contexts/AuthContext.tsx` - Manejo de autenticación
- `src/lib/api.ts` - Cliente HTTP para la API
- `src/components/` - Componentes reutilizables
- `src/app/` - Páginas de la aplicación

**Backend:**
- `main.py` - Configuración de FastAPI y endpoints
- `models.py` - Modelos SQLAlchemy
- `schemas.py` - Validación con Pydantic
- `database.py` - Configuración de base de datos

### Flujo de Autenticación
1. Usuario se registra/inicia sesión
2. Backend genera JWT token
3. Frontend almacena token en localStorage
4. Token se incluye en requests subsecuentes
5. Backend valida token en endpoints protegidos

### Base de Datos
- **Desarrollo:** SQLite (`gym_tracker.db`)
- **Producción:** PostgreSQL (configurar `DATABASE_URL`)

## Despliegue

### Backend (Producción)
1. Configurar PostgreSQL
2. Actualizar `DATABASE_URL` en `.env`
3. Ejecutar migraciones si es necesario
4. Usar servidor ASGI como Gunicorn con Uvicorn workers

### Frontend (Producción)
1. Configurar `NEXT_PUBLIC_API_URL` para producción
2. Build de la aplicación: `npm run build`
3. Servir con `npm start` o desplegar en Vercel/Netlify

## Resolución de Problemas

### Problema: Array de ejercicios vacío
Si los ejercicios no cargan pero las API responses son 200 OK:

1. **Verificar la base de datos:**
   ```bash
   # Desde la raíz del proyecto
   ./.venv/Scripts/python.exe -c "
   import sys; 
   sys.path.append('./backend'); 
   from database import SessionLocal; 
   from models import Exercise; 
   db = SessionLocal(); 
   print('Ejercicios totales:', db.query(Exercise).count()); 
   db.close()"
   ```

2. **Verificar la ruta de la base de datos:**
   - Asegurarse de que `backend/main.py` use la base de datos correcta
   - Verificar que no existan múltiples archivos `gym_tracker.db`

3. **Regenerar datos iniciales:**
   ```bash
   cd backend
   python seed_data.py
   ```

### Problema: Acceso desde móvil
Si no puedes acceder desde dispositivos móviles:

1. **Verificar que el backend esté en 0.0.0.0:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

2. **Configurar CORS correctamente en `main.py`:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # En producción, especificar dominios
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Actualizar la configuración del frontend** en `.env.local`

### Problema: Errores de autenticación
Si tienes problemas con JWT tokens:

1. Verificar que `SECRET_KEY` esté configurada
2. Asegurar que el token se envíe en el header correcto
3. Verificar la expiración del token (30 minutos por defecto)

## Contribución

1. Fork del proyecto
2. Crear rama para nueva característica
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request


