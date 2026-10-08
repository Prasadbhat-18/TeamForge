import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { loginUser } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FolderKanban, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      login(res);
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center mb-4 shadow-lg">
            <FolderKanban size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your TaskForge account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="you@example.com" autoComplete="email"
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.email?"border-red-400":"border-gray-300"}`}
                {...register("email")} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" autoComplete="current-password"
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.password?"border-red-400":"border-gray-300"}`}
                {...register("password")} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign up</Link>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-indigo-50 text-xs text-indigo-700 text-center">
            Demo: <strong>demo1@taskforge.dev</strong> / <strong>Demo@1234</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
