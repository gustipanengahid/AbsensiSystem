import { OfficeConfig, User } from "../types";

export function getDepartmentSchedule(user: User, office: OfficeConfig) {
  const deptSchedule = office.departmentSchedules?.find(
    (s) => s.department.toLowerCase() === user.department.toLowerCase(),
  );

  return {
    workStartHour: deptSchedule
      ? deptSchedule.workStartHour
      : office.workStartHour,
    workEndHour: deptSchedule ? deptSchedule.workEndHour : office.workEndHour,
  };
}
