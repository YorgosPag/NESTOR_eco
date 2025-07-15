
import { getProjectById, getAllProjects } from "@/lib/projects-data";
import { getMasterInterventions } from "@/lib/interventions-data";
import { notFound } from "next/navigation";
import { getContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { ProjectDetails } from "@/components/projects/project-details";
import type { Project } from "@/types";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const db = getAdminDb();
  const [project, masterInterventions, contacts, customLists, customListItems] = await Promise.all([
      getProjectById(db, resolvedParams.id),
      getMasterInterventions(db),
      getContacts(db),
      getCustomLists(db),
      getAllCustomListItems(db)
  ]);

  if (!project) {
      notFound();
  }

  return <ProjectDetails project={project} masterInterventions={masterInterventions} contacts={contacts} customLists={customLists} customListItems={customListItems} />;
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
try {
  const db = getAdminDb();
  const projects: Project[] = await getAllProjects(db);
  return projects.map((project) => ({
    id: project.id,
  }));
} catch (error) {
  console.error("Failed to generate static params for projects due to DB connection issue:", error);
  // Return an empty array to prevent the build from failing.
  // Pages will be generated on-demand at runtime.
  return [];
}
}
