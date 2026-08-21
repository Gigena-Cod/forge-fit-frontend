import { useEffect, useState } from "react";
import { getMembers } from "../../services/getMembers.ts";
import type { Member } from "../../types/member.ts";

type UseGetMembersResult = {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  addMember: (member: Member) => void;
  replaceMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
};

export function useGetMembers(): UseGetMembersResult {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getMembers()
      .then((result) => {
        if (isMounted) setMembers(result);
      })
      .catch(() => {
        if (isMounted) setError("No fue posible cargar los socios.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    members,
    isLoading,
    error,
    addMember: (member) => setMembers((current) => [...current, member]),
    replaceMember: (member) =>
      setMembers((current) =>
        current.map((item) => (item.id === member.id ? member : item)),
      ),
    removeMember: (memberId) =>
      setMembers((current) => current.filter((item) => item.id !== memberId)),
  };
}
