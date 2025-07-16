import { useEffect, useState } from "react"
import { z } from "zod"
import { ProjectSchema, ContactSchema } from "@/lib/schemas"
import { getBatchWorkOrderData } from "@/app/actions/projects"
import type { Contact, Project } from "@/types";

export function useWorkOrderData(id: string | undefined) {
  const [data, setData] = useState<Project | null>(null)
  const [contacts, setContacts] = useState<Contact[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError(new Error("No project ID provided."));
        return;
    };

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getBatchWorkOrderData([id])
        
        // We can't use Zod to parse the result from Firestore directly
        // because Firestore timestamps are not JS Dates.
        // We trust the shape from getBatchWorkOrderData for now.
        const project = result.projects[0]
        if (!project) throw new Error("Project not found.")

        setData(project)
        setContacts(result.contacts || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, contacts, loading, error }
}
