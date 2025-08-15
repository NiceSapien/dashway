import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"

export function Layout() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] pt-16 w-full">
        <main className="flex-1 overflow-y-auto p-6 w-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
