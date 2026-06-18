import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const { data, error } = await supabase.from('contracts').select('*').eq('token_semnare_client', token).single();
  if (error) return NextResponse.json({ success: false }, { status: 404 });
  return NextResponse.json({ success: true, contract: data });
}