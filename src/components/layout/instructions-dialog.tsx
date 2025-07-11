"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InstructionsDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const instructionsText = `ΠΡΟΣΟΧΗ – ΑΥΣΤΗΡΕΣ ΟΔΗΓΙΕΣ ΤΡΟΠΟΠΟΙΗΣΗΣ

Απόλυτη Εγκράτεια Ενεργειών:
Σε κάθε περίπτωση, πριν παραχθεί οποιοσδήποτε κώδικας ή πραγματοποιηθεί οποιαδήποτε αλλαγή στην εφαρμογή (εμφάνιση, δομή, κώδικα, αρχιτεκτονική ή δεδομένα), ο agent υποχρεούται να γράφει με σαφήνεια τι κατάλαβε από την οδηγία ή τι προτείνει ως ενέργεια (όσο μικρή ή προφανής κι αν φαίνεται). Θα περιμένει ρητή επιβεβαίωση ή διόρθωση από εμένα πριν προχωρήσει περαιτέρω.

Απαγορεύεται αυστηρά η τροποποίηση οποιουδήποτε στοιχείου της εφαρμογής, εκτός αν έχει δοθεί ρητή εντολή και μόνο στο συγκεκριμένο σημείο που έχει ζητηθεί.

Αποκλειστικότητα Αλλαγών:
Κάθε αλλαγή γίνεται ΜΟΝΟ βάσει εντολής και στο ακριβές scope που έχει δοθεί. Δεν γίνονται παράπλευρες ή πρόσθετες επεμβάσεις χωρίς νέα ρητή εντολή.

Ακεραιότητα Εφαρμογής:
Οι οδηγίες αυτές είναι απολύτως δεσμευτικές και κρίσιμες για τη σταθερότητα και ασφάλεια της εφαρμογής.

Μη Παρέμβαση:
Δεν γίνονται αλλαγές σε άλλα σημεία του κώδικα, στη δομή, στα δεδομένα, στην εμφάνιση ή στη λειτουργία, εκτός αν ζητηθεί ρητά και συγκεκριμένα.

Οποιαδήποτε απόκλιση από τις παραπάνω οδηγίες θεωρείται σοβαρό σφάλμα και μπορεί να προκαλέσει ανεπανόρθωτη βλάβη στην εφαρμογή.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(instructionsText).then(() => {
      toast({
        title: "Επιτυχία",
        description: "Οι οδηγίες αντιγράφηκαν στο πρόχειρο.",
      });
    }).catch(err => {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αντιγραφή των οδηγιών.",
      });
      console.error('Copy failed', err);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Οδηγίες Χρήσης & Επεξεργασίας</DialogTitle>
          <DialogDescription>
            Σημαντικές πληροφορίες για την ορθή χρήση και τροποποίηση της εφαρμογής.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <Alert variant="destructive" className="bg-destructive/5 dark:bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">ΠΡΟΣΟΧΗ – ΑΥΣΤΗΡΕΣ ΟΔΗΓΙΕΣ ΤΡΟΠΟΠΟΙΗΣΗΣ</AlertTitle>
                <AlertDescription>
                    <div className="pt-2 text-destructive/90 dark:text-destructive/80 space-y-4">
                      
                      <div>
                        <h4 className="font-bold">Απόλυτη Εγκράτεια Ενεργειών:</h4>
                        <p className="mt-1">
                          Σε κάθε περίπτωση, πριν παραχθεί οποιοσδήποτε κώδικας ή πραγματοποιηθεί οποιαδήποτε αλλαγή στην εφαρμογή (εμφάνιση, δομή, κώδικα, αρχιτεκτονική ή δεδομένα), ο agent υποχρεούται να γράφει με σαφήνεια τι κατάλαβε από την οδηγία ή τι προτείνει ως ενέργεια (όσο μικρή ή προφανής κι αν φαίνεται). Θα περιμένει ρητή επιβεβαίωση ή διόρθωση από εμένα πριν προχωρήσει περαιτέρω.
                        </p>
                      </div>

                      <p className="font-semibold">Απαγορεύεται αυστηρά η τροποποίηση οποιουδήποτε στοιχείου της εφαρμογής, εκτός αν έχει δοθεί ρητή εντολή και μόνο στο συγκεκριμένο σημείο που έχει ζητηθεί.</p>

                      <ul className="list-disc list-inside space-y-2 font-medium">
                          <li>
                              <strong>Αποκλειστικότητα Αλλαγών:</strong> Κάθε αλλαγή γίνεται ΜΟΝΟ βάσει εντολής και στο ακριβές scope που έχει δοθεί. Δεν γίνονται παράπλευρες ή πρόσθετες επεμβάσεις χωρίς νέα ρητή εντολή.
                          </li>
                          <li>
                              <strong>Ακεραιότητα Εφαρμογής:</strong> Οι οδηγίες αυτές είναι απολύτως δεσμευτικές και κρίσιμες για τη σταθερότητα και ασφάλεια της εφαρμογής.
                          </li>
                           <li>
                              <strong>Μη Παρέμβαση:</strong> Δεν γίνονται αλλαγές σε άλλα σημεία του κώδικα, στη δομή, στα δεδομένα, στην εμφάνιση ή στη λειτουργία, εκτός αν ζητηθεί ρητά και συγκεκριμένα.
                          </li>
                      </ul>
                       <p className="font-bold pt-2">
                          Οποιαδήποτε απόκλιση από τις παραπάνω οδηγίες θεωρείται σοβαρό σφάλμα και μπορεί να προκαλέσει ανεπανόρθωτη βλάβη στην εφαρμογή.
                      </p>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
        <DialogFooter className="pt-4 border-t bg-muted/50 -mx-6 px-6 -mb-6 pb-4 sm:justify-end">
          <Button onClick={handleCopy} variant="outline" className="w-full sm:w-auto">
            <Copy className="mr-2 h-4 w-4" />
            Αντιγραφή Οδηγιών
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
