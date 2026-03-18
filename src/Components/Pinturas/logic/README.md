# Estructura de Lógica de Pinturas

## Descripción

La carpeta `logic` en `src/Components/Pinturas/` contiene funciones reutilizables para operaciones relacionadas con pinturas, separando responsabilidades y mejorando la escalabilidad.

## Archivos

### `parseRal.js`
Contiene funciones para parsear y procesar información de RAL (color).

**Funciones:**
- `parseRalString(input)` - Extrae RAL, acabado y marca de un string libre
  - Busca 4 dígitos iniciales como código RAL
  - Identifica acabados: `txt`, `texturado`, `gofrado`, `gof`, `mate`, `m`, `satinado`, `sat`, `brillo`
  - Lo que resta es considerado el nombre de marca
  - Devuelve: `{ ral, acabado, marca, original }`

- `buildRalName(ral, acabado)` - Construye nombre completo de pintura
  - Ejemplo: `buildRalName("7025", "MATE")` → `"7025 MATE"`

**Ejemplos de parsing:**
```
"7025 MATE AXALTA" → { ral: "7025", acabado: "MATE", marca: "AXALTA" }
"MATE ROJO AXALTA" → { ral: null, acabado: "MATE", marca: "ROJO AXALTA" }
"7016" → { ral: "7016", acabado: null, marca: null }
```

### `pinturaOperations.js`
Contiene operaciones de API y lógica de negocio para pinturas.

**Funciones:**
- `findOrCreatePintura(searchInput, pinturasExistentes)` - Busca pintura existente o prepara datos para crear nueva
  - Valida que exista un RAL para crear nueva pintura
  - Devuelve estado: `{ found, pintura, parsed, needsCreate, datosNuevaPintura }`

- `createNewPintura(datosNuevaPintura)` - Crea nueva pintura en BD
  - Llama a `/api/pintura/guardar`
  - Retorna: `{ success, pintura, message, error }`

## Flujo de Entrada Mercancía

1. **Usuario escribe en buscador**: "7025 MATE AXALTA"
2. **Sistema parsea**: Extrae RAL, acabado, marca
3. **Búsqueda local**: Verifica si existe en catálogo
4. **Dos caminos:**
   - ✅ **Encontrado**: Muestra resultado, usuario selecciona y agrega línea
   - ❌ **No encontrado**: Muestra opción "Crear y Agregar" con datos pre-rellenados
5. **Si crea nueva**: 
   - POST a `/api/pintura/guardar` con datos parseados
   - Nueva pintura se agrega al catálogo local
   - Se agrega automáticamente como línea al albarán

## Ventajas de esta Arquitectura

1. **Reutilizable**: Las funciones se pueden usar en otros componentes
2. **Testeable**: Funciones puras sin dependencias externas
3. **Escalable**: Fácil de extender con nuevas reglas de parsing o validaciones
4. **Responsabilidades claras**: Parsing, API, lógica separados
5. **Mantenible**: Cambios en reglas de RAL se hacen en un solo lugar

## Futuras Mejoras

- Agregar validaciones de rango de precio histórico
- Integrar scanner para entrada directa de códigos
- Cachear resultados de búsqueda
- Agregar fuzzy matching para búsquedas más flexibles
