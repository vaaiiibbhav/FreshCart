import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Provider from "../Provider";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Urban Grocer | 10 minutes delivery",
  description: "10 minutes delivery of groceries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
          <Provider>
            <StoreProvider>
              <InitUser />
              {children}
            </StoreProvider>
          </Provider>
      </body>
    </html>
  );
}
