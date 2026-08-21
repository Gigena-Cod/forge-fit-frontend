export const MembershipStatus = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
} as const;

export type MembershipStatus =
  (typeof MembershipStatus)[keyof typeof MembershipStatus];

export interface Member {
  id: string;
  name: string;
  dni: string;
  birthDate?: string;
  phone: string;
  registrationDate: string;
  membershipStatus: MembershipStatus;
  email: string;
  lastEntry: string | null;
}
