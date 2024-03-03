import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Providers from "@/components/Providers";
import SessionProvider from "@/contexts/SessionProvider";
import getServerUser from "@/lib/getServerUser";

import "./globals.css";
import "@uploadthing/react/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={{ user }}>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}