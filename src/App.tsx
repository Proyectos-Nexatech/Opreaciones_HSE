import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
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
          <Route element={<ProtectedRoute />}>
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
