export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export type IssueCategory = 'SPF' | 'DMARC' | 'DKIM' | 'MX' | 'BIMI' | 'BLACKLIST' | 'TLS' | 'GENERAL';

export interface AuditIssue {
  id: string;
  category: IssueCategory;
  severity: Severity;
  title: string;
  description: string;
  recommendation?: string;
}

export type SpfQualifier = '+all' | '-all' | '~all' | '?all' | 'neutral' | 'none';

export interface SpfRecord {
  raw: string | null;
  isValid: boolean;
  qualifier: SpfQualifier | null;
  mechanisms: string[];
  dnsLookupCount: number;
  warnings: string[];
  errors: string[];
}

export type DmarcPolicy = 'none' | 'quarantine' | 'reject';

export interface DmarcRecord {
  raw: string | null;
  isValid: boolean;
  policy: DmarcPolicy | null;
  subdomainPolicy: DmarcPolicy | null;
  percentage: number | null;
  rua: string[];
  ruf: string[];
  tags: Record<string, string>;
  warnings: string[];
  errors: string[];
}

export interface DkimRecord {
  selector: string;
  raw: string | null;
  isValid: boolean;
  publicKey: string | null;
  keyType: string | null;
  tags: Record<string, string>;
}

export interface DkimAuditResult {
  found: boolean;
  records: DkimRecord[];
  checkedSelectors: string[];
  warnings: string[];
  errors: string[];
}

export interface MxRecordItem {
  exchange: string;
  priority: number;
}

export interface MxAuditResult {
  records: MxRecordItem[];
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface BimiRecord {
  raw: string | null;
  isValid: boolean;
  logoUrl: string | null;
  authorityUrl: string | null;
  hasVmc: boolean;
  tags: Record<string, string>;
  warnings: string[];
  errors: string[];
}

export interface BlacklistDetail {
  provider: string;
  listed: boolean;
  returnCode?: string;
}

export interface BlacklistAuditResult {
  ip: string;
  checked: number;
  listed: number;
  details: BlacklistDetail[];
}

export interface TlsAuditResult {
  mxHost: string;
  supported: boolean;
  version?: string;
  certValid?: boolean;
  issuer?: string;
  expiresInDays?: number;
}

export type DomainAuditStatus = 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';

export interface AuditSummary {
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

export interface DomainAuditReport {
  domain: string;
  timestamp: string;
  score: number;
  status: DomainAuditStatus;
  summary: AuditSummary;
  issues: AuditIssue[];
  spf: SpfRecord;
  dmarc: DmarcRecord;
  dkim: DkimAuditResult;
  mx: MxAuditResult;
  bimi: BimiRecord;
  blacklists: BlacklistAuditResult;
  tls: TlsAuditResult;
}
