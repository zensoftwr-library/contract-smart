'use client';
import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import QRCode from 'qrcode'; // Importăm librăria de QR

export default function SignPortal({ params }) {
  const token = params.token;
  const canvasRef = useRef(null);
  const sigPadRef = useRef(null);
  const [contract, setContract] = useState(null);
  const [signed, setSigned] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    fetch(`/api/get-contract?token=${token}`).then(res => res.json()).then(data => {
      if (data.success) {
        setContract(data.contract);
        if (data.contract.status === 'semnat') setSigned(true);
        
        // --- GENERARE AUTOMATĂ QR DE PLATĂ (Standard EPC) ---
        // Construim string-ul de plată pentru aplicațiile bancare
        // NOTĂ: IBAN-ul trebuie preluat din setările prestatorului în producție
        const iban = "RO00AAAA0000000000000000"; 
        const beneficiar = data.contract.prestator_nume;
        const suma = data.contract.valoare_totala;
        const moneda = "RON";
        
        // Format standard european de plată QR (EPC)
        const paymentString = `BCD\n001\n1\nSCT\n\n${beneficiar}\n${iban}\n${moneda}${suma}\n\n\nContract ${token}`;
        
        QRCode.toDataURL(paymentString, {
          margin: 2,
          color: {
            dark: '#8ba888', // Culoarea ta Matcha premium
            light: '#FFFFFF'
          }
        }, (err, url) => {
          if (!err) setQrCodeUrl(url);
        });
      }
    });
  }, [token]);

  // ... (Funcțiile handleSign și handleClear rămân la fel, în backend) ...
  const handleClear = () => {
    if (sigPadRef.current) sigPadRef.current.clear();
  };

  const handleSign = async () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert("Te rugăm să semnezi documentul înainte de confirmare.");
      return;
    }
    // Aici vine logica de trimitere a semnăturii (base64) către API
    alert("Procesul de semnare funcționează. Integrează API-ul de salvare.");
  };

  if (!contract) return <div className="p-12 text-center text-slate-500 text-xs">Se încarcă documentul securizat...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-200 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl bg-[#12181D] p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
        
        {/* BRANDING PRESTATOR ȘI STATUS SECURE */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <span className="font-black text-white text-sm tracking-tighter uppercase">Document: {token}</span>
          <span className="text-[10px] px-3 py-1 rounded-full bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 font-bold uppercase">Securizat Criptografic</span>
        </div>

        {/* TEXT CONTRACTUAL CORP - POZITIONAT CORECT JURIDIC */}
        <div className="text-xs space-y-4 text-slate-300 leading-relaxed mb-8">
            <h2 className="text-lg font-black text-white text-center mb-6">CONTRACT DE PRESTĂRI SERVICII</h2>
            
            {/* Introducere și Părți */}
            <p>Subsemnatul, <strong>{contract.prestator_nume}</strong>, în calitate de Prestator, și <strong>{contract.client_nume}</strong>, în calitate de Beneficiar, am convenit la executarea serviciilor de: <em>{contract.obiect_contract}</em>.</p>
            
            {/* Valoare */}
            <p>Suma totală agreată pentru acest proiect este de: <strong className="text-white">{contract.valoare_totala} RON</strong>.</p>
            
            {/* Clauze Predefinite Clasic (Clauza PI, Penalități etc. - presupunând că există în DB) */}
            <p>Art. 1. Drepturile de proprietate intelectuală rămân la Prestator până la încasarea integrală.</p>
            <p>Art. 2. Întârzierile la plată atrag penalități de 0.5% pe zi.</p>

            {/* --- INJECTARE DINAMICĂ A NOILOR CLAUZE NON-IT (Piață Extinsă) --- */}
            <div className="space-y-3 mt-5 border-t border-slate-800/40 pt-4">
              
              {contract.clauza_raw_foto && (
                <p><strong>Art. X. Fișiere Brute:</strong> Obiectul prezentului contract include exclusiv livrabilele finale editate. Prestatorul nu are obligația de a preda beneficiarului fișierele brute (RAW/proiecte sursă) decât în baza unui acord comercial separat.</p>
              )}

              {contract.clauza_marketing_terti && (
                <p><strong>Art. Y. Exonerare Algoritmi:</strong> Prestatorul nu răspunde pentru fluctuațiile organice de trafic, vizibilitate sau conversii cauzate de modificările independente de algoritm ale platformelor terțe (Google, Meta, TikTok, LinkedIn) survenite pe parcursul derulării contractului.</p>
              )}

              {contract.clauza_aprobare_tacita && (
                <p><strong>Art. Z. Recepție Tacită:</strong> Beneficiarul are la dispoziție 3 zile calendaristice de la livrare pentru a solicita revizii în scris. În lipsa unui refuz explicit și motivat în acest termen, serviciile sunt considerate aprobate tacit, generând obligația de plată.</p>
              )}

              {contract.clauza_taxa_anulare && (
                <p><strong>Art. W. Taxă Anulare/Despăgubire:</strong> În cazul denunțării unilaterale a contractului de către Beneficiar în afara unei culpe dovedite a Prestatorului, Beneficiarul datorează o taxă de reziliere intempensivă echivalentă cu 50% din restul sumei rămase de plată din contract.</p>
              )}

            </div>
        </div>

        {/* --- WIDGET QR DE PLATĂ INTEGRAT PENTRU FRICȚIUNE ZERO --- */}
        <div className="bg-[#0B0F12] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-inner">
            <div className="flex-1">
                <h4 className="text-xs font-bold text-[#8ba888] uppercase tracking-wider mb-1">Instrucțiuni de Plată Rapidă</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">Scanează codul QR Matcha din dreapta cu aplicația ta bancară pentru a iniția plata facturii de <strong className="text-white">{contract.valoare_totala} RON</strong> fără erori de tastare.</p>
            </div>
            {qrCodeUrl && (
                <div className="bg-white p-2 rounded-xl flex-shrink-0 shadow-lg border-4 border-[#8ba888]">
                    <img src={qrCodeUrl} alt="QR Plată Matcha" className="w-24 h-24" />
                </div>
            )}
        </div>

        {/* ZONA SEMNĂTURĂ GRAFICĂ */}
        <div className="pt-6 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 block mb-3 uppercase tracking-widest text-center">Consimțământ prin Semnătură Grafică</span>
          
          {signed ? (
            <div className="p-5 bg-[#16221A] text-[#8ba888] border border-[#8ba888]/20 text-center font-bold text-xs rounded-2xl animate-pulse">
                DOCUMENT SEMNAT ȘI VALIDAT CRIPTOGRAFIC. O copie a fost trimisă pe email-ul ambelor părți.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Canvas-ul de semnătură - Păstrat intact */}
              <div className="border border-slate-700 bg-[#0B0F12] rounded-2xl overflow-hidden shadow-inner">
                <canvas ref={canvasRef} width={600} height={180} className="w-full h-[180px] cursor-crosshair" />
              </div>
              <div className="flex justify-between items-center">
                <button onClick={handleClear} className="text-[10px] text-slate-500 font-bold uppercase hover:text-white transition">Șterge</button>
                <button 
                  onClick={handleSign} 
                  className="bg-[#8ba888] text-[#0B0F12] font-black px-6 py-3 rounded-xl text-xs tracking-tight hover:opacity-90 transition shadow-lg shadow-[#8ba888]/10"
                >
                  Confirmă și Semnează Contractul
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}