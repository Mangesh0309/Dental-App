import React from "react";

export default function Sidebar({ user, isOpen, onClose, toggleDarkMode, signOut }) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-2xl transition-transform duration-300 transform translate-x-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
              <p className="font-semibold capitalize text-slate-900 dark:text-white">{user?.role || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Toggle Theme</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </button>
            <button
              onClick={() => { onClose(); signOut(); }}
              className="w-full rounded-lg bg-slate-900 dark:bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-red-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
