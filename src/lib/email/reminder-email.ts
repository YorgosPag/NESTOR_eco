/**
 * @fileoverview Generates the email body for an AI-powered smart reminder.
 */

import type { Stage, Contact, GenerateReminderOutput } from "@/types";
import { getSignature } from './signatures';
import { createSection } from './helpers';

interface ReminderEmailPayload {
    stage: Stage;
    projectName: string;
    assignee: Contact;
    owner?: Contact;
    result: GenerateReminderOutput;
    senderEmail: string;
    urgencyConfig: any;
}

function generateOwnerInfoSection(owner: Contact): string[] {
    const fullAddress = [
      owner.addressStreet,
      owner.addressNumber,
      owner.addressArea,
      owner.addressPostalCode,
      owner.addressCity,
      owner.addressPrefecture,
    ].filter(Boolean).join(", ");
    
    return createSection('ΣΤΟΙΧΕIA ΕΠΙΚΟΙΝΩΝΙΑΣ ΙΔΙΟΚΤΗΤΗ', [
        `• Όνομα: ${owner.firstName} ${owner.lastName}`,
        `• Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δ/Υ'}`,
        `• Διεύθυνση: ${fullAddress || 'Δ/Υ'}`,
    ]);
}

export function generateReminderEmailBody({
    stage,
    projectName,
    assignee,
    owner,
    result,
    senderEmail,
    urgencyConfig
}: ReminderEmailPayload): string {
    const bodyParts: string[] = [];

    const reminderSection = createSection('ΥΠΕΝΘΥΜΙΣΗ', [result.reminder]);
    const assessmentSection = createSection('ΑΞΙΟΛΟΓΗΣΗ ΚΑΤΑΣΤΑΣΗΣ', [
        `ΕΠΙΠΕΔΟ ΕΠΕΙΓΟΝΤΟΣ: ${urgencyConfig[result.urgencyLevel].text}`,
        `> ${result.riskAssessment}`,
    ]);
    const stepsSection = createSection('ΠΡΟΤΕΙΝΟΜΕΝΑ ΕΠΟΜΕΝΑ ΒΗΜΑΤΑ', (result.suggestedNextSteps || []).map(step => `• ${step}`));
    const notesSection = createSection('ΠΡΟΣΘΕΤΕΣ ΣΗΜΕΙΩΣΕΙΣ', [stage.notes]);

    bodyParts.push(
      `Αγαπητέ/ή ${assignee.firstName} ${assignee.lastName},`,
      ``,
      `Ακολουθεί μια αυτοματοποιημένη υπενθύμιση από το σύστημα NESTOR eco σχετικά με το στάδιο "${stage.title}" για το έργο "${projectName}".`,
      `\n==================================================`,
      ...reminderSection,
      ...assessmentSection,
      ...stepsSection,
      ...notesSection,
    );

    if (owner) {
      bodyParts.push(...generateOwnerInfoSection(owner));
    }
    
    bodyParts.push(
      `\n==================================================`,
      `\nΜε εκτίμηση,`,
      ``,
      ...getSignature(senderEmail)
    );
    
    return bodyParts.join("\n");
}