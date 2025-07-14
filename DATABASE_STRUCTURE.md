# Firestore Database Structure

This document outlines the structure of the Firestore database for the EcoFlow Manager application.

---

## 1. `projects`

This collection stores all the project data, including their interventions, stages, and audit logs.

### Fields:
- `title` (string): The main title of the project.
- `applicationNumber` (string, optional): The official application number (e.g., from a subsidy program).
- `ownerContactId` (string, reference): The ID of the contact from the `contacts` collection who owns the project.
- `deadline` (timestamp, optional): The final deadline for the project completion.
- `status` (string): The current status of the project. Can be `Quotation`, `On Track`, `Delayed`, `Completed`.
- `budget` (number): The total calculated budget for the project, derived from its interventions.
- `interventions` (array of maps): An array containing the project's interventions.
    - `masterId` (string): The ID from the `masterInterventions` collection.
    - `code` (string, optional): A custom code for the intervention.
    - `expenseCategory` (string): The category of the expense.
    - `interventionCategory` (string): The main category of the intervention.
    - `interventionSubcategory` (string, optional): A more specific subcategory.
    - `totalCost` (number): The calculated cost for this specific intervention.
    - `subInterventions` (array of maps, optional): A detailed breakdown of costs.
        - `id` (string): Unique identifier for the sub-intervention.
        - `subcategoryCode` (string): Code for the specific task.
        - `description` (string): Description of the task.
        - `cost` (number): The eligible cost for this task from the program.
        - `costOfMaterials` (number, optional): The actual cost of materials.
        - `costOfLabor` (number, optional): The actual cost of labor.
    - `stages` (array of maps): The pipeline of stages for this intervention.
        - `id` (string): Unique ID for the stage.
        - `title` (string): Title of the stage.
        - `status` (string): `pending`, `in progress`, `completed`, `failed`.
        - `deadline` (timestamp): The deadline for this stage.
        - `lastUpdated` (timestamp): When the stage was last updated.
        - `assigneeContactId` (string, reference, optional): ID of the assigned contact.
        - `supervisorContactId` (string, reference, optional): ID of the supervising contact.
        - `files` (array of maps): Attached files for the stage.
- `auditLog` (array of maps): A log of all actions taken on the project.
    - `id` (string): Log entry ID.
    - `user` (map): Information about the user who performed the action.
    - `action` (string): The action performed (e.g., "Create Project").
    - `timestamp` (timestamp): When the action occurred.
    - `details` (string, optional): More details about the action.

### Sample Document:
```json
{
  "title": "Ανακαίνιση στο Μαρούσι",
  "applicationNumber": "ΕΞ-2024-001",
  "ownerContactId": "contact-1",
  "deadline": "2025-05-30T23:59:59Z",
  "status": "On Track",
  "budget": 14200,
  "interventions": [
    {
      "masterId": "dummy-id-1",
      "interventionCategory": "Κουφώματα",
      "totalCost": 6400,
      "stages": [
        {
          "id": "p1i1s3",
          "title": "Παραγγελία Κουφωμάτων",
          "status": "in progress",
          "deadline": "2024-07-15T00:00:00Z"
        }
      ]
    }
  ],
  "auditLog": [
    {
      "action": "Δημιουργία Έργου",
      "timestamp": "2024-06-01T10:00:00Z"
    }
  ]
}
```

---

## 2. `contacts`

This collection stores all contacts, including clients, suppliers, and technicians.

### Fields:
- `firstName` (string): The contact's first name.
- `lastName` (string): The contact's last name.
- `email` (string, optional): The contact's email address.
- `mobilePhone` (string, optional): The contact's mobile phone number.
- `role` (string): The role of the contact (e.g., "Πελάτης", "Προμηθευτής").
- `specialty` (string, optional): The professional specialty of the contact.
- `company` (string, optional): The company the contact works for.
- `vatNumber` (string, optional): The contact's VAT/tax number.
- `addressCity` (string, optional): The city of the contact's address.
- `avatar` (string, optional, URL): URL to the contact's profile picture.

### Sample Document:
```json
{
  "firstName": "Γιώργος",
  "lastName": "Τεχνικός",
  "email": "g.technikos@example.com",
  "mobilePhone": "6971234567",
  "role": "Τεχνίτης",
  "specialty": "Ηλεκτρολόγος Μηχανικός",
  "company": "Τεχνικές Λύσεις Α.Ε.",
  "vatNumber": "123456789"
}
```
---

## 3. `masterInterventions`

This is a catalog collection that stores the predefined "master" interventions that can be added to projects.

### Fields:
- `code` (string): A unique code for the intervention type (e.g., "1.A1").
- `expenseCategory` (string): The high-level expense category.
- `interventionCategory` (string): The main category of the intervention.
- `interventionSubcategory` (string, optional): A detailed description.
- `unit` (string): The unit of measurement (e.g., "€/m²").
- `maxUnitPrice` (number): The maximum unit price allowed by the program.
- `maxAmount` (number): The maximum total amount allowed for this intervention.

### Sample Document:
```json
{
  "code": "1.A1",
  "expenseCategory": "Κουφώματα",
  "interventionCategory": "Κουφώματα",
  "interventionSubcategory": "Αντικατάσταση Κουφωμάτων - Πλαίσιο αλουμινίου με θερμοδιακοπή",
  "unit": "€/m²",
  "maxUnitPrice": 320,
  "maxAmount": 10000
}
```
---

## 4. `customLists` & `customListItems`

These collections manage dynamic dropdown lists used throughout the application.

### `customLists`
- `name` (string): The user-facing name of the list (e.g., "Μάρκες Υλικών").
- `key` (string, optional): A stable, system-level key for programmatic access (e.g., "MATERIAL_BRANDS").

### `customListItems`
- `listId` (string, reference): The ID of the parent list in the `customLists` collection.
- `name` (string): The value of the list item (e.g., "Daikin").
```

### Sample Document (`customLists`):
```json
{
  "name": "Ρόλοι Επαφών",
  "key": "CONTACT_ROLES"
}
```

### Sample Document (`customListItems`):
```json
{
  "listId": "someListIdForContactRoles",
  "name": "Πελάτης"
}
```
---

## 5. `offers`

This collection stores offers received from suppliers and contractors.

### Fields:
- `supplierId` (string, reference): The ID of the contact from the `contacts` collection.
- `type` (string): The type of offer (`general` or `perProject`).
- `projectId` (string, reference, optional): The ID of the project this offer is for.
- `description` (string): A description of the offer.
- `items` (array of maps): The line items of the offer.
  - `name` (string): Description of the item.
  - `unit` (string): Unit of measurement.
  - `quantity` (number, optional): The quantity of the item.
  - `unitPrice` (number): The price per unit.
- `fileUrl` (string, optional, URL): A link to the offer document.
- `createdAt` (timestamp): When the offer was created.

### Sample Document:
```json
{
  "supplierId": "contact-2",
  "type": "general",
  "description": "Τιμοκατάλογος Υλικών Ιουνίου 2024",
  "items": [
    {
      "name": "Πάνελ οροφής",
      "unit": "τεμ.",
      "unitPrice": 55.50
    }
  ],
  "createdAt": "2024-06-20T12:00:00Z"
}
```
