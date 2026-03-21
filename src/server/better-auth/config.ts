import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dash } from "@better-auth/infra";
import { jwt } from "better-auth/plugins/jwt";
import { bearer } from "better-auth/plugins/bearer";

import { env } from "~/env";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
    },
  },
  account: {
    skipStateCookieCheck: true
  },
  plugins: [
    dash({
      apiKey: env.BETTER_AUTH_SECRET,
      activityTracking: {
        enabled: true,
        updateInterval: 300000,
      }
    }),
    jwt(),
    bearer(),
  ],
});

export type Session = typeof auth.$Infer.Session;
