export type UserRole = "Admin" | "Supplier" | "Client" | "Accounting";
export type ContactRole = string;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName:string;
  email?: string;
  mobilePhone?: string;
  landlinePhone?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressArea?: string;
  addressPostalCode?: string;
  addressCity?: string;
  addressPrefecture?: string;
  role: ContactRole;
  specialty?: string;
  company?: string;
  avatar?: string;
  notes?: string;

  // Personal Info
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: string;
  nationality?: string;

  // ID Info
  vatNumber?: string;
  idNumber?: string;
  idIssueDate?: string;
  idIssuingAuthority?: string;

  // Taxis login details
  usernameTaxis?: string;
  passwordTaxis?: string;

  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export type ExpenseCategory = string;
export type Unit = string;
export type InterventionCategory = string;
export type InterventionSubcategory = string;

export interface MasterIntervention {
  id: string;
  code: string;
  info?: string;
  energySpecsOptions?: string;
  expenseCategory: ExpenseCategory;
  interventionCategory: InterventionCategory;
  interventionSubcategory?: InterventionSubcategory;
  unit: Unit;
  maxUnitPrice: number;
  maxAmount: number;
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
  assigneeContactId?: string; // Contractor
  supervisorContactId?: string; // Internal supervising engineer
}

export interface SubIntervention {
  id: string;
  subcategoryCode: string;
  expenseCategory?: string;
  description: string;
  cost: number; // This is the selling/eligible price
  quantity?: number;
  quantityUnit?: string;
  costOfMaterials?: number;
  costOfLabor?: number;
  unitCost?: number;
  implementedQuantity?: number;
  selectedEnergySpec?: string;
  displayCode?: string; // Added field for calculated display value
}

export interface ProjectIntervention extends Omit<MasterIntervention, 'id' | 'code' | 'unit' | 'maxUnitPrice' | 'maxAmount'> {
  masterId: string; // ID from MasterIntervention
  code?: string;
  subInterventions?: SubIntervention[];

  // User-defined values for this specific project
  quantity: number;
  selectedEnergySpec?: string;
  selectedSystemClass?: string;

  // Quotation-specific costs
  costOfMaterials?: number;
  costOfLabor?: number;

  // Calculated value
  totalCost: number;
  stages: Stage[];
}

export interface Project {
  id: string;
  title: string;
  applicationNumber?: string;
  ownerContactId?: string;
  deadline?: string; // YYYY-MM-DD
  interventions: ProjectIntervention[];
  budget: number; // This should be the sum of totalCost from interventions
  progress: number;
  status: "On Track" | "Delayed" | "Completed" | "Quotation";
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

export interface Trigger {
  id: string;
  name: string;
  code: string;
  interventionCategory: string;
  description?: string;
}

export interface ManagedInterventionCategory {
  id: string;
  name: string;
}

export interface CustomList {
  id: string;
  name: string;
  key?: string;
}

export interface CustomListItem {
  id: string;
  name: string;
  listId: string;
}

export interface OfferItem {
  id: string;
  name: string;
  unit: string;
  quantity?: number;
  unitPrice: number;
}

export interface Offer {
  id: string;
  supplierId: string;
  supplierType: "contractor" | "vendor";
  type: "general" | "perProject";
  projectId?: string;
  description: string;
  items: Omit<OfferItem, 'id'>[];
  fileUrl?: string;
  createdAt: string;
}

export interface ChartData {
  type: 'bar' | 'pie';
  title: string;
  data: { name: string; value: number }[];
}