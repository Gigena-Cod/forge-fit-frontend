import { useEffect, useState } from "react";
import { getMemberPayments } from "../../../services/getMemberPayments.ts";
import type { Payment } from "../../../../payments/models/Payment.ts";

type UseGetMemberPaymentsResult = {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
};

export function useGetMemberPayments(
  memberId: string,
): UseGetMemberPaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getMemberPayments(memberId)
      .then((result) => {
        if (isMounted) setPayments(result);
      })
      .catch(() => {
        if (isMounted) setError("Unable to retrieve payments");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  return { payments, isLoading, error };
}
