import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml'
  }
});

export async function GET() {
  try {
    // Folosim un feed global de business/economie foarte stabil și imun la blocaje
    const feed = await parser.parseURL('http://feeds.feedburner.com/hotnews_ro_economie');
    
    if (!feed || !feed.items || feed.items.length === 0) {
      throw new Error("Feed gol");
    }

    const stiriMapate = feed.items.slice(0, 6).map(item => ({
      sursa: "Mediafax / HotNews",
      titlu: item.title || "Știre Economică de Actualitate",
      link: item.link || "https://www.hotnews.ro"
    }));

    return NextResponse.json({ success: true, stiri: stiriMapate });
  } catch (error) {
    console.log("Eroare la parsarea RSS, trimitem gol pentru a activa fallback-ul din interfata:", error.message);
    return NextResponse.json({ success: false, stiri: [] });
  }
}