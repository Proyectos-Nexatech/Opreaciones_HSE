import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';
import { DashboardClienteLayout } from './components/DashboardClienteLayout';
import { Dashboard } from './pages/Dashboard';
import { DashboardCliente } from './pages/DashboardCliente';
import { DashboardPublico } from './pages/DashboardPublico';
import { NuevoPermiso } from './pages/NuevoPermiso';
import { ReportesPermisos } from './pages/ReportesPermisos';
import {
  Analytics,
  Equipo,
  Calendario,
  Ayuda
} from './pages/PlaceholderPages';
import { Configuracion } from './pages/Configuracion';
import { ResetPassword } from './pages/ResetPassword';
import { Asistencia } from './pages/Asistencia';
import { Ausentismo } from './pages/Ausentismo';
import { EventosAccidentes } from './pages/EventosAccidentes';
import { Novedades } from './pages/Novedades';
import { OcurrioAsi } from './pages/OcurrioAsi';
import { Personal } from './pages/Personal';
import { PersonalHSE } from './pages/PersonalHSE';
import { CentrosCosto } from './pages/CentrosCosto';
import { EmpresasCliente } from './pages/EmpresasCliente';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas Públicas (Sin Login) */}
          <Route path="/view/:token" element={<DashboardPublico />} />

          {/* Rutas para usuarios con rol Cliente (con Login opcional) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard-cliente" element={<DashboardClienteLayout />}>
              <Route index element={<DashboardCliente />} />
            </Route>
          </Route>

          {/* Rutas principales — AdminRoute redirige automáticamente a usuarios Cliente */}
          <Route element={<AdminRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="reportes" element={<ReportesPermisos />} />
              <Route path="asistencia" element={<Asistencia />} />
              <Route path="ausentismo" element={<Ausentismo />} />
              <Route path="eventos-accidentes" element={<EventosAccidentes />} />
              <Route path="novedades" element={<Novedades />} />
              <Route path="ocurrio-asi" element={<OcurrioAsi />} />
              <Route path="personal" element={<Personal />} />
              <Route path="personal-hse" element={<PersonalHSE />} />
              <Route path="centros-costo" element={<CentrosCosto />} />
              <Route path="empresas-cliente" element={<EmpresasCliente />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="equipo" element={<Equipo />} />
              <Route path="calendario" element={<Calendario />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="ayuda" element={<Ayuda />} />
              <Route path="nuevo-permiso" element={<NuevoPermiso />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
