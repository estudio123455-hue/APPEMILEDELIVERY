-- ==============================================================================
-- MIGRACIÓN SUPABASE: DELIVERABILITY RADAR (MONITOREO RECURRENTE & ALERTAS)
-- Tabla: public.monitored_domains
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.monitored_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    last_score INTEGER NOT NULL DEFAULT 100 CHECK (last_score >= 0 AND last_score <= 100),
    last_dmarc_policy VARCHAR(50) NOT NULL DEFAULT 'none',
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_domain UNIQUE (user_id, domain)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_monitored_domains_user_id ON public.monitored_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_domains_domain ON public.monitored_domains(domain);
CREATE INDEX IF NOT EXISTS idx_monitored_domains_last_checked ON public.monitored_domains(last_checked_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.monitored_domains ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICA DE USUARIO: Los usuarios autenticados gestionan exclusivamente sus dominios
CREATE POLICY "Users can view and manage their own monitored domains"
    ON public.monitored_domains
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. POLÍTICA DE SUPER ADMIN: Acceso total para Super Administradores de DeliverabilityGuard
CREATE POLICY "Super Admins have full access to all monitored domains"
    ON public.monitored_domains
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN (
            'estudio.123455@gmail.com',
            'deliverabilityguard@gmail.com',
            'admin@miportal.me'
        )
        OR ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
        OR ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN (
            'estudio.123455@gmail.com',
            'deliverabilityguard@gmail.com',
            'admin@miportal.me'
        )
        OR ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
        OR ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    );

-- 3. POLÍTICA DE SERVICIO: Permite lectura y actualización al Service Role (usado por el Cron Job)
CREATE POLICY "Service role can read and update all monitored domains"
    ON public.monitored_domains
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
