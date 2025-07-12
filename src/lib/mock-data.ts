
import type {
    Project,
    User,
    AuditLog,
    ProjectIntervention,
    Stage,
    Contact,
    MasterIntervention,
    CustomListItem,
    CustomList
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
        firstName: 'Γιώργος',
        lastName: 'Τεχνικός',
        email: 'g.technikos@example.com',
        mobilePhone: '6971234567',
        landlinePhone: '2810123456',
        role: 'Τεχνίτης',
        specialty: 'Ηλεκτρολόγος Μηχανικός',
        company: 'Τεχνικές Λύσεις Α.Ε.',
        addressStreet: 'Δαιδάλου',
        addressNumber: '12',
        addressCity: 'Ηράκλειο',
        addressPostalCode: '71202',
        addressPrefecture: 'Ηρακλείου',
        avatar: 'https://i.pravatar.cc/150?u=contact-1',
        notes: 'Εξειδικευμένος σε συστήματα smart home.',
    },
    {
        firstName: 'Μαρία',
        lastName: 'Προμηθεύτρια',
        email: 'm.promitheutria@materials.com',
        mobilePhone: '6987654321',
        role: 'Προμηθευτής',
        specialty: 'Κουφώματα & Μονωτικά',
        company: 'Alpha Materials',
        addressStreet: 'Βιομηχανική Περιοχή Θεσσαλονίκης',
        addressCity: 'Θεσσαλονίκη',
        avatar: 'https://i.pravatar.cc/150?u=contact-2',
        notes: 'Παράδοση εντός 5 εργάσιμων ημερών για κουφώματα.',
    },
    {
        firstName: 'Νίκος',
        lastName: 'Λογιστής',
        email: 'nikos.logistis@accountants.gr',
        landlinePhone: '2101234567',
        role: 'Λογιστήριο',
        specialty: 'Φοροτεχνικός',
        company: 'Λογιστικές Υπηρεσίες Ελλάδος',
        addressStreet: 'Σταδίου',
        addressNumber: '50',
        addressCity: 'Αθήνα',
        addressPostalCode: '10564',
        avatar: 'https://i.pravatar.cc/150?u=contact-3',
        notes: 'Υπεύθυνος για τιμολογήσεις έργων.',
    },
     {
        firstName: 'Ιωάννης',
        lastName: 'Παπαδόπουλος',
        email: 'ioannis.p@gmail.com',
        mobilePhone: '6944444444',
        role: 'Πελάτης',
        addressStreet: 'Αγίου Γεωργίου',
        addressNumber: '23',
        addressCity: 'Μαρούσι',
        avatar: 'https://i.pravatar.cc/150?u=contact-4',
        notes: 'Ιδιοκτήτης του έργου "Ανακαίνιση Μονοκατοικίας στο Μαρούσι".',
    },
     {
        firstName: 'Μαρία',
        lastName: 'Γεωργίου',
        email: 'maria.g@yahoo.com',
        mobilePhone: '6933333333',
        role: 'Πελάτης',
        addressStreet: 'Αγίας Σοφίας',
        addressNumber: '15',
        addressCity: 'Πάτρα',
        avatar: 'https://i.pravatar.cc/150?u=contact-5',
        notes: 'Ιδιοκτήτρια του έργου "Ενεργειακή Αναβάθμιση Διαμερίσματος στην Πάτρα".',
    },
     {
        firstName: 'Εταιρεία',
        lastName: 'Α.Ε.',
        email: 'info@etaireia.gr',
        landlinePhone: '2109876543',
        role: 'Πελάτης',
        company: 'Hellenic Business Corp.',
        addressStreet: 'Λεωφόρος Συγγρού',
        addressNumber: '100',
        addressCity: 'Αθήνα',
        avatar: 'https://placehold.co/40x40.png',
        notes: 'Ιδιοκτήτης του έργου "Εγκατάσταση Φ/Β σε Επαγγελματικό Χώρο".',
    },
     {
        firstName: 'Κώστας',
        lastName: 'Μάστορας',
        email: 'k.mastoras@workers.com',
        mobilePhone: '6911111111',
        role: 'Τεχνίτης',
        specialty: 'Υδραυλικός/Εγκαταστάτης Θέρμανσης',
        company: 'ΑΜΕΣΗ ΔΡΑΣΗ',
        addressCity: 'Πάτρα',
        avatar: 'https://i.pravatar.cc/150?u=contact-6',
        notes: 'Ειδικός σε αντλίες θερμότητας.',
    },
];

export const masterInterventionsData: Omit<MasterIntervention, 'id' | 'code'>[] = [
    {
        info: "Κουφώματα – Υαλοπίνακες – Συστήματα Σκίασης",
        expenseCategory: "Κουφώματα",
        interventionCategory: "Κουφώματα",
        interventionSubcategory: "Αντικατάσταση Κουφωμάτων - Πλαίσιο αλουμινίου με θερμοδιακοπή",
        unit: "€/m²",
        maxUnitPrice: 320,
        maxAmount: 10000,
        energySpecsOptions: "U < 1.8",
    },
    {
        info: "Θερμομόνωση",
        expenseCategory: "Θερμομόνωση",
        interventionCategory: "Θερμομόνωση",
        interventionSubcategory: "Εξωτερική Θερμομόνωση (Κέλυφος)",
        unit: "€/m²",
        maxUnitPrice: 65,
        maxAmount: 8000,
        energySpecsOptions: "Πάχος 10cm",
    },
    {
        info: "Συστήματα Θέρμανσης - Ψύξης",
        expenseCategory: "Συστήματα Θέρμανσης-Ψύξης",
        interventionCategory: "Συστήματα Θέρμανσης-Ψύξης",
        interventionSubcategory: "Αντλία Θερμότητας - Αέρος-Νερού για θέρμανση/ψύξη",
        unit: "€/kW",
        maxUnitPrice: 950,
        maxAmount: 12000,
        energySpecsOptions: "8kW < P ≤ 12kW",
    },
    {
        info: "Συστήματα Παροχής Ζεστού Νερού Χρήσης (ΖΝΧ)",
        expenseCategory: "ΖΝΧ",
        interventionCategory: "ΖΝΧ",
        interventionSubcategory: "Ηλιακός θερμοσίφωνας - Επιλεκτικός συλλέκτης κενού",
        unit: "€/μονάδα",
        maxUnitPrice: 1800,
        maxAmount: 2000,
        energySpecsOptions: "200L",
    },
     {
        info: "Λοιπές Παρεμβάσεις Εξοικονόμησης Ενέργειας",
        expenseCategory: "Λοιπές Παρεμβάσεις",
        interventionCategory: "Λοιπές Παρεμβάσεις",
        interventionSubcategory: "Φωτοβολταϊκό Σύστημα - Net metering",
        unit: "€/kW",
        maxUnitPrice: 1300,
        maxAmount: 15000,
    }
];


// Stages for Project 1 (On Track)
const project1_intervention1_stages: Stage[] = [
    { id: 'p1i1s1', title: 'Έγκριση Προσφοράς', status: 'completed', deadline: new Date(Date.now() - 30 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Ιωάννης Παπαδόπουλος' },
    { id: 'p1i1s2', title: 'Τεχνική Μελέτη Κουφωμάτων', status: 'completed', deadline: new Date(Date.now() - 15 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Γιώργος Τεχνικός' },
    { id: 'p1i1s3', title: 'Παραγγελία Κουφωμάτων', status: 'in progress', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Μαρία Προμηθεύτρια' },
    { id: 'p1i1s4', title: 'Τοποθέτηση', status: 'pending', deadline: new Date(Date.now() + 30 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
];

const project1_intervention2_stages: Stage[] = [
    { id: 'p1i2s1', title: 'Μελέτη Θερμομόνωσης', status: 'completed', deadline: new Date(Date.now() - 20 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Γιώργος Τεχνικός' },
    { id: 'p1i2s2', title: 'Εφαρμογή Κελύφους', status: 'pending', deadline: new Date(Date.now() + 45 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Κώστας Μάστορας' },
];

const proj1Interventions: ProjectIntervention[] = [
    { 
        masterId: "dummy-id-1", 
        expenseCategory: "Κουφώματα (I)", 
        interventionCategory: "Κουφώματα", 
        interventionSubcategory: "Αντικατάσταση Κουφωμάτων",
        maxUnitPrice: 320,
        quantity: 20, 
        totalCost: 6400, 
        stages: project1_intervention1_stages,
        subInterventions: [
            { id: 'sub2', subcategoryCode: '1.Γ2', description: 'Πλαίσιο PVC με υαλοπίνακα - Εξωστόθυρα (U < 2,0)', cost: 2867.74 },
            { id: 'sub1', subcategoryCode: '1.Γ1', description: 'Πλαίσιο PVC με υαλοπίνακα - Παράθυρο (U < 2,0)', cost: 75.00 },
            { id: 'sub3', subcategoryCode: '1.Ε1', description: 'Εξωτερικό προστατευτικό φύλλο (σύστημα Κουτί–Ρολό, ή Εξώφυλλο)', cost: 1638.71 },
        ]
    },
    { masterId: "dummy-id-2", expenseCategory: "Θερμομόνωση (II)", interventionCategory: "Θερμομόνωση", interventionSubcategory: "Εξωτερική Θερμομόνωση (Κέλυφος)", maxUnitPrice: 65, quantity: 120, totalCost: 7800, stages: project1_intervention2_stages },
];


// Stages for Project 2 (Delayed)
const project2_intervention1_stages: Stage[] = [
    { id: 'p2i1s1', title: 'Υποβολή Αίτησης', status: 'completed', deadline: new Date(Date.now() - 60 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
    { id: 'p2i1s2', title: 'Έγκριση Δανείου', status: 'completed', deadline: new Date(Date.now() - 45 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
    { id: 'p2i1s3', title: 'Μελέτη Αντλίας Θερμότητας', status: 'in progress', deadline: new Date(Date.now() - 5 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 15 * 86400000).toISOString(), notes: 'Καθυστέρηση στην παράδοση των σχεδίων από τον μηχανικό.', assigneeContactId: 'Κώστας Μάστορας', files: [] },
    { id: 'p2i1s4', title: 'Εγκατάσταση & Πληρωμή', status: 'pending', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Νίκος Λογιστής' },
];

const proj2Interventions: ProjectIntervention[] = [
    { masterId: "dummy-id-3", expenseCategory: "Συστήματα Θέρμανσης-Ψύξης (III)", interventionCategory: "Συστήματα Θέρμανσης-Ψύξης", interventionSubcategory: "Αντλία Θερμότητας", maxUnitPrice: 950, quantity: 10, totalCost: 9500, stages: project2_intervention1_stages },
];

// Stages for Project 3 (Completed)
const project3_intervention1_stages: Stage[] = [
    { id: 'p3i1s1', title: 'Παραγγελία Φ/Β', status: 'completed', deadline: new Date(Date.now() - 90 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 85 * 86400000).toISOString(), files: [] },
    { id: 'p3i1s2', title: 'Διαδικασίες ΔΕΔΔΗΕ', status: 'completed', deadline: new Date(Date.now() - 60 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 55 * 86400000).toISOString(), files: [] },
    { id: 'p3i1s3', title: 'Εγκατάσταση & Σύνδεση', status: 'completed', deadline: new Date(Date.now() - 30 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 25 * 86400000).toISOString(), files: [] },
];

const proj3Interventions: ProjectIntervention[] = [
    { masterId: "dummy-id-5", expenseCategory: "Λοιπές Παρεμβάσεις (V)", interventionCategory: "Λοιπές Παρεμβάσεις", interventionSubcategory: "Φωτοβολταϊκό Σύστημα", maxUnitPrice: 1300, quantity: 5, totalCost: 6500, stages: project3_intervention1_stages },
];


export const projectsMockData: Omit<Project, 'id' | 'progress' | 'status' | 'alerts'>[] = [
    {
      title: "Ανακαίνιση Μονοκατοικίας στο Μαρούσι",
      applicationNumber: "ΕΞ-2024-001",
      ownerContactId: "Ιωάννης Παπαδόπουλος",
      deadline: "2025-05-30T23:59:59Z",
      interventions: proj1Interventions,
      budget: proj1Interventions.reduce((sum, i) => sum + i.totalCost, 0),
      auditLog: [],
    },
    {
      title: "Ενεργειακή Αναβάθμιση Διαμερίσματος στην Πάτρα",
      applicationNumber: "ΕΞ-2024-002",
      ownerContactId: "Μαρία Γεωργίου",
      deadline: "2025-02-28T23:59:59Z",
      interventions: proj2Interventions,
      budget: proj2Interventions.reduce((sum, i) => sum + i.totalCost, 0),
      auditLog: [],
    },
    {
      title: "Εγκατάσταση Φ/Β σε Επαγγελματικό Χώρο",
      applicationNumber: "ΕΞ-2023-157",
      ownerContactId: "Εταιρεία Α.Ε.",
      deadline: "2024-11-20T23:59:59Z",
      interventions: proj3Interventions,
      budget: proj3Interventions.reduce((sum, i) => sum + i.totalCost, 0),
      auditLog: [],
    },
];

// Data for custom lists seeding
export const customListsSeedData: Omit<CustomList, 'id'>[] = [
    { name: 'Κωδικός', key: 'CODE' },
    { name: 'Κατηγορία Παρέμβασης', key: 'INTERVENTION_CATEGORY' },
    { name: 'Κατηγορία Δαπάνης', key: 'EXPENSE_CATEGORY' },
    { name: 'Υπο-Κατηγορία Παρέμβασης', key: 'SUB_INTERVENTION_CATEGORY' },
    { name: 'info', key: 'INFO' },
    { name: 'Ενεργειακά Χαρακτηριστικά', key: 'ENERGY_SPECS' },
    { name: 'τίτλοι παρεμβάσεων', key: 'INTERVENTION_TITLES' },
    { name: 'Ρόλοι Επαφών', key: 'CONTACT_ROLES' },
    { name: 'Μονάδες Μέτρησης', key: 'UNIT_OF_MEASUREMENT' },
];

export const customListItemsSeedData: { listKey: string; items: string[] }[] = [
    { listKey: 'CODE', items: ["1.A1", "1.B1", "1.C1", "1.D1", "1.E1", "1.Γ1", "1.Γ2", "1.Ε1"] },
    { listKey: 'INTERVENTION_CATEGORY', items: ["Κουφώματα", "Θερμομόνωση", "Συστήματα Θέρμανσης-Ψύξης", "ΖΝΧ", "Λοιπές Παρεμβάσεις"] },
    { listKey: 'EXPENSE_CATEGORY', items: ["Κουφώματα (I)", "Θερμομόνωση (II)", "Συστήματα Θέρμανσης-Ψύξης (III)", "ΖΝΧ (IV)", "Λοιπές Παρεμβάσεις (V)"] },
    { listKey: 'SUB_INTERVENTION_CATEGORY', items: ["Πλαίσιο PVC με υαλοπίνακα - Παράθυρο (U < 2,0)", "Πλαίσιο PVC με υαλοπίνακα - Εξωστόθυρα (U < 2,0)", "Εξωτερικό προστατευτικό φύλλο (σύστημα Κουτί–Ρολό, ή Εξώφυλλο)"] },
    { listKey: 'INFO', items: ["Κουφώματα – Υαλοπίνακες – Συστήματα Σκίασης", "Θερμομόνωση", "Συστήματα Θέρμανσης - Ψύξης", "Συστήματα Παροχής Ζεστού Νερού Χρήσης (ΖΝΧ)", "Λοιπές Παρεμβάσεις Εξοικονόμησης Ενέργειας"] },
    { listKey: 'ENERGY_SPECS', items: ["U < 1.8", "Πάχος 10cm", "8kW < P ≤ 12kW", "200L"] },
    { listKey: 'INTERVENTION_TITLES', items: ["Αντικατάσταση Κουφωμάτων", "Εξωτερική Θερμομόνωση (Κέλυφος)", "Αντλία Θερμότητας", "Ηλιακός θερμοσίφωνας", "Φωτοβολταϊκό Σύστημα"] },
    { listKey: 'CONTACT_ROLES', items: ["Πελάτης", "Προμηθευτής", "Τεχνίτης", "Λογιστήριο", "Μηχανικός", "Συνεργείο", "Άλλο"] },
    { listKey: 'UNIT_OF_MEASUREMENT', items: ["€/m²", "€/kW", "€/μονάδα", "€/αίτηση", "τεμ.", "m", "m²", "m³", "kW", "kWh"] },
];
