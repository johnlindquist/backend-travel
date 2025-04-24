# Plan: Hono API with BetterSQLite3, Drizzle ORM, and OpenAPI

This plan outlines the steps to build a Hono API server that interacts with the existing `travel.sqlite` database using BetterSQLite3 and Drizzle ORM, including OpenAPI documentation.

**Database Schema:**

*   `aircrafts_data`
*   `airports_data`
*   `boarding_passes`
*   `bookings`
*   `flights`
*   `seats`
*   `ticket_flights`
*   `tickets`

**Steps:**

1.  **Project Setup:**
    *   Initialize a new Node.js project: `pnpm init`
    *   Install Hono: `pnpm add hono`
    *   Install BetterSQLite3 driver and types: `pnpm add better-sqlite3 && pnpm add -D @types/better-sqlite3`
    *   Install Drizzle ORM: `pnpm add drizzle-orm`
    *   Install Drizzle Kit (dev dependency): `pnpm add -D drizzle-kit`
    *   Install Hono OpenAPI middleware: `pnpm add @hono/zod-openapi`
    *   Install necessary dev dependencies: `pnpm add -D typescript @types/node tsx`
    *   Create `tsconfig.json`: `pnpm exec tsc --init` (adjust settings as needed, e.g., `moduleResolution` to `Bundler` or `NodeNext`, `outDir`, `rootDir`).
    *   Create `src/` directory for source code.
    *   Create a basic Hono server file: `src/index.ts`.

2.  **Database Connection:**
    *   Create `src/db/index.ts`.
    *   Initialize and export the BetterSQLite3 database instance, connecting to `db/travel.sqlite`.
    *   Initialize and export the Drizzle ORM instance using the BetterSQLite3 driver.

3.  **Drizzle Schema Definition:**
    *   Create `src/db/schema.ts`.
    *   Define Drizzle schemas for each table based on the `.schema` output:
        *   `aircraftsData`
        *   `airportsData`
        *   `boardingPasses`
        *   `bookings`
        *   `flights`
        *   `seats`
        *   `ticketFlights`
        *   `tickets`
    *   Pay attention to data types (e.g., `jsonb` might need `customType`, `point` likely needs `customType`, map `timestamp with time zone` to `Date` or string, `numeric` to `number` or string). Define primary keys and foreign key relationships if necessary/possible based on column names (though the schema dump didn't show constraints, they might exist).

4.  **Drizzle Kit Introspection:**
    *   Create `drizzle.config.ts`. Configure it for SQLite, pointing to `db/travel.sqlite` and `src/db/schema.ts`.
    *   Run introspection to verify schema definitions (or generate them initially): `pnpm drizzle-kit introspect:sqlite`
    *   *Note: Since the database already exists and we're wrapping it, we primarily use Drizzle for querying. Migrations (`generate` and `push`) might not be strictly necessary unless you plan to manage schema changes via Drizzle going forward.*

5.  **API Endpoints with OpenAPI:**
    *   Create `src/routes/` directory (e.g., `src/routes/flights.ts`, `src/routes/bookings.ts`, etc.).
    *   For each resource (e.g., flights), create Hono routes (`app.get(...)`, `app.post(...)`, etc.).
    *   Use `@hono/zod-openapi` to:
        *   Define Zod schemas for request parameters, bodies, and responses.
        *   Create OpenAPI route specifications using `createRoute`.
    *   Inject the Drizzle instance (from `src/db/index.ts`) into the route handlers.
    *   Implement route logic to query the database using Drizzle ORM based on request inputs.
    *   Structure response data according to the defined Zod schemas.

6.  **OpenAPI Documentation Route:**
    *   In `src/index.ts`, import the route modules.
    *   Use Hono's OpenAPI middleware (`app.doc(...)` and `app.get('/ui', ...)`) to generate and serve the OpenAPI specification and a Swagger UI.

7.  **Server Entrypoint & Scripts:**
    *   Update `src/index.ts` to register all the API routes with the main Hono app instance.
    *   Add a `dev` script to `package.json`: `"dev": "tsx watch src/index.ts"`
    *   Add a `build` script: `"build": "tsc"`
    *   Add a `start` script: `"start": "node dist/index.js"`

8.  **Testing:**
    *   Start the dev server: `pnpm run dev`
    *   Use `curl`, Postman, or the Swagger UI (`/ui`) to manually test each API endpoint.
    *   (Optional) Implement automated tests using a framework like Vitest, potentially with an in-memory SQLite database for isolation. 