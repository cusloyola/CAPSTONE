import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [validToken, setValidToken] = useState(null); // null = loading, true = valid, false = invalid

  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
        setValidToken(true);
      } catch (err) {
        setValidToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Loading state
  if (validToken === null) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  );

  // Invalid or expired token
  if (validToken === false) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800 text-center">
        <p className="text-red-600 dark:text-red-400">This reset link is invalid or has expired.</p>
        <button
          className="mt-4 text-sm text-blue-500 hover:underline"
          onClick={() => navigate("/forgot-password")}
        >
          Request a new link
        </button>
      </div>
    </div>
  );

  // Reset form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Reset Password
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Enter your new password below to reset your account password.
        </p>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <Label>
              New Password <span className="text-error-500">*</span>
            </Label>
            <Input
              type="password"
              value={password}
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Button className="w-full" size="sm">
              Reset Password
            </Button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-green-600 dark:text-green-400">{message}</p>}

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-blue-500 hover:underline"
            onClick={() => navigate("/login")}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
