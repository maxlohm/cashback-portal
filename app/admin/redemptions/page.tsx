// app/admin/redemptions/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = false; // oder 0
export const runtime = 'nodejs';

import RedemptionsClient from './RedemptionsClient';

export default function Page() {
  return <RedemptionsClient />;
}
