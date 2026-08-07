import { auth } from "@/auth";

export type Viewer = {
  id: string;
  isAdmin: boolean;
};

export async function getCurrentUser(): Promise<Viewer | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return { id: session.user.id, isAdmin: session.user.isAdmin };
}

export function canEditCard(
  user: Viewer | null,
  card: { ownerId?: string },
): boolean {
  return Boolean(user && (user.isAdmin || user.id === card.ownerId));
}
