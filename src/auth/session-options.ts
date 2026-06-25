import type { SessionOptions } from 'express-session';

export function createSessionOptions(nodeEnv = process.env.NODE_ENV, secret = process.env.SESSION_SECRET || 'change-this-secret'): SessionOptions {
  const isProd = nodeEnv === 'production';

  return {
    secret,
    resave: false,
    saveUninitialized: true,
    proxy: isProd,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      domain: isProd ? '.wign.dev' : undefined,
    },
  };
}
