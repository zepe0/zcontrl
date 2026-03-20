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

| Método     | Ruta                             | Descripción                                                     |
| ---------- | -------------------------------- | --------------------------------------------------------------- |
| `GET`      | `/api/albaran/:id`               | Detalle de un pedido con sus líneas                             |
| `GET`      | `/api/albaranes`                 | Listado de todos los albaranes                                  |
| `PUT`      | `/api/pedidos/:id/estado`        | Cambiar el estado de un pedido                                  |
| `POST`     | `/api/albaran/add`               | Crear nuevo pedido                                              |
| `POST`     | `/api/albaran/add-transaccional` | Crear pedido con validación y descuento de stock en transacción |
| `PUT`      | `/api/materiales/edit`           | Editar una línea de material                                    |
| `GET/POST` | `/api/cliente`                   | Búsqueda y alta de clientes                                     |
| `GET`      | `/`                              | Listado de pinturas                                             |

### Contrato para guardado transaccional

El frontend intenta guardar en `/api/albaran/add-transaccional`. Si el backend responde `404`, usa fallback a `/api/albaran/add`.

Respuesta esperada en caso de stock insuficiente:

```json
{
  "code": "STOCK_INSUFICIENTE",
  "reason": "stock",
  "error": "No hay stock suficiente"
}
```

Código HTTP recomendado para stock insuficiente: `409`.

---

## Sistema de pinturas RAL — Convenciones y registros especiales

### Pinturas de sistema (no aparecen en ningún listado)

El inventario de pinturas filtra automáticamente los registros de sistema para que no aparezcan en la vista de lista ni en los KPIs de stock crítico. Un registro se considera de sistema si cumple cualquiera de estas condiciones:

| Condición                                   | Lógica de filtro                         |
| ------------------------------------------- | ---------------------------------------- |
| `ral = 'Sin Especificar'`                   | `isPlaceholderPintura` (Home y Pinturas) |
| `id = 'REFNONE'`                            | `isPlaceholderPintura`                   |
| `marca = 'SISTEMA'`                         | `isWildcardPintura` (ListaPintura)       |
| `id = 'PI-PEND'` / ral = `'PENDIENTE'`      | `isWildcardPintura`                      |
| `id = 'PI-SIN-COLOR'` / ral = `'SIN COLOR'` | `isWildcardPintura`                      |

### RAL especiales definidos en base de datos

| id             | ral             | marca   | stock    | rendimiento_kg_m2 | Propósito                                                                                                            |
| -------------- | --------------- | ------- | -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `9999`         | Sin Especificar | SISTEMA | 999 999  | 0.150             | Placeholder para piezas sin asignación de color definitivo. El stock masivo garantiza que nunca bloquee operaciones. |
| `PI-PEND`      | PENDIENTE       | SISTEMA | 999.99   | **0.000**         | Pieza cuyo color aún no se ha decidido. `rendimiento = 0` → no descuenta stock real.                                 |
| `PI-SIN-COLOR` | SIN COLOR       | SISTEMA | 999.99   | **0.000**         | Clase alternativa equivalente a `PI-PEND`, usada para identificar piezas sin color asignado.                         |
| `IMP`          | Imprimacion     | Titan   | variable | 0.150             | Base de imprimación. Tiene precio real en `pintura_compras`. Sí gestiona stock.                                      |

> **Regla clave:** cuando una pieza se fabrica sin color final asignado, debe vincularse a `PI-PEND` (RAL = `PENDIENTE`) o `PI-SIN-COLOR` (RAL = `SIN COLOR`). Ambas clases son equivalentes de sistema: registran el caso de color pendiente y no descuentan stock real (`rendimiento = 0`). Dejar `ral_snapshot` en blanco sigue siendo incidencia de calidad de dato.

### Filtro de renderizado en lista de pinturas

En `Pinturas.jsx` se aplica adicionalmente un filtro de visualización:

```js
const esRegistroValido =
  /^\d/.test(ralTexto) || // RAL numérico: 7016, 9005…
  ralTexto.startsWith("NOIR") ||
  ralTexto.includes("IMP") ||
  ralTexto.includes("OXI");
```

Los RALs de sistema (`PENDIENTE`, `SIN COLOR`, `Sin Especificar`, etc.) no pasan este filtro y nunca se renderizan.

---

## Calidad de dato — `GET /api/analytics/pinturas/data-quality`

El endpoint devuelve las incidencias de calidad del módulo de pinturas para un periodo dado (`?period=YYYY-MM`). **No representa el número de alertas operativas** — es la suma de 3 métricas de higiene de datos, mostradas en el KPI "Calidad de dato" del Dashboard.

```json
{
  "period": "2026-03",
  "salidasSinCoste": 7,
  "movimientosSinRal": 1,
  "pinturasSinPrecio": 14,
  "attentionCount": 22
}
```

### Incidencia 1 — Salidas sin coste (`salidasSinCoste`)

Movimientos de tipo `SALIDA` en el mes cuyo `coste_total_eur = 0`.

Significa que se consumió pintura pero el sistema no pudo calcular el coste porque la pintura **no tenía ninguna compra registrada** en `pintura_compras` en el momento del movimiento. Afecta directamente al coste real de producción de los albaranes.

**Causa raíz más habitual:** existe pintura en físico pero no se ha dado de alta ninguna compra → ver Incidencia 3.

**Exclusiones del conteo** (no se cuentan como incidencia):

- Movimientos cuyo `pintura_id` sea `9999` (`Sin Especificar`), `PI-PEND` (`PENDIENTE`) o `PI-SIN-COLOR` (`SIN COLOR`), pues son placeholders de sistema sin precio intencionado.
- Movimientos cuyo `ral_snapshot` sea `'Sin Especificar'`, `'PENDIENTE'` o `'SIN COLOR'`, por el mismo motivo.
- Movimientos con `ral_snapshot` vacío (esos ya cuentan en la Incidencia 2).

---

### Incidencia 2 — Movimientos sin RAL (`movimientosSinRal`)

Movimientos (entradas o salidas) cuyo campo `ral_snapshot` está **vacío o nulo**.

`ral_snapshot` debe capturar el color del pedido en el momento del movimiento. Si queda vacío, el sistema no sabe qué RAL se consumió o entró, lo que rompe los informes de consumo por color y las alertas operativas.

**Causas posibles:**

- El pedido origen tenía un RAL sin asignar y no se usó el placeholder `PENDIENTE`.
- Error de integración: el movimiento se creó sin propagar el RAL del pedido.

**Cómo corregirlo:** ir al pedido origen, asegurarse de que la línea tenga un RAL asignado (aunque sea `PENDIENTE`) y regenerar el movimiento.

**Exclusiones del conteo:**

- Movimientos de `9999`, `PI-PEND` y `PI-SIN-COLOR` (sistema). Estos pueden legitimamente no tener `ral_snapshot` en algunos flujos.

> **Importante:** `PENDIENTE` e `Imprimacion` tienen valores reales en `ral_snapshot`, por lo que **nunca se cuentan** en esta incidencia. Solo cuentan los verdaderamente vacíos/nulos.

---

### Incidencia 3 — Pinturas sin precio (`pinturasSinPrecio`)

Pinturas con `stock > 0` que no tienen **ninguna** entrada en `pintura_compras`.

Sin precio de compra registrado, cualquier futura salida de esa pintura generará una "Salida sin coste" (Incidencia 1). Es la raíz del problema de costeo.

**Cómo corregirlo:** registrar una compra en "Entrada Mercancía" para esa pintura, indicando el proveedor y precio/kg. Con eso quedan activas las reglas FIFO y el sistema podrá costear las salidas automáticamente.

**Exclusiones del conteo:**

- Pinturas con `marca = 'SISTEMA'` (9999, PI-PEND, PI-SIN-COLOR): son placeholders internos que no tienen precio real.

---

### Relación causal y orden de prioridad

```
Pintura sin precio  (Incidencia 3)
       ↓
  al consumirse genera
       ↓
Salida sin coste    (Incidencia 1)
```

El orden de limpieza recomendado:

1. **Registrar compras** a todas las pinturas con `pinturasSinPrecio > 0`.
2. Eso elimina los futuros `salidasSinCoste`.
3. Para errores pasados, investigar pedido a pedido y hacer ajuste de coste manualmente.
4. `movimientosSinRal` requiere corregir en origen el pedido con RAL vacío.

---

### Migración SQL incluida

Se ha añadido una migración base para trazabilidad de stock y soporte FIFO en:

- [database/migrations/2026-03-18_stock_fifo_foundation.sql](database/migrations/2026-03-18_stock_fifo_foundation.sql)

Esta migración crea:

- `pintura_stock_movimientos` (auditoría de entradas/salidas/ajustes).
- `pintura_stock_lotes_fifo` (capas de coste FIFO por entrada).
- Campos de snapshot de coste en `pedido_lineas`.
- Metadatos de operación en `pedidos`.
- Vista `vw_pintura_gasto_mensual` para agregación inicial mensual.
