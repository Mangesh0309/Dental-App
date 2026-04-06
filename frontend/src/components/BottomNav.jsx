import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Book" },
  { to: "/history", label: "History" }
];

export default function BottomNav({ user }) {
  const navItems = user?.role === "patient" ? items : [...items, { to: "/admin", label: "Admin" }];

  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full bg-slate-900/95 px-5 py-3 text-sm text-white shadow-2xl shadow-slate-900/20">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 transition ${isActive ? "bg-teal-500 text-white" : "text-slate-300"}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
