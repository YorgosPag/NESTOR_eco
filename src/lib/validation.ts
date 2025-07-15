
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// Project Schema
export const ProjectSchema = z.object({
  title: z.string().min(1),
  applicationNumber: z.string().optional(),
  ownerContactId: z.string(),
  deadline: z.date().optional(),
  status: z.enum(['Quotation', 'On Track', 'Delayed', 'Completed']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Intervention Schema
export const InterventionSchema = z.object({
  projectId: z.string(),
  masterId: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  totalCost: z.number().nonnegative(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Stage Schema
export const StageSchema = z.object({
  interventionId: z.string(),
  title: z.string().min(1),
  status: z.enum(['pending', 'in progress', 'completed', 'failed']),
  deadline: z.date(),
  assigneeContactId: z.string().optional(),
  supervisorContactId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// File Schema
export const FileSchema = z.object({
  stageId: z.string(),
  name: z.string(),
  url: z.string().url(),
  uploadedBy: z.string(),
  uploadedAt: z.date(),
})

// Contact Schema
export const ContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  mobilePhone: z.string().optional(),
  role: z.string(),
  specialty: z.string().optional(),
  company: z.string().optional(),
  vatNumber: z.string().optional(),
  addressCity: z.string().optional(),
  avatar: z.string().url().optional(),
})

// Audit Log Schema
export const AuditLogSchema = z.object({
  projectId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  action: z.string(),
  details: z.string().optional(),
  timestamp: z.date(),
})

// Types for Inference
export type Project = z.infer<typeof ProjectSchema>
export type Intervention = z.infer<typeof InterventionSchema>
export type Stage = z.infer<typeof StageSchema>
export type File = z.infer<typeof FileSchema>
export type Contact = z.infer<typeof ContactSchema>
export type AuditLog = z.infer<typeof AuditLogSchema>

// Validation Helpers
export function validateProject(data: unknown): Project {
  const result = ProjectSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Invalid project data: ' + result.error.message)
  }
  return result.data
}

export function validateIntervention(data: unknown): Intervention {
  const result = InterventionSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Invalid intervention data: ' + result.error.message)
  }
  return result.data
}

export function validateStage(data: unknown): Stage {
  const result = StageSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Invalid stage data: ' + result.error.message)
  }
  return result.data
}

// React Hook Form Integrations
export function useProjectForm(defaultValues?: Partial<Project>) {
  return useForm<Project>({
    resolver: zodResolver(ProjectSchema),
    defaultValues,
  })
}

export function useInterventionForm(defaultValues?: Partial<Intervention>) {
  return useForm<Intervention>({
    resolver: zodResolver(InterventionSchema),
    defaultValues,
  })
}

export function useStageForm(defaultValues?: Partial<Stage>) {
  return useForm<Stage>({
    resolver: zodResolver(StageSchema),
    defaultValues,
  })
}
