import { useEffect, useState } from "react";
import { getAttendancesByMemberId } from "../../services/getAttendancesByMemberId.ts";
import type { Attendance } from "../../models/Attendance.ts";

export function useGetMemberAttendances(memberId: string) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    getAttendancesByMemberId(memberId)
      .then((result) => {
        if (isMounted) setAttendances(result);
      })
      .catch(() => {
        if (isMounted) setError("No pudimos obtener las asistencias.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [memberId]);
  return { attendances, isLoading, error };
}
