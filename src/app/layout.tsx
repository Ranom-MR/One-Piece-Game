import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'One Piece RPG - Rota dos Mares',
  description: 'RPG Browser Point-and-Click Widescreen inspirado em Hero Zero e One Piece',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex justify-center selection:bg-amber-500 selection:text-black">
        {/* Container Widescreen Desktop-First (85-90% de tela no PC, max-w-7xl) */}
        <div className="w-full max-w-7xl min-h-screen flex flex-col bg-slate-900 border-x border-slate-800 shadow-2xl relative md:my-0 md:rounded-none">
          {children}
        </div>
      </body>
    </html>
  );
}
