import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'

import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import ContactPage from './pages/ContactPage'
import AdvisorLoginPage from './pages/AdvisorLoginPage'
import AdvisorDocumentsPage from './pages/AdvisorDocumentsPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import SubtopicsPage from './pages/admin/SubtopicsPage'
import AnswersPage from './pages/admin/AnswersPage'
import DocumentsAdminPage from './pages/admin/DocumentsAdminPage'
import LeadsPage from './pages/admin/LeadsPage'
import AdvisorsPage from './pages/admin/AdvisorsPage'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedAdminRoute from './components/layout/ProtectedAdminRoute'
import ProtectedAdvisorRoute from './components/layout/ProtectedAdvisorRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/documentos" element={<DocumentsPage />} />
            <Route path="/contacto" element={<ContactPage />} />

            {/* Advisor routes */}
            <Route path="/asesor" element={<AdvisorLoginPage />} />
            <Route
              path="/asesor/documentos"
              element={
                <ProtectedAdvisorRoute>
                  <AdvisorDocumentsPage />
                </ProtectedAdvisorRoute>
              }
            />

            {/* Admin login */}
            <Route path="/admin" element={<AdminLoginPage />} />

            {/* Admin protected routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="categorias" element={<CategoriesPage />} />
              <Route path="subtemas" element={<SubtopicsPage />} />
              <Route path="respuestas" element={<AnswersPage />} />
              <Route path="documentos" element={<DocumentsAdminPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="asesores" element={<AdvisorsPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
