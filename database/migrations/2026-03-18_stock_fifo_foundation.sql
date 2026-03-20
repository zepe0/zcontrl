-- Migracion base para trazabilidad de stock de pinturas y costeo FIFO
-- Fecha: 2026-03-18
-- Objetivo: preparar modelo para guardado transaccional y metricas mensuales

START TRANSACTION;

-- 1) Auditoria de movimientos de stock de pintura
CREATE TABLE IF NOT EXISTS pintura_stock_movimientos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pedido_id VARCHAR(32) DEFAULT NULL,
  pedido_linea_id BIGINT UNSIGNED DEFAULT NULL,
  pintura_id VARCHAR(255) NOT NULL,
  ral_snapshot VARCHAR(120) DEFAULT NULL,
  tipo ENUM('ENTRADA', 'SALIDA', 'AJUSTE') NOT NULL,
  cantidad_kg DECIMAL(12,3) NOT NULL,
  stock_anterior_kg DECIMAL(12,3) NOT NULL,
  stock_nuevo_kg DECIMAL(12,3) NOT NULL,
  coste_unitario_eur_kg DECIMAL(12,4) DEFAULT NULL,
  coste_total_eur DECIMAL(12,4) DEFAULT NULL,
  origen VARCHAR(50) DEFAULT 'pedido',
  observaciones VARCHAR(255) DEFAULT NULL,
  usuario VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mov_pintura_fecha (pintura_id, created_at),
  KEY idx_mov_pedido (pedido_id),
  KEY idx_mov_tipo_fecha (tipo, created_at),
  CONSTRAINT fk_mov_pintura
    FOREIGN KEY (pintura_id) REFERENCES pintura(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_mov_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_mov_linea
    FOREIGN KEY (pedido_linea_id) REFERENCES pedido_lineas(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2) Capas FIFO por entrada de pintura
CREATE TABLE IF NOT EXISTS pintura_stock_lotes_fifo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pintura_id VARCHAR(255) NOT NULL,
  compra_id INT DEFAULT NULL,
  fecha_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  proveedor VARCHAR(255) DEFAULT NULL,
  cantidad_inicial_kg DECIMAL(12,3) NOT NULL,
  cantidad_restante_kg DECIMAL(12,3) NOT NULL,
  coste_unitario_eur_kg DECIMAL(12,4) NOT NULL,
  estado ENUM('ABIERTO', 'CERRADO') NOT NULL DEFAULT 'ABIERTO',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fifo_pintura_estado_fecha (pintura_id, estado, fecha_entrada),
  KEY idx_fifo_compra_id (compra_id),
  CONSTRAINT fk_fifo_pintura
    FOREIGN KEY (pintura_id) REFERENCES pintura(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_fifo_compra
    FOREIGN KEY (compra_id) REFERENCES pintura_compras(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3) Snapshot de coste aplicado por linea de pedido
-- Compatibilidad MySQL: evita ADD COLUMN IF NOT EXISTS en ALTER TABLE.
SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'pedido_lineas'
        AND column_name = 'consumo_pintura_kg'
    ),
    'SELECT 1',
    'ALTER TABLE pedido_lineas ADD COLUMN consumo_pintura_kg DECIMAL(12,3) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'pedido_lineas'
        AND column_name = 'coste_unitario_pintura_eur_kg'
    ),
    'SELECT 1',
    'ALTER TABLE pedido_lineas ADD COLUMN coste_unitario_pintura_eur_kg DECIMAL(12,4) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'pedido_lineas'
        AND column_name = 'coste_total_pintura_eur'
    ),
    'SELECT 1',
    'ALTER TABLE pedido_lineas ADD COLUMN coste_total_pintura_eur DECIMAL(12,4) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'pedido_lineas'
        AND column_name = 'coste_metodo'
    ),
    'SELECT 1',
    "ALTER TABLE pedido_lineas ADD COLUMN coste_metodo ENUM('FIFO', 'LAST', 'WAC') DEFAULT NULL"
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'pedido_lineas'
        AND column_name = 'fecha_costeo'
    ),
    'SELECT 1',
    'ALTER TABLE pedido_lineas ADD COLUMN fecha_costeo DATETIME DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4) Metadatos de operacion en pedidos
SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'pedidos'
        AND column_name = 'created_by'
    ),
    'SELECT 1',
    'ALTER TABLE pedidos ADD COLUMN created_by VARCHAR(100) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'pedidos'
        AND column_name = 'updated_by'
    ),
    'SELECT 1',
    'ALTER TABLE pedidos ADD COLUMN updated_by VARCHAR(100) DEFAULT NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5) Vista mensual base de gasto por compras (entrada)
CREATE OR REPLACE VIEW vw_pintura_gasto_mensual AS
SELECT
  DATE_FORMAT(pc.fecha_compra, '%Y-%m') AS periodo,
  p.id AS pintura_id,
  p.ral AS ral,
  p.marca AS marca,
  COUNT(pc.id) AS compras,
  SUM(COALESCE(pc.cantidad_cajas, 0)) AS total_cajas,
  SUM(COALESCE(pc.formato_kg, 0) * COALESCE(pc.cantidad_cajas, 0)) AS total_kg_comprados,
  SUM(COALESCE(pc.precio_total_caja, 0) * COALESCE(pc.cantidad_cajas, 0)) AS gasto_total_eur,
  CASE
    WHEN SUM(COALESCE(pc.formato_kg, 0) * COALESCE(pc.cantidad_cajas, 0)) > 0
      THEN SUM(COALESCE(pc.precio_total_caja, 0) * COALESCE(pc.cantidad_cajas, 0)) /
           SUM(COALESCE(pc.formato_kg, 0) * COALESCE(pc.cantidad_cajas, 0))
    ELSE 0
  END AS coste_medio_eur_kg
FROM pintura_compras pc
JOIN pintura p ON p.id = pc.pintura_id
GROUP BY DATE_FORMAT(pc.fecha_compra, '%Y-%m'), p.id, p.ral, p.marca;

COMMIT;

-- Nota:
-- No se fuerza CHECK(stock >= 0) todavia porque hay datos historicos con stock negativo.
-- Esa restriccion debe activarse tras saneamiento de datos y despliegue del endpoint transaccional.
