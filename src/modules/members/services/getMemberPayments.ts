import { apiRequest } from '../../../shared/services/api.ts'
import type { Payment } from "../../payments/models/Payment.ts";

export async function getMemberPayments(memberId: string): Promise<Payment[]> {
  return apiRequest<Payment[]>(`/members/${memberId}/payments`);
}
