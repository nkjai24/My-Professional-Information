import { LoginForm } from "@/components/LoginForm";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    // Simple demo authentication - in real app, validate against backend
    if (email && password) {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to Green Climate Dashboard",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default Login;