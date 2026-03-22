import { X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function LoginModal({ isOpen, onClose, onSignup }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await API.post("/auth/signin", form);

      const { token, user } = res.data;

      // Store authentication
      localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("userId", user.id); // 🔥 IMPORTANT FIX
      setSuccess(true);

      // Simple navigation (no role logic)
      setTimeout(() => {
        navigate("/dashboard"); // change if needed
        onClose();
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div
          className="relative w-full max-w-md rounded-3xl
          bg-white/80 backdrop-blur-xl
          border border-white/50 shadow-2xl p-10 animate-fadeIn"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <X size={22} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
              AI
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2">
            Secure Login
          </h2>

          <p className="text-center text-sm text-gray-500 mb-6">
            Access Prenatal AI Copilot
          </p>

          {/* SUCCESS */}
          {success && (
            <div className="mb-5 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-xl justify-center">
              <CheckCircle size={18} />
              Login successful. Redirecting…
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* FORM */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border"
              />

              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border"
              />

               
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-400 to-purple-600 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>
          )}

          {/* CREATE ACCOUNT */}
          {!success && (
            <p className="mt-6 text-sm text-center text-gray-500">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignup();
                }}
                className="text-purple-600 font-medium hover:underline"
              >
                Create account
              </button>
            </p>
          )}

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-center text-gray-400">
            This platform is a Clinical Decision Support tool.
          </p>
        </div>
      </div>
    </>
  );
}