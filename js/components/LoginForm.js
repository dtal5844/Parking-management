// LoginForm Component
const LoginForm = ({ onLogin, onSwitchToRegister }) => {
    const [formData, setFormData] = React.useState({ username: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(formData);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="login-container">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md fade-in">
                <div className="text-center mb-8">
                    <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Car size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">ניהול חניון מגורים</h1>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4 text-center">התחברות</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                שם משתמש
                            </label>
                            <div className="relative">
                                <div className="absolute right-3 top-3 text-gray-400">
                                    <Icons.User size={20} />
                                </div>
                                <input
                                    type="text"
                                    className="form-input w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
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
                                <div className="absolute right-3 top-3 text-gray-400">
                                    <Icons.Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    className="form-input w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="btn w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                        >
                            התחבר
                        </button>
                        
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="btn w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                        >
                            הרשמה
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Export for use in other files
window.LoginForm = LoginForm;
