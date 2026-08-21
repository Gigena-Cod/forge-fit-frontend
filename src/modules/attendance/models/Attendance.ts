export const AttendanceStatus = {
  Allowed: "ALLOWED",
  Rejected: "REJECTED",
} as const;
export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  entryDate: string;
  entryTime: string;
  status: AttendanceStatus;
}
