import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import type { Express } from "express";
import memoize from "memoizee";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertReplitUser(claims: any) {
  const sub = claims["sub"];
  const email = claims["email"] ?? null;
  const firstName =
    claims["first_name"] ??
    (email ? String(email).split("@")[0] : "Friend");
  await authStorage.upsertUser({
    id: sub,
    email,
    firstName,
    lastName: claims["last_name"] ?? null,
    profileImageUrl: claims["profile_image_url"] ?? null,
  });
}

/**
 * Registers passport strategies + routes for "Sign in with Replit"
 * (which itself supports Google, GitHub, X, Apple, and email/password).
 *
 * Assumes session + passport.initialize() + passport.session() have already
 * been mounted on the app by the caller.
 */
export async function refreshReplitTokens(user: any): Promise<boolean> {
  try {
    if (!user?.refresh_token) return false;
    const config = await getOidcConfig();
    const tokens = await client.refreshTokenGrant(config, user.refresh_token);
    updateUserSession(user, tokens);
    return true;
  } catch (err) {
    console.error("[auth] token refresh failed:", err);
    return false;
  }
}

export async function registerReplitAuth(app: Express): Promise<void> {
  if (!process.env.REPL_ID) {
    console.warn("[auth] REPL_ID not set — skipping Replit OAuth setup");
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user: any = {};
    updateUserSession(user, tokens);
    await upsertReplitUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/auth/replit/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/auth/replit", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/auth/replit/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/home",
      failureRedirect: "/auth",
    })(req, res, next);
  });
}
