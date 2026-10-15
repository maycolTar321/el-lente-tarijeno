import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EL LENTE TARIJEÑO | Periódico Digital e Investigación",
    template: "%s | EL LENTE TARIJEÑO",
  },
  description:
    "Periódico digital de investigación, política, sociedad y actualidad de Tarija, el Gran Chaco y Bolivia.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
