
"use client";

import { useMemo } from 'react';
import type { Project, Contact } from '@/types';
import { formatDisplayCode } from '@/lib/intervention-helpers';
import { User } from 'lucide-react';

interface WorkOrderInterventionListProps {
    project: Project;
    contacts: Contact[];
    showAssignees?: boolean;
}

export function WorkOrderInterventionList({ project, contacts, showAssignees }: WorkOrderInterventionListProps) {

    const processedInterventions = useMemo(() => {
        return project.interventions.map(intervention => {
            const subInterventionsWithDisplayCode = (intervention.subInterventions || []).map(sub => ({
                ...sub,
                displayCode: formatDisplayCode(sub.subcategoryCode || '', sub.expenseCategory || intervention.expenseCategory || '')
            }));
            return {...intervention, subInterventions: subInterventionsWithDisplayCode};
        });
    }, [project.interventions]);
    
    return (
        <section>
            <h3 className="text-h2 mb-4 text-primary">Λίστα Παρεμβάσεων & Εργασιών</h3>
            <div className="space-y-6">
                {processedInterventions.length > 0 ? (
                    processedInterventions.map(intervention => {
                        const firstStageWithAssignee = intervention.stages?.find(s => s.assigneeContactId);
                        const assignee = firstStageWithAssignee ? contacts.find(c => c.id === firstStageWithAssignee.assigneeContactId) : undefined;
                        
                        return (
                            <div key={intervention.masterId} className="grid grid-cols-[3fr_1fr] gap-x-8 gap-y-4 p-4 border rounded-md bg-muted/50 print:bg-gray-50 print:border-gray-200">
                                <div className="col-span-1">
                                    <h4 className="text-h4">{intervention.interventionSubcategory || intervention.interventionCategory}</h4>
                                    {intervention.subInterventions && intervention.subInterventions.length > 0 ? (
                                        <div className="mt-4 pl-4 border-l-2 border-primary/50 space-y-2">
                                            {intervention.subInterventions.map(sub => {
                                                const quantityText = sub.quantity ? `${sub.quantity} ${sub.quantityUnit || ''}` : null;
                                                const priceText = sub.cost > 0 ? sub.cost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' }) : null;
                                                return (
                                                    <div key={sub.id} className="text-sm">
                                                        <p className="font-semibold">{sub.displayCode}: <span className="font-normal">{sub.description}</span></p>
                                                        <div className="text-xs text-muted-foreground pl-4 flex flex-wrap gap-x-4">
                                                            {sub.selectedEnergySpec && <span>Ενεργ. Χαρακτ/κά: {sub.selectedEnergySpec}</span>}
                                                            {quantityText && <span>Ποσότητα: {quantityText}</span>}
                                                            {priceText && <span>Εγκεκριμένη Τιμή: {priceText} (άνευ ΦΠΑ)</span>}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-2 italic">Δεν έχουν καταχωρηθεί αναλυτικές εργασίες.</p>
                                    )}
                                </div>
                                {showAssignees && (
                                    <div className="col-span-1">
                                        <h4 className="text-h4">Ανάδοχος</h4>
                                        {assignee ? (
                                            <div className="space-y-1 mt-2 text-p">
                                                <p className="flex items-center gap-2 font-semibold"><User className="w-4 h-4"/>{assignee.firstName} {assignee.lastName}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-2 italic">Χωρίς ανάθεση.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <p className="text-center text-muted-foreground py-8">Δεν υπάρχουν παρεμβάσεις σε αυτό το έργο.</p>
                )}
            </div>
        </section>
    );
}
