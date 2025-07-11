
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ExternalLink } from "lucide-react";

export function FirebaseErrorDisplay({ error }: { error: string }) {
    // Extract the specific message after the marker
    const specificError = error.includes('FIREBASE_INIT_ERROR:') 
        ? error.split('FIREBASE_INIT_ERROR:')[1]?.trim()
        : error;

    return (
        <main className="flex w-full flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-4xl animate-fade-in-up">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive flex items-center gap-2">
                        <AlertTriangle />
                        Σφάλμα Σύνδεσης με τη Βάση Δεδομένων
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Η εφαρμογή δεν μπόρεσε να φορτώσει τα δεδομένα επειδή απέτυχε η σύνδεση με το Firebase.
                        Αυτό οφείλεται σχεδόν πάντα σε λανθασμένη παραμετροποίηση των κλειδιών στο περιβάλλον του server (π.χ. Netlify).
                    </p>
                    
                    <div className="p-4 bg-destructive/10 rounded-md border border-destructive/20 space-y-3 prose prose-sm max-w-none text-destructive/90 dark:text-destructive/80">
                        <h4 className="font-bold text-destructive">Αντιμετώπιση Σφαλμάτων: Βήμα-προς-Βήμα</h4>
                        <p>Ακολουθήστε <strong>ΑΥΣΤΗΡΑ</strong> τα παρακάτω βήματα για να το διορθώσετε οριστικά:</p>
                        
                        <div>
                            <h5 className="font-bold">ΒΗΜΑ 1: Δημιουργήστε ένα ΝΕΟ κλειδί στο Firebase</h5>
                            <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Πηγαίνετε στο <strong>Firebase Console</strong> για το project σας.</li>
                                <li>Πατήστε το εικονίδιο με το γρανάζι ⚙️ και επιλέξτε <strong>Project settings</strong>.</li>
                                <li>Πηγαίνετε στην καρτέλα <strong>Service accounts</strong>.</li>
                                <li>Πατήστε το κουμπί <strong>Generate new private key</strong>. Ένα αρχείο <code>.json</code> θα κατέβει.</li>
                            </ol>
                        </div>
                        
                        <div>
                            <h5 className="font-bold">ΒΗΜΑ 2: Αντιγράψτε τις τιμές (το πιο ΚΡΙΣΙΜΟ βήμα)</h5>
                            <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Ανοίξτε το <code>.json</code> αρχείο που κατεβάσατε.</li>
                                <li>Θα χρειαστείτε τις τιμές για τα <code>project_id</code>, <code>client_email</code>, και <code>private_key</code>.</li>
                                <li className="font-semibold mt-2">Για το <code>FIREBASE_PRIVATE_KEY</code>:</li>
                                <ul className="list-disc list-inside ml-4">
                                    <li>Βρείτε τη γραμμή που ξεκινά με <code>"private_key":</code>.</li>
                                    <li>Η τιμή του θα μοιάζει κάπως έτσι: <code>"-----BEGIN PRIVATE KEY-----\nMI...&lt;ΠΟΛΛΟΙ ΧΑΡΑΚΤΗΡΕΣ&gt;...\n-----END PRIVATE KEY-----\n"</code></li>
                                    <li><strong>ΣΗΜΑΝΤΙΚΟ:</strong> Αντιγράψτε <strong>ΜΟΝΟ</strong> το περιεχόμενο <strong>ΜΕΣΑ</strong> από τα εξωτερικά εισαγωγικά (<code>"</code>).</li>
                                    <li>Η τιμή που θα αντιγράψετε πρέπει να είναι μία <strong>ενιαία, μεγάλη γραμμή κειμένου</strong> που περιέχει <code>\n</code> ως χαρακτήρες, όχι ως πραγματικές αλλαγές γραμμής.</li>
                                </ul>
                            </ol>
                        </div>

                        <div>
                            <h5 className="font-bold">ΒΗΜΑ 3: Επικολλήστε τα κλειδιά στο Netlify</h5>
                            <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Πηγαίνετε στις ρυθμίσεις του site σας στο <strong>Netlify</strong>.</li>
                                <li>Βρείτε το μενού: <strong>Site configuration</strong> &gt; <strong>Build & deploy</strong> &gt; <strong>Environment variables</strong>.</li>
                                <li>Πατήστε <strong>Edit</strong> δίπλα σε κάθε μεταβλητή (<code>FIREBASE_PRIVATE_KEY</code>, <code>FIREBASE_CLIENT_EMAIL</code>, etc.).</li>
                                <li><strong>Διαγράψτε την παλιά τιμή</strong> και επικολλήστε τη νέα, σωστή τιμή που αντιγράψατε.</li>
                                <li>Πατήστε <strong>Save</strong>.</li>
                                <li>Κάντε ένα νέο Deploy (Deploys &gt; Trigger deploy &gt; Deploy site).</li>
                            </ol>
                        </div>
                    </div>

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Αναλυτική Αιτία Σφάλματος από το Σύστημα</AlertTitle>
                        <AlertDescription>
                            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-destructive/10 p-2 font-mono text-xs">
                                {specificError || "Δεν εντοπίστηκε συγκεκριμένη αιτία. Ελέγξτε όλα τα κλειδιά."}
                            </pre>
                        </AlertDescription>
                    </Alert>

                </CardContent>
                 <CardFooter className="flex justify-end bg-muted/50 p-4 rounded-b-lg">
                    <Button asChild size="sm" onClick={() => window.location.reload()}>
                        <a href="#">
                           Έχω διορθώσει τα κλειδιά, κάνε Ανανέωση
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
