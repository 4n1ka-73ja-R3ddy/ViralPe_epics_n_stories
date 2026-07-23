# Backend & Database Architecture — Developer Guide

This document explains the Backend and Database architecture in simple terms for developers with little or no prior experience. It describes project structure, how data flows, common tasks, and where to look when you need to change or extend the system.

## Goals
- Give a simple mental model of the codebase
- Explain responsibilities of major folders and files
- Show how to add an API endpoint and how data moves from HTTP to the database
- Provide quick start commands for running locally

## High-level overview

- The backend is a layered web API built in .NET (C#).
- HTTP requests are handled by Controllers (API surface). Controllers call Services/Factories to implement business logic. Services use data access / persistence code to read/write the database. DTOs transfer data between layers and over the network.
- The database project (in the `database` folder) contains the SQL Server database project and schema representation used for development and deployment.

## Key folders and responsibilities

- `Controllers/` — API endpoints. Example: [backend/Controllers/AuthController.cs](backend/Controllers/AuthController.cs#L1) and [backend/Controllers/UserController.cs](backend/Controllers/UserController.cs#L1).
- `Services/` — Business logic and orchestration (service layer). Services keep controllers thin.
- `Factories/` — Small helpers that construct domain objects or map DTOs to Models. They help centralize mapping/creation logic.
- `Dtos/` — Data Transfer Objects. DTOs define the shape of data exchanged by the API (requests/responses).
- `Models/` — Domain models that represent persistent entities (tables) in the database.
- `Persistence/` — Data access layer (repositories, DB context, SQL helpers). Responsible for querying and saving Models.
- `Core/` — Application core utilities and app engine (`AppEngine.cs`) used across layers.
- `Program.cs` — Application entry point and DI/service wiring: [backend/Program.cs](backend/Program.cs#L1).
- `appsettings.json` and `appsettings.Development.json` — Configuration including connection strings and feature flags: [backend/appsettings.json](backend/appsettings.json#L1).

## Database project

- The `database/` folder holds a SQL Server Database Project which stores the schema, tables, views, and deployment scripts. See [database/README.md](database/README.md#L1) and the project file [database/SqlServerDb.sqlproj](database/SqlServerDb.sqlproj#L1).
- Schema changes should be made in the database project and deployed through the normal DB release process.

## Typical request flow (simple example)

1. HTTP client calls an endpoint: Controller receives the request.
2. Controller validates input (often using DTOs) and calls a Service.
3. Service applies business rules and uses Factories to create Model instances as needed.
4. Service calls Persistence layer to read/write Models to the database.
5. Persistence executes SQL (via ORM or ADO.NET) and returns Models.
6. Service maps Models back to DTOs and returns to Controller.
7. Controller returns HTTP response to the client.

Visual summary:

Controller -> Service -> Factory -> Persistence -> Database

Response follows reverse path.

## How to add a new API endpoint (step-by-step)

1. Add request/response DTOs to `Dtos/` (shape of incoming/outgoing data).
2. Add a new method in the appropriate Controller under `Controllers/`.
3. Implement business logic in a `Service` (create new service if needed) and register it with DI in `Program.cs`.
4. If you need DB access, add/extend repository methods in `Persistence/` and update Models or Factories as required.
5. Update the database project for any schema changes and run migrations/deploy scripts.
6. Test the endpoint locally using `curl`, Postman, or the built-in HTTP client.

## Configuration & secrets

- Connection strings and environment-specific settings live in `appsettings.json` and `appsettings.Development.json`.
- Keep secrets (production connection strings, keys) in secure stores (Azure Key Vault, environment variables) — do not commit secrets to git.
<!--  -->

## Running the backend locally

1. Ensure you have .NET SDK installed (compatible version required by the project).
2. From the `backend` folder run:

```powershell
dotnet restore
dotnet run --project Backend.csproj
```

3. The app listens on the configured ports. Use the `Controllers` routes to exercise endpoints.

If the system depends on a local SQL Server instance, ensure the database is deployed or configured in `appsettings.Development.json`.

## Common developer tasks

- Finding an endpoint: open `Controllers/` and search the controller name that matches the feature.
- Adding fields to entities: update `Models/`, update the `database` project schema, then update `Persistence/` queries.
- Mapping shapes: add mapping logic to `Factories/` (they centralize DTO <-> Model conversion).

## Authentication & Authorization

- Authentication endpoints live in `AuthController` ([backend/Controllers/AuthController.cs](backend/Controllers/AuthController.cs#L1)).
- Look for factories or providers named `UserAuthProviderFactory` in `Factories/` for auth-specific wiring.

## Debugging tips

- Start with logs — the app will log startup errors or DI resolution failures.
- If a DB call fails, check connection strings and open the SQL logs or use SQL Server Management Studio to run failing queries.
- When DI fails at startup, the console will usually indicate which service/type failed to resolve.

## Conventions & best practices

- Keep Controllers thin — place complex logic in Services.
- Use DTOs for all external-facing endpoints; do not expose internal Models directly.
- Use Factories to avoid duplicated mapping code.
- Make schema changes in the `database` project and follow the team's DB deployment process.

## Where to read code (quick links)

- App entry: [backend/Program.cs](backend/Program.cs#L1)
- Controllers: [backend/Controllers](backend/Controllers/AuthController.cs#L1)
- DTOs: [backend/Dtos](backend/Dtos/AuthResponse.cs#L1)
- Models: [backend/Models](backend/Models/User.cs#L1)
- Factories: [backend/Factories/UserFactory.cs](backend/Factories/UserFactory.cs#L1)
- Database project: [database/SqlServerDb.sqlproj](database/SqlServerDb.sqlproj#L1)
- Configuration: [backend/appsettings.json](backend/appsettings.json#L1)

## Next steps for new developers

- Clone the repo, open in your IDE, run the backend locally.
- Walk through one simple endpoint (e.g., `UserController`) and trace a request using breakpoints.
- Pair with a teammate to add a small feature: create a DTO, add controller action, call a service, and run the flow.

---

If you'd like, I can also:
- add diagrams (Mermaid) to illustrate the request flow
- add a short walkthrough that edits a simple endpoint end-to-end
- generate sample Postman requests for the main endpoints

Tell me which of those you'd like next.
