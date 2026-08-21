import { apiRequest } from '../../../shared/services/api.ts'
import type { Member } from "../types/member.ts";

export async function getMembers(): Promise<Member[]> {
  const members = await apiRequest<Array<Omit<Member, 'lastEntry'>>>("/members");
  return members.map((member) => ({ ...member, birthDate: member.birthDate ?? '', lastEntry: null }));
}
