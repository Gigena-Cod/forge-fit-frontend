import { apiRequest } from '../../../shared/services/api.ts'
import type { Attendance } from "../models/Attendance.ts";

export async function getAttendances(): Promise<Attendance[]> {
  const attendances = await apiRequest<Array<{ id: string; memberId: string | { id?: string; _id?: string; name?: string }; entryAt: string; status: Attendance['status'] }>>('/attendance');
  return attendances.map((attendance) => ({ id: attendance.id, memberId: typeof attendance.memberId === 'string' ? attendance.memberId : attendance.memberId.id ?? attendance.memberId._id ?? '', memberName: typeof attendance.memberId === 'string' ? 'Socio' : attendance.memberId.name ?? 'Socio', entryDate: attendance.entryAt.slice(0, 10), entryTime: new Date(attendance.entryAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }), status: attendance.status }));
}
