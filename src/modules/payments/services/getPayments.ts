import { apiRequest } from '../../../shared/services/api.ts'
import type { Payment } from "../models/Payment.ts";

type ApiPayment = Omit<Payment, 'memberName' | 'memberId'> & { memberId: string | { id?: string; _id?: string; name?: string } }

export type PaymentPage = { items: Payment[]; page: number; limit: number; total: number };
const PAGE_SIZE = 20;

export async function getPayments(page: number, query: string, signal: AbortSignal): Promise<PaymentPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (query) params.set('q', query);
  const data = await apiRequest<Omit<PaymentPage, 'items'> & { items: ApiPayment[] }>(`/payments?${params}`, { signal });
  return {
    ...data,
    items: data.items.map(({ memberId, ...payment }) => ({
      ...payment,
      memberId: typeof memberId === 'string' ? memberId : memberId?.id ?? memberId?._id ?? '',
      memberName: typeof memberId === 'string' ? 'Socio' : memberId?.name ?? 'Socio',
    })),
  };
}
