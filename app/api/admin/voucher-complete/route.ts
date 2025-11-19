import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      redemptionId,
      voucherCode,
      voucherType,
      voucherNotes,
      userEmail,
      amount,
    } = body as {
      redemptionId: string;
      voucherCode: string;
      voucherType?: string | null;
      voucherNotes?: string | null;
      userEmail: string;
      amount: number;
    };

    if (!redemptionId || !voucherCode || !userEmail) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Admin-Check
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    if (adminError || !isAdmin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // RPC: Redemption auf paid setzen + Gutschein speichern
    const { data: redemption, error } = await supabase.rpc(
      'admin_set_voucher_paid',
      {
        p_redemption_id: redemptionId,
        p_voucher_code: voucherCode,
        p_voucher_type: voucherType ?? null,
        p_voucher_notes: voucherNotes ?? null,
      },
    );

    if (error) {
      console.error('admin_set_voucher_paid error', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // TODO: hier später echten Mailversand einbauen
    console.log('Voucher email would be sent', {
      to: userEmail,
      voucherType: voucherType ?? 'Gutschein',
      voucherCode,
      amount,
    });

    return NextResponse.json({ ok: true, redemption });
  } catch (err: any) {
    console.error('voucher-complete error', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal error' },
      { status: 500 },
    );
  }
}
