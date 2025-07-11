
"use server";

import { processMessage } from "@/ai/flows/message-processor";
import type { ProcessMessageInput } from "@/ai/flows/schemas";
import { generateReminder, GenerateReminderInput } from "@/ai/flows/ai-smart-reminders";
import { headers } from 'next/headers';
import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { addProject as addProjectData, getProjectById, users, findInterventionAndStage, updateProject as updateProjectData, deleteProject as deleteProjectData } from '@/lib/data';
import { getMasterInterventionById, addMasterIntervention, updateMasterIntervention, deleteMasterIntervention } from "@/lib/interventions-data";
import type { Project, ProjectIntervention, Stage, Unit, ExpenseCategory } from '@/types';
import { addContact, updateContact, deleteContact } from '@/lib/contacts-data';
import { expenseCategories, units } from '@/types';
import { adminDb } from "@/lib/firebase-admin";
import { contactsData, masterInterventionsData, projectsMockData } from "@/lib/mock-data";


export async function processDocumentAction(input: ProcessMessageInput) {
  try {
    const result = await processMessage(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to process document." };
  }
}

export async function generateReminderAction(input: GenerateReminderInput) {
  try {
    const result = await generateReminder(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate reminder." };
  }
}

export async function setTelegramWebhookAction() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        return { success: false, error: 'Telegram Bot Token is not configured in .env file.' };
    }

    const host = headers().get('host');
    const protocol = headers().get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https');
    const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;
    const TELEGRAM_API = `https://api.telegram.org/bot${token}`;

    try {
        await axios.post(`${TELEGRAM_API}/setWebhook`, {
          url: webhookUrl,
          drop_pending_updates: true,
        });

        const { data } = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
        const webhookInfo = data.result;
        
        if (webhookInfo.url === webhookUrl) {
            return { success: true, message: `Webhook set successfully to: ${webhookUrl}` };
        } else {
             return { success: false, error: `Failed to set webhook. Telegram API reports current webhook is: ${webhookInfo.url}` };
        }
    } catch (error: any) {
        console.error('Failed to set Telegram webhook:', error);
        const errorMessage = error.response?.data?.description || error.message || 'An unknown error occurred.';
        return { success: false, error: `An error occurred while setting the webhook: ${errorMessage}` };
    }
}

const CreateProjectSchema = z.object({
  title: z.string({invalid_type_error: "Παρακαλώ εισάγετε έναν έγκυρο τίτλο."}).min(3, "Ο τίτλος του έργου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  ownerContactId: z.string().min(1, "Παρακαλώ επιλέξτε έναν ιδιοκτήτη."),
  deadline: z.string().optional(),
});

export async function createProjectAction(prevState: any, formData: FormData) {
  const validatedFields = CreateProjectSchema.safeParse({
    title: formData.get('title'),
    ownerContactId: formData.get('ownerContactId'),
    deadline: formData.get('deadline'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία με σφάλμα και προσπαθήστε ξανά.',
    };
  }

  const { title, ownerContactId, deadline } = validatedFields.data;

  const newProject: Omit<Project, 'id' | 'progress' | 'status' | 'alerts'> = {
    title,
    ownerContactId,
    deadline: deadline ? new Date(deadline).toISOString() : undefined,
    interventions: [],
    budget: 0,
    auditLog: [
        {
            id: `log-${Date.now()}`,
            user: users[0], // Assume admin is creating for now
            action: 'Δημιουργία Έργου',
            timestamp: new Date().toISOString(),
            details: `Το έργο "${title}" δημιουργήθηκε.`
        }
    ],
  };

  try {
    await addProjectData(newProject);
  } catch (error) {
    return { message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η δημιουργία του έργου.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

const UpdateProjectSchema = z.object({
    id: z.string().min(1, "Το ID του έργου είναι απαραίτητο."),
    title: z.string({invalid_type_error: "Παρακαλώ εισάγετε έναν έγκυρο τίτλο."}).min(3, "Ο τίτλος του έργου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
    ownerContactId: z.string().min(1, "Παρακαλώ επιλέξτε έναν ιδιοκτήτη."),
    deadline: z.string().optional(),
});

export async function updateProjectAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateProjectSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        ownerContactId: formData.get('ownerContactId'),
        deadline: formData.get('deadline'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
        };
    }

    const { id, title, ownerContactId, deadline } = validatedFields.data;
    
    const projectData = {
        title,
        ownerContactId,
        deadline: deadline ? new Date(deadline).toISOString() : '',
    };

    try {
        const success = await updateProjectData(id, projectData);
        if (!success) {
            throw new Error("Project not found");
        }
    } catch (error) {
        return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η ενημέρωση του έργου.' };
    }

    revalidatePath('/dashboard');
    revalidatePath(`/projects/${id}`);
    return { success: true, message: 'Το έργο ενημερώθηκε με επιτυχία.' };
}


const DeleteProjectSchema = z.object({
  id: z.string().min(1),
});

export async function deleteProjectAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteProjectSchema.safeParse({
        id: formData.get('id'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα.' };
    }

    try {
        await deleteProjectData(validatedFields.data.id);
    } catch (error) {
        return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η διαγραφή του έργου.' };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Το έργο διαγράφηκε με επιτυχία.' };
}


const AddInterventionSchema = z.object({
  projectId: z.string(),
  masterId: z.string().min(1, "Παρακαλώ επιλέξτε μια παρέμβαση."),
  quantity: z.coerce.number().min(0.1, "Η ποσότητα πρέπει να είναι τουλάχιστον 0.1."),
  selectedEnergySpec: z.string().optional(),
  selectedSystemClass: z.string().optional(),
});

export async function addInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = AddInterventionSchema.safeParse({
    projectId: formData.get('projectId'),
    masterId: formData.get('masterId'),
    quantity: formData.get('quantity'),
    selectedEnergySpec: formData.get('selectedEnergySpec'),
    selectedSystemClass: formData.get('selectedSystemClass'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
    };
  }
  
  const { projectId, masterId, quantity, selectedEnergySpec, selectedSystemClass } = validatedFields.data;

  const project = await getProjectById(projectId);
  const masterIntervention = await getMasterInterventionById(masterId);

  if (!project || !masterIntervention) {
    return { success: false, errors: {}, message: 'Σφάλμα: Δεν βρέθηκε το έργο ή η παρέμβαση.' };
  }
  
  if (project.interventions.some(i => i.masterId === masterId)) {
    return { success: false, errors: { masterId: ['Αυτή η παρέμβαση υπάρχει ήδη στο έργο.'] }, message: 'Η παρέμβαση υπάρχει ήδη.' };
  }

  const totalCost = Math.min(quantity * masterIntervention.maxUnitPrice, masterIntervention.maxAmount);

  const generateStages = (interventionId: string): Stage[] => [
    { id: `${interventionId}-stage-1`, title: 'Υποβολή Αίτησης', status: 'pending', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date().toISOString(), files: [], notes: '' },
    { id: `${interventionId}-stage-2`, title: 'Τεχνική Μελέτη', status: 'pending', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
    { id: `${interventionId}-stage-3`, title: 'Εγκατάσταση', status: 'pending', deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
    { id: `${interventionId}-stage-4`, title: 'Ολοκλήρωση & Πληρωμή', status: 'pending', deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
  ];
  
  const newIntervention: ProjectIntervention = {
    ...masterIntervention,
    masterId: masterIntervention.id,
    quantity,
    totalCost,
    selectedEnergySpec: selectedEnergySpec || undefined,
    selectedSystemClass: selectedSystemClass || undefined,
    stages: generateStages(masterIntervention.id),
  };

  project.interventions.push(newIntervention);
  project.budget = project.interventions.reduce((sum, i) => sum + i.totalCost, 0);
  project.auditLog.unshift({
    id: `log-${Date.now()}`,
    user: users[0],
    action: 'Προσθήκη Παρέμβασης',
    timestamp: new Date().toISOString(),
    details: `Προστέθηκε: "${newIntervention.interventionCategory}".`,
  });
  
  await updateProjectData(projectId, project);

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση προστέθηκε με επιτυχία.' };
}

const UpdateInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  quantity: z.coerce.number().min(0.1, "Η ποσότητα πρέπει να είναι τουλάχιστον 0.1."),
  selectedEnergySpec: z.string().optional(),
  selectedSystemClass: z.string().optional(),
});

export async function updateInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = UpdateInterventionSchema.safeParse({
    projectId: formData.get('projectId'),
    interventionMasterId: formData.get('interventionMasterId'),
    quantity: formData.get('quantity'),
    selectedEnergySpec: formData.get('selectedEnergySpec'),
    selectedSystemClass: formData.get('selectedSystemClass'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
    };
  }
  
  const { projectId, interventionMasterId, quantity, selectedEnergySpec, selectedSystemClass } = validatedFields.data;

  const project = await getProjectById(projectId);
  if (!project) {
    return { success: false, errors: {}, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
  }

  const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
  if (!intervention) {
    return { success: false, errors: {}, message: 'Σφάλμα: Η παρέμβαση δεν βρέθηκε.' };
  }

  if (intervention.stages.some(s => s.status === 'completed')) {
    return { 
      success: false, 
      errors: {}, 
      message: 'Δεν επιτρέπεται η επεξεργασία παρέμβασης με ολοκληρωμένα στάδια.' 
    };
  }

  intervention.quantity = quantity;
  intervention.selectedEnergySpec = selectedEnergySpec || undefined;
  intervention.selectedSystemClass = selectedSystemClass || undefined;
  intervention.totalCost = Math.min(quantity * intervention.maxUnitPrice, intervention.maxAmount);

  project.budget = project.interventions.reduce((sum, i) => sum + i.totalCost, 0);

  project.auditLog.unshift({
    id: `log-${Date.now()}`,
    user: users[0], // Assume admin
    action: 'Επεξεργασία Παρέμβασης',
    timestamp: new Date().toISOString(),
    details: `Ενημερώθηκε: "${intervention.interventionCategory}". Νέα ποσότητα: ${quantity}.`,
  });

  await updateProjectData(projectId, project);

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση ενημερώθηκε με επιτυχία.' };
}

const DeleteInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
});

export async function deleteInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = DeleteInterventionSchema.safeParse({
    projectId: formData.get('projectId'),
    interventionMasterId: formData.get('interventionMasterId'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Μη έγκυρα δεδομένα.',
    };
  }

  const { projectId, interventionMasterId } = validatedFields.data;

  const project = await getProjectById(projectId);
  if (!project) {
    return { success: false, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
  }

  const interventionIndex = project.interventions.findIndex(i => i.masterId === interventionMasterId);
  if (interventionIndex === -1) {
    return { success: false, message: 'Σφάλμα: Η παρέμβαση δεν βρέθηκε.' };
  }

  const intervention = project.interventions[interventionIndex];

  const canDelete = intervention.stages.every(s => s.status === 'pending');
  if (!canDelete) {
    return {
      success: false,
      message: 'Δεν επιτρέπεται η διαγραφή παρέμβασης με στάδια σε εξέλιξη ή ολοκληρωμένα.',
    };
  }
  
  project.interventions.splice(interventionIndex, 1);

  project.budget = project.interventions.reduce((sum, i) => sum + i.totalCost, 0);

  project.auditLog.unshift({
    id: `log-${Date.now()}`,
    user: users[0],
    action: 'Διαγραφή Παρέμβασης',
    timestamp: new Date().toISOString(),
    details: `Διαγράφηκε: "${intervention.interventionCategory}".`,
  });

  await updateProjectData(projectId, project);

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση διαγράφηκε με επιτυχία.' };
}

const UpdateStageSchema = z.object({
  projectId: z.string(),
  stageId: z.string(),
  title: z.string().min(3, "Ο τίτλος του σταδίου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Παρακαλώ εισάγετε μια έγκυρη ημερομηνία." }),
  notes: z.string().optional(),
  assigneeContactId: z.string().optional(),
});

export async function updateStageAction(prevState: any, formData: FormData) {
  const validatedFields = UpdateStageSchema.safeParse({
    projectId: formData.get('projectId'),
    stageId: formData.get('stageId'),
    title: formData.get('title'),
    deadline: formData.get('deadline'),
    notes: formData.get('notes'),
    assigneeContactId: formData.get('assigneeContactId'),
  });

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.' };
  }

  const { projectId, stageId, title, deadline, notes, assigneeContactId } = validatedFields.data;

  const lookup = await findInterventionAndStage(projectId, stageId);
  if (!lookup) {
    return { success: false, errors: {}, message: 'Σφάλμα: Το στάδιο ή το έργο δεν βρέθηκε.' };
  }

  const { project, intervention, stage } = lookup;
  
  if (project.deadline && new Date(deadline) > new Date(project.deadline)) {
      const formattedDeadline = new Date(project.deadline).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return { success: false, errors: { deadline: [`Η ημερομηνία λήξης δεν μπορεί να είναι μετά την προθεσμία του έργου (${formattedDeadline}).`] }, message: 'Σφάλμα επικύρωσης.' };
  }

  if (stage.status === 'completed') {
    return { success: false, errors: {}, message: 'Δεν επιτρέπεται η επεξεργασία ολοκληρωμένου σταδίου.' };
  }

  stage.title = title;
  stage.deadline = new Date(deadline).toISOString();
  stage.notes = notes || '';
  stage.assigneeContactId = assigneeContactId === 'none' ? undefined : assigneeContactId;
  stage.lastUpdated = new Date().toISOString();

  project.auditLog.unshift({
    id: `log-${Date.now()}`,
    user: users[0], 
    action: 'Επεξεργασία Σταδίου',
    timestamp: new Date().toISOString(),
    details: `Ενημερώθηκε το στάδιο "${title}" στην παρέμβαση "${intervention.interventionCategory}".`,
  });

  await updateProjectData(projectId, project);

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Το στάδιο ενημερώθηκε με επιτυχία.' };
}


const DeleteStageSchema = z.object({
  projectId: z.string(),
  stageId: z.string(),
});

export async function deleteStageAction(prevState: any, formData: FormData) {
  const validatedFields = DeleteStageSchema.safeParse({
    projectId: formData.get('projectId'),
    stageId: formData.get('stageId'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Μη έγκυρα δεδομένα.' };
  }

  const { projectId, stageId } = validatedFields.data;

  const lookup = await findInterventionAndStage(projectId, stageId);
  if (!lookup) {
    return { success: false, message: 'Σφάλμα: Το στάδιο ή το έργο δεν βρέθηκε.' };
  }

  const { project, intervention, stage } = lookup;

  if (stage.status === 'completed') {
    return { success: false, message: 'Δεν επιτρέπεται η διαγραφή ολοκληρωμένου σταδίου.' };
  }
  
  const stageIndex = intervention.stages.findIndex(s => s.id === stageId);
  if (stageIndex === -1) {
     return { success: false, message: 'Σφάλμα: Το στάδιο δεν βρέθηκε στην παρέμβαση.' };
  }

  intervention.stages.splice(stageIndex, 1);

  project.auditLog.unshift({
    id: `log-${Date.now()}`,
    user: users[0],
    action: 'Διαγραφή Σταδίου',
    timestamp: new Date().toISOString(),
    details: `Διαγράφηκε το στάδιο "${stage.title}" από την παρέμβαση "${intervention.interventionCategory}".`,
  });

  await updateProjectData(projectId, project);

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Το στάδιο διαγράφηκε με επιτυχία.' };
}

const AddStageSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  title: z.string().min(3, "Ο τίτλος του σταδίου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Παρακαλώ εισάγετε μια έγκυρη ημερομηνία." }),
  notes: z.string().optional(),
  assigneeContactId: z.string().optional(),
});

export async function addStageAction(prevState: any, formData: FormData) {
  const validatedFields = AddStageSchema.safeParse({
    projectId: formData.get('projectId'),
    interventionMasterId: formData.get('interventionMasterId'),
    title: formData.get('title'),
    deadline: formData.get('deadline'),
    notes: formData.get('notes'),
    assigneeContactId: formData.get('assigneeContactId'),
  });

  if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.' };
  }

  const { projectId, interventionMasterId, title, deadline, notes, assigneeContactId } = validatedFields.data;

  const project = await getProjectById(projectId);
  if (!project) {
      return { success: false, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
  }
  
  if (project.deadline && new Date(deadline) > new Date(project.deadline)) {
      const formattedDeadline = new Date(project.deadline).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return { success: false, errors: { deadline: [`Η ημερομηνία λήξης δεν μπορεί να είναι μετά την προθεσμία του έργου (${formattedDeadline}).`] }, message: 'Σφάλμα επικύρωσης.' };
  }

  const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
  if (!intervention) {
      return { success: false, message: 'Σφάλμα: Η παρέμβαση δεν βρέθηκε.' };
  }

  const newStage: Stage = {
      id: `${intervention.masterId}-stage-${Date.now()}`,
      title,
      status: 'pending',
      deadline: new Date(deadline).toISOString(),
      lastUpdated: new Date().toISOString(),
      files: [],
      notes: notes || '',
      assigneeContactId: assigneeContactId === 'none' ? undefined : assigneeContactId,
  };

  intervention.stages.push(newStage);

  project.auditLog.unshift({
    id: `log-${Date.now()}`,
    user: users[0],
    action: 'Προσθήκη Σταδίου',
    timestamp: new Date().toISOString(),
    details: `Προστέθηκε το στάδιο "${title}" στην παρέμβαση "${intervention.interventionCategory}".`,
  });
  
  await updateProjectData(projectId, project);

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Το στάδιο προστέθηκε με επιτυχία.' };
}

const ContactSchema = z.object({
  name: z.string().min(3, "Το όνομα πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  email: z.string().email("Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email."),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["Προμηθευτής", "Τεχνίτης", "Πελάτης", "Λογιστήριο", "Συνεργείο", "Μηχανικός", "Άλλο"]),
  specialty: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().url("Παρακαλώ εισάγετε ένα έγκυρο URL για το avatar.").optional().or(z.literal('')),
  notes: z.string().optional(),
});

export async function createContactAction(prevState: any, formData: FormData) {
  const validatedFields = ContactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    role: formData.get('role'),
    specialty: formData.get('specialty'),
    company: formData.get('company'),
    avatar: formData.get('avatar'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
    };
  }

  try {
    await addContact(validatedFields.data);
  } catch (error) {
    return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η δημιουργία της επαφής.' };
  }
  
  revalidatePath('/contacts');
  return { success: true, message: 'Η επαφή δημιουργήθηκε με επιτυχία.' };
}

const UpdateContactSchema = ContactSchema.extend({
  id: z.string().min(1),
});

export async function updateContactAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateContactSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        role: formData.get('role'),
        specialty: formData.get('specialty'),
        company: formData.get('company'),
        avatar: formData.get('avatar'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
        };
    }

    const { id, ...contactData } = validatedFields.data;

    try {
        const success = await updateContact(id, contactData);
        if (!success) throw new Error("Contact not found");
    } catch (error) {
        return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η ενημέρωση της επαφής.' };
    }

    revalidatePath('/contacts');
    return { success: true, message: 'Η επαφή ενημερώθηκε με επιτυχία.' };
}

const DeleteContactSchema = z.object({
  id: z.string().min(1),
});

export async function deleteContactAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteContactSchema.safeParse({
        id: formData.get('id'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα.' };
    }

    try {
        await deleteContact(validatedFields.data.id);
    } catch (error) {
        return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η διαγραφή της επαφής.' };
    }

    revalidatePath('/contacts');
    return { success: true, message: 'Η επαφή διαγράφηκε με επιτυχία.' };
}


// Master Interventions Actions
const stringToArray = z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []);

const MasterInterventionSchema = z.object({
    id: z.string().min(3, "Το ID πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
    expenseCategory: z.enum(expenseCategories, { invalid_type_error: "Επιλέξτε μια έγκυρη κατηγορία δαπάνης." }),
    interventionCategory: z.string().min(3, "Η κατηγορία παρέμβασης είναι υποχρεωτική."),
    interventionSubcategory: z.string().optional(),
    unit: z.enum(units, { invalid_type_error: "Επιλέξτε μια έγκυρη μονάδα." }),
    maxUnitPrice: z.coerce.number().positive("Το κόστος/μονάδα πρέπει να είναι θετικός αριθμός."),
    maxAmount: z.coerce.number().positive("Η μέγ. δαπάνη πρέπει να είναι θετικός αριθμός."),
    energySpecsOptions: stringToArray,
    systemClassOptions: stringToArray,
    notes: z.string().optional(),
});


export async function createMasterInterventionAction(prevState: any, formData: FormData) {
    const validatedFields = MasterInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    const { id, ...data } = validatedFields.data;

    try {
        const success = await addMasterIntervention(id, data);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error) {
        return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η δημιουργία της παρέμβασης.' };
    }
    
    revalidatePath('/admin');
    return { success: true, message: 'Η master παρέμβαση δημιουργήθηκε με επιτυχία.' };
}

export async function updateMasterInterventionAction(prevState: any, formData: FormData) {
    const validatedFields = MasterInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    const { id, ...data } = validatedFields.data;

    try {
        const success = await updateMasterIntervention(id, data);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error) {
        return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η ενημέρωση της παρέμβασης.' };
    }
    
    revalidatePath('/admin');
    return { success: true, message: 'Η master παρέμβαση ενημερώθηκε με επιτυχία.' };
}

const DeleteMasterInterventionSchema = z.object({
  id: z.string().min(1),
});

export async function deleteMasterInterventionAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteMasterInterventionSchema.safeParse({
        id: formData.get('id'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρο ID.' };
    }

    try {
        const success = await deleteMasterIntervention(validatedFields.data.id);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error) {
        return { success: false, message: 'Σφάλμα Βάσης Δεδομένων: Απέτυχε η διαγραφή της παρέμβασης.' };
    }

    revalidatePath('/admin');
    return { success: true, message: 'Η master παρέμβαση διαγράφηκε με επιτυχία.' };
}

export async function seedDatabaseAction() {
    try {
        const projectsCollection = adminDb.collection('projects');
        const contactsCollection = adminDb.collection('contacts');
        const masterInterventionsCollection = adminDb.collection('masterInterventions');

        const projectsSnapshot = await projectsCollection.limit(1).get();
        const contactsSnapshot = await contactsCollection.limit(1).get();
        const masterInterventionsSnapshot = await masterInterventionsCollection.limit(1).get();

        if (!projectsSnapshot.empty || !contactsSnapshot.empty || !masterInterventionsSnapshot.empty) {
            return { success: false, error: 'Η βάση δεδομένων έχει ήδη δεδομένα. Το seeding ακυρώθηκε.' };
        }

        const batch = adminDb.batch();

        // Seed Contacts
        const contactIdMap: Record<string, string> = {};
        contactsData.forEach((contact, index) => {
            const docRef = contactsCollection.doc(); // Firestore generates ID
            batch.set(docRef, contact);
            // Map old mock ID to new Firestore ID
            contactIdMap[`contact-${index + 1}`] = docRef.id;
        });

        // Seed Master Interventions
        const masterInterventionIdMap: Record<string, string> = {};
        masterInterventionsData.forEach((intervention) => {
            // Use predefined IDs for master interventions
            const id = intervention.interventionCategory.toLowerCase().replace(/ /g, '-').slice(0, 15) + '-' + Math.random().toString(36).substring(2, 7);
            const docRef = masterInterventionsCollection.doc(id);
            batch.set(docRef, intervention);
            masterInterventionIdMap[intervention.interventionCategory] = id;
        });

        // Seed Projects
        projectsMockData.forEach(project => {
            const docRef = projectsCollection.doc();
            const updatedProject = {
                ...project,
                // Replace mock ownerContactId with new Firestore ID
                ownerContactId: contactIdMap[project.ownerContactId!] || null,
            };
            batch.set(docRef, updatedProject);
        });

        await batch.commit();

        revalidatePath('/');
        return { success: true, message: 'Η βάση δεδομένων αρχικοποιήθηκε με επιτυχία.' };

    } catch (error: any) {
        console.error("Database seeding failed:", error);
        return { success: false, error: `Η αρχικοποίηση απέτυχε: ${error.message}` };
    }
}
