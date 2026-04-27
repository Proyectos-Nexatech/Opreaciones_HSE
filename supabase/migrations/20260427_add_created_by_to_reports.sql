-- ============================================================
-- Migración: Agregar campo created_by a tablas de reportes
-- Permite filtrar registros por usuario creador para control
-- de acceso por usuario (no-admin solo ve sus propios datos)
-- ============================================================

-- 1. reporte_permisos
ALTER TABLE reporte_permisos
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reporte_permisos_created_by
    ON reporte_permisos (created_by);

-- 2. reporte_asistencia
-- (Esta tabla ya puede tener created_by como UUID de supervisores_hse,
--  pero lo redefinimos para que apunte a auth.users si no existe)
ALTER TABLE reporte_asistencia
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reporte_asistencia_created_by
    ON reporte_asistencia (created_by);

-- 3. reporte_eventos
ALTER TABLE reporte_eventos
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reporte_eventos_created_by
    ON reporte_eventos (created_by);

-- 4. reporte_novedades
ALTER TABLE reporte_novedades
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reporte_novedades_created_by
    ON reporte_novedades (created_by);

-- 5. reporte_ausentismo
ALTER TABLE reporte_ausentismo
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reporte_ausentismo_created_by
    ON reporte_ausentismo (created_by);
