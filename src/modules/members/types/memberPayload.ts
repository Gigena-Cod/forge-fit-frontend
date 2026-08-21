import type { MembershipStatus } from "./member.ts";

export interface MemberPayload {
  name: string;
  dni: string;
  birthDate: string;
  phone: string;
  email: string;
  registrationDate: string;
  membershipStatus: MembershipStatus;
}
