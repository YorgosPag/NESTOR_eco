
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";


export function InstructionsDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const firebaseInstructionsText = `ΑΠΑΙΤΕΙΤΑΙ Η ΔΙΚΗ ΣΑΣ ΕΝΕΡΓΕΙΑ ΣΤΟ NETLIFY

Το σφάλμα "Failed to parse private key" σημαίνει ότι η τιμή για το 'FIREBASE_PRIVATE_KEY' στις ρυθμίσεις του Netlify είναι λανθασμένη. Δεν είναι σφάλμα κώδικα.

Για να το λύσετε, ακολουθήστε ΑΥΣΤΗΡΑ τα παρακάτω βήματα:

---
ΒΗΜΑ 1: Δημιουργήστε νέο κλειδί
---
1.  Πηγαίνετε στο Firebase Console για το project σας.
2.  Πατήστε το γρανάζι ⚙️ > **Project settings** > **Service accounts**.
3.  Πατήστε το κουμπί **Generate new private key**. Ένα αρχείο \`.json\` θα κατέβει.

---
ΒΗΜΑ 2: Αντιγράψτε το κλειδί (το πιο ΚΡΙΣΙΜΟ βήμα)
---
1.  Ανοίξτε το \`.json\` αρχείο με έναν editor (π.χ., Notepad, VS Code).
2.  Βρείτε τη γραμμή που ξεκινά με \`"private_key":\`.
3.  Η τιμή του μοιάζει κάπως έτσι: \`"-----BEGIN PRIVATE KEY-----\\nMI...<ΠΟΛΛΟΙ ΧΑΡΑΚΤΗΡΕΣ>...\\n-----END PRIVATE KEY-----\\n"\`
4.  **ΣΗΜΑΝΤΙΚΟ:** Αντιγράψτε **ΜΟΝΟ** το περιεχόμενο **ΜΕΣΑ** από τα εξωτερικά εισαγωγικά (\`"\`). **ΜΗΝ** αντιγράψετε τα ίδια τα εισαγωγικά.
5.  Η τιμή που θα αντιγράψετε πρέπει να είναι μία **ενιαία, μεγάλη γραμμή κειμένου** που περιέχει \`\\n\` ως χαρακτήρες, όχι ως πραγματικές αλλαγές γραμμής.

---
ΒΗΜΑ 3: Επικολλήστε το κλειδί στο Netlify
---
1.  Πηγαίνετε στις ρυθμίσεις του site σας στο Netlify.
2.  Βρείτε το μενού: **Build & deploy** > **Environment variables**.
3.  Βρείτε το \`FIREBASE_PRIVATE_KEY\` και πατήστε **Edit**.
4.  **Διαγράψτε την παλιά τιμή** και επικολλήστε τη νέα τιμή που αντιγράψατε.
5.  Πατήστε **Save**.
6.  Κάντε ένα νέο Deploy (Deploys > Trigger deploy > Deploy site).

Ακολουθώντας αυτά τα βήματα με ακρίβεια, το πρόβλημα θα λυθεί.`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(firebaseInstructionsText).then(() => {
      toast({
        title: "Αντιγράφηκε!",
        description: "Οι οδηγίες για το Firebase αντιγράφηκαν στο πρόχειρο.",
      });
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Οδηγίες Αντιμετώπισης Σφαλμάτων</DialogTitle>
          <DialogDescription>
            Σημαντικές πληροφορίες για την επίλυση κοινών προβλημάτων.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <Alert variant="destructive" className="bg-destructive/5 dark:bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">Αντιμετώπιση Σφάλματος: FIREBASE_PRIVATE_KEY</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap pt-2 text-destructive/90 dark:text-destructive/80">
                    {firebaseInstructionsText}
                </AlertDescription>
            </Alert>
        </div>
        <DialogFooter>
          <Button onClick={handleCopy} disabled={isCopied}>
            {isCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {isCopied ? "Αντιγράφηκε" : "Αντιγραφή Οδηγιών Firebase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
