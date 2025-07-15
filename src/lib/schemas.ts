import { z } from "zod"

// --------------------------------
// 🔧 Project Schema
// --------------------------------
export const ProjectStageSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["pending", "in progress", "completed", "failed"]),
  deadline: z.coerce.date(),
  assigneeContactId: z.string().optional(),
  supervisorContactId: z.string().optional(),
  files: z.array(z.any()).optional(),
  lastUpdated: z.string(),
  notes: z.string().optional(),
})

export const SubInterventionSchema = z.object({
  id: z.string(),
  subcategoryCode: z.string(),
  expenseCategory: z.string().optional(),
  description: z.string(),
  cost: z.number(),
  costOfMaterials: z.number().optional(),
  costOfLabor: z.number().optional(),
  quantity: z.number().optional(),
  quantityUnit: z.string().optional(),
  unitCost: z.number().optional(),
  implementedQuantity: z.number().optional(),
  selectedEnergySpec: z.string().optional(),
  displayCode: z.string().optional(),
})

export const ProjectInterventionSchema = z.object({
  masterId: z.string(),
  interventionCategory: z.string(),
  interventionSubcategory: z.string().optional(),
  expenseCategory: z.string(),
  totalCost: z.number(),
  stages: z.array(ProjectStageSchema),
  subInterventions: z.array(SubInterventionSchema).optional(),
  code: z.string().optional(),
  quantity: z.number(),
  selectedEnergySpec: z.string().optional(),
  selectedSystemClass: z.string().optional(),
  costOfMaterials: z.number().optional(),
  costOfLabor: z.number().optional(),
})

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  applicationNumber: z.string().optional(),
  ownerContactId: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["Quotation", "On Track", "Delayed", "Completed"]),
  auditLog: z.array(
    z.object({
      id: z.string(),
      user: z.record(z.any()),
      action: z.string(),
      timestamp: z.string(),
      details: z.string().optional(),
    })
  ),
  interventions: z.array(ProjectInterventionSchema),
  budget: z.number(),
  progress: z.number(),
  alerts: z.number(),
})

// --------------------------------
// 👥 Contact Schema
// --------------------------------
export const ContactSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  mobilePhone: z.string().optional(),
  landlinePhone: z.string().optional(),
  role: z.string(),
  specialty: z.string().optional(),
  company: z.string().optional(),
  vatNumber: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressArea: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCity: z.string().optional(),
  addressPrefecture: z.string().optional(),
  avatar: z.string().url().optional(),
  notes: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  idNumber: z.string().optional(),
  idIssueDate: z.string().optional(),
  idIssuingAuthority: z.string().optional(),
  usernameTaxis: z.string().optional(),
  passwordTaxis: z.string().optional(),
  facebookUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  tiktokUrl: z.string().url().optional(),
})

// --------------------------------
// ✅ Utility Validation Functions
// --------------------------------
export const validateProject = (data: unknown) => ProjectSchema.parse(data)
export const validateContact = (data: unknown) => ContactSchema.parse(data)
