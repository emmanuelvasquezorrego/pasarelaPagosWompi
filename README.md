# 💳 Microservicio Pasarela de Pagos con Wompi

Proyecto backend desarrollado en `NestJS` para gestionar pagos mediante `Wompi (sandbox)`, incluyendo manejo de transacciones, sincronización de estado y recepción de eventos mediante `webhooks`.

---

## 🚀 Tecnologías utilizadas

- `NestJS` (Framework backend)
- `TypeORM` (ORM para base de datos)
- `MySQL` (Base de datos relacional)
- `Docker Compose` (Contenedores de base de datos y adminer)
- `Swagger (OpenAPI)` (Documentación y pruebas interactivas)
- `Axios` (Peticiones HTTP a Wompi)
- `Crypto` (Generación de firmas SHA256)

---

## ⚙️ Instalación local

### Requisitos Previos

Antes de ejecutar el proyecto debe de tener:

 - Docker Desktop
 - Un editor de código (recomendado: VS Code)

### 1️⃣ Clonar y abrir el repositorio

```bash
git clone https://github.com/emmanuelvasquezorrego/pasarelaPagosWompi.git
cd pasarela-de-pagos-wompi
code .
```

### 2️⃣ Configurar variables de entorno (.env)

Cree un archivo llamado `.env` en la raíz del proyecto backend (por ejemplo, /api/.env) con las siguientes variables:

```bash
# Llaves de Wompi (Sandbox)
WOMPI_PUBLIC_KEY=pub_test_XXXXXXXXXXXXXXXX
WOMPI_PRIVATE_KEY=prv_test_XXXXXXXXXXXXXXXX
WOMPI_INTEGRITY_KEY=prod_integrity_XXXXXXXXXXXXXXXX

# Variables de Base de Datos
DB_HOST=db
DB_USERN=root
DB_PASS=1234
DB_NAME=pasarela
```

En la llaves de Wompi deberá de agregar sus propias llaves.

### 3️⃣ Levantar los contenedores con Docker

Asegurese de abrir Docker Desktop y en la raíz del proyecto abra la terminal y ejecute:

```bash
docker compose up --build
```

### 4️⃣ Servicios

Para acceder a los diferentes servicios diríjase a:

- `API de NestJS`: http://localhost:3000
- `Swagger` (documentación interactiva): http://localhost:3000/api/docs
- `Base de datos MySQL con Adminer`: http://localhost:8090


### 5️⃣ Probar el Microservicio

El proyecto puede ser probado en:

#### 💻 **Frontend de Prueba (Más fácil de probar)**

Diríjase al archivo index.html y ábralo con la extensión de Live Server. La URL debe de ser algo como:

```bash
http://127.0.0.1:5500/frontend/index.html
```

Despues de llenar los datos del formulario y dar click en pagar seleccione como método de pago `NEQUI`. Al seleccionar esta opción en el número de teléfono ingrese una de estas dos opciones:

- `3991111111` Para una transacción aprobada
- `3992222222` Para una transsación rechazada

#### 📘 **Swagger**

Si por el contrario elige este método diríjase a: http://localhost:3000/api/docs. Desde allí podrá ver los endpoints, probar las solicitudes directamente y ver ejemplos de respuestas.

- En `GET /transacciones/public-key` obtendrá su llave pública de Wompi y no es necesario ingresar ningún dato.
- En `POST /transacciones` podrá crear una transacción. Para poder probar este endpoint en el recuadro de tipo `json` ingrese algo parecido a esto:
    ```bash
    {

    "monto": 20000,

    "servicio": "Corte de Pelo",

    "id_usuario": "John",

    "id_cliente": "Doe",

    "id_cita": "05"

    }
    ```
- En `GET /transacciones/usuario/{id_usuario}` podrá traer todas las transacciones asociadas a un usuario. Solo deberá de ingresar el nombre de uno existente (un usuario que tenga registros dentro de la base de datos para poder ver sus transacciones).
- En `GET /transacciones/{id}` podrá ver la toda la información asociada a una transacción mediante su id. Este es el que aparece en la base de datos como: `id_transaccion`

Cada que realiza una transacción mediante el frontend de prueba o swagger esta se verá reflejada en la base de datos.

### 👤 Integrantes

- Luis Miguel Martínez
- Manuel Augusto Morales
- Emmanuel Vásquez
- Santiago Velásquez
