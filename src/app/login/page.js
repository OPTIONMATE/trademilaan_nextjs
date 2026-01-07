import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Login - Trademilaan",
  description: "Login to your Trademilaan account to access premium trading insights and services.",
};

export default function LoginPage() {
  return <AuthForm type="login" />;
}
