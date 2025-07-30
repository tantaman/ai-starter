// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import theme from "../styles/theme.css?url";
import { auth } from "../server/auth";
import { getWebRequest } from "@tanstack/react-start/server";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const request = getWebRequest();
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session == null) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
  };
});

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchUser();

    return {
      user,
    };
  },
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

    links: [
      { rel: "stylesheet", href: theme },
      // {
      //   href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
      //   rel: "stylesheet",
      // },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
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
