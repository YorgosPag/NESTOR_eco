
import type {
    Project,
    User,
    AuditLog,
    ProjectIntervention,
    Stage,
    Contact,
    MasterIntervention
  } from "@/types";

export const users: User[] = [
    {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-1",
      role: "Admin",
    },
    {
      id: "user-2",
      name: "Bob",
      email: "bob@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-2",
      role: "Supplier",
    },
    {
      id: "user-3",
      name: "Charlie",
      email: "charlie@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-3",
      role: "Client",
    },
];

export const contactsData: Omit<Contact, 'id'>[] = [
    {
        name: 'Γιώργος Τεχνικός',
        email: 'g.technikos@example.com',
        phone: '6971234567',
        role: 'Τεχνίτης',
        specialty: 'Ηλεκτρολόγος',
        company: 'Τεχνικές Λύσεις Α.Ε.',
        address: 'Δαιδάλου 12, Ηράκλειο',
        avatar: 'https://i.pravatar.cc/150?u=contact-1',
        notes: 'Εξειδικευμένος σε συστήματα smart home.',
    },
    {
        name: 'Μαρία Προμηθεύτρια',
        email: 'm.promitheutria@materials.com',
        phone: '6987654321',
        role: 'Προμηθευτής',
        specialty: 'Κουφώματα',
        company: 'Alpha Κουφώματα',
        address: 'Βιομηχανική Περιοχή Θεσσαλονίκης',
        avatar: 'https://i.pravatar.cc/150?u=contact-2',
        notes: 'Παράδοση εντός 5 εργάσιμων ημερών.',
    },
    {
        name: 'Νίκος Λογιστής',
        email: 'nikos.logistis@accountants.gr',
        phone: '2101234567',
        role: 'Λογιστήριο',
        specialty: 'Φοροτεχνικός',
        company: 'Λογιστικές Υπηρεσίες Ελλάδος',
        address: 'Σταδίου 50, Αθήνα',
        avatar: 'https://i.pravatar.cc/150?u=contact-3',
        notes: '',
    },
     {
        name: 'Ιωάννης Παπαδόπουλος',
        email: 'eleni.p@gmail.com',
        phone: '6944444444',
        role: 'Πελάτης',
        address: 'Αριστοτέλους 1, Αθήνα',
        avatar: 'https://i.pravatar.cc/150?u=contact-4',
        notes: 'Ιδιοκτήτης του έργου "Ανακαίνιση Κατοικίας Α".',
    },
     {
        name: 'Μαρία Γεωργίου',
        email: 'maria.g@yahoo.com',
        phone: '6933333333',
        role: 'Πελάτης',
        address: 'Λεωφ. Κηφισίας 210, Μαρούσι',
        avatar: 'https://i.pravatar.cc/150?u=contact-5',
        notes: 'Ιδιοκτήτρια του έργου "Αναβάθμιση Διαμερίσματος Β".',
    },
     {
        name: 'Εταιρεία Α.Ε.',
        email: 'info@etaireia.gr',
        phone: '2109876543',
        role: 'Πελάτης',
        company: 'Εταιρεία Α.Ε.',
        address: 'Πανεπιστημίου 5, Αθήνα',
        avatar: 'https://placehold.co/40x40.png',
        notes: 'Ιδιοκτήτης του έργου "Ενεργειακή Αναβάθμιση Γραφείων".',
    },
];

export const masterInterventionsData: Omit<MasterIntervention, 'id'>[] = [
    {
        expenseCategory: "Κουφώματα",
        interventionCategory: "Αντικατάσταση Κουφωμάτων",
        interventionSubcategory: "Πλαίσιο αλουμινίου με ενεργειακό υαλοπίνακα",
        unit: "€/m²",
        maxUnitPrice: 270,
        maxAmount: 5400,
        energySpecsOptions: ["U < 2.0", "U < 2.5"],
        systemClassOptions: [],
        notes: "Standard aluminum frames with double glazing."
    },
    {
        expenseCategory: "Θερμομόνωση",
        interventionCategory: "Θερμομόνωση δαπέδου",
        interventionSubcategory: "Τοποθέτηση μόνωσης σε επαφή με έδαφος",
        unit: "€/m²",
        maxUnitPrice: 35,
        maxAmount: 2000,
        energySpecsOptions: ["R > 1,8", "R > 2.0"],
        systemClassOptions: [],
        notes: "Insulation for ground-floor levels."
    },
    {
        expenseCategory: "Συστήματα Θέρμανσης-Ψύξης",
        interventionCategory: "Αντλία Θερμότητας",
        interventionSubcategory: "Split αέρος-αέρος",
        unit: "€/kW",
        maxUnitPrice: 800,
        maxAmount: 6400,
        energySpecsOptions: ["3,8 < P ≤ 8", "P > 8"],
        systemClassOptions: ["Class A+", "Class A++"],
        notes: "Air-to-air heat pump."
    },
    {
        expenseCategory: "Αερισμός",
        interventionCategory: "Σύστημα μηχανικού αερισμού με ανάκτηση θερμότητας",
        interventionSubcategory: "Κεντρικό σύστημα > 600m³/h",
        unit: "€/μονάδα",
        maxUnitPrice: 3500,
        maxAmount: 7000,
        energySpecsOptions: [],
        systemClassOptions: ["III Κεντρικά > 600m³/h", "IV Κεντρικά"],
        notes: "Central ventilation system with heat recovery."
    }
];

const generateStages = (interventionId: string): Stage[] => [
    {
      id: `${interventionId}-stage-1`,
      title: "Υποβολή Αίτησης",
      status: "completed",
      deadline: new Date(Date.now() - 20 * 86400000).toISOString(),
      lastUpdated: new Date(Date.now() - 21 * 86400000).toISOString(),
      files: [
        {
          id: "file-1",
          name: "aitisi.pdf",
          url: "#",
          uploadedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
        },
      ],
      notes: "Completed by client",
    },
    {
      id: `${interventionId}-stage-2`,
      title: "Τεχνική Μελέτη",
      status: "in progress",
      deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      lastUpdated: new Date(Date.now() - 5 * 86400000).toISOString(),
      files: [],
      notes: "Waiting for supplier measurements",
      assigneeContactId: 'contact-1'
    },
    {
      id: `${interventionId}-stage-3`,
      title: "Εγκατάσταση",
      status: "pending",
      deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
      lastUpdated: new Date(Date.now() - 5 * 86400000).toISOString(),
      files: [],
    },
    {
      id: `${interventionId}-stage-4`,
      title: "Ολοκλήρωση & Πληρωμή",
      status: "pending",
      deadline: new Date(Date.now() + 35 * 86400000).toISOString(),
      lastUpdated: new Date(Date.now() - 5 * 86400000).toISOString(),
      files: [],
      assigneeContactId: 'contact-3'
    },
];

const allPendingStages = (interventionId: string): Stage[] => [
    {
      id: `${interventionId}-stage-1`,
      title: "Υποβολή Αίτησης",
      status: "pending",
      deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      files: [],
    },
    {
      id: `${interventionId}-stage-2`,
      title: "Τεχνική Μελέτη",
      status: "pending",
      deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      files: [],
    },
    {
      id: `${interventionId}-stage-3`,
      title: "Εγκατάσταση",
      status: "pending",
      deadline: new Date(Date.now() + 35 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      files: [],
    },
  ];

const overdueStages = (interventionId: string): Stage[] => [
     {
      id: `${interventionId}-stage-1`,
      title: "Υποβολή Αίτησης",
      status: "completed",
      deadline: new Date(Date.now() - 40 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      files: [],
    },
    {
      id: `${interventionId}-stage-2`,
      title: "Τεχνική Μελέτη",
      status: "in progress",
      deadline: new Date(Date.now() - 10 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      files: [],
      notes: "Αυτό έχει καθυστερήσει!",
      assigneeContactId: 'contact-1'
    },
     {
      id: `${interventionId}-stage-3`,
      title: "Εγκατάσταση",
      status: "pending",
      deadline: new Date(Date.now() - 5 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      files: [],
    },
]

const proj1Interventions: ProjectIntervention[] = [
    {
      masterId: "EXO-001",
      expenseCategory: "Κουφώματα",
      interventionCategory: "Αντικατάσταση Κουφωμάτων",
      interventionSubcategory: "Πλαίσιο αλουμινίου με ενεργειακό υαλοπίνακα",
      unit: "€/m²",
      maxUnitPrice: 270,
      maxAmount: 5400,
      quantity: 18.5,
      selectedEnergySpec: "U < 2.0",
      totalCost: 4995,
      stages: generateStages("EXO-001"),
    },
    {
      masterId: "THERM-002",
      expenseCategory: "Θερμομόνωση",
      interventionCategory: "Θερμομόνωση δαπέδου",
      interventionSubcategory: "Τοποθέτηση μόνωσης σε επαφή με έδαφος",
      unit: "€/m²",
      maxUnitPrice: 35,
      maxAmount: 2000,
      quantity: 50,
      selectedEnergySpec: "R > 1,8",
      totalCost: 1750,
      stages: allPendingStages("THERM-002"),
    },
];
  
const proj2Interventions: ProjectIntervention[] = [
    {
      masterId: "HEAT-005",
      expenseCategory: "Συστήματα Θέρμανσης-Ψύξης",
      interventionCategory: "Αντλία Θερμότητας",
      interventionSubcategory: "Split αέρος-αέρος",
      unit: "€/kW",
      maxUnitPrice: 800,
      maxAmount: 6400,
      quantity: 7.5,
      selectedEnergySpec: "3,8 < P ≤ 8",
      totalCost: 6000,
      stages: overdueStages("HEAT-005"),
    },
];

const proj3Interventions: ProjectIntervention[] = [
    {
      masterId: "EXO-009",
      expenseCategory: "Αερισμός",
      interventionCategory: "Σύστημα μηχανικού αερισμού με ανάκτηση θερμότητας",
      interventionSubcategory: "Κεντρικό σύστημα > 600m³/h",
      unit: "€/μονάδα",
      maxUnitPrice: 3500,
      maxAmount: 7000,
      quantity: 2,
      selectedSystemClass: "III Κεντρικά > 600m³/h",
      stages: generateStages("EXO-009").map(s => ({...s, status: 'completed'})),
    },
  ];

const proj4Interventions: ProjectIntervention[] = [
    {
        masterId: "ZNX-001",
        expenseCategory: "ΖΝΧ",
        interventionCategory: "Ηλιακός θερμοσίφωνας",
        unit: "€/μονάδα",
        maxUnitPrice: 1200,
        maxAmount: 1200,
        quantity: 1,
        totalCost: 1200,
        stages: [
             { id: `ZNX-001-stage-1`, title: 'Παραγγελία', status: 'in progress', deadline: new Date(Date.now() + 2 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
             { id: `ZNX-001-stage-2`, title: 'Παράδοση', status: 'pending', deadline: new Date(Date.now() + 8 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
        ]
    }
]

export const projectsMockData: Omit<Project, 'id' | 'progress' | 'status' | 'alerts'>[] = [
    {
      title: "Ανακαίνιση Κατοικίας Α",
      ownerContactId: "contact-4", // Placeholder, will be replaced by seeded contact ID
      deadline: "2024-12-31T23:59:59Z",
      interventions: proj1Interventions,
      budget: proj1Interventions.reduce((sum, i) => sum + i.totalCost, 0),
      auditLog: [],
    },
    {
      title: "Αναβάθμιση Διαμερίσματος Β",
      ownerContactId: "contact-5",
      deadline: "2025-03-31T23:59:59Z",
      interventions: proj2Interventions,
      budget: proj2Interventions.reduce((sum, i) => sum + i.totalCost, 0),
      auditLog: [],
    },
    {
      title: "Ενεργειακή Αναβάθμιση Γραφείων",
      ownerContactId: "contact-6",
      deadline: "2024-09-30T23:59:59Z",
      interventions: proj3Interventions,
      budget: proj3Interventions.reduce((sum, i) => sum + i.totalCost, 0),
      auditLog: [],
    },
    {
      title: "Εγκατάσταση Ηλιακού Θερμοσίφωνα",
      ownerContactId: "contact-4",
      deadline: "2024-08-15T23:59:59Z",
      interventions: proj4Interventions,
      budget: proj4Interventions.reduce((sum, i) => sum + i.totalCost, 0),
      auditLog: [],
    },
];
