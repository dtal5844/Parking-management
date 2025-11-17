// RegisterForm Component
const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
    const [formData, setFormData] = React.useState({
        username: '',
        password: '',
        name: '',
        apartment: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(formData);
    };

    return (
        <div className="login-container">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md fade-in">
                <div className="text-center mb-8">
                    <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.User size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">הרשמה למערכת</h1>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4 text-center">פרטי משתמש חדש</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                שם משתמש *
                            </label>
                            <input
                                type="text"
                                className="form-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                                autoFocus
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                סיסמה *
                            </label>
                            <input
                                type="password"
                                className="form-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                שם מלא *
                            </label>
                            <input
                                type="text"
                                className="form-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                מספר דירה *
                            </label>
                            <input
                                type="text"
                                className="form-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={formData.apartment}
                                onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                                required
                                placeholder="לדוגמה: דירה 10"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="btn w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                        >
                            הירשם
                        </button>
                        
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="btn w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                            חזור להתחברות
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Export for use in other files
window.RegisterForm = RegisterForm;
