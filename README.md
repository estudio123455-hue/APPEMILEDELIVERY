# DeliverabilityGuard (SaaS B2B)

Plataforma de autoservicio B2B para diagnóstico, auditoría criptográfica DNS y monitoreo continuo de entregabilidad de correo electrónico (SPF, DMARC, DKIM, MX y BIMI).

## Stack Tecnológico
- **Framework:** Next.js 16+ (App Router con React 19)
- **Lenguaje:** TypeScript en modo estricto
- **Estilos:** Tailwind CSS v4 (Modo oscuro por defecto, paleta `slate` / `emerald`)
- **Backend:** Node Runtime nativo con `node:dns/promises` (cero APIs externas de terceros para resolución DNS)
- **Validación:** Zod v4 para esquemas estrictos de entrada
- **Pagos y Facturación:** Stripe Checkout & Webhooks para suscripciones desatendidas ($19 USD/mes)
- **Vigilancia Recurrente:** Vercel Cron jobs programados cada 60 min (`0 * * * *`)

## Características Clave
1. **Resolución DNS Nativa en Paralelo:**
   - Inspección simultánea de MX, SPF (`v=spf1`), DMARC (`_dmarc.dominio`), BIMI (`default._bimi.dominio`) y selectores DKIM comunes (`google`, `selector1`, `s1`, `k1`).
   - Conteo estricto de mecanismos DNS lookup (límite de 10 de la RFC 7208).
   - Detección de políticas permisivas (`+all`, `p=none`), falta de certificados VMC en BIMI y etiquetas `rua` ausentes.
2. **Scoring Dinámico (0 a 100):**
   - Penalizaciones ponderadas (-30 puntos por fallos críticos, -10 por advertencias).
3. **Frontend 100% Autoservicio:**
   - Auditoría en vivo sin formularios de contacto humano.
   - Redirección directa a Stripe Checkout con metadatos de dominio.
4. **Vigilancia Automatizada 24/7:**
   - Endpoint protegido (`/api/cron/monitor`) con `Authorization: Bearer CRON_SECRET`.
   - Detección proactiva de degradación de entregabilidad.

## Configuración Local

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en `.env.local` (ver `.env.example`):
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3001
CRON_SECRET=cron_secret_deliverabilityguard_dev
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Compilación y chequeo de tipos:
```bash
npx tsc --noEmit
npm run build
```
