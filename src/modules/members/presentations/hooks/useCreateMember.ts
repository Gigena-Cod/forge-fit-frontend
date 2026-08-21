import { useState } from "react";
import { createMember as createMemberService } from "../../services/createMember.ts";
import type { Member } from "../../types/member.ts";
import type { MemberPayload } from "../../types/memberPayload.ts";
export function useCreateMember() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function createMember(payload: MemberPayload): Promise<Member | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await createMemberService(payload);
    } catch {
      setError("No pudimos crear el socio.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }
  return { createMember, isLoading, error };
}
