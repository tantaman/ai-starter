import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();
export const { signIn, signUp, useSession } = authClient;
