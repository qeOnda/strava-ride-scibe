import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ride Scribe - AI-Powered Strava Activity Descriptions',
  description: 'Turn every pedal stroke into a story. Automatically generate compelling, personalized descriptions for your Strava rides using advanced AI. Zero manual work, infinite possibilities.',
  keywords: 'Strava, AI, cycling, activity descriptions, automation, AWS Bedrock, ride tracking',
  authors: [{ name: 'Ride Scribe' }],
  openGraph: {
    title: 'Ride Scribe - AI-Powered Strava Activity Descriptions',
    description: 'Automatically generate compelling descriptions for your Strava rides using advanced AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ride Scribe - AI-Powered Strava Activity Descriptions',
    description: 'Automatically generate compelling descriptions for your Strava rides using advanced AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
