

INSERT INTO pintura (id, ral, marca, stock) VALUES ('9001', '9001', 'AXALTA', 5)
  ON DUPLICATE KEY UPDATE stock=5;
-- Última compra en noviembre
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES (30001, '9001', '2025-11-25', 2, 25, 500, 10.00, 'ProveedorA');
-- Movimientos de salida en diciembre (consumo total 22kg)
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES
  (11001, '9001', 'SALIDA', 12, 27, 15, 10.00, 120.00, 'demo', 'Consumo demo', '2025-12-10 10:00:00'),
  (11002, '9001', 'SALIDA', 10, 15, 5, 10.00, 100.00, 'demo', 'Consumo demo', '2025-12-15 10:00:00');

-- ALERTA 1 extra: Consumo alto sin compra reciente (RAL 9011)
INSERT INTO pintura (id, ral, marca, stock) VALUES ('9011', '9011', 'TIGER', 3)
  ON DUPLICATE KEY UPDATE stock=3;
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES (30011, '9011', '2025-11-20', 1, 20, 300, 15.00, 'ProveedorB');
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES
  (11011, '9011', 'SALIDA', 8, 11, 3, 15.00, 120.00, 'demo', 'Consumo demo', '2025-12-12 10:00:00'),
  (11012, '9011', 'SALIDA', 5, 3, -2, 15.00, 75.00, 'demo', 'Consumo demo', '2025-12-18 10:00:00');


INSERT INTO pintura (id, ral, marca, stock) VALUES ('9002', '9002', 'VALSPAR', 22)
  ON DUPLICATE KEY UPDATE stock=22;
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES
  (30002, '9002', '2025-12-05', 2, 25, 1100, 22.00, 'ProveedorA'),
  (30003, '9002', '2025-12-12', 2, 25, 1200, 24.00, 'ProveedorA'),
  (30004, '9002', '2025-12-19', 2, 25, 1300, 26.00, 'ProveedorA');
-- Entradas de stock asociadas a compras
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES
  (12001, '9002', 'ENTRADA', 25, 0, 25, 22.00, 550.00, 'compra', 'Compra 1', '2025-12-05 09:00:00'),
  (12002, '9002', 'ENTRADA', 25, 25, 50, 24.00, 600.00, 'compra', 'Compra 2', '2025-12-12 09:00:00'),
  (12003, '9002', 'ENTRADA', 25, 50, 75, 26.00, 650.00, 'compra', 'Compra 3', '2025-12-19 09:00:00'),
  (12004, '9002', 'SALIDA', 10, 75, 65, 22.00, 220.00, 'demo', 'Consumo demo', '2025-12-10 10:00:00'),
  (12005, '9002', 'SALIDA', 8, 65, 57, 24.00, 192.00, 'demo', 'Consumo demo', '2025-12-17 10:00:00'),
  (12006, '9002', 'SALIDA', 5, 57, 52, 26.00, 130.00, 'demo', 'Consumo demo', '2025-12-22 10:00:00'),
  (12007, '9002', 'SALIDA', 30, 52, 22, 24.00, 720.00, 'demo', 'Consumo demo', '2025-12-28 10:00:00');

-- ALERTA 2 extra: Coste subiendo (RAL 9012)
INSERT INTO pintura (id, ral, marca, stock) VALUES ('9012', '9012', 'JOTUN', 10)
  ON DUPLICATE KEY UPDATE stock=10;
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES
  (30012, '9012', '2025-12-03', 1, 10, 100, 10.00, 'ProveedorC'),
  (30013, '9012', '2025-12-10', 1, 10, 120, 12.00, 'ProveedorC'),
  (30014, '9012', '2025-12-17', 1, 10, 140, 14.00, 'ProveedorC');
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES
  (12011, '9012', 'ENTRADA', 10, 0, 10, 10.00, 100.00, 'compra', 'Compra 1', '2025-12-03 09:00:00'),
  (12012, '9012', 'ENTRADA', 10, 10, 20, 12.00, 120.00, 'compra', 'Compra 2', '2025-12-10 09:00:00'),
  (12013, '9012', 'ENTRADA', 10, 20, 30, 14.00, 140.00, 'compra', 'Compra 3', '2025-12-17 09:00:00'),
  (12014, '9012', 'SALIDA', 5, 30, 25, 10.00, 50.00, 'demo', 'Consumo demo', '2025-12-05 10:00:00'),
  (12015, '9012', 'SALIDA', 7, 25, 18, 12.00, 84.00, 'demo', 'Consumo demo', '2025-12-12 10:00:00'),
  (12016, '9012', 'SALIDA', 8, 18, 10, 14.00, 112.00, 'demo', 'Consumo demo', '2025-12-19 10:00:00');


INSERT INTO pintura (id, ral, marca, stock) VALUES ('9003', '9003', 'BESA', 1)
  ON DUPLICATE KEY UPDATE stock=1;
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES (30005, '9003', '2025-12-01', 1, 25, 500, 20.00, 'ProveedorB');
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES
  (13001, '9003', 'ENTRADA', 25, 0, 25, 20.00, 500.00, 'compra', 'Compra', '2025-12-01 09:00:00'),
  (13002, '9003', 'SALIDA', 7, 25, 18, 20.00, 140.00, 'demo', 'Consumo demo', '2025-12-03 10:00:00'),
  (13003, '9003', 'SALIDA', 10, 18, 8, 20.00, 200.00, 'demo', 'Consumo demo', '2025-12-15 10:00:00'),
  (13004, '9003', 'SALIDA', 7, 8, 1, 20.00, 140.00, 'demo', 'Consumo demo', '2025-12-20 10:00:00');

-- ALERTA 3 extra: Stock bajo con consumo alto (RAL 9013)
INSERT INTO pintura (id, ral, marca, stock) VALUES ('9013', '9013', 'VALSPAR', 2)
  ON DUPLICATE KEY UPDATE stock=2;
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES (30015, '9013', '2025-12-02', 1, 15, 180, 12.00, 'ProveedorD');
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES
  (13011, '9013', 'ENTRADA', 15, 0, 15, 12.00, 180.00, 'compra', 'Compra', '2025-12-02 09:00:00'),
  (13012, '9013', 'SALIDA', 6, 15, 9, 12.00, 72.00, 'demo', 'Consumo demo', '2025-12-10 10:00:00'),
  (13013, '9013', 'SALIDA', 7, 9, 2, 12.00, 84.00, 'demo', 'Consumo demo', '2025-12-18 10:00:00');


INSERT INTO pintura (id, ral, marca, stock) VALUES ('9004', '9004', 'PPG', 50)
  ON DUPLICATE KEY UPDATE stock=50;
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES (30006, '9004', '2025-12-05', 1, 25, 400, 16.00, 'ProveedorC');
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES (14001, '9004', 'ENTRADA', 25, 25, 50, 16.00, 400.00, 'compra', 'Compra', '2025-12-05 09:00:00'),
       (14002, '9004', 'SALIDA', 2, 50, 48, 16.00, 32.00, 'demo', 'Consumo demo', '2025-12-10 10:00:00');

-- CASO SIN ALERTAS extra (RAL 9014)
INSERT INTO pintura (id, ral, marca, stock) VALUES ('9014', '9014', 'BESA', 40)
  ON DUPLICATE KEY UPDATE stock=40;
INSERT INTO pintura_compras (id, pintura_id, fecha_compra, cantidad_cajas, formato_kg, precio_total, precio_kg_calculado, proveedor)
VALUES (30016, '9014', '2025-12-06', 2, 20, 320, 8.00, 'ProveedorE');
INSERT INTO pintura_stock_movimientos (id, pintura_id, tipo, cantidad_kg, stock_anterior_kg, stock_nuevo_kg, coste_unitario_eur_kg, coste_total_eur, origen, observaciones, created_at)
VALUES (14011, '9014', 'ENTRADA', 20, 20, 40, 8.00, 160.00, 'compra', 'Compra', '2025-12-06 09:00:00'),
       (14012, '9014', 'SALIDA', 3, 40, 37, 8.00, 24.00, 'demo', 'Consumo demo', '2025-12-12 10:00:00');
