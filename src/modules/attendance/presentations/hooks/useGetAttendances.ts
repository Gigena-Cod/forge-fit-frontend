import { useEffect, useState } from "react";
import { getAttendances } from "../../services/getAttendances.ts";
import type { Attendance } from "../../models/Attendance.ts";

export function useGetAttendances() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    getAttendances()
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
  }, []);
  return { attendances, isLoading, error };
}
