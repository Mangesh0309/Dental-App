import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import api from "./lib/api";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import BookingPage from "./pages/BookingPage";
import HistoryPage from "./pages/HistoryPage";
import AdminPage from "./pages/AdminPage";

const demoAccounts = [
  {
    label: "Patient demo",
    payload: { name: "Aarav Sharma", email: "patient@demo.com", phone: "9999999991", password: "Password123" }
  },
  {
    label: "Admin demo",
    payload: { name: "Clinic Admin", email: "admin@demo.com", phone: "9999999992", password: "Password123", role: "admin" }
  }
];

const canAccessAdmin = (user) => user && user.role !== "patient";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "9999999991",
    password: "Password123"
  });
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("clinic_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const persistAuth = (response) => {
    localStorage.setItem("clinic_token", response.data.token);
    localStorage.setItem("clinic_user", JSON.stringify(response.data.user));
    setUser(response.data.user);
    setError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload = authMode === "login" ? { phone: form.phone, password: form.password } : form;
      const response = await api.post(path, payload);
      persistAuth(response);
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || "Authentication failed.");
    }
  };

  const seedDemo = async (account) => {
    try {
      await api.post("/auth/register", account.payload);
    } catch {
      // Existing demo user is fine.
    }
    const response = await api.post("/auth/login", {
      phone: account.payload.phone,
      password: account.payload.password
    });
    persistAuth(response);
  };

  const signOut = () => {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_user");
    setUser(null);
  };

  const toggleDarkMode = () => {
    const htmlClasses = document.documentElement.classList;
    if (htmlClasses.contains("dark")) {
      htmlClasses.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      htmlClasses.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  useEffect(() => {
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5 text-slate-900 dark:text-slate-100">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-teal-700 dark:text-teal-400">Dental Clinic</p>
          <h1 className="font-heading text-xl font-bold">Dr. Bhure Clinic</h1>
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Profile
          </button>
        ) : null}
      </div>

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        toggleDarkMode={toggleDarkMode}
        signOut={signOut}
      />

      {!user ? (
        <div className="space-y-5 pb-28">
          <section className="rounded-[32px] bg-gradient-to-br from-teal-700 via-teal-600 to-amber-500 p-6 text-white shadow-card">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-50">Patient plus clinic ops</p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight">
              One booking flow for roaming doctors and multi-city clinics.
            </h2>
            <p className="mt-3 text-sm text-teal-50/90">
              Build around live slots, secure payments, automated reminders, and simple admin controls.
            </p>
          </section>

          <section className="glass rounded-[28px] border border-white/70 dark:border-slate-700 p-5 shadow-card dark:bg-slate-800 transition-colors duration-300">
            <div className="mb-4 flex rounded-full bg-slate-100 dark:bg-slate-700 p-1">
              {["login", "register"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                    authMode === mode ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow" : "text-slate-500 dark:text-slate-300"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <form className="grid gap-3" onSubmit={onSubmit}>
              {authMode === "register" ? (
                <input
                  className="rounded-2xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-4 py-3"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              ) : null}
              {authMode === "register" ? (
                <input
                  className="rounded-2xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-4 py-3"
                  placeholder="Email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              ) : null}
              <input
                className="rounded-2xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-4 py-3"
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
              <input
                type="password"
                className="rounded-2xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-4 py-3"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
              <button type="submit" className="rounded-2xl bg-slate-900 dark:bg-teal-600 px-5 py-3 font-semibold text-white">
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="mt-5 grid gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => seedDemo(account)}
                  className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  {account.label}
                </button>
              ))}
            </div>
            {error ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
          </section>
        </div>
      ) : (
        <>
          <Routes>
            {user.role === "admin" ? (
              <>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<BookingPage user={user} />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
          <BottomNav user={user} />
        </>
      )}
    </main>
  );
}
