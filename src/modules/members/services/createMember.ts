import { apiRequest } from '../../../shared/services/api.ts'
import type { Member } from "../types/member.ts";
import type { MemberPayload } from "../types/memberPayload.ts";

export async function createMember(payload: MemberPayload): Promise<Member> {
  const member = await apiRequest<Omit<Member, 'lastEntry'>>('/members', { method: 'POST', body: JSON.stringify(payload) });
  return { ...member, birthDate: member.birthDate ?? '', lastEntry: null };
}
