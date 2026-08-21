import { useEffect, useState } from "react";
import { getPayments } from "../../services/getPayments.ts";
import type { Payment } from "../../models/Payment.ts";

export function useGetPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getPayments()
      .then((result) => {
        if (isMounted) setPayments(result);
      })
      .catch(() => {
        if (isMounted) setError("No pudimos obtener los pagos.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { payments, isLoading, error };
}
