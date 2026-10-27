import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_URL = 'https://xlmxfatjupdvuqzzciuj.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbXhmYXRqdXBkdnVxenpjaXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4Nzc3MTUsImV4cCI6MjEwODQ1MzcxNX0.1XDKcTWLUZtBPmr0zsPqalOxHZ9Pk8Qj7hFfG0b4xIA';

/**
 * Cliente de Supabase con permisos de Service Role para actualizar registros
 * de usuarios sin requerir sesión activa en cookies.
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_ANON_KEY;

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * GET: Verificación de salud y ping del webhook de Bold
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'bold-payment-webhook',
      message: 'Receptor de webhooks de Bold activo y listo para procesar pagos.',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

/**
 * POST: Procesamiento de eventos de pago de Bold
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: Record<string, any> = {};

    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.warn('[BOLD WEBHOOK] Payload no es JSON válido:', rawBody.slice(0, 100));
      return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
    }

    console.log('[BOLD WEBHOOK] Evento recibido:', JSON.stringify(payload, null, 2));

    // 1. Validar el estado del pago (APPROVED o PAID)
    const rawStatus =
      payload.status ||
      payload.data?.status ||
      payload.payment?.status ||
      payload.transaction_status ||
      (payload.event === 'payment.approved' ? 'APPROVED' : null) ||
      '';

    const statusUpper = String(rawStatus).toUpperCase().trim();
    const isApproved = ['APPROVED', 'PAID', 'SUCCESS', 'COMPLETED'].includes(statusUpper);

    if (!isApproved) {
      console.log(`[BOLD WEBHOOK] Evento ignorado con estado no aprobado: '${statusUpper}'`);
      return NextResponse.json(
        { received: true, processed: false, reason: `Estado '${statusUpper}' no requiere activación.` },
        { status: 200 }
      );
    }

    // 2. Extraer datos del payload
    const amount = Number(
      payload.amount ||
      payload.data?.amount ||
      payload.payment?.amount ||
      payload.total_amount ||
      0
    );

    const payerEmail = (
      payload.payer_email ||
      payload.data?.payer_email ||
      payload.customer?.email ||
      payload.data?.customer?.email ||
      payload.payment?.email ||
      payload.email ||
      ''
    ).toLowerCase().trim();

    let userId: string | null =
      payload.metadata?.user_id ||
      payload.data?.metadata?.user_id ||
      payload.user_id ||
      null;

    console.log(`[BOLD WEBHOOK] Pago Aprobado: Monto=$${amount} COP | Email='${payerEmail}' | UserId='${userId}'`);

    const supabaseAdmin = getSupabaseAdmin();

    // 3. Si no viene user_id, buscar el usuario en la tabla profiles por correo
    if (!userId && payerEmail) {
      const { data: profile, error: profileErr } = await (supabaseAdmin as any)
        .from('profiles')
        .select('id, user_id, email')
        .ilike('email', payerEmail)
        .maybeSingle();

      if (profile && (profile.user_id || profile.id)) {
        userId = profile.user_id || profile.id;
        console.log(`[BOLD WEBHOOK] Usuario localizado por email en profiles: '${userId}'`);
      } else {
        if (profileErr) {
          console.warn('[BOLD WEBHOOK] Error consultando profiles:', profileErr.message);
        }
        // Intentar consultar auth.users directamente si service_role tiene acceso
        try {
          const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
          const matchedUser = authData?.users?.find(
            (u) => u.email?.toLowerCase().trim() === payerEmail
          );
          if (matchedUser) {
            userId = matchedUser.id;
            console.log(`[BOLD WEBHOOK] Usuario localizado en auth.users: '${userId}'`);
          }
        } catch (authErr) {
          console.info('[BOLD WEBHOOK] Búsqueda en auth.admin omitida:', authErr);
        }
      }
    }

    // 4. Determinar membresía según el monto pagado
    // Blindaje DNS: $150.000 COP (umbral >= 140.000)
    // Pase Pro Mercado: $49.000 COP (umbral < 140.000)
    const isDnsShieldService = amount >= 140000;
    const today = new Date().toISOString().split('T')[0];

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
      last_search_date: today,
    };

    if (isDnsShieldService) {
      updatePayload.dns_shield_active = true;
      console.log('[BOLD WEBHOOK] Activando: Blindaje DNS DeliverabilityGuard ($150.000 COP)');
    } else {
      updatePayload.is_pro = true;
      console.log('[BOLD WEBHOOK] Activando: Pase Pro de Escucha de Mercado ($49.000 COP)');
    }

    // Si encontramos el userId, hacemos upsert en user_usage
    if (userId) {
      updatePayload.user_id = userId;

      const { data: existingUsage } = await (supabaseAdmin as any)
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const finalUpsert = {
        ...existingUsage,
        ...updatePayload,
      };

      const { error: upsertErr } = await (supabaseAdmin as any)
        .from('user_usage')
        .upsert(finalUpsert, { onConflict: 'user_id' });

      if (upsertErr) {
        console.error('[BOLD WEBHOOK] Error al actualizar user_usage:', upsertErr);
      } else {
        console.log(`[BOLD WEBHOOK] ¡user_usage actualizado con éxito para el usuario ${userId}!`);
      }
    } else {
      console.warn(
        `[BOLD WEBHOOK] No se encontró usuario para asociar el pago de '${payerEmail}'. Pago registrado en logs.`
      );
    }

    // Responder a Bold con 200 OK inmediatamente
    return NextResponse.json(
      {
        received: true,
        processed: true,
        activated: isDnsShieldService ? 'dns_shield' : 'market_pro',
        userIdentified: Boolean(userId),
        amount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[BOLD WEBHOOK] Excepción no controlada procesando webhook:', error);
    // Respondemos 200 a Bold con error para evitar reintentos infinitos si fue un error lógico
    return NextResponse.json(
      { received: true, error: 'INTERNAL_PROCESSING_ERROR' },
      { status: 200 }
    );
  }
}
