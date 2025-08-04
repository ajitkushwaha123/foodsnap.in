import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/global/AppShell";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { Provider } from "react-redux";
import { store } from "@/store";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "FoodSnap – Premium Food Image Library",
  description:
    "FoodSnap is a curated library of high-quality food images approved for Zomato and Swiggy. Download and use beautiful, optimized food photos for your restaurant listings.",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en" suppressHydrationWarning>
        <ClerkProvider>
          <body className={`${poppins.variable} font-poppins antialiased`}>
            <AppShell>{children}</AppShell>

            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-5HJD7C1GQ4"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-5HJD7C1GQ4');
              `}
            </Script>
          </body>
        </ClerkProvider>
      </html>
  );
}
