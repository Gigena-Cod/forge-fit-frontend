import { apiRequest } from '../../../shared/services/api.ts'
import type { Attendance } from "../models/Attendance.ts";

export async function getAttendancesByMemberId(
  memberId: string,
): Promise<Attendance[]> {
  const attendances = await apiRequest<Array<{ id: string; memberId: string; entryAt: string; status: Attendance['status'] }>>(`/members/${memberId}/attendance`);
  return attendances.map((attendance) => ({ ...attendance, memberName: '', entryDate: attendance.entryAt.slice(0, 10), entryTime: new Date(attendance.entryAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) }));
}
