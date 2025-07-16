
"use client";

import { format } from 'date-fns';
import type { Project } from '@/types';
import { formatDisplayCode } from '@/lib/intervention-helpers';

function getSignature(senderEmail: string): string[] {
    const SIGNATURES: Record<string, string[]> = {
        'georgios.pagonis@gmail.com': [
            `Παγώνης Νέστ. Γεώργιος`,
            `Αρχιτέκτων Μηχανικός`,
            ``,
            `Σαμοθράκης 16, 563 34`,
            `Ελευθέριο Κορδελιό, Θεσσαλονίκη`,
            `Τ: 2310 55 95 95`,
            `Μ: 6974 050 023`,
            `georgios.pagonis@gmail.com`
        ],
    };
    return SIGNATURES[senderEmail] || [`Η ομάδα του NESTOR eco`];
}

export function generateWorkOrderEmailBody(project: Project, senderEmail: string): string {
    const bodyParts = [
        `ΕΝΤΟΛΗ ΕΡΓΑΣΙΑΣ`,
        `====================================`,
        ``,
        `Στοιχεία Έργου:`,
        `--------------------`,
        `Τίτλος: ${project.title}`,
        project.applicationNumber ? `Αρ. Αίτησης: ${project.applicationNumber}` : '',
        project.deadline ? `Καταληκτική Ημερομηνία: ${format(new Date(project.deadline), 'dd/MM/yyyy')}` : '',
        ``,
        `Λίστα Παρεμβάσεων & Εργασιών:`,
        `---------------------------------`,
    ];

    project.interventions.forEach(intervention => {
        bodyParts.push(`\n• ΠΑΡΕΜΒΑΣΗ: ${intervention.interventionSubcategory || intervention.interventionCategory}`);
        
        if (intervention.subInterventions && intervention.subInterventions.length > 0) {
            intervention.subInterventions.forEach(sub => {
                const displayCode = formatDisplayCode(sub.subcategoryCode || '', sub.expenseCategory || intervention.expenseCategory || '');
                const quantityText = sub.quantity ? ` - Ποσότητα: ${sub.quantity} ${sub.quantityUnit || ''}` : '';
                const priceText = sub.cost > 0 ? ` - Τιμή: ${sub.cost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })} (άνευ ΦΠΑ)` : '';
                const energySpecText = sub.selectedEnergySpec ? ` - Χαρακτ/κά: ${sub.selectedEnergySpec}` : '';
                bodyParts.push(`  └─ ${displayCode}: ${sub.description}${energySpecText}${quantityText}${priceText}`);
            });
        }
    });
    
    bodyParts.push(
        ``,
        `====================================`,
        `Με εκτίμηση,`,
        ``,
        ...getSignature(senderEmail)
    );
    
    return bodyParts.filter(part => part !== null && part !== '').join('\n');
}
