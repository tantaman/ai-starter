import { ZeroProvider } from "@rocicorp/zero/react";
import { useMemo, type ReactNode } from "react";
import { schema } from "@/shared/schema.js";
import { useSession } from "@/client/auth.js";
import { createMutators } from "../shared/mutators";

export function ZeroInit({ children }: { children: ReactNode }) {
  const { data } = useSession();

  let server: string | null = null;
  if (typeof window !== "undefined") {
    server = window.location.origin;
  }

  const props = useMemo(() => {
    return {
      schema,
      server: window.location.origin,
      userID: data?.user?.id ?? "anon",
      mutators: createMutators(data ?? null),
      logLevel: "info",
    } as const;
  }, [data?.user?.id]);

  if (server == null) {
    return <div>Loading...</div>;
  }

  return <ZeroProvider {...props}>{children}</ZeroProvider>;
}
