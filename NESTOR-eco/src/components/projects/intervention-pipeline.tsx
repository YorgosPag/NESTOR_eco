
"use client";

import type { Stage, Contact } from "@/types";
import { StageCard } from "./stage-card";

interface InterventionPipelineProps {
  stages: Stage[];
  projectName: string;
  projectId: string;
  contacts: Contact[];
  owner?: Contact;
}

const PipelineColumn = ({ title, stages, projectName, projectId, contacts, owner }: { title: string, stages: Stage[], projectName: string, projectId: string, contacts: Contact[], owner?: Contact }) => (
  <div>
    <h3 className="font-semibold mb-3 px-2 text-muted-foreground">{title} ({stages.length})</h3>
    <div className="flex flex-col gap-3">
      {stages.map((stage) => (
        <StageCard key={stage.id} stage={stage} projectName={projectName} projectId={projectId} contacts={contacts} owner={owner} />
      ))}
      {stages.length === 0 && <p className="text-sm text-muted-foreground px-2 italic">Κανένα στάδιο σε αυτή τη στήλη.</p>}
    </div>
  </div>
);

export function InterventionPipeline({ stages, projectName, projectId, contacts, owner }: InterventionPipelineProps) {
  const pendingItems = stages.filter((s) => s.status === 'pending');
  const inProgressItems = stages.filter((s) => s.status === 'in progress');
  const completedItems = stages.filter((s) => s.status === 'completed');
  const failedItems = stages.filter((s) => s.status === 'failed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <PipelineColumn title="Σε Εκκρεμότητα" stages={pendingItems} projectName={projectName} projectId={projectId} contacts={contacts} owner={owner} />
      <PipelineColumn title="Σε Εξέλιξη" stages={inProgressItems} projectName={projectName} projectId={projectId} contacts={contacts} owner={owner} />
      <PipelineColumn title="Ολοκληρωμένα" stages={completedItems} projectName={projectName} projectId={projectId} contacts={contacts} owner={owner} />
      <PipelineColumn title="Απέτυχαν" stages={failedItems} projectName={projectName} projectId={projectId} contacts={contacts} owner={owner} />
    </div>
  );
}
