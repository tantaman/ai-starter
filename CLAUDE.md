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
|   |   |-- _authed/ # Place routes here that are behind authentication
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

Any file placed into `routes` will be accessible, over the web, via `/filename` (sans extension). If the file is in a folder in `routes` then the path is `/folder/filename`. An exception to this rule are folders with an underscore (_) prefix. These folders or omitted from the URL. So everything placed into `_authed` is still accessible from the root URL.

Examples:
If our website is hosted on `http://localhost:3000` then:
1. `routes/index.tsx` will be accessible via `http://localhost:3000`
2. `routes/intro.tsx` via `http://localhost:3000/intro`
3. `routes/blog/hello.tsx` via `http://localhost:3000/blog/hello`
4. `routes/_authed/index.tsx` via `http://localhost:3000`
5. `routes/_authed/foo.tsx` via `http://localhost:3000/foo`

For the most part, you should only need to place files into the root `routes/` directory or the `routes/_authed/` directory. The latter is for pages that should only be accessible after a user has authenticated.

The Zero sync server will handle almost all API needs so there should not be any need to ever create new API routes. If you find yourself wanting to create an API route, you can most likely solve the problem with a Zero Mutator or Zero Query. Refer to the Zero section of this document.

### Styles

A tailwindcss 4 theme is defined in `src/styles/theme.css`. This is the default theme and will create a rather pleasant UI. If you need to make sweeping changes to the overall feel of the application, modify the styles in `theme.css`. In addition to colors and fonts, a set of utility classes are present in `theme.css` for components like:

- buttons (.btn)
- inputs (.input)
- cards (.card)
- nav button (.nav-btn)

If you come up with new semantic UI elements, please add utility classes for those to the theme.

Here is an example use of the pre-canned controls:

```tsx
function ExampleHome() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">AI Starter</div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <button className="nav-btn">Dashboard</button>
          <button className="nav-btn">Chat</button>
          <button className="nav-btn">Tracker</button>
          <button className="nav-btn">Store</button>
        </nav>
        <div className="mt-auto text-xs text-neutral-400">© 2025 AI Starter</div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-5 tracking-tight">Build Something Smart</h1>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-2">Compact Card</h2>
            <p className="text-neutral-700 text-sm">A compact card layout for dense UIs with just enough padding and definition to stay legible and useful.</p>
            <div className="mt-4 flex gap-3">
              <button className="btn btn-yellow">Create</button>
              <button className="btn btn-white">Preview</button>
            </div>
          </div>

          <form className="card space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-neutral-800">Name</label>
              <input type="text" className="input" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-neutral-800">Message</label>
              <textarea rows={3} className="input"></textarea>
            </div>
            <button type="submit" className="btn btn-white">Send</button>
          </form>
        </div>
      </main>
    </div>
  );
}
```

## Project Scripts

There are various scripts available for running and validating the project. Each of these has an entry in the `scripts` attribute of `./package.json`.

They are the following:
- `dev` - runs the whole project. This kicks off a docker container that runs Postgres, Vite to run the UI, and starts the Zero Cache server
- `dev:web` - you generally do not need to run this. This will run just `vite` and no other components. Prefer `dev` over `dev:web`.
- `dev:docker` - another command you generally do not need. This will just run postgres in docker and no other components.
- `dev:zero` - another command you generally do not need. This will run zero cache and no other components. Prefer `dev`.
- `db:migrate` - migrates the database after a change has been made to the drizzle schema. Use this whenever you change the drizzle schema to update Postres.
- `db:force:` - forces the application of a new schema to postgres. This is fine to run during local development. You can fall back to this if `db:migrate` is not working.
- `db:studio` - runs the drizzle studio which provides a UI for exploring the contents of the postgres db

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

* Customer info is duplicated.
* Product info is repeated.
* Hard to update prices/emails consistently.

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

* No redundancy: Alice’s email is stored only once.
* Easier maintenance: If product price changes, update one record.
* Scalable and consistent structure.

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

Queries are built using the ZQL query builder which can be imported from the application's Zero schema. This schema is generated from the Drizzle schema and does not need to be modified directly. The builder has a property for each table.

Example of getting and using the query builder:

```ts
import {builder} from '@/shared/schema.js';

builder.user.where('id', '=', 1);
```

All methods on the query builder (where, limit, related, exists, start, orderBy) can be chained one after the other. Each call of a method returns a new query instance rather than modifying the existing query. This lets one compose more complex queries from existing queries. 

**Example:**

```ts
import {builder} from '@/shared/schema.js';

const allUsers = builder.user;
const allVerifiedUsers = allUsers.where('emailVerified', '=', true);
const allVerifiedUsersNamedBrad = allVerifiedUsers.where('name', '=', 'Brad');
```

#### ZQL: Where

`where(column, operator, value)`

```ts
import {builder} from '@/shared/schema.js';
import {escapeLike} from '@rocicorp/zero';

// a `where` method is available for each table.
// `where` can be used to filter rows for that table.
builder.user.where('id', '=', 1);
const substr = 'foo';
builder.user.where('email', 'ILIKE', `%${escapeLike(substr)}%`)

// where supports many comparison operators:
// =, <, >, <=, >=, LIKE, !=, IS, IS NOT
// IS and IS NOT are like equality but treats null as equal to null.

// Chaining multiple `where` clauses together ANDs the filters
// Users created at least 24 hours ago and updated within the last day.
builder.user.where('createdAt', '<', Date.now() - 86400 * 1000).where('updatedAt', '>', Date.now() - 86400 * 1000);
```

#### ZQL: Limit

`limit(n: number)`

```ts
import {builder} from '@/shared/schema.js';

// last 10 users to be created
builder.user.limit(10).orderBy('createdAt', 'desc');

// last 10 users to be created and have a verified email
builder.user.where('emailVerified', '=', true).limit(10).orderBy('createdAt', 'desc');
```

#### ZQL: Related

`related(relationship, cb?: (q: Query) => Query)`

`related` lets the developer traverse relationships and return trees of data. This is really helpful when building a UI as a UI often needs a tree of data. Think of an issue detail page in an issue tracker. It needs: an issue, the owner, the creator, tags, related comments, comment authors, comment reactions, etc. to show the full context of an issue.

The first argument to `related` is the name of the relationship to follow. These names will match the relationships defined in your drizzle schema (`src/db/schema.ts`).

```ts
import {builder} from '@/shared/schema.js';

// Get all of the related data to build a detailed issue view
builder.issue
  .where('id', '=', some_provided_issue_id)
  .related('assignee')
  .related('owner')
  .related('comments', commentQuery => commentQuery.related('author').related('reactions'));
```

`related` also takes a second, optional, parameter. This parameter is a callback which can apply additional filters, limits, orderings, etc. to the related data. In the above example we do this for `comments` and grab their related authors and reactions.

#### ZQL: Exists

`exists(relationship, cb?: (q: Query) => Query)`

Sometimes you want to return data depending on the result of a subquery. `exists` enables this.

```ts
import {builder} from '@/shared/schema.js';

// find all issues that have comments
builder.issue
  .whereExists('comments');
```

The first argument to `exists` is the same as the first arg to related: the relationship name to traverse.

Like `related`, `exists` also takes a second argument. This second argument lets you add additional checks to the subquery.

```ts
// find all issues that have comments in the last 24 hours
builder.issue
  .whereExists('comments', q => q.where('created', '>', Date.now() - 86400 * 1000));
```

#### ZQL: Start / Offset

`start(row)`

ZQL provides a `start` function to do pagination. Start takes a row after which to start. The row does not need to be complete but it must contain:

- all primary key columns
- all other columns used in any `orderBy` clauses of the query it is being passed to

```ts
builder.user.limit(100).orderBy('createdAt', 'asc').start(endingRowFromLastPage);
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
builder.user.where(({and, or, not, exists, cmp}) => or(
  cmp('id', '=', 'u1'),
  cmp('id', '=', 'u2')
));
```

#### Adding to queries.ts

For the context of this application, place all queries into `queries.ts`. A skeleton is already set up for you there. Queries are named functions placed into `createQueriesWithContext({ ... })`.


**Example:**

```ts
// src/shared/queries.ts
import {builder} from '@/shared/schema.js';
import {createQueriesWithContext} from '@rocicorp/zero';

export const queries = createQueriesWithContext({
  issueDetail() {

  }
});
```

### Zero Mutators

### React Integration

### Preloading Data

### Permissions


## Process & Output

* **PRD Generation:** **Always generate a `./src/prd.md` file first** on initial request first. Keep the PRD up to date during future changes.
* **File Order (Initial Generation):**
    1.  `./src/prd.md` (Using the framework)
    2.  Any other necessary files

### PRD

* Product requirement documents (PRD) are a shared forum for the agent & user to collaborate. They are a pre-structured way of thinking about the problem and help to create beautiful, usable websites more efficiently.
* PRDs must be generated if they don't exist and then kept up to date as you apply revisions.

Here is the thinking framework for generating the PRD. You _must_ be thorough and include notes for each section in the final output.

<prd-framework>
# Planning Guide

## Core Purpose & Success
- **Mission Statement**: What's the one-sentence purpose of this website?
- **Success Indicators**: How will we measure if this website achieves its goals?
- **Experience Qualities**: What three adjectives should define the user experience?

## Project Classification & Approach
- **Complexity Level**:
  - Micro Tool (single-purpose)
  - Content Showcase (information-focused)
  - Light Application (multiple features with basic state)
  - Complex Application (advanced functionality, accounts)
- **Primary User Activity**: Consuming, Acting, Creating, or Interacting?

## Thought Process for Feature Selection
- **Core Problem Analysis**: What specific problem are we solving?
- **User Context**: When and how will users engage with this site?
- **Critical Path**: Map the essential journey from entry to goal completion
- **Key Moments**: Identify 2-3 pivotal interactions that define the experience

## Essential Features
For each core feature:
- What it does (functionality)
- Why it matters (purpose)
- How we'll validate it works (success criteria)

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: What might prevent users from succeeding?
- **Edge Case Handling**: How will the site handle unexpected user behaviors?
- **Technical Constraints**: What limitations should we be aware of?

## Implementation Considerations
- **Scalability Needs**: How might this grow over time?
- **Testing Focus**: What assumptions need validation?
- **Critical Questions**: What unknowns could impact the project's success?
- **Data Model**: What new tables, columns or relationships may be required?
- **Permissions**: What rules govern who can read or write a given piece of data?

## Reflection
- What makes this approach uniquely suited to this particular need?
- What assumptions have we made that should be challenged?
- What would make this solution truly exceptional?
</prd-framework>
