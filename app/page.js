'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [qrType, setQrType] = useState('vcard'); 
  const [qrData, setQrData] = useState({ name: '', phone: '', iban: '', suma: '', url: '' });
  const [clauzaMarketingTerti, setClauzaMarketingTerti] = useState(false);
  const [clauzaTaxaAnulare, setClauzaTaxaAnulare] = useState(false);
  
  // STATE-URI PENTRU DATE LIVE DE REȚEA
  const [cursBnr, setCursBnr] = useState({ eur: '4.9752', usd: '4.5820' });
  const [indiciBursa, setIndiciBursa] = useState({
    bet: { puncte: '17,420.50', procent: '+1.24%' },
    sp500: { puncte: '5,310.12', procent: '+0.68%' },
    nasdaq: { puncte: '18,650.45', procent: '-0.12%' }
  });
  const [stiriLive, setStiriLive] = useState([]);

  // LOGICĂ MANAGEMENT SESIUNE UTILIZATOR
  const [user, setUser] = useState(null); 
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // CALCULATOR FISCAL COMPLEX 2026
  const [fiscal, setFiscal] = useState({
    venitLunar: 15000,
    formaJuridica: 'SRL', 
    platitorTva: false,
    areAngajati: true,
    normaRegiune: 45000
  });

  const [formData, setFormData] = useState({
    prestatorNume: '', prestatorCui: '', prestatorEmail: '', prestatorLogo: '', prestatorCuloare: '#8ba888',
    clientNume: '', clientCui: '', clientEmail: '', clientTelefon: '',
    obiect: '', valoare: '', emiteFacturaAvans: false, trimitePeWhatsapp: false,
    clauzaPi: true, clauzaPenalitati: true, clauzaRevizii: false, tarifOrar: '150',
    clauzaRawFoto: false, clauzaMarketingTerti: false, clauzaAprobareTacita: false, clauzaTaxaAnulare: false,
    clauzaSplitPayment: false,
    clauzaRetentie: false
  });

  // COLECTARE DATE LIVE
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/EUR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setCursBnr({
            eur: data.rates.RON ? data.rates.RON.toFixed(4) : '4.9752',
            usd: (data.rates.RON / data.rates.USD) ? (data.rates.RON / data.rates.USD).toFixed(4) : '4.5820'
          });
        }
      }).catch(() => console.log("Fallback BNR"));

    fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=^BET,^GSPC,^IXIC')
      .then(res => res.json())
      .then(data => {
        const quotes = data?.quoteResponse?.result;
        if (quotes && quotes.length >= 3) {
          setIndiciBursa({
            bet: { puncte: quotes[0].regularMarketPrice?.toLocaleString('ro-RO') || '17,420.50', procent: (quotes[0].regularMarketChangePercent >= 0 ? '+' : '') + quotes[0].regularMarketChangePercent?.toFixed(2) + '%' },
            sp500: { puncte: quotes[1].regularMarketPrice?.toLocaleString('ro-RO') || '5,310.12', procent: (quotes[1].regularMarketChangePercent >= 0 ? '+' : '') + quotes[1].regularMarketChangePercent?.toFixed(2) + '%' },
            nasdaq: { puncte: quotes[2].regularMarketPrice?.toLocaleString('ro-RO') || '18,650.45', procent: (quotes[2].regularMarketChangePercent >= 0 ? '+' : '') + quotes[2].regularMarketChangePercent?.toFixed(2) + '%' }
          });
        }
      }).catch(() => console.log("Fallback Bursă"));

    const incarcaStiriSecurizat = async () => {
      try {
        const res = await fetch('/api/stiri-economice', { method: 'GET' });
        const data = await res.json();
        if (data && data.success && data.stiri && data.stiri.length > 0) {
          setStiriLive(data.stiri);
          return;
        }
      } catch (e) {}
      setStiriLive([
        { sursa: "Profit.ro", titlu: "Modificări plafoane microîntreprinderi: Schimbările fiscale aplicate trimestrul acesta în deconturi.", link: "https://www.profit.ro" },
        { sursa: "Ziarul Financiar", titlu: "Evoluția pieței de freelancing din România: Companiile caută contracte cu clauze ferme.", link: "https://www.zf.ro" },
        { sursa: "StartupCafe.ro", titlu: "Ghid PFA 2026: Cum se depune Declarația Unică și cum se calculează plafoanele CASS corect.", link: "https://www.startupcafe.ro" },
        { sursa: "Profit.ro", titlu: "Digitalizarea ANAF: Sistemul e-Factura introduce noi validări automate pentru firme din iunie.", link: "https://www.profit.ro" },
        { sursa: "Ziarul Financiar", titlu: "Litigii comerciale: Lipsa contractelor semnate digital duce la pierderea sumelor în instanță.", link: "https://www.zf.ro" },
        { sursa: "StartupCafe.ro", titlu: "Fonduri europene nerambursabile disponibile pentru digitalizarea activităților independente.", link: "https://www.startupcafe.ro" }
      ]);
    };
    incarcaStiriSecurizat();
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail) return alert('Introdu un email');
    setUser({ email: authEmail, hasQrPremium: false, status: 'free', credits: 1 });
    setShowAuthModal(false);
    alert("Autentificare reușită! Acum poți lansa contractul gratuit.");
  };

  const handleLogout = () => { setUser(null); };

  const calculeazaTaxeComplet = () => {
    const venitAnual = fiscal.venitLunar * 12;
    let taxeAnuale = 0;
    if (fiscal.formaJuridica === 'SRL') {
      taxeAnuale = (venitAnual * (fiscal.areAngajati ? 0.01 : 0.03)) + (venitAnual * 0.08) + 6000;
    } else {
      taxeAnuale = venitAnual * 0.10 + 12000;
    }
    return {
      taxeLunare: Math.round(taxeAnuale / 12),
      netLunar: Math.round((venitAnual - taxeAnuale) / 12),
      tvaMentiune: fiscal.platitorTva ? "Plătitor TVA" : "Neplătitor TVA"
    };
  };

  const rezultateFiscale = calculeazaTaxeComplet();

  const handleVerificaCui = async (tipPartener) => {
  // tipPartener poate fi 'prestator' sau 'client'
  const cuiDeCautat = tipPartener === 'prestator' ? formData.prestatorCui : formData.clientCui;
  
  // Curățăm textul direct aici înainte de trimitere
  const cuiCurat = cuiDeCautat ? cuiDeCautat.replace(/[^0-9]/g, '') : '';

  if (!cuiCurat) {
    alert('Te rugăm să introduci un CUI valid format doar din cifre.');
    return;
  }

  try {
    const res = await fetch('/api/company-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cui: cuiCurat }) // Trimitem strict valoarea text curățată
    });

    const data = await res.json();

    if (data.success) {
      if (tipPartener === 'prestator') {
        setFormData(prev => ({ ...prev, prestatorNume: data.nume }));
      } else {
        setFormData(prev => ({ ...prev, clientNume: data.nume }));
      }
    } else {
      alert(data.message || 'Firma nu a fost găsită.');
    }
  } catch (err) {
    console.error(err);
    alert('Eroare la conectarea cu API-ul de interogare.');
  }
};

  const handleQuickAnaf = async () => {
    const cui = document.getElementById('quickCui').value;
    if (!cui) return alert('Introdu un CUI în widget');
    const res = await fetch('/api/company-info', { method: 'POST', body: JSON.stringify({ cui }) });
    const data = await res.json();
    alert(data.success ? `Firmă identificată: ${data.nume}` : "CUI invalid.");
  };

  const handleCumparaPremium = async () => {
    setLoading(true);
    const res = await fetch('/api/generate-contract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLifetimePurchase: true, clientEmail: user?.email || 'test@email.com' })
    });
    const data = await res.json();
    if (data.redirectUrl) window.location.href = data.redirectUrl;
    setLoading(false);
  };

  // LOGICĂ LANSARE CONTRACT MUTATĂ SECURE LA FINAL
  const handleLansareContract = async (e) => {
    e.preventDefault();
    
    // Fricțiune 0: Dacă nu are cont, îi oprim acțiunea temporar și îi cerem contul gratuit
    if (!user) {
      alert('Contractul este configurat cu succes! Pentru a descărca și trimite documentul gratuit către client, creează un cont rapid în 10 secunde.');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    const res = await fetch('/api/generate-contract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, prestatorEmail: user.email })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) alert(`Contract lansat! Link portal client: http://localhost:3001/semneaza/${data.token}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 font-sans pb-16 relative">
      
      {/* NAVBAR */}
      <nav className="bg-[#12181D] border-b border-slate-800 py-4 px-6 flex justify-between items-center shadow-lg">
  
  {/* LOGO CONSTRUIT DIRECT ÎN COD */}
  <div className="w-[180px] h-[30px] flex items-center">
    <svg viewBox="0 0 240 40" className="w-full h-full">
      <g transform="translate(0, 2)">
        <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" 
              fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round"/>
        <path d="M16 21 L21 26 L32 12" 
              fill="none" stroke="#8ba888" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
        Contract<tspan fill="#8ba888">Smart</tspan>
      </text>
    </svg>
  </div>
  
  <div className="flex items-center space-x-5">
    <Link href="/legal" className="text-xs text-slate-400 hover:text-white transition">Bază Legală</Link>
    <span className="text-slate-800">|</span>
    
    {!user ? (
      <button type="button" onClick={() => setShowAuthModal(true)} className="text-xs font-bold text-slate-300 hover:text-[#8ba888] transition">Autentificare / Cont Nou</button>
    ) : (
      <div className="flex items-center space-x-3 text-xs">
        <span className="text-slate-400">Cont: <strong className="text-white font-mono font-normal">{user.email}</strong> <span className="ml-1.5 text-[10px] uppercase font-bold bg-[#16221A] text-[#8ba888] px-2 py-0.5 rounded border border-emerald-900/40">{user.status === 'founder' ? 'Fondator' : 'Gratuit'}</span></span>
        <button type="button" onClick={handleLogout} className="text-red-400 font-bold hover:underline">Ieșire</button>
      </div>
    )}

    <button onClick={handleCumparaPremium} className="bg-[#8ba888] hover:opacity-90 text-[#0B0F12] font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-[#8ba888]/10">Cont Fondator (199 RON)</button>
  </div>
</nav>

      {/* MODAL AUTH */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12181D] border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
            <button type="button" onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-md font-bold">✕</button>
            <h3 className="text-xl font-bold text-white mb-2">{isSignUp ? 'Creează un Cont Nou' : 'Autentificare Platformă'}</h3>
            <p className="text-xs text-slate-500 mb-6">Salvează securizat contractul tău gratuit în baza de date.</p>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Adresă de Email</label>
                <input type="email" required placeholder="nume@companie.ro" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Parolă</label>
                <input type="password" required placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
              </div>
              <button type="submit" className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-3 rounded-xl text-xs tracking-tight transition hover:opacity-90 mt-2">{isSignUp ? 'Confirmă Înregistrarea' : 'Conectare Securizată'}</button>
            </form>
            <div className="text-center mt-5 pt-4 border-t border-slate-800/80">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-xs text-slate-400 hover:text-white underline">{isSignUp ? 'Ai deja un cont? Conectează-te' : 'Nu ai cont? Creează unul acum gratuit'}</button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {step === 1 && (
        <div className="w-full">
          <div className="max-w-4xl mx-auto text-center py-16 px-4">
            <span className="bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">Infrastructură Electronică de Securizare Comercială</span>
            <h1 className="text-5xl md:text-6xl font-black text-white mt-6 leading-tight tracking-tighter">Asigurarea Încasărilor <br/><span className="text-[#8ba888]">Prin Management de Clauze</span></h1>
            <div className="mt-10">
              {/* ACCES DIRECT ÎN FORMULAR - FRICȚIUNE 0 */}
              <button type="button" onClick={() => setStep(2)} className="bg-[#8ba888] hover:opacity-90 text-[#0B0F12] font-black px-10 py-5 rounded-xl shadow-xl shadow-[#8ba888]/5 transition text-lg tracking-tight">Configurează și Generează Contract Securizat</button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
            {/* CALCULATOR FISCAL */}
            <div className="bg-[#12181D] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between lg:col-span-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Calculator Fiscal Complex 2026</span>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Venit Brut Lunar: <span className="text-white font-bold">{fiscal.venitLunar} RON</span></label>
                    <input type="range" min="3000" max="50000" step="500" value={fiscal.venitLunar} onChange={e => setFiscal({...fiscal, venitLunar: Number(e.target.value)})} className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#8ba888]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1">Formă Organizare</label>
                      <select value={fiscal.formaJuridica} onChange={e => setFiscal({...fiscal, formaJuridica: e.target.value})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-white outline-none">
                        <option value="SRL">SRL (Microîntreprindere)</option>
                        <option value="PFA_SISTEM_REAL">PFA (Sistem Real)</option>
                        <option value="PFA_NORMA">PFA (Normă de Venit)</option>
                      </select>
                    </div>
                    {fiscal.formaJuridica === 'PFA_NORMA' && (
                      <div>
                        <label className="text-slate-400 block mb-1">Normă Regiune (Anuală)</label>
                        <input type="number" value={fiscal.normaRegiune} onChange={e => setFiscal({...fiscal, normaRegiune: Number(e.target.value)})} className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg p-2 text-white text-xs outline-none" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center p-2 bg-[#0B0F12] rounded-lg border border-slate-800 cursor-pointer"><input type="checkbox" checked={fiscal.areAngajati} onChange={e => setFiscal({...fiscal, areAngajati: e.target.checked})} className="mr-2 accent-[#8ba888]" />Are Angajați</label>
                    <label className="flex items-center p-2 bg-[#0B0F12] rounded-lg border border-slate-800 cursor-pointer"><input type="checkbox" checked={fiscal.platitorTva} onChange={e => setFiscal({...fiscal, platitorTva: e.target.checked})} className="mr-2 accent-[#8ba888]" />Plătitor TVA</label>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 bg-[#0B0F12] p-3 rounded-xl flex justify-between items-center text-xs">
                <div><span className="text-slate-400 block">Dări Stat: <strong className="text-red-400">{rezultateFiscale.taxeLunare} RON</strong></span></div>
                <div className="text-right"><span className="text-slate-400 block">Net Lunar: <strong className="text-[#8ba888] text-sm">{rezultateFiscale.netLunar} RON</strong></span></div>
              </div>
            </div>

            {/* BURSA */}
            <div className="bg-[#12181D] p-5 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Indici Bursieri Live</span>
              <div className="space-y-2.5 text-xs">
                <div className="bg-[#0B0F12] p-2.5 rounded-xl border border-slate-800 flex justify-between"><span className="text-white">BET (București)</span><span className={indiciBursa.bet.procent.startsWith('-') ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{indiciBursa.bet.puncte} ({indiciBursa.bet.procent})</span></div>
                <div className="bg-[#0B0F12] p-2.5 rounded-xl border border-slate-800 flex justify-between"><span className="text-white">S&P 500 (Global)</span><span className={indiciBursa.sp500.procent.startsWith('-') ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{indiciBursa.sp500.puncte} ({indiciBursa.sp500.procent})</span></div>
                <div className="bg-[#0B0F12] p-2.5 rounded-xl border border-slate-800 flex justify-between"><span className="text-white">NASDAQ (Tech)</span><span className={indiciBursa.nasdaq.procent.startsWith('-') ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{indiciBursa.nasdaq.puncte} ({indiciBursa.nasdaq.procent})</span></div>
              </div>
            </div>

            {/* BNR */}
            <div className="bg-[#12181D] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Curs BNR Live & Validare</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 text-center">
                  <div className="bg-[#0B0F12] py-1.5 rounded border border-slate-800"><span className="text-slate-500 block">1 EUR</span><span className="text-white font-bold">{cursBnr.eur} RON</span></div>
                  <div className="bg-[#0B0F12] py-1.5 rounded border border-slate-800"><span className="text-slate-500 block">1 USD</span><span className="text-white font-bold">{cursBnr.usd} RON</span></div>
                </div>
                <div className="space-y-1">
                  <input type="text" id="quickCui" placeholder="CUI Client de verificat" className="w-full bg-[#0B0F12] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none" />
                  <button type="button" onClick={handleQuickAnaf} className="w-full bg-[#8ba888] text-[#0B0F12] text-xs font-bold py-1.5 rounded-lg transition hover:opacity-90">Interoghează Registru ANAF</button>
                </div>
              </div>
            </div>
          </div>

          {/* WIDGET 4: QR FREEMIUM (CONFORM SCREENSHOT 2026-06-18 003509.jpg) */}
          <div className="max-w-7xl mx-auto px-6 mt-12">
            <div className="bg-[#12181D] border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl">
              <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                <div className="flex-1 w-full space-y-5">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Generator QR Dinamic de Afaceri</span>
                    <p className="text-xs text-slate-500">Generează instant coduri scanabile. Variantele statice (.PNG) sunt gratuite.</p>
                  </div>
                  <div className="flex space-x-2 bg-[#0B0F12] p-1.5 rounded-xl border border-slate-800">
                    {[{ id: 'vcard', label: 'Carte Vizită (vCard)' }, { id: 'plată', label: 'Plată Factură (IBAN)' }, { id: 'link', label: 'Link / Portofoliu' }].map(t => (
                      <button key={t.id} type="button" onClick={() => setQrType(t.id)} className={`flex-1 text-[11px] py-2.5 rounded-lg font-bold transition ${qrType === t.id ? 'bg-[#8ba888] text-black shadow-lg shadow-[#8ba888]/10' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>
                    ))}
                  </div>
                  <div className="space-y-3 bg-[#0B0F12] p-4 rounded-2xl border border-slate-800/60">
                    {qrType === 'vcard' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Nume Complet" value={qrData.name} onChange={e => setQrData({...qrData, name: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
                        <input type="text" placeholder="Telefon" value={qrData.phone} onChange={e => setQrData({...qrData, phone: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
                      </div>
                    )}
                    {qrType === 'plată' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Cont IBAN Destinatar" value={qrData.iban} onChange={e => setQrData({...qrData, iban: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888] md:col-span-2" />
                        <input type="number" placeholder="Sumă de Plată (RON)" value={qrData.suma} onChange={e => setQrData({...qrData, suma: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
                      </div>
                    )}
                    {qrType === 'link' && (
                      <input type="url" placeholder="https://portofoliul-tau.ro" value={qrData.url} onChange={e => setQrData({...qrData, url: e.target.value})} className="w-full p-2.5 bg-[#12181D] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-[#8ba888]" />
                    )}
                  </div>
                </div>
                <div className="w-full md:w-auto bg-[#0B0F12] p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-w-[200px]">
                  <div className="bg-white p-3 rounded-xl w-36 h-36 flex flex-col items-center justify-center relative">
                    <div className="w-full h-full border-4 border-[#8ba888] border-dashed rounded flex items-center justify-center text-black font-black text-[11px]">[ QR LIVE ]</div>
                  </div>
                  <div className="w-full mt-4 space-y-2 text-center">
                    <button type="button" onClick={() => alert('Fișier descărcat gratuit în folderul web.')} className="w-full bg-[#12181D] text-slate-300 border border-slate-700 font-bold py-2 rounded-xl text-[11px]">Descarcă gratuit (.PNG)</button>
                    <div className="border-t border-slate-800/80 my-2 pt-2">
                      <button type="button" onClick={handleCumparaPremium} className="w-full bg-[#8ba888] text-[#0B0F12] font-black py-2 rounded-xl text-[11px]">{user?.hasQrPremium ? "Descarcă Vectorial (.SVG Pro)" : "Treci la QR Dinamic & SVG (49 lei)"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ȘTIRI */}
          <div className="max-w-7xl mx-auto px-6 mt-12">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Flux Monitorizare Mediativă Legală Real-Time</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stiriLive.slice(0, 6).map((stire, i) => (
                <div key={i} className="bg-[#12181D] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <span className="text-[10px] font-bold text-[#8ba888] bg-[#16221A] px-2 py-0.5 rounded border border-emerald-900/50 uppercase">{stire.sursa || "Presă Economică"}</span>
                    <h3 className="text-sm font-bold text-white mt-3 leading-snug">{stire.titlu}</h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Actualizat Live</span>
                    <a href={stire.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#8ba888] hover:underline">Vezi mai mult</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURATOR CONTRACT */}
      {step === 2 && (
        <div className="max-w-3xl mx-auto py-6 px-4">
          <div className="bg-[#12181D] p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Configurator Document Comercial Electronic</h2>
            <form onSubmit={handleLansareContract} className="space-y-6">
              {/* WHITE LABEL */}
              <div className="bg-[#0B0F12] p-5 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-[#8ba888] uppercase block">Identitate Vizuală (Branding)</span>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="CUI Prestator" value={formData.prestatorCui} onChange={e => setFormData({...formData, prestatorCui: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-lg text-xs text-white outline-none" />
                  <input type="text" placeholder="Denumire Firma Ta" value={formData.prestatorNume} onChange={e => setFormData({...formData, prestatorNume: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-lg text-xs text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <input type="text" placeholder="Link Siglă (.png)" value={formData.prestatorLogo} onChange={e => setFormData({...formData, prestatorLogo: e.target.value})} className="p-2.5 bg-[#12181D] border border-slate-700 rounded-lg text-xs text-white outline-none" />
                  <div className="flex flex-col">
                    <label className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Culoare Butoane Portal Client</label>
                    <input type="color" value={formData.prestatorCuloare} onChange={e => setFormData({...formData, prestatorCuloare: e.target.value})} className="w-full h-9 bg-transparent cursor-pointer rounded" />
                  </div>
                </div>
                <button type="button" onClick={() => handleVerificaCui('prestatorCui', 'prestatorNume')} className="w-full bg-[#12181D] border border-slate-700 text-slate-300 font-bold p-2 text-xs rounded-lg">Validează Furnizor prin ANAF</button>
              </div>

              {/* CLIENT */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase block">Identificare Beneficiar Contract</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex space-x-2">
                    <input type="text" placeholder="CUI Client" value={formData.clientCui} onChange={e => setFormData({...formData, clientCui: e.target.value})} className="w-full p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white outline-none" />
                    <button type="button" onClick={() => handleVerificaCui('clientCui', 'clientNume')} className="bg-[#8ba888] text-[#0B0F12] px-4 font-black rounded-lg text-xs">ANAF</button>
                  </div>
                  <input type="text" placeholder="Companie Client" value={formData.clientNume} onChange={e => setFormData({...formData, clientNume: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="Email Client" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white focus:border-[#8ba888]" required />
                  <input type="text" placeholder="WhatsApp Client" value={formData.clientTelefon} onChange={e => setFormData({...formData, clientTelefon: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white focus:border-[#8ba888]" />
                </div>
              </div>

              {/* FINANCIAR */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase block">Obiectul Serviciilor și Remunerație</span>
                <textarea placeholder="Descrierea explicită a sarcinilor..." value={formData.obiect} onChange={e => setFormData({...formData, obiect: e.target.value})} className="w-full p-3 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs h-16 text-white resize-none" required></textarea>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Valoare Contractuală Totală (RON)" value={formData.valoare} onChange={e => setFormData({...formData, valoare: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white" required />
                  {formData.clauzaRevizii && <input type="number" placeholder="Tarif Extra / Oră (RON)" value={formData.tarifOrar} onChange={e => setFormData({...formData, tarifOrar: e.target.value})} className="p-2.5 bg-[#0B0F12] border border-slate-700 rounded-lg text-xs text-white" />}
                </div>
              </div>

              {/* CLAUZE */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase block">Activare Clauze Specifice de Asigurare Plată</span>
            <div className="space-y-2 text-xs">
              
              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaPi} onChange={e => setFormData({...formData, clauzaPi: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">1. Suspendare Proprietate Intelectuală</span>
                  <span className="text-[10px] text-slate-500 block">Rămâne la prestator până la încasarea bancară deplină.</span>
                </div>
              </label>

              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaPenalitati} onChange={e => setFormData({...formData, clauzaPenalitati: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">2. Majorări Penalizatoare</span>
                  <span className="text-[10px] text-slate-500 block">Se calculează 0.5% pe zi din valoarea neachitată la scadență.</span>
                </div>
              </label>

              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaRevizii} onChange={e => setFormData({...formData, clauzaRevizii: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">3. Plafonare Feedback și Revizii</span>
                  <span className="text-[10px] text-slate-500 block">Maximum 2 runde incluse, restul pe tarif orar extra.</span>
                </div>
              </label>

              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaRawFoto} onChange={e => setFormData({...formData, clauzaRawFoto: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">4. Excludere Fișiere Brute (RAW)</span>
                  <span className="text-[10px] text-slate-500 block">Nu implică predarea elementelor sau bruturilor de lucru.</span>
                </div>
              </label>

              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaMarketingTerti} onChange={e => setFormData({...formData, clauzaMarketingTerti: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">5. Exonerare Algoritm</span>
                  <span className="text-[10px] text-slate-500 block">Fără răspundere pe schimbările Google/Meta/TikTok de rețea.</span>
                </div>
              </label>

              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaAprobareTacita} onChange={e => setFormData({...formData, clauzaAprobareTacita: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">6. Aprobare Tacită la 3 Zile</span>
                  <span className="text-[10px] text-slate-500 block">Se consideră aprobat dacă nu există obiecții scrise în 3 zile.</span>
                </div>
              </label>

              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaTaxaAnulare} onChange={e => setFormData({...formData, clauzaTaxaAnulare: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">7. Taxă Anulare Proiect</span>
                  <span className="text-[10px] text-slate-500 block">Obligă la plata a 50% din restul sumei în caz de denunțare unilaterală.</span>
                </div>
              </label>

              {/* CLAUZA NOUĂ 8 */}
              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaSplitPayment} onChange={e => setFormData({...formData, clauzaSplitPayment: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">8. Plată Eșalonată (Split Payment)</span>
                  <span className="text-[10px] text-slate-500 block">Deplorarea plăților în tranșe clare (Avans / Intermediar / Final).</span>
                </div>
              </label>

              {/* CLAUZA NOUĂ 9 */}
              <label className="flex items-start p-3 bg-[#0B0F12] border border-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.clauzaRetentie} onChange={e => setFormData({...formData, clauzaRetentie: e.target.checked})} className="mt-0.5 mr-3 accent-[#8ba888]" />
                <div>
                  <span className="font-bold text-white block">9. Drept de Retenție Directă</span>
                  <span className="text-[10px] text-slate-500 block">Sistarea accesului sau livrărilor fizice dacă există facturi scadente.</span>
                </div>
              </label>

            </div>
          </div>
              {/* AUTOMATIZĂRI */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase block">Sisteme de Automatizare Conexe (Cloud API)</span>
                <label className="flex items-center p-3 bg-[#0B0F12] border border-slate-800 rounded-xl text-xs cursor-pointer"><input type="checkbox" checked={formData.emiteFacturaAvans} onChange={e => setFormData({...formData, emiteFacturaAvans: e.target.checked})} className="mr-3 accent-[#8ba888]" />Emite factură de avans în SmartBill la semnare.</label>
                <label className="flex items-center p-3 bg-[#0B0F12] border border-slate-800 rounded-xl text-xs cursor-pointer"><input type="checkbox" checked={formData.trimitePeWhatsapp} onChange={e => setFormData({...formData, trimitePeWhatsapp: e.target.checked})} className="mr-3 accent-[#8ba888]" />Trimite alertă prin Twilio WhatsApp direct pe telefon.</label>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 underline">Înapoi</button>
                <button type="submit" disabled={loading} className="bg-[#8ba888] text-[#0B0F12] font-black px-8 py-4 rounded-xl text-sm transition hover:opacity-90">{loading ? 'Se înregistrează...' : 'Lansează Document Electronic Securizat'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}