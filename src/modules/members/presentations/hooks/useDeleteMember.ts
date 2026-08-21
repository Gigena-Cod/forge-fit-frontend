import { useState } from "react";
import { deleteMember as deleteMemberService } from "../../services/deleteMember.ts";
export function useDeleteMember() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function deleteMember(id: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await deleteMemberService(id);
      return true;
    } catch {
      setError("No pudimos eliminar el socio.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  return { deleteMember, isLoading, error };
}
