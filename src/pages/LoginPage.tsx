import React, { useState } from "react";
import { User, Role } from "../types";

interface Props {
  users: User[];
  onLogin: (user: User) => void;
  onRegisterAdmin: (user: User) => void;
}

export default function LoginPage({ users, onLogin, onRegisterAdmin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Form state untuk registrasi Admin pertama kali
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const isFirstRun = users.length === 0;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
    );

    if (!foundUser) {
      setError("Username tidak terdaftar!");
      return;
    }

    if (!foundUser.isActive) {
      setError("Akun Anda sedang dinonaktifkan.");
      return;
    }

    // Validasi kecocokan password
    if (foundUser.password && foundUser.password !== password.trim()) {
      setError("Password salah!");
      return;
    }

    onLogin(foundUser);
  };

  const handleCreateInitialAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminUsername.trim() || !adminPassword.trim()) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    const newAdmin: User = {
      id: `usr-admin-${Date.now()}`,
      username: adminUsername.trim().toLowerCase(),
      password: adminPassword.trim(),
      name: adminName.trim(),
      role: "admin" as Role,
      position: "Administrator Utama",
      department: "Human Resources",
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    onRegisterAdmin(newAdmin);
    onLogin(newAdmin);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6 tracking-tight">
          Login Sistem
        </h2>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        {isFirstRun ? (
          /* Form Setup Admin Pertama */
          <form onSubmit={handleCreateInitialAdmin} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-[11px] mb-2 leading-relaxed">
              Belum ada akun terdaftar. Buat akun Administrator pertama Anda
              beserta passwordnya.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all"
                placeholder="Contoh: Gusti Panengah"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Username Admin
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-mono transition-all"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password Admin
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-mono transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Buat Akun & Login
            </button>
          </form>
        ) : (
          /* Form Login Biasa */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-mono transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-mono transition-all"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Masuk Sistem
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
