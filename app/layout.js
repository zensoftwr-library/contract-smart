import './globals.css';

export const metadata = {
  title: 'ContractSmart Premium - Contracte Digitale Securizate',
  description: 'Serviciu inteligent de generare și semnare contracte anti-țeapă cu audit cryptographic.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}