import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KhamarBari - Comprehensive Livestock Management",
    template: "%s | KhamarBari",
  },
  description: "Manage your livestock health, appointments, vaccinations, and connect with other farmers. Professional livestock management system for modern farmers.",
  keywords: ["Livestock Care", "Veterinary", "Livestock Management", "Cattle Health", "Vaccination", "Appointments", "Farm Management", "AI Livestock Assistant"],
  authors: [{ name: "KhamarBari Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "KhamarBari - Comprehensive Livestock Management",
    description: "Professional livestock management system for modern farmers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
