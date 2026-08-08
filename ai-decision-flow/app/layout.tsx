import "./globals.css";

export const metadata = {
  title: "AI Decision Flow",
  description: "Visual AI workflow builder — React Flow + Inngest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
