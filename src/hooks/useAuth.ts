import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

type UnifiedUser = {
  id: number;
  name: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  resumeUrl?: string | null;
  skills?: string[] | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !oauthUser && !!localStorage.getItem("local_auth_token"),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const user: UnifiedUser | null = useMemo(() => {
    if (oauthUser) {
      return {
        id: oauthUser.id,
        name: oauthUser.name,
        email: oauthUser.email,
        firstName: oauthUser.name?.split(" ")[0] ?? null,
        lastName: oauthUser.name?.split(" ").slice(1).join(" ") ?? null,
        role: oauthUser.role,
        avatar: oauthUser.avatar,
        avatarUrl: oauthUser.avatar,
        phone: oauthUser.phone,
        city: oauthUser.city,
        resumeUrl: oauthUser.resumeUrl,
        skills: oauthUser.skills,
        createdAt: oauthUser.createdAt,
        updatedAt: oauthUser.updatedAt,
      };
    }
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        firstName: localUser.firstName,
        lastName: localUser.lastName,
        role: localUser.role,
        avatar: localUser.avatar,
        avatarUrl: localUser.avatarUrl,
        phone: localUser.phone,
        city: localUser.city,
        resumeUrl: localUser.resumeUrl,
        skills: localUser.skills,
        createdAt: localUser.createdAt,
        updatedAt: localUser.updatedAt,
      };
    }
    return null;
  }, [oauthUser, localUser]);

  const isLoading = oauthLoading || (localLoading && !oauthUser);

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  const isAdmin = user?.role === "admin";
  const isCompany = user?.role === "company";
  const isSeeker = user?.role === "seeker";

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      isAdmin,
      isCompany,
      isSeeker,
      logout,
    }),
    [user, isLoading, logoutMutation.isPending, isAdmin, isCompany, isSeeker, logout]
  );
}
