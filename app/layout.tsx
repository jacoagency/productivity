import { Inter } from 'next/font/google';
import { Providers } from "./providers";
import { ThemeToggle } from './components/theme-toggle';
import { UserButton } from "@clerk/nextjs";
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background text-foreground font-sans antialiased`}>
        <Providers>
          <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
            <UserButton afterSignOutUrl="/" />
            <ThemeToggle />
          </div>
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
