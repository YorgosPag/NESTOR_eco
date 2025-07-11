
import { getProjectById, getAllProjects } from "@/lib/data";
import { notFound } from "next/navigation";
import { ProjectDetails } from "@/components/projects/project-details";
import type { Project } from "@/types";
import { getMasterInterventions } from "@/lib/interventions-data";
import { getContacts } from "@/lib/contacts-data";

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const [project, masterInterventions, contacts] = await Promise.all([
        getProjectById(params.id),
        getMasterInterventions(),
        getContacts()
    ]);

    if (!project) {
        notFound();
    }

    return <ProjectDetails project={project} masterInterventions={masterInterventions} contacts={contacts} />;
}

export async function generateStaticParams() {
  try {
    const projects: Project[] = await getAllProjects();
    return projects.map((project) => ({
      id: project.id,
    }));
  } catch (error) {
    console.error("Failed to generate static params for projects:", error);
    return [];
  }
}
