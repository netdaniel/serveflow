import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthLayout } from './components/AuthLayout';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Volunteers } from './pages/Volunteers';
import { Schedule } from './pages/Schedule';
import { Roles } from './pages/Roles';
import { ApprovalPending } from './pages/ApprovalPending';
import { ManageMembers } from './pages/ManageMembers';
import { StoreProvider } from './services/store';
import SupabaseTest from './components/SupabaseTest';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/pending" element={<ApprovalPending />} />

          <Route element={<AuthLayout />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="roles" element={<Roles />} />
            <Route path="manage-members" element={<ManageMembers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
