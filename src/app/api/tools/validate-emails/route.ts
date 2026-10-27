import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import { createClient } from '@/utils/supabase/server';
import { isUserSuperAdmin } from '@/config/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RFC_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'yopmail.com',
  'trashmail.com',
  'throwawaymail.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'mohmal.com',
  'crazymailing.com',
  'maildrop.cc',
  'nada.ltd',
  'mytemp.email',
  'burnermail.io',
  'temp-mail.org',
  'inboxkitten.com',
  'generator.email',
  'emailondeck.com',
  'tempail.com',
  'dropmail.me',
  'mintemail.com',
  'spambog.com',
]);

const FREE_WEBMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.es',
  'yahoo.co',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
]);

export interface EmailValidationItem {
  email: string;
  domain: string;
  status: 'VALID' | 'NO_MX' | 'INVALID_SYNTAX' | 'DISPOSABLE' | 'RISKY';
  syntaxValid: boolean;
  isDisposable: boolean;
  hasMx: boolean;
  isFreeWebmail: boolean;
  reason: string;
  mxRecords?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAdmin = isUserSuperAdmin(user);
    let isShieldActive = false;

    if (user) {
      const { data: usage } = await supabase
        .from('user_usage')
        .select('dns_shield_active, is_pro')
        .eq('user_id', user.id)
        .single();
      if (usage?.dns_shield_active || usage?.is_pro) {
        isShieldActive = true;
      }
    }

    const hasFullAccess = isAdmin || isShieldActive;

    const body = await request.json().catch(() => ({}));
    const rawEmails: unknown = body.emails;

    if (!rawEmails || !Array.isArray(rawEmails)) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Se esperaba un arreglo de correos en "emails".' },
        { status: 400 }
      );
    }

    // Limpiar correos y eliminar duplicados
    const cleanedEmails = Array.from(
      new Set(
        rawEmails
          .filter((e): e is string => typeof e === 'string')
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0)
      )
    );

    if (cleanedEmails.length === 0) {
      return NextResponse.json(
        { error: 'EMPTY_LIST', message: 'No se encontraron correos para validar.' },
        { status: 400 }
      );
    }

    // Control freemium: 5 para free, 50 para pro/admin
    const maxAllowed = hasFullAccess ? 50 : 5;
    const isLimited = cleanedEmails.length > maxAllowed;
    const emailsToValidate = cleanedEmails.slice(0, maxAllowed);

    // Cache local de resolución MX para no consultar el mismo dominio múltiples veces
    const mxCache = new Map<string, { hasMx: boolean; mxList: string[] }>();

    const results: EmailValidationItem[] = [];

    for (const email of emailsToValidate) {
      // 1. Verificación de Sintaxis RFC
      const isSyntaxValid = RFC_EMAIL_REGEX.test(email);
      const parts = email.split('@');
      const domain = parts[1] || '';

      if (!isSyntaxValid || !domain || !domain.includes('.')) {
        results.push({
          email,
          domain: domain || 'desconocido',
          status: 'INVALID_SYNTAX',
          syntaxValid: false,
          isDisposable: false,
          hasMx: false,
          isFreeWebmail: false,
          reason: 'Formato de sintaxis inválido según norma RFC 5322.',
        });
        continue;
      }

      // 2. Verificación de Correo Desechable
      const isDisposable = DISPOSABLE_DOMAINS.has(domain);
      if (isDisposable) {
        results.push({
          email,
          domain,
          status: 'DISPOSABLE',
          syntaxValid: true,
          isDisposable: true,
          hasMx: false,
          isFreeWebmail: false,
          reason: 'Dominio temporal / desechable detectado. Alto riesgo de rebote permanente.',
        });
        continue;
      }

      // 3. Resolución de Registros MX
      let mxData = mxCache.get(domain);
      if (!mxData) {
        try {
          const mxRecords = await dns.resolveMx(domain);
          const hasMx = Array.isArray(mxRecords) && mxRecords.length > 0;
          const mxList = hasMx
            ? mxRecords.sort((a, b) => a.priority - b.priority).map((m) => m.exchange)
            : [];
          mxData = { hasMx, mxList };
        } catch {
          mxData = { hasMx: false, mxList: [] };
        }
        mxCache.set(domain, mxData);
      }

      const isFreeWebmail = FREE_WEBMAIL_DOMAINS.has(domain);

      if (!mxData.hasMx) {
        results.push({
          email,
          domain,
          status: 'NO_MX',
          syntaxValid: true,
          isDisposable: false,
          hasMx: false,
          isFreeWebmail,
          reason: 'El dominio no tiene servidores MX configurados para recibir correos.',
        });
        continue;
      }

      results.push({
        email,
        domain,
        status: 'VALID',
        syntaxValid: true,
        isDisposable: false,
        hasMx: true,
        isFreeWebmail,
        reason: 'Correo verificado: sintaxis correcta y servidores MX activos.',
        mxRecords: mxData.mxList,
      });
    }

    const validCount = results.filter((r) => r.status === 'VALID').length;
    const disposableCount = results.filter((r) => r.status === 'DISPOSABLE').length;
    const noMxCount = results.filter((r) => r.status === 'NO_MX').length;
    const invalidSyntaxCount = results.filter((r) => r.status === 'INVALID_SYNTAX').length;

    return NextResponse.json({
      success: true,
      total: results.length,
      validCount,
      disposableCount,
      noMxCount,
      invalidSyntaxCount,
      hasFullAccess,
      isLimited,
      maxAllowed,
      results,
    });
  } catch (error) {
    console.error('[EMAIL VALIDATOR API ERROR]:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Ocurrió un error al validar los correos.' },
      { status: 500 }
    );
  }
}
