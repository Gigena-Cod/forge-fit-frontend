import { useEffect, useState } from "react";
import { getPayments, type PaymentPage } from "../../services/getPayments.ts";

export function useGetPayments(page: number, query: string, revision: number) {
  const key = JSON.stringify([page, query, revision]);
  const [response, setResponse] = useState<{ key: string; data: PaymentPage | null } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void getPayments(page, query, controller.signal).then(
        (data) => { if (!controller.signal.aborted) setResponse({ key, data }); },
        () => { if (!controller.signal.aborted) setResponse({ key, data: null }); },
      );
    }, query ? 250 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, page, query]);

  const current = response?.key === key ? response : null;
  return { data: current?.data, isLoading: !current, error: !!current && !current.data };
}
