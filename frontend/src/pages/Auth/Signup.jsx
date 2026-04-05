import { useState } from "react";
import API from "../../services/api";
import { CheckCircle, X } from "lucide-react";

export default function Signup({ isOpen, onClose, onLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    consent: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ================= FRONTEND VALIDATIONS =================

    const nameRegex = /^[A-Za-z][A-Za-z\s]*$/;
    if (!nameRegex.test(form.name)) {
      return setError(
        "Name must start with a letter and contain only letters and spaces."
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      return setError("Please enter a valid email address.");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (!form.consent) {
      return setError(
        "Please acknowledge the Clinical Decision Support disclaimer."
      );
    }

    // ================= API CALL =================

    setLoading(true);

    try {
      await API.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setForm({
          name: "",
          email: "",
          password: "",
          consent: false,
        });
        onClose();
        onLogin();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div className="relative w-full max-w-md rounded-3xl bg-white border shadow-xl p-8 animate-fadeIn">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Create Account
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Secure access to your healthcare platform.
          </p>

          {/* SUCCESS */}
          {success && (
            <div className="mb-5 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
              <CheckCircle size={18} />
              Account created successfully. Please log in.
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border"
              disabled={success}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border"
              disabled={success}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border"
              disabled={success}
            />

            {/* CONSENT */}
            <label className="flex gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
                disabled={success}
              />
              I understand this is a Clinical Decision Support tool.
            </label>

            <button
              type="submit"
              disabled={
                loading ||
                success ||
                !form.name ||
                !form.email ||
                !form.password
              }
              className="w-full mt-2 py-2.5 rounded-lg text-white font-medium
              bg-gradient-to-r from-purple-400 to-purple-600 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>

          </form>

          {/* SIGN IN OPTION */}
          {!success && (
            <p className="mt-6 text-sm text-center text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogin();
                }}
                className="text-purple-600 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </>
  );
}