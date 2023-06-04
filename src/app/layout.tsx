import './globals.css'
import { ClientWatcher } from './components/ClientWatcher';

export const metadata = {
  title: 'Remarc',
  description: 'Remember everything',
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

        <title>
          {metadata.title}
        </title>
      </head>

      <body suppressHydrationWarning={true}>
        <ClientWatcher />
        {children}
      </body>

    </html>
  )
}
