# Firestore Database Structure

This document outlines the structure of the Firestore database for the EcoFlow Manager application.

---

## 1. Database Type & Connection

- **Type**: NoSQL (Document-Oriented Database)
- **Service**: Google Cloud Firestore
- **Database Name**: `(default)` as specified in `firebase.json`
- **Region**: `eur3` as specified in `firebase.json`
- **Connection**: The application connects to Firestore using the Firebase Admin SDK for server-side operations (Actions, API routes) and the Firebase Web SDK for potential client-side operations. The connection is configured via environment variables, as detailed in the `README.md` file. The core logic for server-side connection is in `src/lib/firebase-admin.ts`.

---

## 2. Collections

### 2.1. `projects`

This is the main collection, storing all project-related data.

- **Fields**:
    - `title` (string): The title of the project.
    - `applicationNumber` (string, optional): The official application number.
    - `ownerContactId` (string, reference): The ID of the contact from the `contacts` collection.
    - `deadline` (timestamp, optional): The project's final deadline.
    - `status` (string): Current status (`Quotation`, `On Track`, `Delayed`, `Completed`).
    - `auditLog` (array of maps): A log of all actions taken on the project. Each log entry is a map with `id`, `user` (map), `action` (string), `timestamp`, and `details`.
    - `interventions` (array of maps): Contains the project's interventions.
        - `masterId` (string): The ID from the `masterInterventions` collection.
        - `interventionCategory` (string): The main category.
        - `interventionSubcategory` (string, optional): A more specific description.
        - `totalCost` (number): The calculated cost for this intervention.
        - `stages` (array of maps): The pipeline of stages for the intervention.
            - `id` (string): Unique ID for the stage.
            - `title` (string): Title of the stage.
            - `status` (string): `pending`, `in progress`, `completed`, `failed`.
            - `deadline` (timestamp): The deadline for this stage.
            - `assigneeContactId` (string, reference, optional): ID of the assigned contact.
            - `supervisorContactId` (string, reference, optional): ID of the supervising contact.
            - `files` (array of maps, optional): Attached files for the stage.
        - `subInterventions` (array of maps, optional): A detailed cost breakdown.
            - `id` (string): Unique identifier.
            - `subcategoryCode` (string): Code for the task.
            - `description` (string): Description of the task.
            - `cost` (number): The eligible cost for this task.
            - `costOfMaterials` (number, optional): Actual cost of materials.
            - `costOfLabor` (number, optional): Actual cost of labor.

---

### 2.2. `contacts`

This collection stores all contacts (clients, suppliers, technicians, etc.).

- **Fields**:
    - `firstName` (string): Contact's first name.
    - `lastName` (string): Contact's last name.
    - `email` (string, optional): Email address.
    - `mobilePhone` (string, optional): Mobile phone number.
    - `role` (string): Role (e.g., "Πελάτης", "Προμηθευτής").
    - `specialty` (string, optional): Professional specialty.
    - `company` (string, optional): Company name.
    - `vatNumber` (string, optional): VAT/tax number.
    - `addressCity` (string, optional): City of the contact's address.
    - `avatar` (string, optional, URL): URL to a profile picture.
    - *Additional fields for personal, ID, and social media information also exist.*

---

### 2.3. `masterInterventions`

A catalog collection storing predefined intervention templates.

- **Fields**:
    - `code` (string): A unique code for the intervention type (e.g., "1.A1").
    - `expenseCategory` (string): High-level expense category.
    - `interventionCategory` (string): The main category.
    - `interventionSubcategory` (string, optional): A detailed description.
    - `unit` (string): Unit of measurement (e.g., "€/m²").
    - `maxUnitPrice` (number): Maximum unit price allowed by the program.
    - `maxAmount` (number): Maximum total amount allowed.

---

### 2.4. `customLists` & `customListItems`

Collections for managing dynamic dropdown lists used throughout the app.

- **`customLists` Fields**:
    - `name` (string): User-facing name of the list (e.g., "Ρόλοι Επαφών").
    - `key` (string, optional): A stable, system-level key for programmatic access (e.g., "CONTACT_ROLES").
- **`customListItems` Fields**:
    - `listId` (string, reference): The ID of the parent list in `customLists`.
    - `name` (string): The value of the list item (e.g., "Πελάτης").

---

### 2.5. `offers`

This collection stores offers received from suppliers and contractors.

- **Fields**:
    - `supplierId` (string, reference): ID of the contact from the `contacts` collection.
    - `type` (string): `general` or `perProject`.
    - `projectId` (string, reference, optional): ID of the associated project.
    - `description` (string): A description of the offer.
    - `items` (array of maps): Line items of the offer (`name`, `unit`, `quantity`, `unitPrice`).
    - `createdAt` (timestamp): When the offer was created.

---

## 3. Special Configurations

- **Indexes**: The project uses Firestore indexes to optimize queries. The definitions are stored in `firestore.indexes.json`. Key indexes include:
    - Index on `projects.title` for sorting.
    - Index on `contacts.lastName` for sorting.
- **Triggers**: There are no database-level triggers (like Cloud Functions Triggers) configured at this time. All logic is handled within the Next.js application via Server Actions.
- **Security Rules**: The security rules are defined in `firestore.rules`. At present, they are configured for development mode (`allow read, write: if true;`), but they should be updated for production to restrict access appropriately.
