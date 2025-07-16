
"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { getAllContacts } from "@/lib/contacts-data";
import { getAllProjects as getAllProjectsData } from '@/lib/projects-data';

export async function exportContactsToMarkdownAction() {
  try {
    const db = getAdminDb();
    const contacts = await getAllContacts(db);
    if (contacts.length === 0) {
      return { success: true, data: "Δεν βρέθηκαν επαφές στη βάση δεδομένων." };
    }
    
    let markdown = '# Λίστα Επαφών Βάσης Δεδομένων\n\n';
    markdown += 'Ακολουθούν τα αναλυτικά στοιχεία για όλες τις επαφές που είναι καταχωρημένες στο σύστημα.\n\n---\n\n';

    contacts.forEach((contact, index) => {
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
        const address = [
            contact.addressStreet,
            contact.addressNumber,
            contact.addressArea,
            contact.addressPostalCode,
            contact.addressCity,
            contact.addressPrefecture,
        ].filter(Boolean).join(', ');

        markdown += `### ${index + 1}. ${fullName || 'Επαφή χωρίς όνομα'}\n`;
        if (contact.company) markdown += `- **Εταιρεία:** ${contact.company}\n`;
        if (contact.email) markdown += `- **Email:** ${contact.email}\n`;
        if (contact.mobilePhone) markdown += `- **Κινητό:** ${contact.mobilePhone}\n`;
        if (contact.landlinePhone) markdown += `- **Σταθερό:** ${contact.landlinePhone}\n`;
        if (contact.role) markdown += `- **Ρόλος:** ${contact.role}\n`;
        if (contact.specialty) markdown += `- **Ειδικότητα:** ${contact.specialty}\n`;
        if (address) markdown += `- **Διεύθυνση:** ${address}\n`;
        if (contact.vatNumber) markdown += `- **ΑΦΜ:** ${contact.vatNumber}\n`;
        if (contact.idNumber) markdown += `- **ΑΔΤ:** ${contact.idNumber}\n`;
        if (contact.notes) markdown += `- **Σημειώσεις:** ${contact.notes}\n`;
        markdown += `\n---\n\n`;
    });

    return { success: true, data: markdown };
  } catch (error: any) {
    console.error("🔥 ERROR in exportContactsToMarkdownAction:", error);
    return { success: false, error: `Η εξαγωγή απέτυχε: ${error.message}` };
  }
}

export async function exportProjectsToMarkdownAction() {
  try {
    const db = getAdminDb();
    const [projects, contacts] = await Promise.all([
      getAllProjectsData(db),
      getAllContacts(db),
    ]);

    if (projects.length === 0) {
      return { success: true, data: "Δεν βρέθηκαν έργα στη βάση δεδομένων." };
    }

    let markdown = '# Λίστα Έργων Βάσης Δεδομένων\n\n';
    markdown += 'Ακολουθούν τα αναλυτικά στοιχεία για όλα τα έργα που είναι καταχωρημένα στο σύστημα.\n\n---\n\n';

    projects.forEach((project, index) => {
        const owner = contacts.find(c => c.id === project.ownerContactId);
        markdown += `## ${index + 1}. ${project.title}\n\n`;
        markdown += `- **ID Έργου:** ${project.id}\n`;
        markdown += `- **Αρ. Αίτησης:** ${project.applicationNumber || 'Δ/Υ'}\n`;
        markdown += `- **Ιδιοκτήτης:** ${owner ? `${owner.firstName} ${owner.lastName}` : 'Άγνωστος'}\n`;
        markdown += `- **Κατάσταση:** ${project.status}\n`;
        markdown += `- **Προϋπολογισμός:** €${project.budget.toLocaleString('el-GR')}\n`;
        markdown += `- **Προθεσμία:** ${project.deadline ? new Date(project.deadline).toLocaleDateString('el-GR') : 'Δ/Υ'}\n`;
        
        if (project.interventions.length > 0) {
            markdown += `\n### Παρεμβάσεις (${project.interventions.length}):\n`;
            project.interventions.forEach(intervention => {
                markdown += `\n- **${intervention.interventionCategory} / ${intervention.interventionSubcategory || ''}**\n`;
                if(intervention.subInterventions && intervention.subInterventions.length > 0){
                    markdown += `  - **Ανάλυση Κόστους:**\n`;
                    intervention.subInterventions.forEach(sub => {
                        markdown += `    - ${sub.description}: €${sub.cost.toLocaleString('el-GR')}\n`;
                    });
                }
            });
        }
        
        markdown += `\n---\n\n`;
    });

    return { success: true, data: markdown };
  } catch (error: any) {
    console.error("🔥 ERROR in exportProjectsToMarkdownAction:", error);
    return { success: false, error: `Η εξαγωγή απέτυχε: ${error.message}` };
  }
}
