export const PaymentStatus = {
  Paid: "PAID",
  Pending: "PENDING",
  Overdue: "OVERDUE",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  Cash: "CASH",
  Transfer: "TRANSFER",
  Card: "CARD",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  period: string;
  amount: number;
  paymentDate: string | null;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
}
