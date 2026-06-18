'use client';
import Link from 'next/link';

export default function LegalPage() {
  const legislatie = [
    { art: "Art. 1245 Cod Civil", titlu: "Validitatea formei electronice", text: "Contractele pot fi încheiate prin orice mijloace care reflectă consimțământul părților. Semnătura grafică stocată cu timestamp digital este recunoscută ca probă în instanță." },
    { art: "Legea 8/1996 Art. 41", titlu: "Drepturi de Autor", text: "Transferul drepturilor de proprietate intelectuală se produce doar la momentul plății integrale, conform clauzei de rezervare a proprietății." },
    { art: "Legea 455/2001", titlu: "Semnătura Electronică", text: "Asigură cadrul legal pentru identificarea autorului unui înscris în format electronic prin asocieri unice de metadate (IP, Token, Hash)." }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F12] text-slate-300 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold text-white">Documentație Legală România</h1>
          <Link href="/" className="text-xs bg-slate-800 px-4 py-2 rounded-lg">Înapoi</Link>
        </div>
        <div className="space-y-6">
          {legislatie.map((l, i) => (
            <div key={i} className="bg-[#12181D] p-6 rounded-2xl border border-slate-800">
              <span className="text-[#86EFAC] text-[10px] font-bold uppercase">{l.art}</span>
              <h3 className="text-white font-bold mt-1">{l.titlu}</h3>
              <p className="text-sm mt-2 leading-relaxed">{l.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}