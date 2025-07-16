
/**
 * @fileoverview This file contains helper functions for generating email body content.
 * It helps keep business logic out of UI components.
 */

import type { Project, Stage, ProjectIntervention, Contact } from "@/types";

interface EmailTemplatePayload {
    project: Project;
    stage: Stage;
    selectedInterventions: ProjectIntervention[];
    assignee?: Contact;
    owner?: Contact;
    senderEmail: string;
    includeOwnerInfo: boolean;
    includePricingInfo: boolean;
    invoicingContact?: Contact;
}

export function generateAssignmentEmailBody({
    project,
    stage,
    selectedInterventions,
    assignee,
    owner,
    senderEmail,
    includeOwnerInfo,
    includePricingInfo,
    invoicingContact,
}: EmailTemplatePayload): string {

    const bodyParts: string[] = [];

    const interventionsText = selectedInterventions.map((intervention) => {
        let interventionBlock = `• ΠΑΡΕΜΒΑΣΗ: ${intervention.interventionSubcategory || intervention.interventionCategory}`;
        
        if (intervention.subInterventions && intervention.subInterventions.length > 0) {
            const subInterventionsText = intervention.subInterventions.map((sub, subIndex, arr) => {
                const isLast = subIndex === arr.length - 1;
                const prefix = isLast ? '└─' : '├─';
                const quantityText = sub.quantity ? ` - Ποσότητα: ${sub.quantity} ${sub.quantityUnit || ''}` : '';
                
                const expenseCategory = sub.expenseCategory || '';
                const romanNumeralMatch = expenseCategory.match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
                const romanNumeral = romanNumeralMatch ? ` (${romanNumeralMatch[1]})` : '';

                return `  ${prefix} ${sub.subcategoryCode}${romanNumeral}: ${sub.description}${quantityText}`;
            }).join('\n');
            interventionBlock += `\n${subInterventionsText}`;
        }
        
        return interventionBlock;
    }).join('\n\n');

    let assigneeGreeting = `Αγαπητέ/ή ${assignee ? `${assignee.firstName} ${assignee.lastName}` : "Ανάδοχε"},`;
    
    bodyParts.push(assigneeGreeting);
    bodyParts.push(``);
    bodyParts.push(`Σας ανατίθενται οι παρακάτω εργασίες για το έργο "${project.title}":`);
    bodyParts.push(``);
    bodyParts.push(interventionsText);


    if (stage.notes) {
        bodyParts.push(``);
        bodyParts.push(`ΣΗΜΕΙΩΣΕΙΣ ΓΙΑ ΤΟ ΣΤΑΔΙΟ "${stage.title}":`);
        bodyParts.push(stage.notes);
    }
    
    if (includeOwnerInfo && owner) {
        const ownerFullAddress = [
            owner.addressStreet,
            owner.addressNumber,
            owner.addressArea,
            owner.addressPostalCode,
            owner.addressCity,
            owner.addressPrefecture,
        ].filter(Boolean).join(', ');

        bodyParts.push(``);
        bodyParts.push(`ΣΤΟΙΧΕΙΑ ΙΔΙΟΚΤΗΤΗ ΓΙΑ ΣΥΝΤΟΝΙΣΜΟ:`);
        bodyParts.push(`• Όνομα: ${owner.firstName} ${owner.lastName}`);
        bodyParts.push(`• Τηλέφωνο: ${owner.mobilePhone || owner.landlinePhone || 'Δ/Υ'}`);
        bodyParts.push(`• Διεύθυνση Έργου: ${ownerFullAddress || 'Δ/Υ'}`);
    }

    if (includePricingInfo && invoicingContact) {
      const invoicingAddress = [
          invoicingContact.addressStreet,
          invoicingContact.addressNumber,
          invoicingContact.addressPostalCode,
          invoicingContact.addressCity
      ].filter(Boolean).join(' ');

      bodyParts.push(``);
      bodyParts.push(`ΣΤΟΙΧΕΙΑ ΓΙΑ ΕΚΔΟΣΗ ΤΙΜΟΛΟΓΙΟΥ:`);
      bodyParts.push(`${invoicingContact.company || `${invoicingContact.firstName} ${invoicingContact.lastName}`}`);
      if(invoicingAddress) bodyParts.push(invoicingAddress);
      if(invoicingContact.landlinePhone) bodyParts.push(`Τηλ: ${invoicingContact.landlinePhone}`);
      if(invoicingContact.email) bodyParts.push(`Email: ${invoicingContact.email}`);
      if(invoicingContact.vatNumber) bodyParts.push(`ΑΦΜ: ${invoicingContact.vatNumber}`);
      
      const invoiceNoteParts = [];
      if (project.applicationNumber) invoiceNoteParts.push(project.applicationNumber);
      if (owner) invoiceNoteParts.push(`${owner.firstName} ${owner.lastName}`);
      invoiceNoteParts.push('Εξοικονομώ');
      const invoiceNote = invoiceNoteParts.join(', ');
      
      bodyParts.push(``);
      bodyParts.push(`ΠΡΟΣΟΧΗ: Είναι απαραίτητο στις παρατηρήσεις του τιμολογίου να γράψετε:`);
      bodyParts.push(invoiceNote);
    }

    bodyParts.push(``);
    bodyParts.push(`================================`);
    bodyParts.push(`Με εκτίμηση,`);
    bodyParts.push(``);

    if (senderEmail === 'georgios.pagonis@gmail.com') {
        bodyParts.push(
            `Παγώνης Νέστ. Γεώργιος`,
            `Αρχιτέκτων Μηχανικός`,
            ``,
            `Σαμοθράκης 16, 563 34`,
            `Ελευθέριο Κορδελιό, Θεσσαλονίκη`,
            `Τ: 2310 55 95 95`,
            `Μ: 6974 050 023`,
            `georgios.pagonis@gmail.com`
        );
    } else {
         bodyParts.push(`Η ομάδα του NESTOR eco`);
    }

    return bodyParts.join('\n');
}
