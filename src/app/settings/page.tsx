
"use client";

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDatabaseAction } from '@/app/actions/database';
import { Loader2, Database, AlertTriangle, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SeedButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Αρχικοποίηση...
              </>
            ) : (
              "Εκτέλεση Αρχικοποίησης (Seed)"
            )}
        </Button>
    );
}

export default function SettingsPage() {
  const [state, formAction] = useActionState(seedDatabaseAction, { success: false, error: null, message: null });
  const { toast } = useToast();

  useState(() => {
    if (state.message) {
      toast({
        title: "Επιτυχία",
        description: state.message,
      });
    } else if (state.error) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: state.error,
      });
    }
  });

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="text-h1 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Ρυθμίσεις
      </h1>
      
       <Card>
        <CardHeader>
          <CardTitle className="text-h2 flex items-center gap-2">
            <Database />
            Βάση Δεδομένων
          </CardTitle>
          <CardDescription>
            Αρχικοποιήστε τη βάση δεδομένων του Firestore με τα αρχικά δεδομένα επίδειξης.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Προσοχή</AlertTitle>
              <AlertDescription>
                Αυτή η ενέργεια θα πρέπει να εκτελεστεί μόνο μία φορά σε μια κενή βάση δεδομένων. Εάν υπάρχουν ήδη δεδομένα, η διαδικασία θα ακυρωθεί για την αποφυγή διπλοεγγραφών.
              </AlertDescription>
            </Alert>
        </CardContent>
        <CardFooter>
            <form action={formAction}>
                <SeedButton />
            </form>
        </CardFooter>
      </Card>
    </main>
  );
}
