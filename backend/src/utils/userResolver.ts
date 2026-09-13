import { prisma } from './prisma';

/**
 * Resolves a Clerk user ID, internal user ID, or missing session to an existing internal User.id
 * Ensures foreign key constraints never fail and guests can practice seamlessly.
 */
export async function resolveUserId(identifier?: string): Promise<string> {
  if (identifier) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { clerkId: identifier },
        ],
      },
    });

    if (user) return user.id;

    // Auto-create user for newly signed-in Clerk accounts
    try {
      const created = await prisma.user.create({
        data: {
          clerkId: identifier,
          email: `${identifier.replace(/[^a-zA-Z0-9]/g, '_')}@candidate.intelview.ai`,
          name: 'Candidate',
        },
      });
      return created.id;
    } catch {
      const fallback = await prisma.user.findFirst({ where: { clerkId: identifier } });
      if (fallback) return fallback.id;
    }
  }

  // Fallback to guest candidate for unauthenticated dev/demo access
  const existingGuest = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkId: 'guest_user' },
        { email: 'guest@intelview.ai' },
      ],
    },
  });
  if (existingGuest) return existingGuest.id;

  const demoUser = await prisma.user.create({
    data: {
      clerkId: 'guest_user',
      email: 'guest@intelview.ai',
      name: 'Candidate',
    },
  });
  return demoUser.id;
}
