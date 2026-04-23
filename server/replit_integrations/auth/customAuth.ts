import session from "express-session";
import connectPg from "connect-pg-simple";
import passport from "passport";
import type { Express, RequestHandler } from "express";
import { registerReplitAuth, refreshReplitTokens } from "./replitAuth";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  await registerReplitAuth(app);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // 1) Custom username/password session
  if (req.session?.userId) {
    (req as any).user = { claims: { sub: req.session.userId } };
    return next();
  }
  // 2) Replit OAuth session (passport)
  const passportUser = req.user as any;
  if (passportUser?.claims?.sub) {
    const now = Math.floor(Date.now() / 1000);
    if (!passportUser.expires_at || now <= passportUser.expires_at) {
      return next();
    }
    const refreshed = await refreshReplitTokens(passportUser);
    if (refreshed) return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
