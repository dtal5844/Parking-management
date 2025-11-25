import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import LoginPage from "../pages/LoginPage";
import CalendarPage from "../pages/CalendarPage";
import AdminPage from "../pages/AdminPage";

function PrivateRoute({ children, adminOnly = false }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !currentUser.isAdmin) {
    return <Navigate to="/calendar" replace />;
  }

  return children;
}

export default function AppRouter() {
  const { currentUser } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/calendar" replace /> : <LoginPage />}
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly>
              <AdminPage />
            </PrivateRoute>
          }
        />

        {/* ברירת מחדל */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
