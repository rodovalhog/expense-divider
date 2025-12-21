import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils'; // Not strictly needed here if we don't apply classes to body via cn but good practice

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Expense Divider',
  description: 'Split expenses easily with your partner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "antialiased min-h-screen bg-[#0a0a0a]")}>{children}</body>
    </html>
  );
}
