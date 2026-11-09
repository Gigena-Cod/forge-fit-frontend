import { apiRequest } from '../../../shared/services/api.ts'
import type { Payment } from "../../payments/models/Payment.ts";
import type { ListPage } from "../../../shared/hooks/usePagedList.ts";

export async function getMemberPayments(memberId: string, period: string): Promise<Payment[]> {
  const path = `/members/${encodeURIComponent(memberId)}/payments`;
  const payments: Payment[] = [];
  let page = 1;
  while (true) {
    const params = new URLSearchParams({ period, page: String(page), limit: "100" });
    const result = await apiRequest<ListPage<Payment>>(`${path}?${params}`);
    payments.push(...result.items);
    if (!result.items.length || page * result.limit >= result.total) return payments;
    page++;
  }
}
