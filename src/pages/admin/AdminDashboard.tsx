import React, { useState, useMemo } from "react";
import { User, OfficeConfig, AttendanceRecord, Role } from "../../types";
import { photoService } from "../../services/photoService";
import {
  Users,
  Clock,
  MapPin,
  Camera,
  Calendar,
  Settings,
  UserCheck,
  UserX,
  CheckCircle2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Building,
  UserPlus,
  Edit2,
  Trash2,
  X,
  DollarSign,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AdminDashboardProps {
  activeTab: string;
  records: AttendanceRecord[];
  users: User[];
  office: OfficeConfig;
  setUsers: (users: User[]) => void;
  onSaveOffice: (config: OfficeConfig) => void;
  onResetData: () => void;
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
}

export default function AdminDashboard({
  activeTab,
  records,
  users,
  office,
  setUsers,
  onSaveOffice,
  onResetData,
  setAttendanceRecords,
  showToast,
}: AdminDashboardProps) {
  const chartWeeklyData = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
      });

      const dayRecs = records.filter((r) => r.date === dStr);
      const hadir = dayRecs.filter((r) => r.status === "Hadir").length;
      const late = dayRecs.filter((r) => r.status === "Terlambat").length;

      result.push({ date: dayLabel, Hadir: hadir, Terlambat: late });
    }
    return result;
  }, [records]);

  if (activeTab === "admin-users") {
    return (
      <AdminUserManager
        users={users}
        setUsers={setUsers}
        office={office}
        showToast={showToast}
      />
    );
  }
  if (activeTab === "admin-history") {
    return (
      <AdminAttendanceLogs records={records} users={users} office={office} />
    );
  }
  if (activeTab === "admin-settings") {
    return (
      <AdminSettings
        office={office}
        onSaveOffice={onSaveOffice}
        onResetData={onResetData}
        users={users}
        attendanceRecords={records}
        setUsers={setUsers}
        setAttendanceRecords={setAttendanceRecords}
        showToast={showToast}
      />
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const employeesOnly = users.filter(
    (u) => u.role === "employee" && u.isActive,
  );
  const totalEmployees = employeesOnly.length;
  const todayRecords = records.filter((r) => r.date === todayStr);

  const hadirCount = todayRecords.filter((r) => r.status === "Hadir").length;
  const terlambatCount = todayRecords.filter(
    (r) => r.status === "Terlambat",
  ).length;
  const pulangCount = todayRecords.filter((r) => r.checkOutTime).length;
  const belumHadirCount = Math.max(
    0,
    totalEmployees - (hadirCount + terlambatCount),
  );

  const pieData = [
    { name: "Hadir Tepat Waktu", value: hadirCount, color: "#2563eb" },
    { name: "Terlambat", value: terlambatCount, color: "#dc2626" },
    { name: "Belum Presensi", value: belumHadirCount, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            Dashboard Ringkasan Presensi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 self-start">
          <Building className="w-3.5 h-3.5 text-blue-600" />
          <span>{office.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Karyawan
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">
              {totalEmployees}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Aktif dalam sistem
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Hadir Tepat
            </span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-600">
              {hadirCount}
            </div>
            <span className="text-[10px] text-blue-600 font-medium">
              Sesuai jadwal
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Terlambat
            </span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-rose-600">
              {terlambatCount}
            </div>
            <span className="text-[10px] text-rose-600 font-medium">
              Lewat jadwal
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Belum Absen
            </span>
            <UserX className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-600">
              {belumHadirCount}
            </div>
            <span className="text-[10px] text-amber-600 font-medium">
              Belum presensi
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Sudah Pulang
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-600">
              {pulangCount}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              Selesai shift
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Tren Kehadiran 7 Hari Terakhir</span>
          </h3>
          <div className="h-60 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartWeeklyData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="Hadir" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Terlambat" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <span>Rasio Status Hari Ini</span>
          </h3>
          <div className="flex-1 h-48 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUserManager({
  users,
  setUsers,
  office,
  showToast,
}: {
  users: User[];
  setUsers: (u: User[]) => void;
  office: OfficeConfig;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const availableDepts = office.departmentSchedules?.map(
    (d) => d.department,
  ) || ["Office"];

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "employee" as Role,
    position: "",
    department: availableDepts[0] || "Office",
    avatar: "",
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.position.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      name: "",
      role: "employee",
      position: "",
      department: availableDepts[0] || "Office",
      avatar: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      name: user.name,
      role: user.role,
      position: user.position,
      department: user.department,
      avatar: (user as any).avatar || "",
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser && !formData.password.trim()) {
      showToast("Password wajib diisi untuk akun baru!", "error");
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: formData.username.trim().toLowerCase(),
              ...(formData.password.trim()
                ? { password: formData.password.trim() }
                : {}),
              name: formData.name.trim(),
              role: formData.role,
              position: formData.position.trim(),
              department: formData.department.trim(),
              avatar: formData.avatar.trim(),
            }
          : u,
      );
      setUsers(updated);
      showToast("Data akun berhasil diperbarui.", "success");
    } else {
      if (
        users.some(
          (u) =>
            u.username.toLowerCase() === formData.username.trim().toLowerCase(),
        )
      ) {
        showToast("Username sudah digunakan pengguna lain!", "error");
        return;
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        username: formData.username.trim().toLowerCase(),
        password: formData.password.trim(),
        name: formData.name.trim(),
        role: formData.role,
        position: formData.position.trim(),
        department: formData.department.trim(),
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
        avatar: formData.avatar.trim(),
      };
      setUsers([...users, newUser as User]);
      showToast("Akun karyawan baru berhasil ditambahkan.", "success");
    }
    setIsModalOpen(false);
  };

  const toggleUserActive = (user: User) => {
    const updated = users.map((u) =>
      u.id === user.id ? { ...u, isActive: !u.isActive } : u,
    );
    setUsers(updated);
    showToast(
      `Status pengguna ${user.name} diubah menjadi ${!user.isActive ? "Aktif" : "Non-aktif"}.`,
      "info",
    );
  };

  const handleDeleteUser = (user: User) => {
    if (
      user.role === "admin" &&
      users.filter((u) => u.role === "admin").length <= 1
    ) {
      showToast("Tidak dapat menghapus satu-satunya akun Admin!", "error");
      return;
    }
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus akun ${user.name}?`)
    ) {
      setUsers(users.filter((u) => u.id !== user.id));
      showToast("Akun berhasil dihapus.", "info");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            Manajemen Karyawan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola akun, jabatan, dan hak akses karyawan
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 self-start transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, username, atau posisi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="p-3.5 sm:px-5">Pengguna</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Departemen & Jabatan</th>
                <th className="p-3.5">Peran</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 sm:pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((user) => {
                const uAvatar = (user as any).avatar;
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-3.5 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden flex-shrink-0">
                          {uAvatar ? (
                            <img
                              src={uAvatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="w-full h-full bg-blue-600 text-white flex items-center justify-center">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-800">
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {user.username}
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">
                        {user.position}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {user.department}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize ${
                          user.role === "admin"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleUserActive(user)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          user.isActive
                            ? "bg-blue-50 text-blue-700 border-blue-200/60"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {user.isActive ? "Aktif" : "Non-Aktif"}
                      </button>
                    </td>
                    <td className="p-3.5 sm:pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingUser ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSaveUser}
              className="p-5 space-y-4 overflow-y-auto flex-1"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Username Login
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-mono transition-all"
                    placeholder="budi_s"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Password{" "}
                    {editingUser && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        (Opsional)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-mono transition-all"
                    placeholder={
                      editingUser ? "Biarkan kosong jika tetap" : "••••••••"
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Peran Sistem
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as Role })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all"
                  >
                    <option value="employee">Karyawan</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Departemen
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all"
                  >
                    {availableDepts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="Staff Operasional"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Foto Profil / Avatar
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Pilih Berkas Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminAttendanceLogs({
  records,
  users,
  office,
}: {
  records: AttendanceRecord[];
  users: User[];
  office: OfficeConfig;
}) {
  const [activeTabSub, setActiveTabSub] = useState<"logs" | "salary">("logs");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activePhotoModal, setActivePhotoModal] = useState<{
    photoUrl: string | null;
    title: string;
  } | null>(null);

  // Perhitungan Gaji Berdasarkan Total Hari Masuk x Tarif Gaji Harian
  const employeeSalaryReport = useMemo(() => {
    const deptSchedules = office.departmentSchedules || [];
    const deptDailyMap: Record<string, number> = {};
    deptSchedules.forEach((ds: any) => {
      deptDailyMap[ds.department] = ds.dailySalary || 120000;
    });

    // Hitung total presensi per karyawan
    const employeePresenceCount: Record<string, number> = {};
    records.forEach((r) => {
      if (r.status === "Hadir" || r.status === "Terlambat") {
        employeePresenceCount[r.userId] =
          (employeePresenceCount[r.userId] || 0) + 1;
      }
    });

    return users
      .filter((u) => u.role === "employee")
      .map((user) => {
        const daysPresent = employeePresenceCount[user.id] || 0;
        const dailyRate = deptDailyMap[user.department] || 120000;
        const totalSalary = daysPresent * dailyRate;

        return {
          id: user.id,
          name: user.name,
          position: user.position,
          department: user.department,
          dailyRate,
          daysPresent,
          totalSalary,
        };
      });
  }, [users, records, office]);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userPosition.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const exportToCSV = () => {
    if (filtered.length === 0) {
      alert("Tidak ada data yang tersedia untuk diekspor!");
      return;
    }
    const headers = [
      "Tanggal",
      "Nama Karyawan",
      "Jabatan",
      "Jam Masuk",
      "Jam Pulang",
      "Jarak (m)",
      "Status",
    ];
    const rows = filtered.map((r) => [
      r.date,
      `"${r.userName}"`,
      `"${r.userPosition}"`,
      r.checkInTime || "",
      r.checkOutTime || "",
      r.checkInDistanceMeters ?? "",
      r.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Absensi_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPhoto = async (
    photoId?: string,
    title: string = "Foto Presensi",
  ) => {
    if (!photoId) return;
    const dataUrl = await photoService.getPhoto(photoId);
    setActivePhotoModal({ photoUrl: dataUrl, title });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            Laporan & Perhitungan Gaji Harian
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rekapitulasi total hari hadir dan kalkulasi gaji berdasarkan tarif
            harian per departemen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabSub("logs")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTabSub === "logs"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Riwayat Absensi
          </button>
          <button
            onClick={() => setActiveTabSub("salary")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTabSub === "salary"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Rekap Rincian Gaji
          </button>
          {activeTabSub === "logs" && (
            <button
              onClick={exportToCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors ml-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      {activeTabSub === "salary" ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>
                  Rincian Perhitungan Gaji Karyawan (Total Hari Masuk × Tarif
                  Harian)
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="p-3.5 sm:px-5">Karyawan</th>
                    <th className="p-3.5">Departemen & Jabatan</th>
                    <th className="p-3.5">Tarif Gaji / Hari</th>
                    <th className="p-3.5">Total Hari Masuk</th>
                    <th className="p-3.5 sm:pr-5 text-right">
                      Total Gaji Diterima
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {employeeSalaryReport.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 sm:px-5 font-bold text-slate-800">
                        {emp.name}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span className="font-semibold text-slate-800 block">
                          {emp.department}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {emp.position}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        Rp {emp.dailyRate.toLocaleString("id-ID")} / Hari
                      </td>
                      <td className="p-3.5 font-mono text-blue-600 font-bold">
                        {emp.daysPresent} Hari
                      </td>
                      <td className="p-3.5 sm:pr-5 text-right font-mono font-bold text-emerald-600 text-sm">
                        Rp {emp.totalSalary.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama karyawan..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 text-slate-600"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 text-slate-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="Hadir">Hadir Tepat Waktu</option>
                <option value="Terlambat">Terlambat</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="p-3.5 sm:px-5">Tanggal</th>
                    <th className="p-3.5">Nama Karyawan</th>
                    <th className="p-3.5">Jam Masuk</th>
                    <th className="p-3.5">Jam Pulang</th>
                    <th className="p-3.5">Jarak GPS</th>
                    <th className="p-3.5">Bukti Foto</th>
                    <th className="p-3.5 sm:pr-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-slate-400"
                      >
                        Tidak ditemukan data presensi yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((rec) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-3.5 sm:px-5 font-mono text-slate-500">
                          {rec.date}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          {rec.userName}
                        </td>
                        <td className="p-3.5 font-mono font-medium text-blue-600">
                          {rec.checkInTime}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">
                          {rec.checkOutTime || "-"}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {rec.checkInDistanceMeters !== undefined
                            ? `${rec.checkInDistanceMeters}m`
                            : "-"}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {rec.checkInPhotoId ? (
                              <button
                                onClick={() =>
                                  handleViewPhoto(
                                    rec.checkInPhotoId,
                                    `Foto Masuk - ${rec.userName}`,
                                  )
                                }
                                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200/60 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Camera className="w-3 h-3" /> Masuk
                              </button>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                            {rec.checkOutPhotoId && (
                              <button
                                onClick={() =>
                                  handleViewPhoto(
                                    rec.checkOutPhotoId,
                                    `Foto Pulang - ${rec.userName}`,
                                  )
                                }
                                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200/60 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Camera className="w-3 h-3" /> Pulang
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 sm:pr-5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              rec.status === "Hadir"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                : "bg-rose-50 text-rose-700 border border-rose-200/60"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activePhotoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs">
                {activePhotoModal.title}
              </h4>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[250px]">
              {activePhotoModal.photoUrl ? (
                <img
                  src={activePhotoModal.photoUrl}
                  alt="Bukti Absensi Selfie"
                  className="max-h-72 object-contain rounded-xl shadow"
                />
              ) : (
                <div className="text-slate-400 text-xs">
                  Foto tidak tersedia atau telah terhapus.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSettings({
  office,
  onSaveOffice,
  onResetData,
  users,
  attendanceRecords,
  setUsers,
  setAttendanceRecords,
  showToast,
}: {
  office: OfficeConfig;
  onSaveOffice: (o: OfficeConfig) => void;
  onResetData: () => void;
  users: User[];
  attendanceRecords: AttendanceRecord[];
  setUsers: (u: User[]) => void;
  setAttendanceRecords: (a: AttendanceRecord[]) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const DEFAULT_DEPT_SCHEDULES = [
    {
      department: "Office",
      workStartHour: "08:00",
      workEndHour: "17:00",
      dailySalary: 150000,
    },
    {
      department: "Persiapan",
      workStartHour: "21:00",
      workEndHour: "05:00",
      dailySalary: 130000,
    },
    {
      department: "Pengolahan",
      workStartHour: "23:30",
      workEndHour: "07:30",
      dailySalary: 140000,
    },
    {
      department: "Distribusi",
      workStartHour: "06:00",
      workEndHour: "14:00",
      dailySalary: 120000,
    },
  ];

  const [formOffice, setFormOffice] = useState<OfficeConfig>(() => {
    const schedules =
      office.departmentSchedules && office.departmentSchedules.length > 0
        ? office.departmentSchedules
        : DEFAULT_DEPT_SCHEDULES;
    return { ...office, departmentSchedules: schedules };
  });

  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptSalary, setNewDeptSalary] = useState(120000);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOffice(formOffice);
    showToast(
      "Pengaturan lokasi, jam kerja, dan gaji harian departemen berhasil disimpan!",
      "success",
    );
  };

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const current = formOffice.departmentSchedules || [];
    if (
      current.some(
        (d) => d.department.toLowerCase() === newDeptName.trim().toLowerCase(),
      )
    ) {
      showToast("Departemen tersebut sudah ada!", "error");
      return;
    }
    const updated = [
      ...current,
      {
        department: newDeptName.trim(),
        workStartHour: "08:00",
        workEndHour: "17:00",
        dailySalary: Number(newDeptSalary) || 120000,
      },
    ];
    setFormOffice({ ...formOffice, departmentSchedules: updated });
    setNewDeptName("");
    setNewDeptSalary(120000);
    showToast(`Departemen ${newDeptName} berhasil ditambahkan.`, "info");
  };

  const handleRemoveDepartment = (index: number) => {
    const updated = [...(formOffice.departmentSchedules || [])];
    updated.splice(index, 1);
    setFormOffice({ ...formOffice, departmentSchedules: updated });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 font-sans">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          Pengaturan Kantor & Sistem Gaji Harian
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Konfigurasi koordinat GPS kantor dan tarif gaji harian per departemen
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nama Lokasi / Kantor
            </label>
            <input
              type="text"
              required
              value={formOffice.name}
              onChange={(e) =>
                setFormOffice({ ...formOffice, name: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={formOffice.latitude}
                onChange={(e) =>
                  setFormOffice({
                    ...formOffice,
                    latitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={formOffice.longitude}
                onChange={(e) =>
                  setFormOffice({
                    ...formOffice,
                    longitude: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Max Toleransi Radius Presensi (Meter)
            </label>
            <input
              type="number"
              required
              value={formOffice.radiusMeters}
              onChange={(e) =>
                setFormOffice({
                  ...formOffice,
                  radiusMeters: parseInt(e.target.value) || 100,
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Simpan Pengaturan Kantor
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Jam Kerja & Tarif Gaji Harian Per Departemen</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nama Departemen Baru..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Tarif Gaji / Hari (Rp)"
              value={newDeptSalary}
              onChange={(e) => setNewDeptSalary(Number(e.target.value))}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl font-medium shadow-sm transition-colors cursor-pointer"
            >
              + Tambah Departemen
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {formOffice.departmentSchedules?.map((dept: any, idx: number) => (
              <div
                key={dept.department}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50/75 rounded-xl border border-slate-200/60 text-xs gap-3"
              >
                <div className="w-full sm:w-1/4">
                  <span className="font-bold text-slate-800 block text-sm">
                    {dept.department}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Jam: {dept.workStartHour} - {dept.workEndHour}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Masuk:</span>
                    <input
                      type="time"
                      value={dept.workStartHour}
                      onChange={(e) => {
                        const updated = [
                          ...(formOffice.departmentSchedules || []),
                        ];
                        updated[idx].workStartHour = e.target.value;
                        setFormOffice({
                          ...formOffice,
                          departmentSchedules: updated,
                        });
                      }}
                      className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Pulang:</span>
                    <input
                      type="time"
                      value={dept.workEndHour}
                      onChange={(e) => {
                        const updated = [
                          ...(formOffice.departmentSchedules || []),
                        ];
                        updated[idx].workEndHour = e.target.value;
                        setFormOffice({
                          ...formOffice,
                          departmentSchedules: updated,
                        });
                      }}
                      className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                    <span className="text-[10px] text-slate-400">
                      Gaji/Hari:
                    </span>
                    <input
                      type="number"
                      value={dept.dailySalary || 0}
                      onChange={(e) => {
                        const updated = [
                          ...(formOffice.departmentSchedules || []),
                        ];
                        updated[idx].dailySalary = Number(e.target.value) || 0;
                        setFormOffice({
                          ...formOffice,
                          departmentSchedules: updated,
                        });
                      }}
                      className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono w-full"
                      placeholder="Gaji Harian (Rp)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-auto cursor-pointer"
                    title="Hapus Departemen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Simpan Jam Kerja & Gaji Departemen
          </button>
        </div>
      </div>
    </div>
  );
}
