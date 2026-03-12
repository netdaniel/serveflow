# Project Overview

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [vite.config.js](file://vite.config.js)
- [src/main.jsx](file://src/main.jsx)
- [src/App.jsx](file://src/App.jsx)
- [src/components/Layout.jsx](file://src/components/Layout.jsx)
- [src/components/AuthLayout.jsx](file://src/components/AuthLayout.jsx)
- [src/services/store.jsx](file://src/services/store.jsx)
- [src/services/supabase.js](file://src/services/supabase.js)
- [src/pages/Dashboard.jsx](file://src/pages/Dashboard.jsx)
- [src/pages/Volunteers.jsx](file://src/pages/Volunteers.jsx)
- [src/pages/Schedule.jsx](file://src/pages/Schedule.jsx)
- [src/pages/Roles.jsx](file://src/pages/Roles.jsx)
- [src-tauri/tauri.conf.json](file://src-tauri/tauri.conf.json)
- [electron/main.js](file://electron/main.js)
- [ELECTRON_BUILD.md](file://ELECTRON_BUILD.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
RosterFlow is a church volunteer management application designed to streamline operations and improve coordination for religious organizations. Its core value proposition lies in centralizing volunteer management, service scheduling, and ministry organization into a single platform that supports real-time collaboration across web, desktop, and mobile environments. The application targets church administrators, ministry leaders, and volunteers who need reliable tools to manage rosters, assign roles, and communicate schedules efficiently.

Key differentiators:
- Unified multi-platform deployment using modern web technologies and native packaging for desktop.
- Real-time synchronization powered by a backend-as-a-service for authentication and data persistence.
- Practical workflows for onboarding volunteers, organizing ministry teams, and coordinating weekly services.

## Project Structure
The project follows a frontend-first architecture with a React + Vite application, complemented by native packaging configurations for desktop and Tauri-based bundling. Authentication and data persistence are handled via a backend-as-a-service client library. The structure supports:
- Web deployment via Vite
- Desktop packaging via Electron
- Native desktop builds via Tauri

```mermaid
graph TB
subgraph "Web Frontend"
A["src/main.jsx"]
B["src/App.jsx"]
C["src/components/Layout.jsx"]
D["src/components/AuthLayout.jsx"]
E["src/services/store.jsx"]
F["src/services/supabase.js"]
G["src/pages/Dashboard.jsx"]
H["src/pages/Volunteers.jsx"]
I["src/pages/Schedule.jsx"]
J["src/pages/Roles.jsx"]
end
subgraph "Desktop Packaging"
K["electron/main.js"]
L["src-tauri/tauri.conf.json"]
end
A --> B
B --> C
B --> D
C --> E
D --> E
E --> F
C --> G
C --> H
C --> I
C --> J
K --> |"loads dist/"| A
L --> |"bundles frontend dist"| A
```

**Diagram sources**
- [src/main.jsx](file://src/main.jsx#L1-L11)
- [src/App.jsx](file://src/App.jsx#L1-L37)
- [src/components/Layout.jsx](file://src/components/Layout.jsx#L1-L102)
- [src/components/AuthLayout.jsx](file://src/components/AuthLayout.jsx#L1-L29)
- [src/services/store.jsx](file://src/services/store.jsx#L1-L472)
- [src/services/supabase.js](file://src/services/supabase.js#L1-L13)
- [src/pages/Dashboard.jsx](file://src/pages/Dashboard.jsx#L1-L90)
- [src/pages/Volunteers.jsx](file://src/pages/Volunteers.jsx#L1-L354)
- [src/pages/Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [src/pages/Roles.jsx](file://src/pages/Roles.jsx#L1-L386)
- [electron/main.js](file://electron/main.js#L1-L46)
- [src-tauri/tauri.conf.json](file://src-tauri/tauri.conf.json#L1-L35)

**Section sources**
- [README.md](file://README.md#L1-L17)
- [package.json](file://package.json#L1-L44)
- [vite.config.js](file://vite.config.js#L1-L10)
- [src/main.jsx](file://src/main.jsx#L1-L11)
- [src/App.jsx](file://src/App.jsx#L1-L37)
- [src/components/Layout.jsx](file://src/components/Layout.jsx#L1-L102)
- [src/components/AuthLayout.jsx](file://src/components/AuthLayout.jsx#L1-L29)
- [src/services/store.jsx](file://src/services/store.jsx#L1-L472)
- [src/services/supabase.js](file://src/services/supabase.js#L1-L13)
- [src/pages/Dashboard.jsx](file://src/pages/Dashboard.jsx#L1-L90)
- [src/pages/Volunteers.jsx](file://src/pages/Volunteers.jsx#L1-L354)
- [src/pages/Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [src/pages/Roles.jsx](file://src/pages/Roles.jsx#L1-L386)
- [electron/main.js](file://electron/main.js#L1-L46)
- [src-tauri/tauri.conf.json](file://src-tauri/tauri.conf.json#L1-L35)

## Core Components
- Application shell and routing: The root application initializes React Router and wraps routes with providers for global state and layout.
- Global state and data layer: A centralized store manages authentication state, organization context, and CRUD operations for groups, roles, volunteers, events, and assignments. It integrates with a backend-as-a-service client for persistence and real-time updates.
- Authentication and navigation: Authenticated routes are protected and redirect unauthenticated users to landing/authentication views. Navigation adapts to user sessions.
- Feature pages:
  - Dashboard: Quick stats and actions for common tasks.
  - Volunteers: CRUD for volunteers, role associations, and CSV import.
  - Schedule: Event creation, assignment management, and sharing via email, WhatsApp, or print.
  - Areas & Roles: Ministry team and role management with grouping support.

Practical workflows:
- Onboarding a new volunteer: Navigate to Volunteers, add contact info and roles, optionally import via CSV.
- Scheduling a service: Go to Schedule, create an event, assign volunteers to required slots, and share the schedule.
- Organizing ministries: Use Areas & Roles to define teams and roles, then assign volunteers accordingly.

**Section sources**
- [src/App.jsx](file://src/App.jsx#L1-L37)
- [src/services/store.jsx](file://src/services/store.jsx#L1-L472)
- [src/services/supabase.js](file://src/services/supabase.js#L1-L13)
- [src/components/Layout.jsx](file://src/components/Layout.jsx#L1-L102)
- [src/components/AuthLayout.jsx](file://src/components/AuthLayout.jsx#L1-L29)
- [src/pages/Dashboard.jsx](file://src/pages/Dashboard.jsx#L1-L90)
- [src/pages/Volunteers.jsx](file://src/pages/Volunteers.jsx#L1-L354)
- [src/pages/Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [src/pages/Roles.jsx](file://src/pages/Roles.jsx#L1-L386)

## Architecture Overview
RosterFlow employs a multi-platform architecture:
- Web: Built with React and Vite, served statically.
- Desktop: Packaged via Electron for Windows development and distribution.
- Native desktop: Configured via Tauri for cross-platform native builds.

```mermaid
graph TB
subgraph "Runtime"
FE["React App<br/>Vite Dev Server"]
TAURI["Tauri Runtime"]
ELECTRON["Electron Runtime"]
end
subgraph "Deployment Targets"
WEB["Web Browser"]
WIN["Windows Executable"]
MAC["macOS DMG/BUNDLE"]
LINUX["Linux DEB/RPM"]
end
FE --> WEB
FE --> |"dist/"| TAURI
FE --> |"dist/"| ELECTRON
TAURI --> WIN
TAURI --> MAC
TAURI --> LINUX
ELECTRON --> WIN
```

**Diagram sources**
- [vite.config.js](file://vite.config.js#L1-L10)
- [src-tauri/tauri.conf.json](file://src-tauri/tauri.conf.json#L1-L35)
- [electron/main.js](file://electron/main.js#L1-L46)

## Detailed Component Analysis

### Multi-Platform Deployment
- Web: Vite builds the React app to a static site. Base path is configured for relative asset resolution.
- Desktop (Electron): Loads the built app from the dist directory in development or production. Supports dev tools and window lifecycle.
- Native (Tauri): Bundles the frontend dist into a native application with platform-specific icons and build targets.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant Vite as "Vite Build"
participant Dist as "dist/"
participant Tauri as "Tauri CLI"
participant Electron as "Electron Main"
Dev->>Vite : Run build
Vite-->>Dist : Emit static assets
Dev->>Tauri : Build native app
Tauri-->>Dist : Bundle frontend
Dev->>Electron : Start Electron
Electron-->>Dist : Load index.html
```

**Diagram sources**
- [vite.config.js](file://vite.config.js#L1-L10)
- [src-tauri/tauri.conf.json](file://src-tauri/tauri.conf.json#L1-L35)
- [electron/main.js](file://electron/main.js#L1-L46)

**Section sources**
- [vite.config.js](file://vite.config.js#L1-L10)
- [src-tauri/tauri.conf.json](file://src-tauri/tauri.conf.json#L1-L35)
- [electron/main.js](file://electron/main.js#L1-L46)
- [ELECTRON_BUILD.md](file://ELECTRON_BUILD.md#L1-L41)

### Authentication and Data Layer
- Authentication: Uses a backend-as-a-service client initialized from environment variables. Session state is tracked globally and used to gate authenticated routes.
- Data synchronization: The store loads organization context and related entities in parallel, exposes CRUD functions for each domain entity, and refreshes data after mutations.
- Real-time updates: Subscribes to authentication state changes to keep the UI synchronized.

```mermaid
sequenceDiagram
participant UI as "Feature Page"
participant Store as "Global Store"
participant Auth as "Auth Client"
participant DB as "Backend-as-a-Service"
UI->>Store : Call login/register/logout
Store->>Auth : Sign in/up/out
Auth-->>Store : Session state
Store->>DB : Load profile and organization
DB-->>Store : Data
Store-->>UI : Updated state
```

**Diagram sources**
- [src/services/store.jsx](file://src/services/store.jsx#L1-L472)
- [src/services/supabase.js](file://src/services/supabase.js#L1-L13)

**Section sources**
- [src/services/store.jsx](file://src/services/store.jsx#L1-L472)
- [src/services/supabase.js](file://src/services/supabase.js#L1-L13)

### Volunteer Management Workflow
- Add/edit/remove volunteers and associate roles.
- Bulk import volunteers via CSV.
- Role assignment and filtering by role/group.

```mermaid
flowchart TD
Start(["Open Volunteers Page"]) --> View["View Volunteer List"]
View --> Action{"Action?"}
Action --> |Add| OpenAdd["Open Add/Edit Modal"]
Action --> |Edit| OpenEdit["Open Edit Modal"]
Action --> |Delete| ConfirmDel["Confirm Deletion"]
OpenAdd --> SubmitAdd["Submit Form"]
OpenEdit --> SubmitEdit["Submit Form"]
ConfirmDel --> Delete["Delete Record"]
SubmitAdd --> Refresh["Refresh List"]
SubmitEdit --> Refresh
Delete --> Refresh
Refresh --> End(["Done"])
```

**Diagram sources**
- [src/pages/Volunteers.jsx](file://src/pages/Volunteers.jsx#L1-L354)
- [src/services/store.jsx](file://src/services/store.jsx#L161-L242)

**Section sources**
- [src/pages/Volunteers.jsx](file://src/pages/Volunteers.jsx#L1-L354)
- [src/services/store.jsx](file://src/services/store.jsx#L161-L242)

### Service Scheduling and Collaboration
- Create/update/delete events.
- Assign volunteers to required roles.
- Share schedules via email, WhatsApp, or print.

```mermaid
sequenceDiagram
participant Admin as "Ministry Leader"
participant Schedule as "Schedule Page"
participant Store as "Global Store"
participant Email as "Email Client"
participant WA as "WhatsApp Web"
Admin->>Schedule : Create Event
Schedule->>Store : addEvent()
Admin->>Schedule : Assign Volunteer
Schedule->>Store : assignVolunteer()
Admin->>Schedule : Select Events
Admin->>Schedule : Share via Email
Schedule->>Email : Open mailto
Admin->>Schedule : Share via WhatsApp
Schedule->>WA : Open chat link
```

**Diagram sources**
- [src/pages/Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [src/services/store.jsx](file://src/services/store.jsx#L244-L314)

**Section sources**
- [src/pages/Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [src/services/store.jsx](file://src/services/store.jsx#L244-L314)

### Ministry Organization (Areas & Roles)
- Define ministry teams and roles, group roles by team, and manage orphaned roles.
- Assign roles to volunteers and maintain hierarchical organization.

```mermaid
flowchart TD
Start(["Open Areas & Roles"]) --> ManageTeams["Manage Teams"]
ManageTeams --> AddTeam["Add Team"]
ManageTeams --> EditTeam["Edit Team"]
ManageTeams --> DelTeam["Delete Team"]
AddTeam --> SaveTeam["Save Team"]
EditTeam --> SaveTeam
DelTeam --> MigrateRoles["Migrate Roles to Other"]
SaveTeam --> Back["Back to Roles"]
MigrateRoles --> Back
Back --> ManageRoles["Manage Roles"]
ManageRoles --> AddRole["Add Role"]
ManageRoles --> EditRole["Edit Role"]
ManageRoles --> DelRole["Delete Role"]
AddRole --> SaveRole["Save Role"]
EditRole --> SaveRole
DelRole --> Done(["Done"])
```

**Diagram sources**
- [src/pages/Roles.jsx](file://src/pages/Roles.jsx#L1-L386)
- [src/services/store.jsx](file://src/services/store.jsx#L330-L422)

**Section sources**
- [src/pages/Roles.jsx](file://src/pages/Roles.jsx#L1-L386)
- [src/services/store.jsx](file://src/services/store.jsx#L330-L422)

### Conceptual Overview
RosterFlow’s mission is to reduce administrative overhead for churches by automating routine tasks around volunteer coordination. Administrators can quickly assemble teams, assign roles, and publish schedules, while volunteers receive timely communications and clear expectations.

[No sources needed since this section doesn't analyze specific files]

## Dependency Analysis
High-level dependencies:
- React ecosystem: React, React Router, Tailwind utilities.
- Backend integration: Backend-as-a-service client for auth and data.
- Desktop packaging: Electron for development and distribution; Tauri for native builds.
- Build tooling: Vite for fast development and optimized builds.

```mermaid
graph LR
Pkg["package.json"]
React["react, react-dom"]
Router["react-router-dom"]
UI["lucide-react, clsx, tailwind-merge"]
Supabase["@supabase/supabase-js"]
Tauri["@tauri-apps/api"]
Electron["electron + electron-is-dev"]
Pkg --> React
Pkg --> Router
Pkg --> UI
Pkg --> Supabase
Pkg --> Tauri
Pkg --> Electron
```

**Diagram sources**
- [package.json](file://package.json#L1-L44)

**Section sources**
- [package.json](file://package.json#L1-L44)

## Performance Considerations
- Parallel data loading: The store fetches related entities concurrently to minimize load time.
- Minimal re-renders: Centralized state reduces prop drilling and optimizes rendering.
- Static build: Vite produces optimized bundles suitable for web delivery.
- Desktop packaging: Electron and Tauri leverage prebuilt assets to speed up startup.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Environment variables for backend integration are missing: Ensure required variables are present before running or building.
- Authentication redirects to landing page unexpectedly: Verify session state and network connectivity to the backend service.
- Desktop build artifacts not appearing: Confirm Vite build completes, then run the appropriate desktop build script.

**Section sources**
- [src/services/supabase.js](file://src/services/supabase.js#L1-L13)
- [src/components/Layout.jsx](file://src/components/Layout.jsx#L1-L102)
- [ELECTRON_BUILD.md](file://ELECTRON_BUILD.md#L1-L41)

## Conclusion
RosterFlow delivers a practical solution for church volunteer management with a clean, modular architecture that supports web, desktop, and native deployments. By focusing on essential workflows—volunteer onboarding, scheduling, and ministry organization—it enables religious organizations to coordinate more effectively and spend less time on administration.

[No sources needed since this section summarizes without analyzing specific files]