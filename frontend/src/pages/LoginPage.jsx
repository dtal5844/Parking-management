import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { authAPI } from "../services/api";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      setError("");
      setLoading(true);
      const user = await authAPI.login(data.username, data.password);
      login(user);
      navigate("/calendar");
    } catch (err) {
      setError(err.message || "שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    try {
      setError("");
      setLoading(true);
      const user = await authAPI.register(data);
      login(user);
      navigate("/calendar");
    } catch (err) {
      setError(err.message || "שגיאה בהרשמה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {showRegister ? (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setShowRegister(false)}
            loading={loading}
          />
        ) : (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
