
import { getProjectById, getAllProjects } from "@/lib/projects-data";
import { getMasterInterventions } from "@/lib/interventions-data";
import { notFound } from "next/navigation";
import { getAllContacts } from "@/lib/contacts-data";
import { getAdminDb } from "@/lib/firebase-admin";
import { ProjectDetails } from "@/components/projects/project-details";
import type { Project } from "@/types";
import { getCustomLists, getAllCustomListItems } from "@/lib/custom-lists-data";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const db = getAdminDb();
  const [project, masterInterventions, contacts, customLists, customListItems] = await Promise.all([
      getProjectById(db, params.id),
      getMasterInterventions(db),
      getAllContacts(db),
      getCustomLists(db),
      getAllCustomListItems(db)
  ]);

  if (!project) {
      notFound();
  }

  return <ProjectDetails project={project} masterInterventions={masterInterventions} contacts={contacts} customLists={customLists} customListItems={customListItems} />;
}

export async function generateStaticParams() {
  try {
    const db = getAdminDb();
    const projects: Project[] = await getAllProjects(db);
    return projects.map((project) => ({
      id: project.id,
    }));
  } catch (error) {
    console.error("Failed to generate static params for projects due to DB connection issue:", error);
    return [];
  }
}
