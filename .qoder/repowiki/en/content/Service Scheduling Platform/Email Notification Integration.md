# Email Notification Integration

<cite>
**Referenced Files in This Document**
- [Schedule.jsx](file://src/pages/Schedule.jsx)
- [Volunteers.jsx](file://src/pages/Volunteers.jsx)
- [Modal.jsx](file://src/components/Modal.jsx)
- [NotificationBell.jsx](file://src/components/NotificationBell.jsx)
- [store.jsx](file://src/services/store.jsx)
- [supabase.js](file://src/services/supabase.js)
- [Layout.jsx](file://src/components/Layout.jsx)
- [supabase-notifications.sql](file://supabase-notifications.sql)
- [send-welcome-email/index.ts](file://supabase/functions/send-welcome-email/index.ts)
- [.env.example](file://.env.example)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive real-time notification system with NotificationBell component
- Integrated database-driven notification management with Supabase real-time capabilities
- Enhanced welcome email automation with Supabase Edge Functions
- Added automated notification triggers for new registrations and member requests
- Updated architecture to support both email integration and real-time notifications

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Real-Time Notification System](#real-time-notification-system)
7. [Automated Welcome Email System](#automated-welcome-email-system)
8. [Dependency Analysis](#dependency-analysis)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Conclusion](#conclusion)

## Introduction
This document explains the comprehensive notification system that enables both traditional email functionality and modern real-time notifications for team communication. The system now features a dual notification approach: the existing email modal interface for generating roster details and sending emails to assigned volunteers, alongside a sophisticated real-time notification bell with Supabase real-time capabilities. Additionally, it includes automated welcome emails triggered by new organization registrations and member requests, providing a complete communication ecosystem for volunteer coordination.

## Project Structure
The notification system spans multiple interconnected components:
- Schedule page: orchestrates email generation, modal display, recipient management, and sending workflow
- Volunteers page: displays volunteer contact information used for recipient selection
- Modal component: reusable dialog container for the email interface
- NotificationBell component: real-time notification system with Supabase integration
- Store service: provides access to volunteers, events, assignments data and authentication state
- Supabase service: connects to the backend database for data persistence and real-time subscriptions
- Database schema: comprehensive notifications table with triggers and policies
- Edge Functions: automated welcome email system with Resend integration
- Environment configuration: defines Supabase connection settings and email service credentials

```mermaid
graph TB
subgraph "UI Layer"
S["Schedule.jsx<br/>Email Modal & Workflow"]
V["Volunteers.jsx<br/>Volunteer List"]
M["Modal.jsx<br/>Dialog Container"]
NB["NotificationBell.jsx<br/>Real-time Notifications"]
L["Layout.jsx<br/>Header Integration"]
end
subgraph "State & Data"
ST["store.jsx<br/>useStore Hook & Auth State"]
SUP["supabase.js<br/>Database Client"]
end
subgraph "Database Layer"
DB["Supabase DB<br/>Notifications Table"]
TRIGGERS["Triggers & Policies<br/>Real-time Events"]
end
subgraph "Edge Functions"
EF["send-welcome-email<br/>Resend Integration"]
end
subgraph "Environment"
ENV[".env.example<br/>Supabase Config"]
RES["RESEND_API_KEY<br/>Email Service Config"]
end
S --> M
S --> ST
V --> ST
NB --> ST
NB --> SUP
L --> NB
ST --> SUP
SUP --> DB
DB --> TRIGGERS
EF --> RES
ENV --> SUP
```

**Diagram sources**
- [Schedule.jsx:1-935](file://src/pages/Schedule.jsx#L1-L935)
- [Volunteers.jsx:1-360](file://src/pages/Volunteers.jsx#L1-L360)
- [Modal.jsx:1-50](file://src/components/Modal.jsx#L1-L50)
- [NotificationBell.jsx:1-292](file://src/components/NotificationBell.jsx#L1-L292)
- [Layout.jsx:1-198](file://src/components/Layout.jsx#L1-L198)
- [store.jsx:1-1307](file://src/services/store.jsx#L1-L1307)
- [supabase.js:1-37](file://src/services/supabase.js#L1-L37)
- [supabase-notifications.sql:1-186](file://supabase-notifications.sql#L1-L186)
- [send-welcome-email/index.ts:1-349](file://supabase/functions/send-welcome-email/index.ts#L1-L349)
- [.env.example:1-5](file://.env.example#L1-L5)

**Section sources**
- [Schedule.jsx:1-935](file://src/pages/Schedule.jsx#L1-L935)
- [Volunteers.jsx:1-360](file://src/pages/Volunteers.jsx#L1-L360)
- [Modal.jsx:1-50](file://src/components/Modal.jsx#L1-L50)
- [NotificationBell.jsx:1-292](file://src/components/NotificationBell.jsx#L1-L292)
- [Layout.jsx:1-198](file://src/components/Layout.jsx#L1-L198)
- [store.jsx:1-1307](file://src/services/store.jsx#L1-L1307)
- [supabase.js:1-37](file://src/services/supabase.js#L1-L37)
- [supabase-notifications.sql:1-186](file://supabase-notifications.sql#L1-L186)
- [send-welcome-email/index.ts:1-349](file://supabase/functions/send-welcome-email/index.ts#L1-L349)
- [.env.example:1-5](file://.env.example#L1-L5)

## Core Components
- **Email Modal Interface**: Provides recipient selection, manual input, subject/message editing, and send confirmation
- **Recipient Management**: Adds/removes recipients via dropdown or manual input with duplicate prevention
- **Template Generation**: Builds event-specific roster details and message content
- **Native Email Client Integration**: Uses mailto links to open the user's default email client
- **Real-time Notification Bell**: Comprehensive notification system with Supabase real-time capabilities
- **Database-driven Notifications**: Automated notification triggers for new registrations and member requests
- **Automated Welcome Emails**: Edge Function-based welcome email system with Resend integration
- **Volunteer Contact Information**: Retrieves volunteer names and emails from the store for recipient population

**Section sources**
- [Schedule.jsx:19-142](file://src/pages/Schedule.jsx#L19-L142)
- [Volunteers.jsx:197-206](file://src/pages/Volunteers.jsx#L197-L206)
- [store.jsx:14-18](file://src/services/store.jsx#L14-L18)
- [NotificationBell.jsx:1-292](file://src/components/NotificationBell.jsx#L1-L292)
- [supabase-notifications.sql:1-186](file://supabase-notifications.sql#L1-L186)
- [send-welcome-email/index.ts:1-349](file://supabase/functions/send-welcome-email/index.ts#L1-L349)

## Architecture Overview
The notification system follows a hybrid architecture combining traditional email workflows with modern real-time notifications:
- User triggers email generation from the schedule view
- System builds a recipient list from event assignments
- Template content is generated with event details and roster formatting
- Email modal opens with pre-filled subject and message
- Users manage recipients via dropdown or manual input
- On send, the system validates recipients and opens the native email client
- Real-time notifications are delivered instantly via Supabase Postgres changes
- Automated welcome emails are processed through Supabase Edge Functions
- Database triggers ensure notifications are created for system events

```mermaid
sequenceDiagram
participant U as "User"
participant S as "Schedule.jsx"
participant NB as "NotificationBell.jsx"
participant ST as "store.jsx"
participant M as "Modal.jsx"
participant V as "Volunteers.jsx"
participant DB as "Supabase DB"
participant EF as "Edge Function"
U->>S : Click "Email Team"
S->>ST : Get event assignments & volunteers
S->>S : Build recipients list (unique)
S->>S : Generate roster template
S->>M : Open email modal with pre-filled data
U->>M : Add recipients (dropdown/manual)
U->>M : Edit subject/message
U->>M : Click "Send Email"
M->>S : Validate recipients
S->>U : Open mailto link in native email client
U-->>S : Close modal after sending
Note over NB,DB : Real-time Notifications
NB->>DB : Subscribe to notifications channel
DB-->>NB : INSERT event (new notification)
NB->>NB : Update unread count & display
NB->>DB : Mark as read/update/delete
DB-->>NB : Confirm operation
Note over EF,DB : Automated Welcome Emails
DB->>EF : Trigger on new organization registration
EF->>EF : Send welcome email via Resend
EF->>DB : Log email attempt & create notification
```

**Diagram sources**
- [Schedule.jsx:62-95](file://src/pages/Schedule.jsx#L62-L95)
- [Schedule.jsx:97-142](file://src/pages/Schedule.jsx#L97-L142)
- [NotificationBell.jsx:20-37](file://src/components/NotificationBell.jsx#L20-L37)
- [NotificationBell.jsx:73-106](file://src/components/NotificationBell.jsx#L73-L106)
- [supabase-notifications.sql:96-128](file://supabase-notifications.sql#L96-L128)
- [send-welcome-email/index.ts:12-349](file://supabase/functions/send-welcome-email/index.ts#L12-L349)

## Detailed Component Analysis

### Email Modal Interface
The email modal provides a structured interface for composing and sending emails:
- Recipient selection via a dropdown populated from volunteers
- Manual recipient input with Enter key support
- Visual tag display for added recipients with remove controls
- Subject and message fields for customization
- Send button that validates recipients and opens the native email client

```mermaid
flowchart TD
Start(["Open Email Modal"]) --> RecipientInput["Manual Input Field"]
RecipientInput --> AddBtn["Add Button"]
AddBtn --> ValidateInput["Validate Input"]
ValidateInput --> InputValid{"Valid?"}
InputValid --> |No| ShowError["Show Error Message"]
InputValid --> |Yes| AddToTags["Add to Recipients Tags"]
AddToTags --> ResetInput["Reset Input Field"]
Start --> VolunteerDropdown["Volunteer Dropdown"]
VolunteerDropdown --> SelectVolunteer["Select Volunteer"]
SelectVolunteer --> PreventDup{"Duplicate?"}
PreventDup --> |Yes| Skip["Skip Addition"]
PreventDup --> |No| AddToTags
RecipientsTags["Recipients Tags"] --> RemoveTag["Remove Individual Tag"]
RemoveTag --> UpdateList["Update Recipients List"]
UpdateList --> ReadyToSend["Ready to Send"]
ReadyToSend --> SendButton["Send Email Button"]
SendButton --> ValidateRecipients["Validate Recipients Count"]
ValidateRecipients --> HasRecipients{"Any Recipients?"}
HasRecipients --> |No| AlertNoRecipients["Alert: Add Recipients"]
HasRecipients --> |Yes| OpenMailto["Open Native Email Client"]
```

**Diagram sources**
- [Schedule.jsx:610-727](file://src/pages/Schedule.jsx#L610-L727)
- [Schedule.jsx:97-142](file://src/pages/Schedule.jsx#L97-L142)

**Section sources**
- [Schedule.jsx:610-727](file://src/pages/Schedule.jsx#L610-L727)

### Recipient Validation and Duplicate Prevention
The system implements robust validation and deduplication:
- Input validation accepts either a volunteer name/email or a raw email address
- Duplicate prevention checks against existing recipients before adding
- Volunteer dropdown prevents adding duplicates by checking email presence
- Manual input validation ensures only valid entries are accepted

```mermaid
flowchart TD
Input["Recipient Input"] --> CheckType{"Contains '@'?"}
CheckType --> |Yes| IsEmail["Treat as Email"]
CheckType --> |No| MatchVolunteer["Match by Name/Email"]
MatchVolunteer --> FoundVolunteer{"Volunteer Found?"}
FoundVolunteer --> |Yes| UseVolunteer["Use Volunteer Info"]
FoundVolunteer --> |No| InvalidEntry["Invalid Entry"]
IsEmail --> UseEmail["Use Email Input"]
UseVolunteer --> CheckDuplicate{"Duplicate?"}
UseEmail --> CheckDuplicate
CheckDuplicate --> |Yes| Skip["Skip Addition"]
CheckDuplicate --> |No| AddToList["Add to Recipients"]
```

**Diagram sources**
- [Schedule.jsx:97-124](file://src/pages/Schedule.jsx#L97-L124)
- [Schedule.jsx:623-636](file://src/pages/Schedule.jsx#L623-L636)

**Section sources**
- [Schedule.jsx:97-124](file://src/pages/Schedule.jsx#L97-L124)
- [Schedule.jsx:623-636](file://src/pages/Schedule.jsx#L623-L636)

### Email Template Generation
Template generation creates structured content with event details and formatted roster information:
- Subject line includes event title and date
- Message body includes event title, date, time, and roster details
- Roster formatting lists roles, volunteers, and associated details
- Unique recipient extraction removes duplicates from assignments

```mermaid
flowchart TD
EventAssignments["Get Event Assignments"] --> MapVolunteers["Map to Volunteer Objects"]
MapVolunteers --> FilterValid["Filter Valid Volunteers"]
FilterValid --> ExtractEmails["Extract Email/Name Pairs"]
ExtractEmails --> RemoveDuplicates["Remove Duplicate Emails"]
RemoveDuplicates --> BuildRoster["Build Roster Details"]
BuildRoster --> FormatDetails["Format Role/Details"]
FormatDetails --> CombineTemplate["Combine with Event Details"]
CombineTemplate --> SetEmailData["Set Subject/Message/Recipients"]
```

**Diagram sources**
- [Schedule.jsx:62-95](file://src/pages/Schedule.jsx#L62-L95)
- [Schedule.jsx:74-87](file://src/pages/Schedule.jsx#L74-L87)

**Section sources**
- [Schedule.jsx:62-95](file://src/pages/Schedule.jsx#L62-L95)
- [Schedule.jsx:74-87](file://src/pages/Schedule.jsx#L74-L87)

### Native Email Client Integration
The system integrates with native email clients using mailto links:
- Composes mailto URLs with encoded subject and body
- Opens the default email client for user interaction
- Supports sharing selected events via WhatsApp and printing schedules

```mermaid
sequenceDiagram
participant U as "User"
participant S as "Schedule.jsx"
participant Browser as "Browser"
participant EmailApp as "Native Email Client"
U->>S : Click "Email" (Selected Events)
S->>S : Format Schedule Text
S->>Browser : window.open(mailto URL)
Browser->>EmailApp : Launch Application
EmailApp-->>U : Pre-filled Composition Window
```

**Diagram sources**
- [Schedule.jsx:224-229](file://src/pages/Schedule.jsx#L224-L229)

**Section sources**
- [Schedule.jsx:224-229](file://src/pages/Schedule.jsx#L224-L229)

### Volunteer Contact Information Integration
Volunteer contact information is central to the email system:
- Volunteer list displays names and contact details
- Email modal uses volunteer data for dropdown selection
- Recipient management leverages volunteer email addresses
- Data persistence handled through Supabase integration

**Section sources**
- [Volunteers.jsx:197-206](file://src/pages/Volunteers.jsx#L197-L206)
- [store.jsx:14-18](file://src/services/store.jsx#L14-L18)
- [supabase.js:1-13](file://src/services/supabase.js#L1-L13)

## Real-Time Notification System

### NotificationBell Component Architecture
The NotificationBell component provides a comprehensive real-time notification system:
- Real-time subscription to Supabase PostgreSQL changes
- Automatic notification loading and display
- Interactive notification management (mark as read, delete)
- Unread count tracking and badge display
- Demo mode support with simulated notifications

```mermaid
flowchart TD
Init["Initialize NotificationBell"] --> CheckAuth["Check User & Demo Mode"]
CheckAuth --> LoadNotifications["Load Notifications from DB"]
LoadNotifications --> SetupSubscription["Setup Supabase Real-time Subscription"]
SetupSubscription --> DisplayBell["Display Bell with Unread Count"]
DisplayBell --> UserInteraction{"User Interaction?"}
UserInteraction --> |Click Bell| ShowDropdown["Show Notification Dropdown"]
UserInteraction --> |Click Outside| CloseDropdown["Close Dropdown"]
ShowDropdown --> MarkAsRead["Mark as Read"]
ShowDropdown --> DeleteNotification["Delete Notification"]
ShowDropdown --> MarkAllRead["Mark All as Read"]
MarkAsRead --> UpdateDB["Update DB via RPC"]
DeleteNotification --> UpdateDB
MarkAllRead --> UpdateDB
UpdateDB --> UpdateUI["Update UI State"]
UpdateUI --> DisplayBell
```

**Diagram sources**
- [NotificationBell.jsx:16-37](file://src/components/NotificationBell.jsx#L16-L37)
- [NotificationBell.jsx:73-106](file://src/components/NotificationBell.jsx#L73-L106)
- [NotificationBell.jsx:159-176](file://src/components/NotificationBell.jsx#L159-L176)

### Database-Driven Notification Management
The notification system is powered by a comprehensive database schema:
- Notifications table with user and organization relationships
- Row-level security policies for data isolation
- Triggers for automatic notification creation
- Indexes for optimal query performance
- JSONB data field for flexible notification content

```mermaid
erDiagram
NOTIFICATIONS {
UUID id PK
UUID user_id FK
UUID org_id FK
TEXT type
TEXT title
TEXT message
JSONB data
BOOLEAN is_read
TIMESTAMP created_at
}
WELCOME_EMAIL_LOG {
UUID id PK
UUID org_id FK
TEXT admin_email
TEXT admin_name
TEXT org_name
BOOLEAN email_sent
TIMESTAMP email_sent_at
TEXT error_message
TIMESTAMP created_at
}
ORGANIZATIONS ||--o{ NOTIFICATIONS : "has"
USERS ||--o{ NOTIFICATIONS : "belongs_to"
PROFILES ||--o{ NOTIFICATIONS : "notifies"
```

**Diagram sources**
- [supabase-notifications.sql:7-17](file://supabase-notifications.sql#L7-L17)
- [supabase-notifications.sql:46-56](file://supabase-notifications.sql#L46-L56)

**Section sources**
- [NotificationBell.jsx:1-292](file://src/components/NotificationBell.jsx#L1-L292)
- [supabase-notifications.sql:1-186](file://supabase-notifications.sql#L1-L186)

## Automated Welcome Email System

### Edge Function Implementation
The welcome email system is implemented as a Supabase Edge Function:
- Automated processing of new organization registrations
- Integration with Resend email service
- Comprehensive error handling and logging
- Database logging of email attempts
- Notification creation upon successful email delivery

```mermaid
flowchart TD
Trigger["New Organization Registration"] --> CheckExisting["Check Existing Email Log"]
CheckExisting --> SendEmail["Send Welcome Email via Resend"]
SendEmail --> Success{"Email Sent?"}
Success --> |Yes| LogSuccess["Log Success in DB"]
Success --> |No| LogError["Log Error in DB"]
LogSuccess --> CreateNotification["Create 'welcome_email_sent' Notification"]
LogError --> CreateNotification
CreateNotification --> Complete["Complete Process"]
```

**Diagram sources**
- [send-welcome-email/index.ts:41-54](file://supabase/functions/send-welcome-email/index.ts#L41-L54)
- [send-welcome-email/index.ts:297-310](file://supabase/functions/send-welcome-email/index.ts#L297-L310)
- [send-welcome-email/index.ts:316-328](file://supabase/functions/send-welcome-email/index.ts#L316-L328)

### Database Integration and Triggers
The system integrates with database triggers for automatic notification creation:
- Trigger on new organization registration
- Trigger on new member requests
- Automatic notification creation for admins
- Data enrichment with organization and user information
- JSONB payload for flexible notification content

**Section sources**
- [send-welcome-email/index.ts:1-349](file://supabase/functions/send-welcome-email/index.ts#L1-L349)
- [supabase-notifications.sql:96-177](file://supabase-notifications.sql#L96-L177)

## Dependency Analysis
The notification system relies on several interconnected components:
- Schedule page depends on store hooks for data access
- Modal component provides reusable dialog infrastructure
- NotificationBell component handles real-time subscriptions and state management
- Store service manages authentication, user profiles, and data access
- Supabase service handles database connectivity and real-time subscriptions
- Database schema provides notification infrastructure and triggers
- Edge Functions handle external service integrations
- Environment configuration supplies backend credentials and service keys

```mermaid
graph TB
S["Schedule.jsx"] --> ST["store.jsx"]
S --> M["Modal.jsx"]
V["Volunteers.jsx"] --> ST
NB["NotificationBell.jsx"] --> ST
NB --> SUP["supabase.js"]
L["Layout.jsx"] --> NB
ST --> SUP
SUP --> DB["Supabase DB"]
DB --> TRIGGERS["Database Triggers"]
EF["Edge Functions"] --> RES["Resend API"]
ENV[".env.example"] --> SUP
RES --> EF
```

**Diagram sources**
- [Schedule.jsx:1-935](file://src/pages/Schedule.jsx#L1-L935)
- [Volunteers.jsx:1-360](file://src/pages/Volunteers.jsx#L1-L360)
- [Modal.jsx:1-50](file://src/components/Modal.jsx#L1-L50)
- [NotificationBell.jsx:1-292](file://src/components/NotificationBell.jsx#L1-L292)
- [Layout.jsx:1-198](file://src/components/Layout.jsx#L1-L198)
- [store.jsx:1-1307](file://src/services/store.jsx#L1-L1307)
- [supabase.js:1-37](file://src/services/supabase.js#L1-L37)
- [supabase-notifications.sql:1-186](file://supabase-notifications.sql#L1-L186)
- [send-welcome-email/index.ts:1-349](file://supabase/functions/send-welcome-email/index.ts#L1-L349)
- [.env.example:1-5](file://.env.example#L1-L5)

**Section sources**
- [Schedule.jsx:1-935](file://src/pages/Schedule.jsx#L1-L935)
- [NotificationBell.jsx:1-292](file://src/components/NotificationBell.jsx#L1-L292)
- [Layout.jsx:1-198](file://src/components/Layout.jsx#L1-L198)
- [store.jsx:1-1307](file://src/services/store.jsx#L1-L1307)
- [supabase.js:1-37](file://src/services/supabase.js#L1-L37)
- [supabase-notifications.sql:1-186](file://supabase-notifications.sql#L1-L186)
- [send-welcome-email/index.ts:1-349](file://supabase/functions/send-welcome-email/index.ts#L1-L349)
- [.env.example:1-5](file://.env.example#L1-L5)

## Performance Considerations
- Recipient deduplication uses a Map-based approach for O(n) uniqueness filtering
- Template generation processes assignments efficiently with mapping and filtering
- Modal rendering uses controlled components to minimize re-renders
- Data fetching occurs via parallel promises in the store for optimal loading
- Real-time notifications use Supabase's efficient PostgreSQL change streams
- Database indexes optimize notification queries and sorting
- Edge Functions provide scalable email processing without server overhead
- Caching strategies prevent redundant database queries for notification counts

## Troubleshooting Guide
Common issues and resolutions:
- Missing environment variables: Ensure Supabase URL and anonymous key are configured in environment
- Empty recipient list: Verify that event assignments exist and volunteers are properly linked
- Duplicate recipients: The system prevents duplicates; check for case sensitivity in email addresses
- Invalid email input: Manual input validation requires '@' character for raw email entries
- Native email client not opening: Confirm browser allows pop-ups and default email app is set
- Real-time notifications not updating: Check Supabase connection and PostgreSQL change stream permissions
- Welcome email failures: Verify Resend API key configuration and email service credentials
- Database trigger issues: Ensure proper row-level security policies and trigger permissions
- Notification bell not displaying: Verify user authentication and organization membership

**Section sources**
- [.env.example:1-5](file://.env.example#L1-L5)
- [Schedule.jsx:97-142](file://src/pages/Schedule.jsx#L97-L142)
- [Schedule.jsx:224-229](file://src/pages/Schedule.jsx#L224-L229)
- [NotificationBell.jsx:16-37](file://src/components/NotificationBell.jsx#L16-L37)
- [send-welcome-email/index.ts:56-64](file://supabase/functions/send-welcome-email/index.ts#L56-L64)

## Conclusion
The enhanced notification system provides a comprehensive solution for modern team communication. It combines the familiar email notification workflow with cutting-edge real-time notifications, creating a seamless multi-channel communication experience. The addition of automated welcome emails and database-driven notification triggers ensures timely and relevant information delivery. The modular architecture maintains flexibility while delivering a robust, scalable notification infrastructure that supports both traditional email workflows and modern real-time communication patterns. This dual approach ensures effective communication across different user preferences and scenarios while maintaining system reliability and performance.