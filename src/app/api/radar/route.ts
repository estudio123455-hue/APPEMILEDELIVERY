import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserSuperAdmin } from '@/config/admin';
import { executeDomainAudit } from '@/lib/dns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  cleaned = cleaned.replace(/:\d+$/, '');
  return cleaned;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Inicia sesión para ver tus dominios monitoreados.' },
        { status: 401 }
      );
    }

    const isAdmin = isUserSuperAdmin(user);
    let query = supabase.from('monitored_domains').select('*').order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ domains: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al obtener dominios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Inicia sesión para activar el Radar de Entregabilidad.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawDomain = body.domain;

    if (!rawDomain || typeof rawDomain !== 'string') {
      return NextResponse.json({ error: 'Dominio inválido' }, { status: 400 });
    }

    const domain = cleanDomain(rawDomain);
    if (domain.length < 3 || !domain.includes('.')) {
      return NextResponse.json({ error: 'Formato de dominio no válido.' }, { status: 400 });
    }

    // Execute initial audit to obtain baseline metrics
    const report = await executeDomainAudit(domain);
    const dmarcPolicy = report.dmarc.policy || 'none';
    const isBlacklisted = report.blacklists.listed > 0;

    const { data, error } = await supabase
      .from('monitored_domains')
      .insert({
        user_id: user.id,
        domain,
        last_score: report.score,
        last_dmarc_policy: dmarcPolicy,
        is_blacklisted: isBlacklisted,
        last_checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      monitored: data,
      reportSummary: {
        score: report.score,
        status: report.status,
        dmarcPolicy,
        isBlacklisted,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado al agregar dominio.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de dominio requerido' }, { status: 400 });
    }

    const isAdmin = isUserSuperAdmin(user);
    let deleteQuery = supabase.from('monitored_domains').delete().eq('id', id);

    if (!isAdmin) {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    }

    const { error } = await deleteQuery;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al eliminar dominio.' },
      { status: 500 }
    );
  }
}
