import fs from 'node:fs/promises';
import path from 'node:path';

export interface SubscriptionRecord {
  domain: string;
  email: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled';
  createdAt: string;
  updatedAt: string;
}

// In-memory cache for ultra-fast access
const inMemorySubscriptions = new Map<string, SubscriptionRecord>();

// Seed initial demo active subscription for tests and dev verification
inMemorySubscriptions.set('sub_seed_uniandes', {
  domain: 'uniandes.edu.co',
  email: 'segurmng@uniandes.edu.co',
  stripeSubscriptionId: 'sub_seed_uniandes',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'subscriptions.json');

let isInitialized = false;

async function ensureInitialized() {
  if (isInitialized) return;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DB_FILE, 'utf-8');
    const records = JSON.parse(content) as SubscriptionRecord[];
    for (const record of records) {
      inMemorySubscriptions.set(record.stripeSubscriptionId, record);
    }
  } catch {
    // If file doesn't exist yet, save current in-memory seed
    await persistToFile();
  } finally {
    isInitialized = true;
  }
}

async function persistToFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const records = Array.from(inMemorySubscriptions.values());
    await fs.writeFile(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Persistence Error]:', err);
  }
}

/**
 * Saves or updates a customer subscription record upon successful Stripe checkout.
 */
export async function saveSubscription(
  domain: string,
  stripeSubscriptionId: string,
  email: string
): Promise<SubscriptionRecord> {
  await ensureInitialized();

  const now = new Date().toISOString();
  const existing = inMemorySubscriptions.get(stripeSubscriptionId);

  const record: SubscriptionRecord = {
    domain: domain.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    stripeSubscriptionId,
    status: 'active',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  inMemorySubscriptions.set(stripeSubscriptionId, record);
  await persistToFile();

  console.log(`[DB] Suscripción activa guardada para ${domain} (${stripeSubscriptionId})`);
  return record;
}

/**
 * Returns all currently active domain subscriptions configured for 24/7 monitoring.
 */
export async function getActiveSubscriptions(): Promise<
  Array<{ domain: string; email: string; stripeSubscriptionId: string }>
> {
  await ensureInitialized();

  return Array.from(inMemorySubscriptions.values())
    .filter((sub) => sub.status === 'active')
    .map(({ domain, email, stripeSubscriptionId }) => ({
      domain,
      email,
      stripeSubscriptionId,
    }));
}

/**
 * Marks a subscription as canceled, disabling recurring monitoring.
 */
export async function deactivateSubscription(
  stripeSubscriptionId: string
): Promise<boolean> {
  await ensureInitialized();

  const record = inMemorySubscriptions.get(stripeSubscriptionId);
  if (!record) {
    // Also try to find by domain if passed as fallback
    for (const [key, val] of inMemorySubscriptions.entries()) {
      if (val.domain === stripeSubscriptionId) {
        val.status = 'canceled';
        val.updatedAt = new Date().toISOString();
        inMemorySubscriptions.set(key, val);
        await persistToFile();
        return true;
      }
    }
    return false;
  }

  record.status = 'canceled';
  record.updatedAt = new Date().toISOString();
  inMemorySubscriptions.set(stripeSubscriptionId, record);
  await persistToFile();

  console.log(`[DB] Suscripción cancelada para ${record.domain} (${stripeSubscriptionId})`);
  return true;
}
