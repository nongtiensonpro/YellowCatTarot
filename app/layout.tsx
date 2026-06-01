import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/components/ApiKeyProvider";
import Navigation from "@/components/Navigation";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--next-font-cinzel",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  variable: "--next-font-cinzel-decorative",
  weight: ["400", "700", "900"],
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--next-font-be-vietnam-pro",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tarot Mèo Vàng — Khám Phá Thông Điệp Vũ Trụ",
  description: "Trang web rút bài Tarot Rider-Waite-Smith kinh điển, đồng hành cùng chú Mèo Vàng ấm áp phong cách Studio Ghibli và sự luận giải thông thái từ Google Gemini AI.",
  keywords: ["tarot", "mèo vàng", "tarot mèo vàng", "rút bài tarot", "tarot tiếng việt", "studio ghibli", "rider-waite-smith", "gemini ai"],
  authors: [{ name: "Mèo Vàng" }],
  openGraph: {
    title: "Tarot Mèo Vàng — Khám Phá Thông Điệp Vũ Trụ",
    description: "Trang web rút bài Tarot Rider-Waite-Smith kinh điển, đồng hành cùng chú Mèo Vàng ấm áp phong cách Studio Ghibli.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${beVietnamPro.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (
                    args[0] &&
                    typeof args[0] === 'string' &&
                    (args[0].indexOf('THREE.Clock') !== -1 ||
                     args[0].indexOf('PCFSoftShadowMap') !== -1 ||
                     args[0].indexOf('WebGLShadowMap') !== -1 ||
                     args[0].indexOf('THREE.WebGLRenderer: Context Lost') !== -1)
                  ) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0d0d1a] text-[#f8f4e3] font-lora selection:bg-[#ffd166]/30 selection:text-[#ffd166]">
        <ApiKeyProvider>
          <Navigation />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </ApiKeyProvider>
      </body>
    </html>
  );
}


