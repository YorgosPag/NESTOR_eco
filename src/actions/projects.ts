export type UserRole = "Admin" | "Supplier" | "Client" | "Accounting";
export type ContactRole = "Προμηθευτής" | "Τεχνίτης" | "Πελάτης" | "Λογιστήριο" | "Συνεργείο" | "Μηχανικός" | "Άλλο";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: ContactRole;
    specialty?: string;
    company?: string;
    avatar?: string;
    notes?: string;
}

export const expenseCategories = ["Αερισμός", "Εξοικονόμηση Ενέργειας", "Θερμομόνωση", "Κουφώματα", "Λοιπές Παρεμβάσεις", "Συστήματα Θέρμανσης-Ψύξης", "ΖΝΧ", "Σκίαση"] as const;
export type ExpenseCategory = typeof expenseCategories[number];


export const units = ["€/m²", "€/kW", "€/μονάδα", "€/αίτηση"] as const;
export type Unit = typeof units[number];

// This represents an intervention from the master list
export interface MasterIntervention {
    id: string; // e.g., EXO-001
    expenseCategory: ExpenseCategory;
    interventionCategory: string;
    interventionSubcategory?: string;
    // Depending on the intervention, different specs apply. An array of possible values.
    energySpecsOptions?: string[]; 
    systemClassOptions?: string[];
    unit: Unit;
    maxUnitPrice: number;
    maxAmount: number;
    notes?: string;
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
}

export type StageStatus = 'pending' | 'in progress' | 'completed' | 'failed';

export interface Stage {
    id: string;
    title: string;
    status: StageStatus;
    deadline: string; // YYYY-MM-DD
    lastUpdated: string; // YYYY-MM-DD
    files: Attachment[];
    notes?: string;
    assigneeContactId?: string;
    supervisorContactId?: string;
}

// New type definition for SubIntervention based on the schemas in actions.ts
export interface SubIntervention {
    id: string;
    subcategoryCode: string;
    description: string;
    cost: number;
    quantity?: number;
    quantityUnit?: string;
    costOfMaterials?: number;
    costOfLabor?: number;
    unitCost?: number;
    implementedQuantity?: number;
    expenseCategory?: string; // Added based on UpdateSubInterventionSchema
    selectedEnergySpec?: string; // Added based on UpdateSubInterventionSchema
}

// This represents an intervention that has been added to a project
export interface ProjectIntervention {
    masterId: string; // ID from MasterIntervention
    code?: string; // Added code property if needed for custom interventions (based on actions.ts)
    expenseCategory: ExpenseCategory | string; // ExpenseCategory can be string for custom interventions
    interventionCategory: string;
    interventionSubcategory?: string;
    unit?: Unit; // Made optional as it might not apply to custom interventions
    maxUnitPrice?: number; // Made optional
    maxAmount?: number; // Made optional
    notes?: string;

    // User-defined values for this specific project
    quantity?: number;
    selectedEnergySpec?: string;
    selectedSystemClass?: string;

    // Calculated value
    totalCost: number;
    stages: Stage[];
    // Added subInterventions array
    subInterventions?: SubIntervention[];
}


export interface Project {
    id: string;
    title: string;
    applicationNumber?: string; // Added applicationNumber as seen in actions.ts
    ownerContactId?: string;
    deadline?: string; // YYYY-MM-DD
    interventions: ProjectIntervention[];
    budget: number; // This should be the sum of totalCost from interventions
    progress: number;
    status: "On Track" | "Delayed" | "Completed" | "Quotation"; // Added "Quotation" status as seen in actions.ts
    alerts: number;
    auditLog: AuditLog[];
}

export interface AuditLog {
    id: string;
    user: User;
    action: string;
    timestamp: string;
    details?: string;
}