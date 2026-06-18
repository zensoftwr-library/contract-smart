export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // VERIFICARE PLATĂ / DETECTOR STRATEGIC LEMON SQUEEZY (CONT FONDATOR)
    if (body.isLifetimePurchase) {
      const lemonResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json'
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: { checkout_data: { email: body.clientEmail } },
            relationships: {
              store: { data: { type: 'stores', id: process.env.LEMON_STORE_ID } },
              variant: { data: { type: 'variants', id: process.env.LEMON_VARIANT_ID } }
            }
          }
        })
      });
      const checkoutData = await lemonResponse.json();
      return NextResponse.json({ success: true, redirectUrl: checkoutData.data.attributes.url });
    }

    // SALVARE ÎN SUPABASE & GENERARE DOCUMENT SECURIZAT
    const token = crypto.randomBytes(16).toString('hex');
    const fileHash = crypto.createHash('sha256').update(`${body.clientNume}-${body.valoare}-${Date.now()}`).digest('hex');

    const { error } = await supabase.from('contracts').insert([{
      prestator_nume: body.prestatorNume, prestator_cui: body.prestatorCui, prestator_email: body.prestatorEmail,
      prestator_logo: body.prestatorLogo, prestator_culoare: body.prestatorCuloare,
      client_nume: body.clientNume, client_cui: body.clientCui, client_email: body.clientEmail, client_telefon: body.clientTelefon,
      obiect_contract: body.obiect, valoare_totala: body.valoare,
      clauza_proprietate_intelectuala: body.clauzaPi, clauza_penalitati: body.clauzaPenalitati, clauza_limitare_revizii: body.clauzaRevizii,
      tarif_orar_suplimentar: body.tarifOrar, clauza_raw_foto: body.clauzaRawFoto, clauza_marketing_terti: body.clauzaMarketingTerti,
      clauza_aprobare_tacita: body.clauzaAprobareTacita, clauza_taxa_anulare: body.clauzaTaxaAnulare,
      emite_factura_avans: body.emiteFacturaAvans, trimite_pe_whatsapp: body.trimitePeWhatsapp,
      token_semnare_client: token, hash_securitate: fileHash, ip_prestator: ip
    }]);

    if (error) throw error;

    // INTEGRARARE WHATSAPP PRIN TWILIO
    if (body.trimitePeWhatsapp && body.clientTelefon) {
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          To: `whatsapp:${body.clientTelefon}`,
          Body: `Bună ziua! Ați primit un contract securizat pentru proiectul "${body.obiect}". Îl puteți semna grafic aici: http://localhost:3000/semneaza/${token}`
        })
      });
    }

    await resend.emails.send({
      from: 'securitate@contractsmart.ro',
      to: body.clientEmail,
      subject: '📄 Semnează Contract Nou',
      html: `<p>Accesează portalul pentru semnare: <a href="http://localhost:3000/semneaza/${token}">Portal Semnătură</a></p>`
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}