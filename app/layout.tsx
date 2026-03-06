import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Money - Suas finanças sob controle",
  description: "Plataforma de gestão financeira pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
