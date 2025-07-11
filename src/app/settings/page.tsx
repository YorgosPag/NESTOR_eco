
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDatabaseAction } from '@/app/actions/database';
import { Loader2, Database, AlertTriangle, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
      setIsSeeding(true);
      try {
        const result = await seedDatabaseAction();
         if (result.success) {
            toast({
                title: "Επιτυχία",
                description: result.message,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Σφάλμα",
                description: result.error,
            });
        }
      } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Σφάλμα Συστήματος",
            description: "Απέτυχε η αρχικοποίηση της βάσης δεδομένων."
         });
      } finally {
        setIsSeeding(false);
      }
  }

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
          <Button onClick={handleSeedDatabase} disabled={isSeeding}>
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Αρχικοποίηση...
              </>
            ) : (
              "Εκτέλεση Αρχικοποίησης (Seed)"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
