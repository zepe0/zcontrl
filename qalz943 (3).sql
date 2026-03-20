-- phpMyAdmin SQL Dump
-- version 5.2.3-1.el8.remi
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 17-03-2026 a las 17:21:24
-- Versión del servidor: 8.0.44
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `qalz943`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `AlbaranMateriales`
--

CREATE TABLE `AlbaranMateriales` (
  `id` int UNSIGNED NOT NULL,
  `idAlbaran` varchar(255) COLLATE latin1_spanish_ci NOT NULL,
  `idMaterial` varchar(255) COLLATE latin1_spanish_ci NOT NULL,
  `cantidad` int NOT NULL,
  `ral` varchar(100) COLLATE latin1_spanish_ci NOT NULL,
  `observaciones` varchar(255) COLLATE latin1_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Volcado de datos para la tabla `AlbaranMateriales`
--

INSERT INTO `AlbaranMateriales` (`id`, `idAlbaran`, `idMaterial`, `cantidad`, `ral`, `observaciones`) VALUES
(1, '28032025234910', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '3005', 'nuevos'),
(2, '29032025142114', '1', 1, '1', ''),
(3, '29032025191702', '3ee937af-6889-4ec1-b4eb-77a3b891ac7d', 3, '5005', ''),
(4, '12042025180659', 'PU-ZE1', 5, '5005', ''),
(6, '12042025180858', '1', 34, '8008', ''),
(7, '06052025131521', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '9005 mate', ''),
(8, '06052025132225', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '8005', ''),
(9, '06052025132634', '4f9d2294-a2d8-4241-a65f-af3785f13b34', 6, '8008', ''),
(10, '09052025203113', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 1, '9001', ''),
(15, '02062025113749', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 8, '5005', ''),
(16, '02062025113749', '12ae9577-a6a8-4c7f-9b07-51529d7d19ab', 5, '8005', ''),
(17, '02062025113749', '4f9d2294-a2d8-4241-a65f-af3785f13b34', 8, '3001', ''),
(19, '02062025120451', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '8005', ''),
(20, '02062025120740', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '505', ''),
(21, '02062025121015', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '5005', ''),
(23, '02062025121122', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '505', ''),
(24, '02062025121523', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(25, '02062025121717', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(26, '02062025121833', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(28, '02062025121942', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(30, '02062025122118', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(31, '02062025122310', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(32, '02062025122542', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(33, '02062025122655', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(34, '02062025122846', '12ae9577-a6a8-4c7f-9b07-51529d7d19ab', 5, '1001', ''),
(35, '02062025123039', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1000', ''),
(37, '02062025123141', 'b09c4b41-0a86-4832-9741-2674b6c83d05', 5, '1000', ''),
(38, '02062025124119', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(39, '02062025124244', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 7, '1001', ''),
(40, '02062025124352', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(43, '02062025124913', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(44, '02062025125108', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(45, '02062025125254', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(46, '02062025125410', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 7, '1001', ''),
(47, '02062025132501', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(48, '02062025132636', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(49, '02062025133116', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(50, '02062025133223', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 54, '1000', ''),
(51, '02062025133223', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 8, '1001', ''),
(52, '02062025133428', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 3, '1001', ''),
(53, '02062025133529', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(54, '02062025133927', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(55, '02062025134017', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(56, '02062025134453', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '1001', ''),
(60, '04062025111502', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 8, '5005', ''),
(61, '04062025112446', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 3, '1003', ''),
(62, '04062025112446', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 2, '1101', ''),
(63, '04062025112804', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 3, '4009', ''),
(64, '04062025112944', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '7005', ''),
(65, '04062025113054', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '7008', ''),
(66, '04062025114524', '4f9d2294-a2d8-4241-a65f-af3785f13b34', 25, '8007', ''),
(67, '04062025114833', '7b55b34e-552f-4d46-a4ea-2fbbe7d278f3', 8, '9001', ''),
(68, '04062025115045', '4f9d2294-a2d8-4241-a65f-af3785f13b34', 8, '5006', ''),
(69, '04062025115211', '4f9d2294-a2d8-4241-a65f-af3785f13b34', 2, '4003', ''),
(70, '04062025115329', '7b55b34e-552f-4d46-a4ea-2fbbe7d278f3', 8, '5005', ''),
(71, '04062025130839', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 54, '1009', ''),
(72, '05062025204226', '91ebf295-eec7-4fb8-8ac7-50ebe001c600', 5, '2001', ''),
(73, '05062025204746', '4f9d2294-a2d8-4241-a65f-af3785f13b34', 3, '1001', ''),
(74, '02032026193734', '4f9d2294-a2d8-4241-a65f-af3785f13b34', 5, '1015', ''),
(75, '02032026193734', '12ae9577-a6a8-4c7f-9b07-51529d7d19ab', 8, '1015', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tel` varchar(20) DEFAULT NULL,
  `dir` text,
  `nif` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `nombre`, `tel`, `dir`, `nif`) VALUES
('06ca1491-0c77-47c5-aa2f-86963ded96b4', 'manusa', '6000887954', 'Calle del Bosque 22, Granadaqww', '98376452R'),
('282305aa-6c1e-477a-8f15-68fe34bff272', 'copisa milos', '975624768', 'Jacinto Benedicto 543, Badalona', '98376452x'),
('976b8f5c-b191-414f-a731-f802aed69277', 'paco', '6000887954', 'Jacinto Benedicto 543, Badalona', '98376452E'),
('CLI-001', 'Talleres San José', '933445566', 'Calle Mallorca, Barcelona', 'B12345678'),
('test-uuid-123', 'CLIENTE PRUEBAS PROFESIONAL', '910000000', 'Polígono Industrial Norte, Nave 4', '12345678X');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` varchar(32) NOT NULL,
  `cliente_id` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Borrador','Confirmado','EnProceso','Completado','Cancelado','En Almacén','Pendiente') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Borrador',
  `observaciones` text,
  `tipo_iva` int DEFAULT '21'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `cliente_id`, `fecha`, `estado`, `observaciones`, `tipo_iva`) VALUES
('16032026132831', '06ca1491-0c77-47c5-aa2f-86963ded96b4', '2026-03-16 13:34:25', 'Borrador', '16032026132831', 21),
('16032026161805', '06ca1491-0c77-47c5-aa2f-86963ded96b4', '2026-03-16 16:25:10', 'EnProceso', '16032026161805', 21),
('16032026162617', '282305aa-6c1e-477a-8f15-68fe34bff272', '2026-03-16 16:29:34', 'Borrador', '16032026162617', 21),
('16032026195959', '282305aa-6c1e-477a-8f15-68fe34bff272', '2026-03-16 20:01:47', 'Confirmado', '16032026195959', 21),
('ORDEN-TEST-2024', '282305aa-6c1e-477a-8f15-68fe34bff272', '2026-03-17 12:18:34', 'Borrador', 'TEST PROFESIONAL: RAL+IMP y Stock', 21);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_lineas`
--

CREATE TABLE `pedido_lineas` (
  `id` bigint UNSIGNED NOT NULL,
  `pedido_id` varchar(32) DEFAULT NULL,
  `producto_id` varchar(255) DEFAULT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `unidad_medida` varchar(10) DEFAULT 'ud',
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ral` varchar(100) DEFAULT NULL,
  `refObra` varchar(255) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `largo` decimal(10,2) DEFAULT NULL,
  `ancho` decimal(10,2) DEFAULT NULL,
  `espesor` decimal(10,2) DEFAULT '1.00',
  `total_unidades_calculadas` decimal(10,2) DEFAULT NULL,
  `precio_pintura_extra` decimal(10,2) DEFAULT '0.00',
  `fabricacion_manual` tinyint(1) DEFAULT '0',
  `fecha_fabricacion_manual` timestamp NULL DEFAULT NULL,
  `nombre_snapshot` varchar(255) DEFAULT NULL,
  `tiene_imprimacion` tinyint(1) DEFAULT '0',
  `consumo_imprimacion` decimal(10,3) DEFAULT '0.000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `pedido_lineas`
--

INSERT INTO `pedido_lineas` (`id`, `pedido_id`, `producto_id`, `cantidad`, `unidad_medida`, `precio_unitario`, `ral`, `refObra`, `observaciones`, `largo`, `ancho`, `espesor`, `total_unidades_calculadas`, `precio_pintura_extra`, `fabricacion_manual`, `fecha_fabricacion_manual`, `nombre_snapshot`, `tiene_imprimacion`, `consumo_imprimacion`) VALUES
(42, '16032026132831', '', 4, 'm2', 23.26, '1015 Axalta', '-', '', 1000.00, 1000.00, 1.00, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(43, '16032026132831', '', 1, 'm2', 28.35, '1015 Axalta', '-', '', 2000.00, 1000.00, 1.00, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(44, '16032026161805', '', 1, 'ml', 20.00, '7016', '36/26', '', 3000.00, NULL, 1.00, NULL, 0.00, 1, NULL, 'reja', 1, 0.000),
(45, '16032026162617', '', 8, 'ml', 19.12, '9001', 'L658/26', '', 2000.00, NULL, 1.00, NULL, 0.00, 0, NULL, 'Balconera', 1, 0.000),
(46, '16032026195959', '', 1, 'm2', 28.35, '1009 M', '55', '', 1000.00, 1000.00, 1.00, NULL, 0.00, 0, NULL, 'Chapa Galvanizada 1*1*1', 1, 0.000),
(91, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 10, 'ud', 0.00, '7016', 'OBRA TEST', NULL, 2000.00, 1000.00, 1.50, NULL, 0.00, 1, NULL, NULL, 1, 0.000),
(92, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 5, 'ud', 0.00, '1009', 'OBRA TEST', NULL, 500.00, 500.00, 2.00, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(93, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 2, 'ud', 0.00, '9010', 'OBRA TEST', NULL, 3000.00, 150.00, 0.80, NULL, 0.00, 1, NULL, NULL, 0, 0.000),
(94, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 1, 'ud', 0.00, '9005', 'RELLENO', NULL, 100.00, 100.00, 1.00, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(95, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 4, 'ud', 0.00, '9006', 'RELLENO', NULL, 1200.00, 400.00, 1.00, NULL, 0.00, 1, NULL, NULL, 0, 0.000),
(96, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 8, 'ud', 0.00, '7035', 'RELLENO', NULL, 800.00, 800.00, 1.00, NULL, 0.00, 1, NULL, NULL, 0, 0.000),
(97, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 1, 'ud', 0.00, '8014', 'RELLENO', NULL, 2100.00, 900.00, 1.50, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(98, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 6, 'ud', 0.00, '9003', 'RELLENO', NULL, 400.00, 400.00, 0.60, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(99, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 2, 'ud', 0.00, '5010', 'RELLENO', NULL, 1800.00, 200.00, 3.00, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(100, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 10, 'ud', 0.00, '9005', 'RELLENO', NULL, 1000.00, 50.00, 1.50, NULL, 0.00, 0, NULL, NULL, 1, 0.000),
(101, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 3, 'ud', 0.00, '8019', 'FACHADA NORTE', NULL, 4500.00, 200.00, 1.20, NULL, 0.00, 0, NULL, NULL, 1, 0.000),
(102, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 25, 'ud', 0.00, '1009', 'ANCLAJES', NULL, 100.00, 100.00, 2.00, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(103, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 1, 'ud', 0.00, '9010', 'CUMBRERA', NULL, 6000.00, 1200.00, 1.00, NULL, 0.00, 1, NULL, NULL, 0, 0.000),
(104, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 12, 'ud', 0.00, '7035', 'PANELES SOLARES', NULL, 1500.00, 500.00, 1.50, NULL, 0.00, 0, NULL, NULL, 0, 0.000),
(105, 'ORDEN-TEST-2024', 'mmtjv610viwjo28eeuo', 5, 'ud', 0.00, '6005', 'CERRAMIENTO', NULL, 2200.00, 1100.00, 0.80, NULL, 0.00, 0, NULL, NULL, 1, 0.000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pintura`
--

CREATE TABLE `pintura` (
  `id` varchar(255) NOT NULL,
  `ral` varchar(100) NOT NULL,
  `stock` decimal(10,2) DEFAULT '0.00',
  `marca` varchar(255) DEFAULT NULL,
  `refPintura` varchar(255) DEFAULT NULL,
  `rendimiento_kg_m2` decimal(10,3) DEFAULT '0.150'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `pintura`
--

INSERT INTO `pintura` (`id`, `ral`, `stock`, `marca`, `refPintura`, `rendimiento_kg_m2`) VALUES
('9999', 'Sin Especificar', 999999.00, 'SISTEMA', 'N/A', 0.150),
('IMP', 'Imprimacion', 50.00, 'Titan', 'IMP', 0.150),
('mmt610hs93efem0gxa', '1015 Axalta', -4.32, '-', NULL, 0.150),
('mmtjv610viwjo28eeuo', '1009 M', -0.24, 'titan', NULL, 0.150),
('p01', '7016', 49.10, 'AkzoNobel', NULL, 0.150),
('p02', '9010', 120.50, 'Axalta', NULL, 0.150),
('p03', '9005', 15.00, 'Tiger', NULL, 0.150),
('p04', '7035', 8.25, 'AkzoNobel', NULL, 0.150),
('p05', '6005', 45.00, 'Jotun', NULL, 0.150),
('p06', '3000', 3.50, 'Axalta', NULL, 0.150),
('p07', '5010', 25.00, 'Tiger', NULL, 0.150),
('p08', '8014', 0.00, 'AkzoNobel', NULL, 0.150),
('p09', '7015', 60.00, 'Jotun', NULL, 0.150),
('p10', '1015', 12.00, 'Axalta', NULL, 0.150),
('p11', '9006', 100.00, 'AkzoNobel', NULL, 0.150),
('p12', '9007', 5.00, 'Tiger', NULL, 0.150),
('p13', '7021', 30.75, 'Jotun', NULL, 0.150),
('p14', '1021', 1.20, 'Axalta', NULL, 0.150),
('p15', '7040', 22.00, 'Tiger', NULL, 0.150),
('PI-7016', '7016', 49.10, 'AkzoNobel', 'AK-7016', 0.150),
('PI-9010', '9010', 50.00, 'Axalta', 'AX-9010', 0.120),
('PI-PEND', 'PENDIENTE', 999.99, 'SISTEMA', 'N/A', 0.000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pintura_compras`
--

CREATE TABLE `pintura_compras` (
  `id` int NOT NULL,
  `pintura_id` varchar(255) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `fecha_compra` datetime DEFAULT CURRENT_TIMESTAMP,
  `formato_kg` decimal(10,2) DEFAULT NULL,
  `cantidad_cajas` int DEFAULT '1',
  `precio_total_caja` decimal(10,2) DEFAULT NULL,
  `precio_kg_calculado` decimal(10,2) DEFAULT NULL,
  `proveedor` varchar(255) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Volcado de datos para la tabla `pintura_compras`
--

INSERT INTO `pintura_compras` (`id`, `pintura_id`, `fecha_compra`, `formato_kg`, `cantidad_cajas`, `precio_total_caja`, `precio_kg_calculado`, `proveedor`) VALUES
(1, 'p01', '2026-01-15 10:30:00', NULL, 1, 375.00, 15.00, 'Axalta'),
(2, 'p01', '2026-02-10 09:15:00', NULL, 1, 395.00, 15.80, 'Axalta'),
(3, 'p01', '2026-03-05 12:00:00', NULL, 1, 412.50, 16.50, 'Titan'),
(4, 'p02', '2026-01-20 16:45:00', NULL, 1, 300.00, 12.00, 'Jotun'),
(5, 'p02', '2026-03-12 11:20:00', NULL, 1, 312.50, 12.50, 'Axalta'),
(6, 'p10', '2026-02-28 08:00:00', NULL, 1, 450.00, 18.00, 'AkzoNobel');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) DEFAULT '0.00',
  `uni` int DEFAULT '1',
  `unidad_medida` enum('Ud','ml','m2') DEFAULT 'Ud',
  `consumo` decimal(10,3) DEFAULT '0.000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `precio`, `uni`, `unidad_medida`, `consumo`) VALUES
('', 'Chapa Galvanizada 1*1*1', 0.00, 4, 'Ud', 0.000),
('mmtjv610viwjo28eeuo', 'CHAPA GALVANIZADA PRUEBA', 25.50, 1, 'Ud', 0.000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifas_estandar`
--

CREATE TABLE `tarifas_estandar` (
  `id` int NOT NULL,
  `unidad` enum('ud','ml','m2') COLLATE latin1_spanish_ci DEFAULT NULL,
  `precio_color` decimal(10,2) DEFAULT NULL,
  `precio_color_mas_imp` decimal(10,2) DEFAULT NULL,
  `precio_imprimacion` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Volcado de datos para la tabla `tarifas_estandar`
--

INSERT INTO `tarifas_estandar` (`id`, `unidad`, `precio_color`, `precio_color_mas_imp`, `precio_imprimacion`) VALUES
(1, 'ud', 12.00, 15.00, 11.00),
(2, 'ml', 15.38, 19.12, 10.00),
(3, 'm2', 23.26, 28.35, 10.00);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `AlbaranMateriales`
--
ALTER TABLE `AlbaranMateriales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `pedido_lineas`
--
ALTER TABLE `pedido_lineas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `pintura`
--
ALTER TABLE `pintura`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pintura_compras`
--
ALTER TABLE `pintura_compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pintura_compra` (`pintura_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tarifas_estandar`
--
ALTER TABLE `tarifas_estandar`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `AlbaranMateriales`
--
ALTER TABLE `AlbaranMateriales`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de la tabla `pedido_lineas`
--
ALTER TABLE `pedido_lineas`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT de la tabla `pintura_compras`
--
ALTER TABLE `pintura_compras`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tarifas_estandar`
--
ALTER TABLE `tarifas_estandar`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `pedido_lineas`
--
ALTER TABLE `pedido_lineas`
  ADD CONSTRAINT `pedido_lineas_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_lineas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
