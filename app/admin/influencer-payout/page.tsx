// app/admin/influencer-payout/page.tsx
import { createClient } from '@/utils/supabaseServer';
import InfluencerPayoutClient from './InfluencerPayoutClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const supabase = createClient();

  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error || !isAdmin) {
    return (
      <div className="p-6 text-sm text-red-600">
        Kein Zugriff.
      </div>
    );
  }

  const { data: partners } = await supabase
    .from('partners')
    .select('id,name')
    .order('name');

  return <InfluencerPayoutClient partners={partners ?? []} />;
}
