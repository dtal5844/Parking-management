import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const login = (data) => {
    console.log("Login:", data);
  };

  const gotoRegister = () => {
    console.log("Switch to register");
  };

  return (
    <LoginForm onLogin={login} onSwitchToRegister={gotoRegister} />
  );
}
