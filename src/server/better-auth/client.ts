import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
}
);

export type Session = typeof authClient.$Infer.Session;
