import Header from '@/components/header/header.component'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header></Header>
      <br />
      <main className="container">
        {children}
      </main>
    </>
  )
}
