-- =====================================================================
-- STRATEGIST AI - SCRIPT COMPLETO DE BASE DE DATOS POSTGRESQL (INSFORGE)
-- DOMINIO: CONTROL DE CALIDAD (QC) Y MEJORA CONTINUA (COLOMBIA)
-- =====================================================================

-- 1. Crear base de datos (Ejecutar solo si se configura localmente)
-- CREATE DATABASE agent_bi;
-- \c agent_bi;

-- ==========================================
-- TABLA 1: METRICAS EN VIVO Y ESTADO DE CONTROL DE CALIDAD
-- ==========================================
CREATE TABLE IF NOT EXISTS active_metrics (
    id SERIAL PRIMARY KEY,
    revenue BIGINT NOT NULL DEFAULT 0,          -- Costo de No Calidad (COP)
    users INT NOT NULL DEFAULT 0,               -- Inspecciones Realizadas (Muestras)
    risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Tasa de No Conformidad (%)
    efficiency DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Tasa de Conformidad (%)
    warehouse_delay BOOLEAN NOT NULL DEFAULT FALSE,  -- Alerta de Desviación de Tolerancia
    active_dataset VARCHAR(255) NOT NULL DEFAULT 'Ninguno' -- Nombre del Dataset Activo
);

COMMENT ON TABLE active_metrics IS 'Almacena las métricas de calidad en tiempo real importadas temporalmente durante el ETL.';
COMMENT ON COLUMN active_metrics.revenue IS 'Costo total derivado de fallas o reprocesamientos en pesos colombianos (COP).';
COMMENT ON COLUMN active_metrics.users IS 'Cantidad acumulada de muestras o lotes inspeccionados en la planta colombiana.';

-- Sembrar valores iniciales predeterminados (Limpio por defecto)
INSERT INTO active_metrics (revenue, users, risk_score, efficiency, warehouse_delay, active_dataset)
SELECT 0, 0, 0.00, 0.00, FALSE, 'Ninguno'
WHERE NOT EXISTS (SELECT 1 FROM active_metrics);


-- ==========================================
-- TABLA 2: HISTORIAL DE CHAT DEL CONSULTOR IA (QA)
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,                  -- 'user' o 'model'
    text TEXT NOT NULL,                         -- Contenido del mensaje en Markdown
    timestamp VARCHAR(100),                     -- Marca de tiempo elegante
    simulated BOOLEAN DEFAULT FALSE,            -- Indica si fue una respuesta simulada local
    has_variance_chart BOOLEAN DEFAULT FALSE,   -- Si renderiza gráfica de varianza
    impact VARCHAR(50),                         -- Metadatos de impacto financiero
    delta VARCHAR(50),                          -- Desviación o delta
    confidence VARCHAR(50)                      -- Porcentaje de confianza del modelo
);

COMMENT ON TABLE chat_messages IS 'Historial persistente de la conversación con el consultor de calidad Strategist AI.';
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);


-- ==========================================
-- TABLA 3: COLA DE LOGS DE VALIDACIÓN Y PROCESAMIENTO ETL
-- ==========================================
CREATE TABLE IF NOT EXISTS etl_logs (
    id SERIAL PRIMARY KEY,
    time VARCHAR(50) NOT NULL,                  -- Hora del suceso (HH:MM:SS)
    category VARCHAR(50) NOT NULL,              -- 'Sistema', 'Escaneo', 'Análisis', 'Seguridad', 'Integridad', 'Alerta'
    message TEXT NOT NULL                       -- Detalle técnico del log
);

COMMENT ON TABLE etl_logs IS 'Logs históricos del pipeline ETL de autocuración de tolerancias e inspectores.';

-- Sembrar logs iniciales de Aseguramiento de Calidad
INSERT INTO etl_logs (time, category, message) VALUES
(TO_CHAR(NOW(), 'HH24:MI:SS'), 'Sistema', 'Plataforma autónoma de datos inicializada.'),
(TO_CHAR(NOW(), 'HH24:MI:SS'), 'Escaneo', 'Esperando la carga de un conjunto de datos en el Hub de Ingestión...'),
(TO_CHAR(NOW(), 'HH24:MI:SS'), 'Análisis', 'Estructuras analíticas preparadas para el tratamiento de datos.');


-- ==========================================
-- TABLA 4: HISTORIAL DE INFORMES COMPLETOS (OPCIONAL DE SOPORTE)
-- ==========================================
CREATE TABLE IF NOT EXISTS dashboard_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dataset VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    business_description TEXT,
    revenue BIGINT,
    users INT,
    risk_score DECIMAL(5,2),
    efficiency DECIMAL(5,2),
    timestamp VARCHAR(100) NOT NULL
);

COMMENT ON TABLE dashboard_reports IS 'Historial de reportes ejecutivos de calidad consolidados con datos empresariales.';


-- ==========================================
-- TABLA 5: USUARIOS REGISTRADOS Y CREDENCIALES
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- SHA-256 hash (hex)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Almacena las credenciales de directores e inspectores con acceso al aplicativo.';
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sembrar usuario por defecto (director / director123)
-- SHA-256 de 'director123': 4e73b22cf9017686524317ed5c088ef399c43d3df13f707f59d57a2b9044e138
INSERT INTO users (username, email, password)
SELECT 'director', 'director@strategist.co', '4e73b22cf9017686524317ed5c088ef399c43d3df13f707f59d57a2b9044e138'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'director');


-- ==========================================
-- TABLA 6: REGISTROS DE INSPECCIÓN CRUDA (ETL RAW DATA)
-- ==========================================
CREATE TABLE IF NOT EXISTS raw_inspections (
    id SERIAL PRIMARY KEY,
    inspector_name VARCHAR(100),                -- Nombre del inspector / operario
    costo_no_calidad NUMERIC,                   -- Costo del fallo en COP
    tolerancia DECIMAL(5,2),                    -- Tolerancia medida
    resultado VARCHAR(50),                      -- 'Aceptado' o 'Defectuoso'
    region VARCHAR(50)                          -- Ubicación o planta de origen
);

COMMENT ON TABLE raw_inspections IS 'Almacena los registros crudos subidos antes de ser normalizados y procesados por el pipeline ETL.';


-- ==========================================
-- PERMISOS Y CONFIGURACIÓN DE SEGURIDAD (INSFORGE)
-- ==========================================

-- 1. Habilitar permisos de inserción y consulta en secuencias y tablas para acceso anónimo / SDK
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO public;

-- 2. Desactivar RLS por defecto para permitir acceso directo de lectura/escritura desde la capa web (SDK)
ALTER TABLE active_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE etl_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE raw_inspections DISABLE ROW LEVEL SECURITY;
