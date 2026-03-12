# Role Assignment System

<cite>
**Referenced Files in This Document**
- [Schedule.jsx](file://src/pages/Schedule.jsx)
- [store.jsx](file://src/services/store.jsx)
- [supabase.js](file://src/services/supabase.js)
- [supabase-schema.sql](file://supabase-schema.sql)
- [Roles.jsx](file://src/pages/Roles.jsx)
- [Volunteers.jsx](file://src/pages/Volunteers.jsx)
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
The Role Assignment System enables administrators to assign volunteers to specific roles during events. The system provides a comprehensive workflow for managing volunteer assignments, including role selection, volunteer assignment, area designation, and real-time updates. This documentation covers the complete implementation of the assignment system, from data modeling to user interface interactions.

## Project Structure
The role assignment system spans multiple components within the application architecture:

```mermaid
graph TB
subgraph "UI Layer"
Sched[Schedule Page]
Roles[Roles Management]
Vol[Volunteers Management]
end
subgraph "State Management"
Store[Global Store]
Context[React Context]
end
subgraph "Data Layer"
Supabase[Supabase Client]
DB[(PostgreSQL Database)]
end
subgraph "Data Models"
Events[Events Table]
Assignments[Assignments Table]
Roles[Roles Table]
Volunteers[Volunteers Table]
Groups[Groups Table]
end
Sched --> Store
Roles --> Store
Vol --> Store
Store --> Supabase
Supabase --> DB
DB --> Events
DB --> Assignments
DB --> Roles
DB --> Volunteers
DB --> Groups
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [store.jsx](file://src/services/store.jsx#L1-L472)
- [supabase.js](file://src/services/supabase.js#L1-L13)

**Section sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [store.jsx](file://src/services/store.jsx#L1-L472)

## Core Components

### Assignment State Management
The system maintains assignment state through React hooks and global state management:

```mermaid
stateDiagram-v2
[*] --> Idle
Idle --> SelectingRole : "handleAssignClick()"
SelectingRole --> ModalOpen : "setAssigningRole()"
ModalOpen --> Assigning : "handleConfirmAssign()"
Assigning --> Loading : "assignVolunteer()"
Loading --> Idle : "loadAllData()"
Idle --> Updating : "updateAssignment()"
Updating --> Loading : "loadAllData()"
Loading --> Idle : "data refreshed"
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L15-L49)
- [store.jsx](file://src/services/store.jsx#L294-L328)

The assignment state consists of two primary pieces of information:
- `assigningRole`: Tracks the current role being assigned with `{eventId, roleId}`
- `selectedVolunteerId`: Stores the currently selected volunteer ID

**Section sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L15-L49)
- [store.jsx](file://src/services/store.jsx#L294-L328)

### Required Roles Array
The system defines a hardcoded array of required roles for demonstration purposes:

```mermaid
flowchart TD
RequiredRoles["REQUIRED_ROLES Array"] --> Role1[r1 - Worship Leader]
RequiredRoles --> Role2[r2 - Acoustic Guitar]
RequiredRoles --> Role3[r3 - Vocals]
RequiredRoles --> Role4[r6 - Drums]
RequiredRoles --> Role5[r10 - Sound]
RequiredRoles --> Role6[r11 - Projection]
Role1 --> EventCard["Event Card Display"]
Role2 --> EventCard
Role3 --> EventCard
Role4 --> EventCard
Role5 --> EventCard
Role6 --> EventCard
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L34-L35)

**Section sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L34-L35)

## Architecture Overview

### Data Flow Architecture
The role assignment system follows a unidirectional data flow pattern:

```mermaid
sequenceDiagram
participant User as "User Interface"
participant Schedule as "Schedule Component"
participant Store as "Global Store"
participant Supabase as "Supabase Client"
participant Database as "PostgreSQL Database"
User->>Schedule : Click "Assign Volunteer"
Schedule->>Schedule : handleAssignClick(eventId, roleId)
Schedule->>Schedule : setAssigningRole({eventId, roleId})
Schedule->>Schedule : setSelectedVolunteerId('')
Schedule->>Schedule : Open Assignment Modal
User->>Schedule : Select Volunteer
Schedule->>Schedule : setSelectedVolunteerId(volunteerId)
User->>Schedule : Click "Assign"
Schedule->>Store : assignVolunteer(eventId, roleId, volunteerId)
Store->>Supabase : insert assignments row
Supabase->>Database : INSERT INTO assignments
Database-->>Supabase : Success
Supabase-->>Store : Assignment created
Store->>Store : loadAllData()
Store->>Schedule : Refresh assignments data
Schedule->>Schedule : Close modal and update UI
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L37-L49)
- [store.jsx](file://src/services/store.jsx#L294-L314)

### Assignment Data Model
The assignment system uses a normalized relational database design:

```mermaid
erDiagram
EVENTS {
uuid id PK
uuid org_id FK
string title
date date
string time
timestamp created_at
}
ROLES {
uuid id PK
uuid org_id FK
uuid group_id FK
string name
timestamp created_at
}
VOLUNTEERS {
uuid id PK
uuid org_id FK
string name
string email
string phone
timestamp created_at
}
ASSIGNMENTS {
uuid id PK
uuid org_id FK
uuid event_id FK
uuid role_id FK
uuid volunteer_id FK
string status
timestamp created_at
}
GROUPS {
uuid id PK
uuid org_id FK
string name
timestamp created_at
}
EVENTS ||--o{ ASSIGNMENTS : "has many"
ROLES ||--o{ ASSIGNMENTS : "has many"
VOLUNTEERS ||--o{ ASSIGNMENTS : "has many"
GROUPS ||--o{ ROLES : "has many"
```

**Diagram sources**
- [supabase-schema.sql](file://supabase-schema.sql#L57-L76)
- [supabase-schema.sql](file://supabase-schema.sql#L23-L38)

**Section sources**
- [supabase-schema.sql](file://supabase-schema.sql#L67-L76)
- [store.jsx](file://src/services/store.jsx#L294-L328)

## Detailed Component Analysis

### Assignment Modal Workflow
The assignment modal provides a streamlined workflow for volunteer assignment:

```mermaid
flowchart TD
Start([User clicks "Assign Volunteer"]) --> ModalOpen["Open Assignment Modal"]
ModalOpen --> SelectVolunteer["Select Volunteer from Dropdown"]
SelectVolunteer --> ValidateSelection{"Volunteer Selected?"}
ValidateSelection --> |No| KeepModalOpen["Keep Modal Open"]
ValidateSelection --> |Yes| ConfirmAssignment["Click 'Assign' Button"]
ConfirmAssignment --> CallAPI["Call assignVolunteer()"]
CallAPI --> UpdateUI["Update UI and Close Modal"]
KeepModalOpen --> ModalOpen
UpdateUI --> RefreshData["Refresh All Data"]
RefreshData --> End([Assignment Complete])
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L568-L607)

The modal workflow includes:
- Volunteer selection dropdown populated from the volunteer database
- Form validation to ensure volunteer selection
- Confirmation process with error handling
- Automatic modal closure upon successful assignment

**Section sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L568-L607)

### Role Assignment UI Implementation
The role assignment UI displays role slots within expandable event cards:

```mermaid
classDiagram
class EventCard {
+string id
+string title
+date date
+string time
+boolean isExpanded
+number filledSlots
+number totalSlots
+handleExpand() void
+toggleSelection() void
}
class RoleSlot {
+string roleId
+Assignment assignment
+Role role
+Volunteer volunteer
+handleAssignClick() void
+renderAssignedView() JSX
+renderAvailableView() JSX
}
class AssignmentModal {
+AssignmentState state
+handleConfirmAssign() void
+handleCancel() void
}
class AreaDropdown {
+string selectedAreaId
+handleChange(value) void
+updateAssignment() void
}
class DesignatedRoleDropdown {
+string selectedRoleId
+handleChange(value) void
+updateAssignment() void
}
EventCard --> RoleSlot : "contains many"
RoleSlot --> AssignmentModal : "opens"
RoleSlot --> AreaDropdown : "renders"
RoleSlot --> DesignatedRoleDropdown : "renders"
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L415-L477)
- [Schedule.jsx](file://src/pages/Schedule.jsx#L438-L461)

**Section sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L415-L477)

### Assignment State Management
The system manages assignment state through React hooks with persistence:

```mermaid
stateDiagram-v2
[*] --> InitialLoad
InitialLoad --> Ready : "loadAllData() success"
Ready --> Assigning : "handleAssignClick()"
Assigning --> ModalOpen : "setAssigningRole()"
ModalOpen --> Confirmed : "handleConfirmAssign()"
Confirmed --> Loading : "assignVolunteer()"
Loading --> Ready : "loadAllData()"
Ready --> Updating : "updateAssignment()"
Updating --> Loading : "updateAssignment()"
Loading --> Ready : "loadAllData()"
Ready --> Removing : "deleteAssignment()"
Removing --> Loading : "deleteAssignment()"
Loading --> Ready : "loadAllData()"
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L15-L49)
- [store.jsx](file://src/services/store.jsx#L294-L328)

**Section sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L15-L49)
- [store.jsx](file://src/services/store.jsx#L294-L328)

### Real-time Assignment Updates
The system provides real-time updates through Supabase's real-time capabilities:

```mermaid
sequenceDiagram
participant User as "User"
participant Schedule as "Schedule Component"
participant Store as "Global Store"
participant Supabase as "Supabase Client"
participant OtherUsers as "Other Users"
User->>Schedule : Update Area Dropdown
Schedule->>Store : updateAssignment(id, {areaId})
Store->>Supabase : update assignments row
Supabase->>OtherUsers : Real-time notification
OtherUsers->>OtherUsers : UI updates automatically
OtherUsers->>OtherUsers : Progress bar recalculates
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L442-L443)
- [store.jsx](file://src/services/store.jsx#L316-L328)

**Section sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L442-L443)
- [store.jsx](file://src/services/store.jsx#L316-L328)

## Dependency Analysis

### Component Dependencies
The role assignment system has the following dependency relationships:

```mermaid
graph TB
subgraph "Primary Dependencies"
Schedule[Schedule.jsx] --> Store[store.jsx]
Schedule --> Modal[Modal Component]
Store --> Supabase[supabase.js]
Store --> Schema[supabase-schema.sql]
end
subgraph "Secondary Dependencies"
Roles[Roles.jsx] --> Store
Volunteers[Volunteers.jsx] --> Store
Store --> Supabase
Store --> Auth[Supabase Auth]
end
subgraph "External Dependencies"
Supabase --> PostgreSQL[(PostgreSQL Database)]
Store --> React[React Hooks]
Store --> Context[React Context API]
end
Schedule -.->|uses| Roles
Schedule -.->|uses| Volunteers
```

**Diagram sources**
- [Schedule.jsx](file://src/pages/Schedule.jsx#L1-L731)
- [store.jsx](file://src/services/store.jsx#L1-L472)
- [supabase.js](file://src/services/supabase.js#L1-L13)

### Data Flow Dependencies
The assignment system follows a strict data flow pattern:

```mermaid
flowchart LR
subgraph "Data Sources"
Auth[Supabase Auth] --> Profile[User Profile]
Profile --> Org[Organization]
Org --> Data[All Data Tables]
end
subgraph "Data Processing"
Data --> Transform[Data Transformation]
Transform --> Store[Global Store]
Store --> Components[React Components]
end
subgraph "User Interactions"
Components --> Actions[User Actions]
Actions --> Store
Store --> API[Supabase API]
API --> Data
end
```

**Diagram sources**
- [store.jsx](file://src/services/store.jsx#L78-L111)
- [store.jsx](file://src/services/store.jsx#L432-L460)

**Section sources**
- [store.jsx](file://src/services/store.jsx#L78-L111)
- [store.jsx](file://src/services/store.jsx#L432-L460)

## Performance Considerations

### Data Loading Optimization
The system implements several performance optimizations:

1. **Parallel Data Loading**: All data tables are loaded simultaneously using Promise.all
2. **Efficient Filtering**: Role assignments are filtered client-side for display
3. **Memoization**: React.memo could be implemented for expensive computations
4. **Virtual Scrolling**: Large lists could benefit from virtualization

### Assignment Operations
Assignment operations are optimized through:
- Single database transactions for assignment creation
- Batch updates for multiple role assignments
- Efficient state updates using immutable patterns

## Troubleshooting Guide

### Common Issues and Solutions

#### Assignment Creation Failures
**Problem**: Assignment fails to create
**Solution**: Check network connectivity and Supabase credentials
**Debug Steps**:
1. Verify Supabase URL and API key are configured
2. Check browser console for error messages
3. Ensure user has proper authentication

#### Volunteer Selection Issues
**Problem**: Volunteer dropdown appears empty
**Solution**: Verify volunteer data is loaded correctly
**Debug Steps**:
1. Check volunteer table data in Supabase
2. Verify organization filtering
3. Ensure volunteer roles are properly linked

#### Real-time Update Problems
**Problem**: Changes don't appear immediately
**Solution**: Check Supabase real-time subscriptions
**Debug Steps**:
1. Verify Supabase connection status
2. Check for real-time subscription errors
3. Ensure proper cleanup of subscriptions

**Section sources**
- [store.jsx](file://src/services/store.jsx#L54-L111)
- [supabase.js](file://src/services/supabase.js#L6-L8)

## Conclusion

The Role Assignment System provides a comprehensive solution for managing volunteer assignments during events. The system combines a clean React architecture with robust data management through Supabase, enabling real-time collaboration and efficient assignment workflows.

Key strengths of the implementation include:
- **Modular Architecture**: Clear separation of concerns between UI, state management, and data access
- **Real-time Updates**: Seamless synchronization across multiple users
- **Flexible Assignment**: Support for area designation and role customization
- **Scalable Design**: Normalized database schema supporting growth

The system successfully addresses the core requirements for role assignment management while maintaining performance and user experience standards. Future enhancements could include advanced filtering, bulk assignment operations, and enhanced reporting capabilities.