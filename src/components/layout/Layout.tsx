import Sidebar from "./Sidebar"
import Header from "./Header"
import { ToastProvider } from "../../contexts/ToastContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden">
        {/* Sidebar fijo */}
        <Sidebar />
        
        {/* Área principal */}
        <div className="flex-1 flex flex-col h-full overflow-hidden ml-0 md:ml-64">
          {/* Header fijo */}
          <Header />
          
          {/* Contenido con scroll interno */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
} 