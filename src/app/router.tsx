import { Routes, Route, Navigate } from "react-router-dom"
import '../index.css'
import Layout from "../components/layout/Layout.tsx"
import Login from "../features/auth/Login";
import Home from "../features/Home";
import IngresarSalida from "../features/salidas/IngresarSalida";
import GestionarSalidas from "../features/salidas/GestionarSalidas";
import Mercaderistas from "../features/marketing/Mercaderistas";
import ReportesSala from "../features/marketing/ReportesSala";
import PlanillaComisiones from "../features/rrhh/PlanillaComisiones";
import Vacaciones from "../features/rrhh/Vacaciones";
import Usuarios from "../features/usuarios/Usuarios";
import RolesPermisos from "../features/usuarios/RolesPermisos";
// Removed import for deleted Cargos component
import Choperas from "../features/bendita/Choperas";
import MantenimientosDashboard from "../features/bendita/MantenimientosDashboard";
import MantenimientosPorChopera from "../features/bendita/MantenimientosPorChopera";
import NuevoMantenimiento from "../features/bendita/NuevoMantenimiento";
import ListaMantenimientos from "../features/bendita/ListaMantenimientos";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { hasPermission } from "../lib/utils";

interface PrivateRouteProps {
  children: React.ReactNode;
  permission: string | null;
}

function PrivateRoute({ children, permission }: PrivateRouteProps) {
  const { user } = useAuth();
  if (!hasPermission(user, permission)) {
    return <Navigate to='/' />;
  }
  return <>{children}</>;
}

export default function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eceff1]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg">Verificando sesión...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/salidas/ingresar" element={
                  <PrivateRoute permission={null}>
                    <IngresarSalida />
                  </PrivateRoute>
                } />
                <Route path="/salidas/gestionar" element={
                  <PrivateRoute permission={null}>
                    <GestionarSalidas />
                  </PrivateRoute>
                } />
                <Route path="/marketing/mercaderistas" element={
                  <PrivateRoute permission={null}>
                    <Mercaderistas />
                  </PrivateRoute>
                } />
                <Route path="/marketing/reportes-sala" element={
                  <PrivateRoute permission={null}>
                    <ReportesSala />
                  </PrivateRoute>
                } />
                <Route path="/rrhh/planilla-comisiones" element={
                  <PrivateRoute permission={null}>
                    <PlanillaComisiones />
                  </PrivateRoute>
                } />
                <Route path="/rrhh/vacaciones" element={
                  <PrivateRoute permission={null}>
                    <Vacaciones />
                  </PrivateRoute>
                } />
                <Route path="/usuarios" element={
                  <PrivateRoute permission={null}>
                    <Usuarios />
                  </PrivateRoute>
                } />
                <Route path="/usuarios/roles" element={
                  <PrivateRoute permission={null}>
                    <RolesPermisos />
                  </PrivateRoute>
                } />
                <Route path="/usuarios/usuarios" element={
                  <PrivateRoute permission={null}>
                    <Usuarios />
                  </PrivateRoute>
                } />
                <Route path="/bendita/choperas" element={<Choperas />} />
                <Route path="/bendita/choperas/:itemCode/mantenimientos" element={<MantenimientosPorChopera />} />
                <Route path="/bendita/mantenimientos" element={<MantenimientosDashboard />} />
                <Route path="/bendita/mantenimientos/nuevo" element={<NuevoMantenimiento />} />
                <Route path="/bendita/mantenimientos/lista" element={<ListaMantenimientos />} />
              </Routes>
            </Layout>
          ) : (
            <Login />
          )
        }
      />
    </Routes>
  )
}

