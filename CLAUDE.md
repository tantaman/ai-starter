# CLAUDE.md

## Overview

You are building a web application using the following frameworks:

1. TanStack Start - handles client and server side routing. Similar to TanStack Router but with a server component.
2. Drizzle - Manages the database schema and migrations.
3. Postgres - The database being used. Only connected to via Drizzle in the context of this application.
4. React - The UI framework.
5. Zero - The sync engine. Discussed in detail later. Used to synchronize state between frontend and backend.
6. Tailwind css - The style framework.
7. Better-Auth - Authentication framework.
8. TypeScript - The programming language used.

You have existing knowledge on most of these frameworks but Zero is new. This document will cover how the project is organized and go into depth on how to user Zero.

Outside of these libraries, you must **not** pull in any additional libraries that serve the same purpose as one of the seven listed above. Example: do not add `solid` since we have `react`. Do not add `prisma` because we have `drizzle`, etc.

These frameworks have already been configured for you and a project scaffolding set up. As you continue to add features and develop the application, feel free to update this file with information that will be handy to you in the future.

## Project Structure

```
.
|-- public/ # Static assets
|-- scripts/ # Scripts to aid in managing the dev environment.
|-- src/ # Source code of frontend and backend
|   |-- client/ # Code that only runs client side
|   |-- db/ # Drizzle schema, Drizzle client, postgres connector
|   |   |-- schema.ts # the Drizzle schema definition
|   |-- routes/ # The full stack filesystem router.
|   |   |-- api/ # Place API routes here
|   |   |-- index.tsx # Main / home page
|   |-- server/ # Code that only runs server side
|   |-- shared/ # Code that is used by both client and serer
|   |   |-- queries/ # Zero query definitions
|   |   |-- mutators/ # Zero mutator definitions
|   |   |-- schema.ts # The Zero schema. Used to build ZQL queries. Generated from the Drizzle schema.
|   |-- styles/ # CSS files, included by JS files
|   |-- ui/ # UI components (nav, headers, footers, buttons, etc.)
|   |   |-- zero-init.tsx # initializes Zero for use on the client. Do not modify.
```

### Routes

Any file placed into `routes` will be accessible, over the web, via `/filename` (sans extension). If the file is in a folder in `routes` then the path is `/folder/filename`. An exception to this rule are folders with an underscore (\_) prefix. These folders or omitted from the URL. So everything placed into `_foo` is still accessible from the root URL.

Examples:
If our website is hosted on `http://localhost:3000` then:

1. `routes/index.tsx` will be accessible via `http://localhost:3000`
2. `routes/intro.tsx` via `http://localhost:3000/intro`
3. `routes/blog/hello.tsx` via `http://localhost:3000/blog/hello`
4. `routes/_foo/bar.tsx` via `http://localhost:3000/bar`

For the most part, you should only need to place files into the root `routes/` directory.

The Zero sync server will handle almost all API needs so there should not be any need to ever create new API routes. If you find yourself wanting to create an API route, you can most likely solve the problem with a Zero Mutator or Zero Query. Refer to the Zero section of this document.

The queries and mutators you define for Zero will also check session state, meaning we never need separate routes for authenticated pages.

Routes are strictly typed and the type information is generated into `src/routeTree.gen.ts`. You can regenerate this file by running `pnpm dev`.

### Styles

A tailwindcss 4 theme is defined in `src/styles/theme.css`. This is the default theme and will create a rather pleasant UI. If you need to make sweeping changes to the overall feel of the application, modify the styles in `theme.css`. In addition to colors and fonts, a set of utility classes are present in `theme.css` for components like:

- buttons (.btn)
- inputs (.input)
- cards (.card)
- nav button (.nav-btn)

It also contains semantic namings for the colors used so colors can be changed in one place to change the entire feel of the application.

If you come up with new semantic UI elements, please add utility classes for those to the theme.

Here is an example use of the pre-canned controls:

```tsx
function ExampleHome() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-[var(--color-base)] border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">
          AI Starter
        </div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <button className="nav-btn">Dashboard</button>
          <button className="nav-btn">Chat</button>
          <button className="nav-btn">Tracker</button>
          <button className="nav-btn">Store</button>
        </nav>
        <div className="mt-auto text-xs text-subtle">© 2025 AI Starter</div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-5 tracking-tight">
            Build Something Smart
          </h1>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-2">Compact Card</h2>
            <p className="text-body text-sm">
              A compact card layout for dense UIs with just enough padding and
              definition to stay legible and useful.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="btn btn-primary">Create</button>
              <button className="btn btn-default">Preview</button>
            </div>
          </div>

          <form className="card space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-heading">
                Name
              </label>
              <input type="text" className="input" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-heading">
                Message
              </label>
              <textarea rows={3} className="input"></textarea>
            </div>
            <button type="submit" className="btn btn-default">
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
```

## Project Scripts

There are various scripts available for running and validating the project. Each of these has an entry in the `scripts` attribute of `./package.json`. The package manager is `pnpm` so these scripts can be run with `pnpm run [script name]`.

They are the following:

- `dev` - runs the whole project. This kicks off a docker container that runs Postgres, Vite to run the UI, and starts the Zero Cache server. Monitor the output of this for errors. It will watch all changes being made to the project and reload things as required, printing errors if something goes wrong.
- `db:push` - forces the application of a new schema to postgres. Use this whenever making changes to the PG/drizzle schema during development. `db:push` may ask you for input. Monitor the command and provide input if required.
- `db:studio` - runs the drizzle studio which provides a UI for exploring the contents of the postgres db
- `dev:web` - you generally do not need to run this. This will run just `vite` and no other components. Prefer `dev` over `dev:web`.
- `dev:docker` - another command you generally do not need. This will just run postgres in docker and no other components.
- `dev:zero` - another command you generally do not need. This will run zero cache and no other components. Prefer `dev`.
- `check` - runs type script to check all types
- `gen-schema` - generates the zero schema from the drizzle schema

`pnpm run dev` will start everything and the website can be visited at the following URL: http://localhost:8080/

### Rules of thumb:

- After changing the `drizzle schema` run `pnpm run db:push` and `pnpm run gen-schema`
- If `pnpm run dev` is running in the background then any changes to routes will get picked up and generated into `routeTree.gen.ts`.

## Architecture

The system architecture most closely resembles a three tier architecture.

1. `Postgres`, `src/db` is the data layer
2. `src/routes/api`, `src/server` is the application layer
3. `src/routes`, `src/ui`, `src/styles` is the presentation layer

A key divergence, however, is that data is moved from the data layer to the presentation layer via `Zero` and not through traditional Rest APIs. Zero is a sync engine that lets the presentation layer specify a set of queries the results of which will be continuously synced down to the client. This allows one to easily develop reactive and realtime applications as one will always be notified of changes to data. Data that is synced is also stored on device for quick access.

In addition to syncing reads, writes are also synced by Zero.

The data layer, being Postgres, is relational and normalized.

### ✅ Example of Normalized Data Model

#### 🔴 Denormalized Table (Before Normalization)

| OrderID | CustomerName | CustomerEmail                             | ProductName | ProductPrice |
| ------- | ------------ | ----------------------------------------- | ----------- | ------------ |
| 1001    | Alice Smith  | [alice@email.com](mailto:alice@email.com) | iPhone 15   | 999          |
| 1002    | Alice Smith  | [alice@email.com](mailto:alice@email.com) | AirPods Pro | 249          |
| 1003    | Bob Johnson  | [bob@email.com](mailto:bob@email.com)     | iPhone 15   | 999          |

**Issues:**

- Customer info is duplicated.
- Product info is repeated.
- Hard to update prices/emails consistently.

---

#### ✅ Normalized Tables (3NF)

##### 1. **Customers**

| CustomerID | Name        | Email                                     |
| ---------- | ----------- | ----------------------------------------- |
| 1          | Alice Smith | [alice@email.com](mailto:alice@email.com) |
| 2          | Bob Johnson | [bob@email.com](mailto:bob@email.com)     |

##### 2. **Products**

| ProductID | ProductName | Price |
| --------- | ----------- | ----- |
| 101       | iPhone 15   | 999   |
| 102       | AirPods Pro | 249   |

##### 3. **Orders**

| OrderID | CustomerID |
| ------- | ---------- |
| 1001    | 1          |
| 1002    | 1          |
| 1003    | 2          |

##### 4. **OrderDetails**

| OrderID | ProductID |
| ------- | --------- |
| 1001    | 101       |
| 1002    | 102       |
| 1003    | 101       |

**Benefits of normalization:**

- No redundancy: Alice’s email is stored only once.
- Easier maintenance: If product price changes, update one record.
- Scalable and consistent structure.

---

### 🧠 Summary

| Feature          | Denormalized          | Normalized         |
| ---------------- | --------------------- | ------------------ |
| Data Redundancy  | High                  | Low                |
| Update Anomalies | Likely                | Unlikely           |
| Query Simplicity | Simpler queries       | More complex joins |
| Data Integrity   | Risk of inconsistency | High integrity     |

When adding relationships to the data model, all foreign keys must be indexed for efficient use.

## Using Zero

Zero will be the way you read and write data that is synced between the client and the server. Any feature, on the client, that needs information from the Postgres DB will use Zero queries to get it. Any feature, on the client, that needs to write to Postgres will use Zero mutators to do it. You will not ever create custom REST APIs unless you are calling third party data sources.

### Zero Queries

Queries are how the client gets data from the server. Queries definitions live in `./src/shared/queries.ts`.

Zero has a query language called "ZQL" which is a composable query language with many of the features of SQL. The main difference is that ZQL can return hierarchies of data, which a UI often wants, rather than flat, tabular, data.

Queries are built using the ZQL query builder which can be imported from the application's Zero schema. This schema is generated from the Drizzle schema and does not need to be modified directly. The builder has a property for each table. The builder also exposes `related` calls for each `relationship` defined in the `drizzle` schema.

Example of getting and using the query builder:

```ts
import { builder } from "@/shared/schema.js";

builder.user.where("id", "=", 1);
```

All methods on the query builder (where, limit, related, exists, start, orderBy) can be chained one after the other. Each call of a method returns a new query instance rather than modifying the existing query. This lets one compose more complex queries from existing queries.

**Example:**

```ts
import { builder } from "@/shared/schema.js";

const allUsers = builder.user; // returns User[]
const allVerifiedUsers = allUsers.where("emailVerified", "=", true); // returns User[]
const allVerifiedUsersNamedBrad = allVerifiedUsers.where("name", "=", "Brad"); // returns User[]
```

#### ZQL: Where

`where(column, operator, value)`

```ts
import { builder } from "@/shared/schema.js";
import { escapeLike } from "@rocicorp/zero";

// a `where` method is available for each table.
// `where` can be used to filter rows for that table.
builder.user.where("id", "=", 1);
const substr = "foo";
builder.user.where("email", "ILIKE", `%${escapeLike(substr)}%`);

// where supports many comparison operators:
// =, <, >, <=, >=, LIKE, !=, IS, IS NOT
// IS and IS NOT are like equality but treats null as equal to null.

// Chaining multiple `where` clauses together ANDs the filters
// Users created at least 24 hours ago and updated within the last day.
builder.user
  .where("createdAt", "<", Date.now() - 86400 * 1000)
  .where("updatedAt", ">", Date.now() - 86400 * 1000);
```

Where must be done via the above syntax. These are incorrect where clauses:

```ts
// INCORRECT. This is Prisma, not ZQL, syntax:
await prisma.user.findMany({
  where: {
    email: "john@example.com",
  },
});

// INCORRECT. This is Drizzle, not ZQL, syntax:
const users = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, "john@example.com"));
```

#### ZQL: Limit

`limit(n: number)`

```ts
import { builder } from "@/shared/schema.js";

// last 10 users to be created
builder.user.limit(10).orderBy("createdAt", "desc");

// last 10 users to be created and have a verified email
builder.user
  .where("emailVerified", "=", true)
  .limit(10)
  .orderBy("createdAt", "desc");
```

#### ZQL: Related

`related(relationship, cb?: (q: Query) => Query)`

`related` lets the developer traverse relationships and return trees of data. This is really helpful when building a UI as a UI often needs a tree of data. Think of an issue detail page in an issue tracker. It needs: an issue, the owner, the creator, tags, related comments, comment authors, comment reactions, etc. to show the full context of an issue.

`related` relationships are set up in the drizzle schema using its `relations` API.

The first argument to `related` is the name of the relationship to follow. These names will match the relationships defined in your drizzle schema (`src/db/schema.ts`).

```ts
import { builder } from "@/shared/schema.js";

// Get all of the related data to build a detailed issue view
builder.issue
  .where("id", "=", some_provided_issue_id)
  .related("assignee")
  .related("owner")
  .related("comments", (commentQuery) =>
    commentQuery.related("author").related("reactions")
  );
```

`related` also takes a second, optional, parameter. This parameter is a callback which can apply additional filters, limits, orderings, etc. to the related data. In the above example we do this for `comments` and grab their related authors and reactions.

Related also changes the shape of the returned data. Here are some examples of the shapes of data returned by different queries:

```ts
import { builder } from "@/shared/schema.js";

const result = await builder.issue;
// typeof result => Issue[];

const result = await builder.issue.related("comments");
// typeof result => (Issue & { comments: Comment[] })[];

const result = await builder.issue.related("comments").related("assignee");
// typeof result => (Issue & { comments: Comment[], assignee: User })[]
```

In the last example you can see that if the related edge is 1-1 then the attribute value is not an array (in the case of assignee).

The return type of a query can be automatically inferred with some utilities. Examples:

```ts
import { queries } from "@/shared/queries.js";
import { Row } from "@rocicorp/zero";

type UserResult = Row<ReturnType<typeof queries.user>>;
type IssuesResult = Row<ReturnType<typeof queries.issues>>;
```

The row type for an individual item in the schema can also be retrieved:

```ts
import { schema } from "@/shared/schema.js";
import { Row } from "@rocicorp/zero";

type User = Row<typeof schema.tables.user>;
```

Given all of that, you do not have to manually define types for query results or individual rows.

#### ZQL: Exists

`exists(relationship, cb?: (q: Query) => Query)`

Sometimes you want to return data depending on the result of a subquery. `exists` enables this.

```ts
import { builder } from "@/shared/schema.js";

// find all issues that have comments
builder.issue.whereExists("comments");
```

The first argument to `exists` is the same as the first arg to related: the relationship name to traverse.

Like `related`, `exists` also takes a second argument. This second argument lets you add additional checks to the subquery.

```ts
// find all issues that have comments in the last 24 hours
builder.issue.whereExists("comments", (q) =>
  q.where("created", ">", Date.now() - 86400 * 1000)
);
```

#### ZQL: Start / Offset

`start(row)`

ZQL provides a `start` function to do pagination. Start takes a row after which to start. The row does not need to be complete but it must contain:

- all primary key columns
- all other columns used in any `orderBy` clauses of the query it is being passed to

```ts
builder.user
  .limit(100)
  .orderBy("createdAt", "asc")
  .start(endingRowFromLastPage);
```

#### ZQL: OrderBy

`orderBy(column, direction: 'asc' | 'desc')`

#### ZQL: Complex Logic

Where can take a callback in order to build complex expressions. On that callback you can de-structure the provided expression builder to get access to:

- and
- or
- not
- exists
- cmp (compare)

```ts
builder.user.where(({ and, or, not, exists, cmp }) =>
  or(cmp("id", "=", "u1"), cmp("id", "=", "u2"))
);
```

#### ZQL: One

`one()`

Tells the query system that we expect a single result. Returns that single row rather than an array of rows.

Syntactic sugar for:

```ts
const row = (await query.limit(1))[0];
```

#### Adding to queries.ts

For the context of this application, place all queries into `queries.ts`. A skeleton is already set up for you there. Queries are named functions placed into `createQueriesWithContext({ ... })`.

**Example:**

```ts
// src/shared/queries.ts
import { builder, Session } from "@/shared/schema.js";
import { createQueriesWithContext } from "@rocicorp/zero";

export const queries = createQueriesWithContext({
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },

  issues(sess: Session | null, open: boolean) {
    return builder.issue.where("open", "=", open);
  },
});
```

The first argument to query functions in this file is _always_ the session. All arguments to queries, after the first, must be JSON compatible values (string, boolean, number, null). Note that Zero represents dates as milliseconds since epoch. E.g., `const now = Date.now()` not `const now = new Date()`.

If you need to return an empty query, because the user is not authorized to view the data, you can do:

```ts
return builder.user.where(({ or }) => or());
```

as that will always evaluate to false.

It is good practice for the empty query to return the same shape of data as the normal query so we do not run into typing problems in the application code.

**Example:**

```ts
// src/shared/queries.ts
import { builder, Session } from "@/shared/schema.js";
import { createQueriesWithContext } from "@rocicorp/zero";

export const queries = createQueriesWithContext({
  privateIssues(sess: Session | null, open: boolean) {
    let q = builder.issue
      .related("comments")
      .related("assignee")
      .related("creator");

    if (sess == null) {
      // ✅ do this:
      return q.where(({ or }) => or());
      // ❌ not this (the returned query has a different shape because it lacks related calls):
      return builder.issue.where(({ or }) => or());
    }

    return q;
  },
});
```

### Zero Mutators

Mutators are functions which can update state in Zero. Those state updates flow upstream to Postgres and update the system of record there.

Place all mutator definitions in `src/shared/mutators.ts`. Mutators that are defined in `src/shared/mutators.ts` must be pure
functions over their input arguments and database state. They cannot invoke sources of randomness or changing values. UUIDs, created time, modified time, etc. must be passed in, for example, rather than generated in the mutator body.

All arguments to mutators must be JSON compatible values (string, boolean, number, null). Note that Zero represents dates as milliseconds since epoch.

**Example:**

```ts
import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";

export function createMutators(sess: Session | undefined) {
  return {
    createIssue(tx, { id, title, description }) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.issue.insert({ id, title, description });
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}
```

The `tx` object provided to the mutator bodies exposes `insert`, `update`, and `delete` methods on its `tx.mutate` property. These are capable of updating individual rows only. They cannot do complex conditions which impact many rows.

Example use of the `tx` object in a mutator body:

```ts
tx.mutate.issue.insert({
  id,
  title,
  assigneeId,
  // other columns
});
tx.mutate.delete({
  id,
  // any other columns that are part of the primary key
});
tx.mutate.update({
  id,
  // other columns to update
});
```

The `tx` object is also capable of querying the local database.

Example:

```ts
const user = await tx.query.user.where("id", "IS", sess?.user.id);
```

Mutators defined in `mutators.ts` will be made available on the `zero` instance that can be gotten from the `useZero` hook. The `tx` is filled in by `zero` and is not needed wen calling a mutator.

E.g.,

```ts
import { useZero } from "@/ui/use-zero.js";

export function SomeComponent() {
  const zero = useZero();
  function callback() {
    zero.mutate[/* mutator name */](/* mutator args*/);
  }

  // ...
}
```

#### Server Side Mutators

An exception to the purity rule is mutators that run server side. A mutator can have a server side definition that is not pure. A mutator's server side version defaults to `./src/shared/mutators.ts` but a custom implementation for the server can be added to `./src/server/server-mutators.ts`. This is useful for computing authoritative created and modified dates on the server.

### React Integration

Zero provides two main hooks:

- useQuery
- useZero

**useQuery Example:**

```ts
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";

export function SomeComponent() {
  const { data: sessionData } = useSession();
  const [user] = useQuery(queries.currentUser(sessionData));
  const [issues] = useQuery(queries.issues(sessionData));

  // ...
  return (
    <ul>
      {issues.map((i) => (
        <li>{i.title}</li>
      ))}
    </ul>
  );
}
```

`useQuery` is reactive. If any data changes (on the client _or_ the server) that impacts the results of the query, `useQuery` will re-render the component with the updated data. This makes it trivial to build realtime systems that need to respond to interactions by other users. E.g., chat. No polling or special event streams need to be set up. Zero handles all of this.

**useZero Example:**

```ts
import { useZero } from "@/ui/use-zero.js";

export function SomeComponent() {
  const zero = useZero();
  function onSubmit() {
    return zero.mutate.createIssue({ id, title, description });
  }

  // ...
}
```

### Preloading Data

If the application would like to preload data so it is available on device but not yet displayed, the Zero instance provides a `preload` function.

Example:

```ts
import { useZero } from "@/ui/use-zero.js";
import { queries } from "@/shared/queries.js";

export function ATopLevelComponent() {
  const zero = useZero();
  const { data: sess } = useSession();
  useEffect(() => {
    // preload all open issues
    const { cleanup } = zero.preload(queries.issues(sess, true));

    // cleanup the preload on unmount
    return () => cleanup();
  }, [zero, sess]);
}
```

### Permissions

All permission checks are handled within Zero query and mutator definitions. Authentication is already taken care of for you. If you need access to session information on the client you can use the `useSession` react hook.

Example:

```ts
import { useSession } from "@/client/auth.js";

export function SomeComponent() {
  const { data } = useSession();
  // ...
}
```

You will pass the session information when calling Zero mutators and queries. That session information will then be available inside the query and mutator definitions.

Example:

```ts
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";

export function SomeComponent() {
  const { data: sessionData } = useSession();
  const [user] = useQuery(queries.currentUser(sessionData));
  const zero = useZero();

  function onCreate(args) {
    zero.mutate.createSomething(sessionData, args);
  }

  // ...
}
```

The `./src/shared/queries.ts` and `./src/shared/mutators.ts` files are deployed on the client and server. When a query is run against the server, the server loads its copy of the file. In this way, a client cannot just send arbitrary query text so the system is rather secure. If you need a mutator or query to run _different_ logic on the server than it runs on the client, you can place your divergent definition into `./src/server/server-queries.ts` or `./src/server/server-mutators.ts`.

An example use case for `server-queries.ts` is to check the user's role and, based on that role, add or remove conditions from the query.

Write permissions must be encoded into mutator definitions as well. E.g., if a user should only be able to modify their own data then the mutator body should check that the `owner` of a row matches the logged in user from the current session.

### Auth and Login

Better-auth is used in the project. To log a user in with github you can do:

```ts
import { useState } from "react";
import { signIn } from "@/client/auth";

export function SomeComponent() {
  function login() {
    const response = await signIn.social({
      provider: "github",
    });
  }

  return <button onClick={login}>login</button>;
}
```

To log a user in with their email and password:

```ts
import { useState } from "react";
import { signIn } from "@/client/auth";

export function SomeComponent() {
  function emailLogin() {
    const response = await signIn.email({
      email, // get email from somewhere
      password, // get password from somewhere
    });
  }

  return <button onClick={login}>login</button>;
}
```

More detailed example can be seen in `src/ui/login-form.tsx`

## TypeScript Coding Guidelines for Claude

### Variable Declaration Rules

#### Always Use Explicit Type Annotations

- **REQUIRED**: All variable declarations must include explicit type annotations
- **NO**: `let x = [];`
- **YES**: `let x: SomeType[] = [];`

#### Examples

##### Array Declarations

```typescript
// ❌ Avoid - TypeScript infers never[]
let items = [];

// ✅ Required - Explicit type annotation
let items: string[] = [];
let users: User[] = [];
let config: Array<{ name: string; enabled: boolean }> = [];
```

##### Object Declarations

```typescript
// ❌ Avoid - Unclear intent
let state = {};

// ✅ Required - Explicit type annotation
let state: { loading: boolean; data: any } = {};
let options: Record<string, boolean> = {};
```

##### Primitive Declarations

```typescript
// ❌ Avoid when type isn't obvious from initializer
let count;

// ✅ Required - Always annotate
let count: number;
let isActive: boolean = false;
let message: string = "";
```

#### Exception Cases

Type annotations may be omitted only when:

1. The type is immediately obvious from the initializer: `const PI = 3.14159`
2. Using `const` assertions: `const config = {api: 'v1'} as const`
3. Function return types when explicitly declared elsewhere

#### Enforcement

- Apply this rule to ALL variable declarations in TypeScript code
- Include type annotations even when TypeScript could infer the type
- Prioritize code clarity and explicit intent over brevity
