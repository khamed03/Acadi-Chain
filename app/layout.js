"use client";
import React from "react";
import "./globals.css";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { WagmiConfig } from "wagmi";
import { config } from "@/lib/web3";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={config}>
          <TopNav />
          <main className="container">{children}</main>
          <Footer />
        </WagmiConfig>
      </body>
    </html>
  );
}
