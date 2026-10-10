import React, { useState, useEffect } from "react";
import { User, OfficeConfig, AttendanceRecord } from "./types";
import {
  STORAGE_KEYS,
  DEFAULT_OFFICE,
  storageService,
} from "./services/storageService";
import { authService } from "./services/authService";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import {
  Users,
  Clock,
  Camera,
  Calendar,
  FileSpreadsheet,
  Settings,
  LogOut,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Menu,
  User as UserIcon,
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [officeConfig, setOfficeConfig] =
    useState<OfficeConfig>(DEFAULT_OFFICE);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    storageService.seedInitialDataIfNeeded();
    const loadedUsers: User[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.USERS) || "[]",
    );
    const loadedOffice: OfficeConfig = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.OFFICE) ||
        JSON.stringify(DEFAULT_OFFICE),
    );
    const loadedAttendance: AttendanceRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]",
    );
    const savedSession: User | null = authService.getSavedSession();

    setUsers(loadedUsers);
    setOfficeConfig(loadedOffice);
    setAttendanceRecords(loadedAttendance);
    if (savedSession) {
      // Sinkronkan data user terbaru dari daftar users jika ada perubahan (seperti avatar)
      const freshUser =
        loadedUsers.find((u) => u.id === savedSession.id) || savedSession;
      setCurrentUser(freshUser);
      setActiveTab(
        freshUser.role === "admin" ? "admin-dashboard" : "absen-today",
      );
    }
  }, []);

  const showToast = (
    text: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    authService.saveSession(user);
    setActiveTab(user.role === "admin" ? "admin-dashboard" : "absen-today");
    showToast(`Selamat datang kembali, ${user.name}!`, "success");
  };

  const handleRegisterInitialAdmin = (adminUser: User) => {
    const updatedUsers = [adminUser];
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    showToast("Akun Administrator berhasil dibuat!", "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    authService.clearSession();
    showToast("Anda telah keluar dari sistem.", "info");
  };

  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
    // Update currentUser jika datanya ikut diedit
    if (currentUser) {
      const updatedCurrent = newUsers.find((u) => u.id === currentUser.id);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
        authService.saveSession(updatedCurrent);
      }
    }
  };

  const updateOfficeConfig = (newConfig: OfficeConfig) => {
    setOfficeConfig(newConfig);
    localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(newConfig));
    showToast("Pengaturan kantor berhasil disimpan.", "success");
  };

  const addAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      let updated: AttendanceRecord[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = record;
      } else {
        updated = [record, ...prev];
      }
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.OFFICE);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    storageService.seedInitialDataIfNeeded();
    setUsers([]);
    setAttendanceRecords([]);
    setCurrentUser(null);
    showToast("Seluruh data aplikasi telah dibersihkan.", "info");
  };

  if (!currentUser) {
    return (
      <LoginPage
        users={users}
        onLogin={handleLogin}
        onRegisterAdmin={handleRegisterInitialAdmin}
      />
    );
  }

  const userAvatar = (currentUser as any).avatar;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-white font-medium text-xs transition-all transform animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-blue-600"
              : toastMessage.type === "error"
                ? "bg-rose-600"
                : "bg-slate-900"
          }`}
        >
          {toastMessage.type === "success" && (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          {toastMessage.type === "error" && (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {toastMessage.type === "info" && (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl bg-slate-50 border border-slate-200"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {currentUser.position}
              </span>
            </div>
            {/* Avatar Header Atas Kanan */}
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden flex-shrink-0">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full bg-blue-600 text-white flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentUser.role === "admin" ? (
            <AdminDashboard
              activeTab={activeTab}
              records={attendanceRecords}
              users={users}
              office={officeConfig}
              setUsers={updateUsers}
              onSaveOffice={updateOfficeConfig}
              onResetData={clearAllData}
              setAttendanceRecords={setAttendanceRecords}
              showToast={showToast}
            />
          ) : (
            <EmployeeDashboard
              activeTab={activeTab}
              user={currentUser}
              office={officeConfig}
              records={attendanceRecords}
              onRecordSave={addAttendanceRecord}
              showToast={showToast}
            />
          )}
        </main>

        <footer className="bg-white border-t border-slate-100 py-3.5 px-6 text-center text-[11px] text-slate-400 font-medium">
          Sistem Absensi Karyawan — By Gusti Panengah
        </footer>
      </div>
    </div>
  );
}

function Sidebar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  setIsOpen,
}: {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}) {
  const isAdmin = user.role === "admin";
  const userAvatar = (user as any).avatar;

  const navItems = isAdmin
    ? [
        { id: "admin-dashboard", label: "Dashboard Utama", icon: Clock },
        { id: "admin-users", label: "Kelola Karyawan", icon: Users },
        {
          id: "admin-history",
          label: "Laporan & Riwayat",
          icon: FileSpreadsheet,
        },
        { id: "admin-settings", label: "Pengaturan Kantor", icon: Settings },
      ]
    : [
        { id: "absen-today", label: "Absen Hari Ini", icon: Camera },
        { id: "absen-history", label: "Riwayat Saya", icon: Calendar },
        { id: "profile", label: "Profil Saya", icon: UserIcon },
      ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-0 top-0 bottom-0 left-0 z-50 w-64 h-screen bg-white border-r border-slate-100 text-slate-600 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-slate-100 shadow-xs flex-shrink-0">
                <img
                  src="/src/assets/icon.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <span className="font-extrabold text-sm text-slate-900 block truncate tracking-tight">
                  Absensi Workspace
                </span>
              </div>
            </div>
          </div>

          <div className="px-3 py-2 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* Avatar Sidebar Bawah */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden flex-shrink-0">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full bg-blue-600 text-white flex items-center justify-center">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-medium">
                {user.position}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-100 hover:border-rose-100 transition-all font-semibold text-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
}
