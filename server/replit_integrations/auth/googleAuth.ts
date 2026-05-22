import type { Express } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, type Profile } from "passport-google-oauth20";
import { db } from "../../db";
import { users, type User } from "@shared/models/auth";
import { eq } from "drizzle-orm";

async function findOrCreateGoogleUser(profile: Profile): Promise<User> {
  const email = profile.emails?.[0]?.value;
  const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "";
  const lastName = profile.name?.familyName || "";
  const profileImageUrl = profile.photos?.[0]?.value;

  if (email) {
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      const [updated] = await db
        .update(users)
        .set({
          firstName: existing.firstName || firstName,
          lastName: existing.lastName || lastName,
          profileImageUrl: existing.profileImageUrl || profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }
  }

  const usernameBase = (email ? email.split("@")[0] : `user${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 24) || `user${Date.now()}`;

  let username = usernameBase;
  let attempt = 0;
  while (true) {
    const [clash] = await db.select().from(users).where(eq(users.username, username));
    if (!clash) break;
    attempt += 1;
    username = `${usernameBase}_${attempt}`;
  }

  const [created] = await db
    .insert(users)
    .values({
      email: email ?? null,
      firstName,
      lastName,
      profileImageUrl: profileImageUrl ?? null,
      username,
    })
    .returning();
  return created;
}

export function registerGoogleAuth(app: Express): void {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn("[google-auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set; skipping Google OAuth setup.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateGoogleUser(profile);
          return done(null, { id: user.id });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/auth?error=google" }),
    (req: any, res) => {
      const user = req.user as { id: string } | undefined;
      if (!user?.id) {
        return res.redirect("/auth?error=google");
      }
      req.session.userId = user.id;
      req.session.save(() => res.redirect("/home"));
    }
  );
}
