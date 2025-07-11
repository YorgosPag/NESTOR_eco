
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { setTelegramWebhookAction, seedDatabaseAction } from '@/app/actions';
import { Loader2, Bot, Database, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSetupWebhook = async () => {
    setIsWebhookLoading(true);
    try {
      const result = await setTelegramWebhookAction();
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Σφάλμα Εφαρμογής",
        description: "Προέκυψε ένα μη αναμενόμενο σφάλμα κατά τη ρύθμιση του webhook.",
      });
    } finally {
      setIsWebhookLoading(false);
    }
  };

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
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ρυθμίσεις</h1>
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Σύνδεση Telegram Bot
          </CardTitle>
          <CardDescription>
            Συνδέστε το Eco_Stages_Bot για να λαμβάνετε ενημερώσεις σε πραγματικό χρόνο και να διαχειρίζεστε τα έργα απευθείας από το Telegram.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Πατήστε το παρακάτω κουμπί για να ρυθμίσετε το webhook για το Telegram bot σας. Αυτό επιτρέπει στο Telegram να στέλνει ενημερώσεις στην εφαρμογή σας με ασφάλεια. Βεβαιωθείτε ότι το `TELEGRAM_BOT_TOKEN` έχει οριστεί στο αρχείο `.env`.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetupWebhook} disabled={isWebhookLoading}>
            {isWebhookLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ρύθμιση Webhook σε εξέλιξη...
              </>
            ) : (
              "Ρύθμιση Webhook"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
