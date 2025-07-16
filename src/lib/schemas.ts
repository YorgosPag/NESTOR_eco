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
  email: z.string().email().optional().nullable(),
  mobilePhone: z.string().optional().nullable(),
  landlinePhone: z.string().optional().nullable(),
  role: z.string(),
  specialty: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  addressStreet: z.string().optional().nullable(),
  addressNumber: z.string().optional().nullable(),
  addressArea: z.string().optional().nullable(),
  addressPostalCode: z.string().optional().nullable(),
  addressCity: z.string().optional().nullable(),
  addressPrefecture: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  idIssueDate: z.string().optional().nullable(),
  idIssuingAuthority: z.string().optional().nullable(),
  usernameTaxis: z.string().optional().nullable(),
  passwordTaxis: z.string().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  tiktokUrl: z.string().url().optional().nullable(),
})

// --------------------------------
// ✅ Utility Validation Functions
// --------------------------------
export const validateProject = (data: unknown) => ProjectSchema.parse(data)
export const validateContact = (data: unknown) => ContactSchema.parse(data)
