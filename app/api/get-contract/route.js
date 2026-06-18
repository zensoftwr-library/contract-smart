import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

// Reparat: Folosește variabilele corecte din Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token) return NextResponse.json({ success: false, error: 'Token lipsa' }, { status: 400 });
  
  const { data, error } = await supabase.from('contracts').select('*').eq('token_semnare_client', token).single();
  if (error) return NextResponse.json({ success: false }, { status: 404 });
  return NextResponse.json({ success: true, contract: data });
}