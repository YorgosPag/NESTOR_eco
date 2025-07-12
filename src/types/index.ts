
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

// **Προσθήκη: Σταθερές και Τύποι για ExpenseCategory**
export const expenseCategories = ["Αερισμός", "Εξοικονόμηση Ενέργειας", "Θερμομόνωση", "Κουφώματα", "Λοιπές Παρεμβάσεις", "Συστήματα Θέρμανσης-Ψύξης", "ΖΝΧ", "Σκίαση"] as const;
export type ExpenseCategory = typeof expenseCategories[number];

// **Προσθήκη: Σταθερές και Τύποι για Units**
export const units = ["€/m²", "€/kW", "€/μονάδα", "€/αίτηση"] as const;
export type Unit = typeof units[number];

export type InterventionCategory = string;

export const interventionSubcategories = [
  "Πλαίσιο αλουμινίου με ενεργειακό υαλοπίνακα- Παράθυρο",
  "Πλαίσιο αλουμινίου με ενεργειακό υαλοπίνακα – Εξωστόθυρα",
  "Πλαίσιο ξύλου με ενεργειακό υαλοπίνακα – Παράθυρο",
  "Πλαίσιο ξύλου με ενεργειακό υαλοπίνακα – Εξωστόθυρα",
  "Πλαίσιο PVC με ενεργειακό υαλοπίνακα – Παράθυρο",
  "Πλαίσιο PVC με ενεργειακό υαλοπίνακα - Εξωστόθυρα",
  "Μόνον ενεργειακοί υαλοπίνακες (Χωρίς αντικατάσταση πλαισίου) (1) (2)",
  "Εξωτερικό προστατευτικό φύλλο (σύστημα Κουτί–Ρολό, ή Εξώφυλλο) (2) (3)(4)",
  "Λοιπά σταθερά ή κινητά συστήματα σκίασης (2) (4)",
  "Συστήματα Μηχανικού Αερισμού με ανάκτηση θερμότητας (4)(5)(€/ μονάδα)",
  "Θερμομόνωση δώματος εξωτερικά",
  "Θερμομόνωση στέγης ή οριζόντιας οροφής κάτω από μη θερμομονωμένη στέγη",
  "Θερμομόνωση εξωτ. τοιχοποιίας, φέροντος οργανισμού, δαπέδου επί εδάφους επί πιλοτής, ή μη θερμαινόμενου χώρου, με επικάλυψη με συνθετικό επίχρισμα(6)",
  "Θερμομόνωση εξωτ. τοιχοποιίας, φέροντος οργανισμού, δαπέδου επί πιλοτής, ή μη θερμαινόμενου χώρου, με επικάλυψη με ελαφρά πετάσματα (6)",
  "Διατάξεις αυτομάτου ελέγχου λειτουργίας συστήματος θέρμανσης (7) (8)",
  "Σύστημα καυστήρα – λέβητα Φυσικού Αερίου / Υγραερίου",
  "Σύστημα Α/Θ (Θέρμανσης – Ψύξης / Ελάχιστη απαίτηση ενεργειακής σήμανσης στους 55oC)",
  "Σύστημα γεωθερμικής αντλίας θερμότητας",
  "Σύστημα συμπαραγωγής Φ.Α. (ΣΗΘΥΑ)",
  "Σύστημα λέβητα βιομάζας - πελλέτας ξύλου)",
  "Σύστημα ενδοδαπέδιας θέρμανσης",
  "Αντλίες θερμότητας αέρα – αέρα διαιρούμενου τύπου (split unit) για θέρμανση/ψύξη χώρου (4) (10)",
  "Ηλιακό θερμοσιφωνικό σύστημα συλλέκτη – ταμιευτήρα αποθήκευσης ΖΝΧ (4)",
  "Ηλιoθερμικό σύστημα συλλέκτη – ταμιευτήρα αποθήκευσης ΖΝΧ βεβιασμένης κυκλοφορίας  (8) (11)",
  "Ηλιoθερμικό σύστημα παροχής ΖΝΧ και υποβοήθησης θέρμανσης χώρου  (8) (11) (12)",
  "Αντλία θερμότητας  (4)",
  "Συσκευές  διαχείρισης ενέργειας (smarthome) (4) (11) (12)",
  "Αναβάθμιση  φωτισμού  (μόνον για πολυκατοικία)  (11)"
] as const;
export type InterventionSubcategory = typeof interventionSubcategories[number];

// This represents an intervention from the master list
export interface MasterIntervention {
  id: string;
  code: string;
  info?: string;
  energySpecsOptions?: string;
  expenseCategory: ExpenseCategory;
  interventionCategory: InterventionCategory;
  interventionSubcategory?: string;
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

// This represents an intervention that has been added to a project
export interface ProjectIntervention extends Omit<MasterIntervention, 'id'> {
  masterId: string; // ID from MasterIntervention
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
  
  interventionSubcategory: string;
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
  supplierType: "contractor" | "vendor"; // Συνεργείο ή Προμηθευτής
  type: "general" | "perProject"; // Γενική ή για έργο
  projectId?: string; // Προαιρετικό αν είναι perProject
  description: string;
  items: Omit<OfferItem, 'id'>[]; // Items don't have their own ID in the database
  fileUrl?: string; // Ανέβασμα PDF
  createdAt: string; // ISO 8601 date string
}

export interface ChartData {
  type: 'bar' | 'pie';
  title: string;
  data: { name: string; value: number }[];
}
