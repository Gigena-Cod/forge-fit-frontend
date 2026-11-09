import { usePagedList } from '../../../../shared/hooks/usePagedList.ts'
import type { Attendance } from '../../models/Attendance.ts'

type ApiAttendance = {
  id?: string
  _id?: string
  memberId: string | { id?: string; _id?: string; name?: string } | null
  entryAt: string
  status: Attendance['status']
}

function mapAttendance({ id, _id, memberId, entryAt, status }: ApiAttendance): Attendance {
  return {
    id: id ?? _id ?? '',
    memberId: typeof memberId === 'string' ? memberId : memberId?.id ?? memberId?._id ?? '',
    memberName: typeof memberId === 'string' ? 'Socio' : memberId?.name ?? 'Socio',
    entryDate: entryAt.slice(0, 10),
    entryTime: new Date(entryAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status,
  }
}

export function useGetAttendances(path: string | null, query = '') {
  const list = usePagedList<ApiAttendance>(path, query)
  return { ...list, data: list.data && { ...list.data, items: list.data.items.map(mapAttendance) } }
}
