
"use client";

import type { Stage, Contact, ProjectIntervention, Project } from "@/types";
import { StageCard } from "./stage-card";

interface InterventionPipelineProps {
  stages: Stage[];
  project: Project;
  allProjectInterventions: ProjectIntervention[];
  interventionMasterId: string;
  contacts: Contact[];
  owner?: Contact;
}

const PipelineColumn = ({ title, stages, ...props }: { title: string, stages: Stage[] } & Omit<InterventionPipelineProps, 'stages'>) => (
  <div>
    <h3 className="font-semibold mb-3 px-2 text-muted-foreground">{title} ({stages.length})</h3>
    <div className="flex flex-col gap-3">
      {stages.map((stage, index) => (
        <StageCard 
            key={stage.id} 
            stage={stage} 
            {...props}
            canMoveUp={index > 0}
            canMoveDown={index < stages.length - 1}
        />
      ))}
      {stages.length === 0 && <p className="text-sm text-muted-foreground px-2 italic">Κανένα στάδιο σε αυτή τη στήλη.</p>}
    </div>
  </div>
);

export function InterventionPipeline(props: InterventionPipelineProps) {
  const { stages } = props;
  const pendingItems = stages.filter((s) => s.status === 'pending');
  const inProgressItems = stages.filter((s) => s.status === 'in progress');
  const completedItems = stages.filter((s) => s.status === 'completed');
  const failedItems = stages.filter((s) => s.status === 'failed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <PipelineColumn title="Σε Εκκρεμότητα" stages={pendingItems} {...props} />
      <PipelineColumn title="Σε Εξέλιξη" stages={inProgressItems} {...props}/>
      <PipelineColumn title="Ολοκληρωμένα" stages={completedItems} {...props}/>
      <PipelineColumn title="Απέτυχαν" stages={failedItems} {...props}/>
    </div>
  );
}
