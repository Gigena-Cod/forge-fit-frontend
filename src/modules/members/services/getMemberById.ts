import { apiRequest } from '../../../shared/services/api.ts'
import type { Member } from "../types/member.ts";

export async function getMemberById(id: string): Promise<Member> {
  const member = await apiRequest<Omit<Member, 'lastEntry'>>(`/members/${id}`);
  return { ...member, birthDate: member.birthDate ?? '', lastEntry: null };
}
