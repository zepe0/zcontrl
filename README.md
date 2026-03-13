# zControl

ERP ligero para la gestión de pedidos, fabricación y logística en talleres industriales. Proporciona un panel de control en tiempo real, flujo de estados por pedido, inventario de pinturas RAL, plano interactivo de nave y escáner QR.

---

## Stack tecnológico

| Capa            | Tecnología                                                                           |
| --------------- | ------------------------------------------------------------------------------------ |
| Frontend        | React 19 + Vite 6                                                                    |
| Routing         | React Router v7 (HashRouter)                                                         |
| Estilos         | Tailwind CSS + PostCSS + CSS módulos                                                 |
| Tiempo real     | Socket.io (cliente)                                                                  |
| Backend         | Express + MySQL2                                                                     |
| UI / utilidades | react-toastify, react-icons, react-qr-code, @yudiel/react-qr-scanner, @zxing/browser |

---

## Módulos

### Home — Dashboard principal (`/`)

Panel de control con KPIs de pedidos en curso, lista de albaranes y resumen de inventario de pinturas. Actualizado en tiempo real vía Socket.io. Permite abrir cualquier pedido directamente desde el dashboard y filtra por estado (Pendiente, En Proceso, etc.).

### Albaranes — Gestión de pedidos (`/Albaranes`)

Vista completa de pedidos con búsqueda y filtrado. Abre el formulario [`AddPedido`](src/Components/Albaranes/AddPedido.jsx) para crear o editar un pedido, gestionar sus líneas de material, asignar fabricación manual por línea y avanzar el estado mediante la [`OrderStatusBar`](src/Components/Albaranes/OrderStatusBar.jsx).

**Flujo de estados de pedido:**

```
Borrador → Confirmado → Pendiente → EnProceso → Almacén → Completado
```

> Si todas las líneas del pedido tienen `fabricacion_manual = 1` y el estado es _Borrador_ o _Confirmado_, el estado avanza automáticamente a _En Proceso_ sin intervención del usuario.

### Pinturas — Inventario RAL (`/Pinturas`)

CRUD de pinturas con búsqueda por código RAL y marca. Muestra el stock disponible y permite editarlo. Sincronizado en tiempo real mediante el evento Socket.io `pinturaModificada`.

### Materiales (`/Materiales`)

Gestión del catálogo de materiales usados en las líneas de pedido.

### Nave — Plano de instalaciones (`/Nave`)

Plano interactivo de la nave industrial con zonas clicables: **Proceso**, **Acabado**, **Laser**, **Almacenaje Pintura**, **Almacenaje Productos** y **Zinc**.

### Scanner QR (`/Code`)

Escáner de códigos QR usando la cámara del dispositivo (`@yudiel/react-qr-scanner`). Útil para identificar piezas o pedidos en planta.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API=http://tu-servidor:puerto
```

Esta variable se usa en toda la capa de API para construir las peticiones al backend Express.

---

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (LAN, puerto 3000)
npm run dev

# Build de producción
npm run build

# Previsualizar el build
npm run preview
```

### Acceso en red local

El servidor de desarrollo escucha en `0.0.0.0:3000`, por lo que es accesible desde cualquier dispositivo en la misma red. La app se sirve bajo la ruta base `/zcontrol/`.

---

## Arquitectura

```
zcontrol/
├── src/
│   ├── App.jsx                        # Rutas (HashRouter)
│   ├── main.jsx                       # Punto de entrada
│   ├── pages/
│   │   ├── Home.jsx                   # Dashboard + KPIs
│   │   ├── Albaranes.jsx              # Listado de pedidos
│   │   ├── Pinturas.jsx               # Inventario RAL
│   │   └── Materiales.jsx             # Catálogo de materiales
│   ├── Components/
│   │   ├── Nav.jsx                    # Barra de navegación
│   │   ├── Albaranes/
│   │   │   ├── AddPedido.jsx          # Formulario de pedido (creación/edición)
│   │   │   ├── OrderStatusBar.jsx     # Barra de progreso de estados
│   │   │   ├── MaterialesDialog.jsx   # Selector de materiales
│   │   │   ├── SignaturePad.jsx       # Firma digital en albarán
│   │   │   ├── ReviewPedidoData.jsx   # Revisión antes de confirmar
│   │   │   └── logic/
│   │   │       ├── pedidosApi.js      # Llamadas REST al backend
│   │   │       ├── orderStatusFlow.js # Estados y normalización
│   │   │       ├── calculosPedido.js  # Cálculos de líneas
│   │   │       └── restaPintura.js    # Descuento de pintura en stock
│   │   ├── Distibucion/
│   │   │   └── Nave.jsx               # Plano interactivo de nave
│   │   ├── Pinturas/
│   │   │   └── ListaPintura.jsx
│   │   ├── Materiales/
│   │   │   └── MaterialesEdit.jsx
│   │   └── QRcode/
│   │       ├── Scan.jsx               # Escáner QR
│   │       └── QRcode.jsx
│   └── socket/
│       └── socket.js                  # Instancia Socket.io compartida
├── vite.config.js                     # base: /zcontrol/, port: 3000
└── tailwind.config.js
```

### Eventos Socket.io

| Evento                | Descripción                                        |
| --------------------- | -------------------------------------------------- |
| `albaranModificado`   | Recarga la lista de pedidos en Home y Albaranes    |
| `actualizarAlbaranes` | Alias de refresco de pedidos                       |
| `pinturaModificada`   | Actualiza el inventario de pinturas en tiempo real |
| `Actualizar_pintura`  | Alias de refresco de pinturas                      |

### Endpoints principales del backend

| Método     | Ruta                      | Descripción                         |
| ---------- | ------------------------- | ----------------------------------- |
| `GET`      | `/api/albaran/:id`        | Detalle de un pedido con sus líneas |
| `GET`      | `/api/albaranes`          | Listado de todos los albaranes      |
| `PUT`      | `/api/pedidos/:id/estado` | Cambiar el estado de un pedido      |
| `POST`     | `/api/albaran/add`        | Crear nuevo pedido                  |
| `PUT`      | `/api/materiales/edit`    | Editar una línea de material        |
| `GET/POST` | `/api/cliente`            | Búsqueda y alta de clientes         |
| `GET`      | `/`                       | Listado de pinturas                 |


