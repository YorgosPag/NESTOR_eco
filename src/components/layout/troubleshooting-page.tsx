
"use client";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";

export function TroubleshootingPage() {
    return (
        <main className="flex w-full flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-3xl animate-fade-in-up">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">🆘 Απαιτείται Ενέργεια για την Εκκίνηση της Εφαρμογής</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-muted-foreground">
                        Η εφαρμογή δεν μπορεί να ξεκινήσει επειδή υπάρχει ένα σφάλμα διαμόρφωσης με το Firebase.
                        Για να μπορέσετε να δείτε το dashboard, πρέπει πρώτα να διορθώσετε το πρόβλημα στο Netlify.
                    </p>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Πρόβλημα: Σφάλμα στο "Private Key" ή άλλο κλειδί του Firebase</AlertTitle>
                        <AlertDescription>
                            <div className="space-y-3 mt-2 prose prose-sm max-w-none">
                                <p>Ακολουθήστε <strong>ΑΥΣΤΗΡΑ</strong> τα παρακάτω βήματα για να το διορθώσετε οριστικά:</p>
                                
                                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                                    <h4 className="font-bold">ΒΗΜΑ 1: Δημιουργήστε ένα ΝΕΟ κλειδί στο Firebase</h4>
                                    <ol className="list-decimal list-inside space-y-1 mt-2">
                                        <li>Πηγαίνετε στο <strong>Firebase Console</strong> για το project σας.</li>
                                        <li>Πατήστε το εικονίδιο με το γρανάζι ⚙️ και επιλέξτε <strong>Project settings</strong>.</li>
                                        <li>Πηγαίνετε στην καρτέλα <strong>Service accounts</strong>.</li>
                                        <li>Πατήστε το κουμπί <strong>Generate new private key</strong>. Ένα αρχείο <code>.json</code> θα κατέβει στον υπολογιστή σας.</li>
                                    </ol>
                                </div>
                                
                                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                                    <h4 className="font-bold">ΒΗΜΑ 2: Αντιγράψτε τις τιμές (το πιο ΚΡΙΣΙΜΟ βήμα)</h4>
                                     <ol className="list-decimal list-inside space-y-1 mt-2">
                                        <li>Ανοίξτε το <code>.json</code> αρχείο που κατεβάσατε με έναν editor (π.χ., Notepad, VS Code).</li>
                                        <li>Θα χρειαστείτε τις τιμές για τα <code>project_id</code>, <code>client_email</code>, και <code>private_key</code>.</li>
                                        <li className="font-semibold mt-2">Για το <code>FIREBASE_CLIENT_EMAIL</code>:</li>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>Αν το json λέει: <code>"client_email": "firebase-adminsdk-fbsvc@exoikonomo-a70b3.iam.gserviceaccount.com"</code></li>
                                            <li>Βάζετε στο Netlify: <code>FIREBASE_CLIENT_EMAIL</code> = <code>firebase-adminsdk-fbsvc@exoikonomo-a70b3.iam.gserviceaccount.com</code> (Όχι παραπάνω, όχι λιγότερο, **ΧΩΡΙΣ** τα εξωτερικά εισαγωγικά!)</li>
                                        </ul>
                                        <li className="font-semibold mt-2">Για το <code>FIREBASE_PRIVATE_KEY</code>:</li>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>Βρείτε τη γραμμή που ξεκινά με <code>"private_key":</code>.</li>
                                            <li>Η τιμή του θα μοιάζει κάπως έτσι: <code>"-----BEGIN PRIVATE KEY-----\nMI...&lt;ΠΟΛΛΟΙ ΧΑΡΑΚΤΗΡΕΣ&gt;...\n-----END PRIVATE KEY-----\n"</code></li>
                                            <li><strong>ΣΗΜΑΝΤΙΚΟ:</strong> Αντιγράψτε <strong>ΜΟΝΟ</strong> το περιεχόμενο <strong>ΜΕΣΑ</strong> από τα εξωτερικά εισαγωγικά (<code>"</code>).</li>
                                            <li>Η τιμή που θα αντιγράψετε πρέπει να είναι μία <strong>ενιαία, μεγάλη γραμμή κειμένου</strong> που περιέχει <code>\n</code> ως χαρακτήρες, όχι ως πραγματικές αλλαγές γραμμής.</li>
                                        </ul>
                                    </ol>
                                </div>

                                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                                    <h4 className="font-bold">ΒΗΜΑ 3: Επικολλήστε το κλειδί στο Netlify</h4>
                                    <ol className="list-decimal list-inside space-y-1 mt-2">
                                        <li>Πηγαίνετε στις ρυθμίσεις του site σας στο <strong>Netlify</strong>.</li>
                                        <li>Βρείτε το μενού: <strong>Site configuration</strong> &gt; <strong>Build & deploy</strong> &gt; <strong>Environment variables</strong>.</li>
                                        <li>Πατήστε <strong>Edit</strong> δίπλα σε κάθε μεταβλητή (<code>FIREBASE_PRIVATE_KEY</code>, <code>FIREBASE_CLIENT_EMAIL</code>, κτλ.).</li>
                                        <li><strong>Διαγράψτε την παλιά τιμή</strong> και επικολλήστε τη νέα, σωστή τιμή που αντιγράψατε.</li>
                                        <li>Πατήστε <strong>Save</strong>.</li>
                                        <li>Κάντε ένα νέο Deploy πηγαίνοντας στην καρτέλα <strong>Deploys</strong> και πατώντας <strong>Trigger deploy</strong> &gt; <strong>Deploy site</strong>.</li>
                                    </ol>
                                </div>
                                <p className="font-bold pt-2">Μετά την ολοκλήρωση, πατήστε το παρακάτω κουμπί για να μεταβείτε στο dashboard.</p>
                            </div>
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex justify-end bg-muted/50 p-4 rounded-b-lg">
                    <Button asChild size="lg">
                        <Link href="/dashboard">
                           Ολοκλήρωσα τα βήματα, πήγαινέ με στο Dashboard
                           <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
