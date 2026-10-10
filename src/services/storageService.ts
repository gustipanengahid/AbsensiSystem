import { OfficeConfig, User, Role } from "../types";

export const STORAGE_KEYS = {
  USERS: "absensi_prod_users_v1",
  OFFICE: "absensi_prod_office_v1",
  ATTENDANCE: "absensi_prod_records_v1",
  SESSION: "absensi_prod_session_v1",
};

export const DEFAULT_OFFICE: OfficeConfig = {
  name: "SPPG JOHO #01",
  latitude: -7.59706,
  longitude: 110.88985,
  radiusMeters: 250,
  workStartHour: "08:00",
  workEndHour: "17:00",
  breakDurationMinutes: 60,
  departmentSchedules: [
    {
      department: "Office",
      workStartHour: "08:00",
      workEndHour: "17:00",
    },
    { department: "Persiapan", workStartHour: "21:00", workEndHour: "05:00" },
    { department: "Pengolahan", workStartHour: "23:30", workEndHour: "07:30" },
    { department: "Persiapan", workStartHour: "02:30", workEndHour: "10:30" },
    { department: "Distrbusi", workStartHour: "06:00", workEndHour: "14:00" },
  ],
};

const INITIAL_ADMIN: User = {
  id: "usr-admin-gusti",
  username: "gustipanengah",
  name: "Gusti Panengah",
  role: "employee" as Role,
  position: "Administrator",
  department: "Office",
  isActive: true,
  createdAt: "2026-01-01",
};

export const storageService = {
  seedInitialDataIfNeeded() {
    if (!localStorage.getItem(STORAGE_KEYS.OFFICE)) {
      localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(DEFAULT_OFFICE));
    }

    const existingUsers = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.USERS) || "[]",
    );
    if (
      !localStorage.getItem(STORAGE_KEYS.USERS) ||
      existingUsers.length === 0
    ) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([INITIAL_ADMIN]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    }
  },
};
