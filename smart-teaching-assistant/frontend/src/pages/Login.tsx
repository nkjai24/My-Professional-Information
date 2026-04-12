import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const API = "http://localhost:8000/auth";

  /* =========================
     REDIRECT BASED ON ROLE
  ========================= */
  const redirectUser = (user: any) => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  /* =========================
     EMAIL / PASSWORD LOGIN
  ========================= */
  const handleSubmit = async () => {
    setError("");

    if (!email || !password || (isRegister && !name)) {
      setError("Please fill all fields");

      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });

      return;
    }

    try {
      const payload = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(
        `${API}/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        let message = "Error";

        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail[0]?.msg || "Error";
        }

        setError(message);

        toast({
          title: "Authentication failed",
          description: message,
          variant: "destructive",
        });

        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: isRegister ? "Account created 🎉" : "Login successful ✅",
        description: isRegister
          ? "Welcome! Your account is ready."
          : "Welcome back!",
      });

      redirectUser(data.user);

    } catch (err) {
      setError("Server error");

      toast({
        title: "Server error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  /* =========================
     GOOGLE LOGIN (FIXED)
  ========================= */
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${API}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Google login failed",
          description: data.detail || "Unable to authenticate",
          variant: "destructive",
        });
        return;
      }

      // ✅ FIXED TOKEN
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Google login successful 🚀",
        description: "Welcome!",
      });

      redirectUser(data.user);

    } catch (err) {
      toast({
        title: "Google error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Create Account" : "Login"}
        </h2>

        {isRegister && (
          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-white p-2 rounded"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              toast({
                title: "Google Login Failed",
                variant: "destructive",
              })
            }
          />
        </div>

        <p className="text-sm text-center mt-4">
          {isRegister ? "Already have account?" : "No account?"}{" "}
          <span
            className="text-primary cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>

      </div>
    </div>
  );
}