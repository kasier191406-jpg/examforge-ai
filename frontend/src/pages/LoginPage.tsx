import { LockKeyhole, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const { login, token } = useAuthStore();
  const navigate = useNavigate();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-lg border border-white/50 bg-white/80 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-card/80">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
            Tech University
          </p>
          <h1 className="mt-1 text-3xl font-semibold">ExamForge AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Intelligent Question Paper Generation Platform
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium">Username</span>
            <div className="mt-1 flex items-center gap-2 rounded-md border bg-background px-3">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <input
                className="h-10 w-full bg-transparent outline-none"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                type="text"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-md border bg-background px-3">
              <LockKeyhole className="h-4 w-4 text-muted-foreground" />
              <input
                className="h-10 w-full bg-transparent outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
              />
            </div>
          </label>
          {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
          <button
            type="submit"
            className="h-10 w-full rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
