import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { cui } = await request.json();
    const cuiCurat = cui ? cui.toString().replace(/[^0-9]/g, '') : '';

    if (!cuiCurat) {
      return NextResponse.json({ success: false, message: 'CUI invalid.' }, { status: 400 });
    }

    // Apelăm OpenAPI.ro folosind cheia ta securizată din producție
    const apiKey = process.env.OPENAPI_API_KEY;
    
    const response = await fetch(`https://api.openapi.ro/api/companies/${cuiCurat}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey, // Cheia ta securizată
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.name) {
        return NextResponse.json({
          success: true,
          nume: data.name, // Aici va returna exact "PHOENIX DETAILING CENTER SRL"
          adresa: data.address || 'România',
          cui: cuiCurat
        });
      }
    }

    return NextResponse.json({ success: false, message: 'Firma nu a putut fi identificată în baza de date reală.' });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Eroare de conexiune.' }, { status: 500 });
  }
}