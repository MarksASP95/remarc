import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/header/header.component'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

      <head>
        {/* <!-- Google Fonts --> */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic" />

        {/* <!-- CSS Reset --> */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css" />

        {/* <!-- Milligram CSS --> */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.css" />
      </head>

      <body suppressHydrationWarning={true}>
        <Header></Header>
        <br />
        <main className="container">
          {children}
        </main>
      </body>

    </html>
  )
}
