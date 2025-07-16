import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export default function AccountabilityPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6" />
            Λογοδοσία
          </CardTitle>
          <CardDescription>
            Αυτή η σελίδα προορίζεται για την παρακολούθηση και την λογοδοσία των έργων.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Το περιεχόμενο αυτής της σελίδας θα υλοποιηθεί σύντομα.</p>
        </CardContent>
      </Card>
    </main>
  );
}
