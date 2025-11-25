import React from "react";
import { Car, User, Lock } from "../icons/Icons";

const LoginForm = ({ onLogin, onSwitchToRegister, loading }) => {
  const [formData, setFormData] = React.useState({ username: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      onLogin(formData);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="fade-in w-full">
      {/* כותרת ואייקון */}
      <div className="text-center mb-8">
        <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Car size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1 text-center">
          ניהול חניון מגורים
        </h1>
        <h2 className="text-lg font-semibold text-gray-700">התחברות</h2>
      </div>

      {/* טופס */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שם משתמש
          </label>
          <div className="relative">
            <div className="absolute right-3 top-2.5 text-gray-400">
              <User size={18} />
            </div>
            <input
              type="text"
              className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg form-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            סיסמה
          </label>
          <div className="relative">
            <div className="absolute right-3 top-2.5 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg form-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "מתחבר..." : "התחבר"}
        </button>

        <button
          type="button"
          onClick={onSwitchToRegister}
          className="btn w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
        >
          הרשמה
        </button>
      </form>

      {/* טקסט דמו */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p className="font-medium">למבחן:</p>
        <p>מנהל: admin / admin123</p>
        <p>דייר: dani / 1234</p>
      </div>
    </div>
  );
};

export default LoginForm;
