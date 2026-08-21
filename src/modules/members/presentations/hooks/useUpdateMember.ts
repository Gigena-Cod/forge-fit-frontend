import { useState } from "react";
import { updateMember as updateMemberService } from "../../services/updateMember.ts";
import type { Member } from "../../types/member.ts";
import type { MemberPayload } from "../../types/memberPayload.ts";
export function useUpdateMember() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function updateMember(
    id: string,
    payload: MemberPayload,
  ): Promise<Member | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await updateMemberService(id, payload);
    } catch {
      setError("No pudimos actualizar el socio.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }
  return { updateMember, isLoading, error };
}
