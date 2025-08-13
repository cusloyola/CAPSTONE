import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // <-- Add error state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(""); // Clear previous errors

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(res.data.message || "Password reset email sent!");
    } catch (err) {
      console.error(err.response);

      // Check for specific backend response
      if (err.response?.status === 404) {
        setError(err.response.data?.message || "No account found with that email.");
      } else {
        setError(err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Forgot Password
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                placeholder="info@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>} {/* Display error */}

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-blue-500 hover:underline"
            onClick={() => navigate("/signin")}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
