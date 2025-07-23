import './globals.css';
import { Inter } from 'next/font/google';
import SessionProvider from './SessionProvider'; // Importez le SessionProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ProFoot - Pronostics Sportifs',
  description: 'Gérez vos pronostics sportifs en toute simplicité.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* Enveloppez l'application avec le SessionProvider */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}