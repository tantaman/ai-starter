// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  ClientOnly,
} from "@tanstack/react-router";

import theme from "@/styles/theme.css?url";
import { ZeroInit } from "../ui/zero-init";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Zero AI Starter",
      },
    ],

    links: [{ rel: "stylesheet", href: theme }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ClientOnly fallback={<div>Loading...</div>}>
        <ZeroInit>
          <Outlet />
        </ZeroInit>
      </ClientOnly>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="font-sans">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gradient-to-br from-gray-50 via-white to-gray-100 text-neutral-800">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
