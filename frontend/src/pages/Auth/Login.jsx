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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.id); 
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
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
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="relative w-full max-w-md rounded-2xl
          bg-white/95 backdrop-blur-xl
          border border-white/50 shadow-xl p-8 animate-fadeIn"
        >
          {/* Close - Discreet */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          {/* Header - Scaled down */}
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-xl bg-purple-100 items-center justify-center text-purple-600 font-bold text-base mb-3">
              AI
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Secure Login</h2>
            <p className="text-sm text-gray-500">Prenatal AI Copilot</p>
          </div>

          {success && (
            <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-xl justify-center">
              <CheckCircle size={16} /> Login successful.
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
              />

              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-5 text-sm text-center text-gray-500">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => { onClose(); onSignup(); }}
                className="text-purple-600 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          )}

          <p className="mt-6 text-[11px] text-center text-gray-400 border-t pt-4">
            Clinical Decision Support Platform
          </p>
        </div>
      </div>
    </>
  );
}