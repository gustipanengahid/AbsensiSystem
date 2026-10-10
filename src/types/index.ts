export type Role = "admin" | "employee";

export interface User {
  id: string;
  username: string;
  password?: string; // Tambahkan baris ini
  name: string;
  role: Role;
  position: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

export interface DepartmentSchedule {
  department: string;
  workStartHour: string; // e.g. "08:00"
  workEndHour: string; // e.g. "17:00"
}

export interface OfficeConfig {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  workStartHour: string; // Jam standar global
  workEndHour: string;
  breakDurationMinutes: number;
  departmentSchedules?: DepartmentSchedule[]; // Jadwal spesifik per departemen
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userPosition: string;
  date: string;
  checkInTime: string;
  checkInPhotoId?: string;
  checkInLat?: number;
  checkInLng?: number;
  checkInDistanceMeters?: number;
  checkOutTime?: string;
  checkOutPhotoId?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutDistanceMeters?: number;
  status: "Hadir" | "Terlambat" | "Pulang";
  note?: string; // Tambahkan baris ini
}

export interface DepartmentSchedule {
  department: string;
  workStartHour: string;
  workEndHour: string;
  dailySalary?: number; // Gaji per hari (misal: 120000)
}
