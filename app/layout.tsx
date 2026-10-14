import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:{default:"EL LENTE TARIJEÑO | Noticias de Tarija",template:"%s | EL LENTE TARIJEÑO"},description:"Noticias, política e investigación de Tarija y sus provincias."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
