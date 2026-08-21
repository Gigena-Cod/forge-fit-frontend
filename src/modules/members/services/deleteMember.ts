import { apiRequest } from '../../../shared/services/api.ts'

export async function deleteMember(memberId: string): Promise<void> {
  await apiRequest<void>(`/members/${memberId}`, { method: 'DELETE' });
}
