import './globals.css';

export const metadata = {
  title: 'UI Replay — Record and replay user interactions',
  description:
    'A developer tool that captures user interactions, replays them with high visual fidelity, and surfaces intelligent insights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
