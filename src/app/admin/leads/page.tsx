import { Metadata } from 'next';
import AdminLeadsClient from './AdminLeadsClient';

export const metadata: Metadata = {
  title: 'Prospección Masiva de Leads | DeliverabilityGuard Super Admin',
  description: 'Auditoría masiva de infraestructura de correo para prospección comercial B2B.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLeadsPage() {
  return <AdminLeadsClient />;
}
