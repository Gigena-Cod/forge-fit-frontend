import { apiRequest } from '../../../shared/services/api.ts'
import type { Payment } from "../models/Payment.ts";

type ApiPayment = Omit<Payment, 'memberName' | 'memberId'> & { memberId: string | { id?: string; _id?: string; name?: string } }

export async function getPayments(): Promise<Payment[]> {
  const payments = await apiRequest<ApiPayment[]>('/payments');
  return payments.map((payment) => ({ ...payment, memberId: typeof payment.memberId === 'string' ? payment.memberId : payment.memberId.id ?? payment.memberId._id ?? '', memberName: typeof payment.memberId === 'string' ? 'Socio' : payment.memberId.name ?? 'Socio' }));
}
