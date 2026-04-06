import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import api from "./lib/api";
import BottomNav from "./components/BottomNav";
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
    email: "patient@demo.com",
    phone: "9999999991",
    password: "Password123"
  });
  const [error, setError] = useState("");

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
      const payload = authMode === "login" ? { email: form.email || form.phone, password: form.password } : form;
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
      email: account.payload.email,
      password: account.payload.password
    });
    persistAuth(response);
  };

  const signOut = () => {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_user");
    setUser(null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5 text-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-teal-700">Dental app</p>
          <h1 className="font-heading text-xl font-bold">Clinic Booking System</h1>
        </div>
        {user ? (
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
          >
            Sign out
          </button>
        ) : null}
      </div>

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

          <section className="glass rounded-[28px] border border-white/70 p-5 shadow-card">
            <div className="mb-4 flex rounded-full bg-slate-100 p-1">
              {["login", "register"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    authMode === mode ? "bg-white text-slate-900 shadow" : "text-slate-500"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <form className="grid gap-3" onSubmit={onSubmit}>
              {authMode === "register" ? (
                <input
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              ) : null}
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              {authMode === "register" ? (
                <input
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              ) : null}
              <input
                type="password"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
              <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="mt-5 grid gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => seedDemo(account)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700"
                >
                  {account.label}
                </button>
              ))}
            </div>
            {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
          </section>
        </div>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<BookingPage user={user} />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route
              path="/admin"
              element={canAccessAdmin(user) ? <AdminPage /> : <Navigate to="/" replace />}
            />
          </Routes>
          <BottomNav user={user} />
        </>
      )}
    </main>
  );
}
