import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(request) {
  try {
    const { token, semnatura } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    const { data: records, error: updateError } = await supabase
      .from('contracts')
      .update({ status: 'semnat', semnatura_grafica_client: semnatura, ip_client: ip, data_semnare_client: new Date().toISOString() })
      .eq('token_semnare_client', token)
      .select();

    if (updateError || !records.length) throw new Error('Contractul nu poate fi actualizat.');
    const contract = records[0];

    // INTEGRARARE CLOUD AUTOMATĂ SMARTBILL LA SEMNARE
    if (contract.emite_factura_avans) {
      await fetch('https://cloud.smartbill.ro/api/invoice', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.SMARTBILL_USER}:${process.env.SMARTBILL_API_KEY}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyVatCode: contract.prestator_cui,
          client: { name: contract.client_nume, vatCode: contract.client_cui, email: contract.client_email },
          products: [{ name: `Avans proiect ref SHA-${contract.hash_securitate.substring(0,6)}`, price: contract.valoare_totala, isTaxIncluded: true, quantity: 1, measuringUnit: 'buc' }]
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}