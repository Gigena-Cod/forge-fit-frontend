import { useEffect, useState } from "react";
import { getMemberById } from "../../../services/getMemberById.ts";
import type { Member } from "../../../types/member.ts";

type UseGetMemberResult = {
  member: Member | null;
  isLoading: boolean;
  error: string | null;
};

export function useGetMember(id: string): UseGetMemberResult {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getMemberById(id)
      .then((result) => {
        if (isMounted) setMember(result);
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setMember(null);
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to retrieve member",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { member, isLoading, error };
}
