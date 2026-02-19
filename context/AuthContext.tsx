import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';

export function useAuth() {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();
  return {
    userId: user?.id ?? null,
    displayName: user?.fullName ?? user?.firstName ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    signOut,
  };
}
