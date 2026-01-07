import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Register - Trademilaan",
  description: "Create your Trademilaan account to access premium AI-powered trading insights and services.",
};

export default function RegisterPage() {
  return <AuthForm type="register" />;
}
