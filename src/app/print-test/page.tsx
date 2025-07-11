'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Printer } from 'lucide-react';

export default function PrintTestPage() {
  const handlePrint = () => {
    console.log('🧪 Print button clicked!');
    console.log('⛔ Is inside iframe?', window.self !== window.top); // ✅ Εδώ βλέπουμε αν είσαι σε iframe
    console.log('window.self:', window.self);
    console.log('window.top:', window.top);

    requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Εκτύπωσης</CardTitle>
          <CardDescription>
            Αυτή η σελίδα υπάρχει για να δοκιμάσουμε με ασφάλεια τη λειτουργία εκτύπωσης του browser.
            Μόνο το περιεχόμενο μέσα στο πράσινο πλαίσιο θα πρέπει να εμφανίζεται στην προεπισκόπηση εκτύπωσης.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center p-4 rounded-md bg-muted print:hidden">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Εκτύπωση Τεστ
            </Button>
          </div>

          <div id="printable-area" className="p-6 border-2 border-dashed border-green-500 rounded-lg">
            <div className="print:hidden text-center text-red-600 font-semibold mb-4">
              Αυτό το μήνυμα ΔΕΝ πρέπει να εκτυπωθεί.
            </div>
            <h2 className="text-xl font-bold text-center">ΑΝΑΦΟΡΑ ΔΟΚΙΜΗΣ</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Αν βλέπετε αυτό το κείμενο στην προεπισκόπηση εκτύπωσης, τότε η λειτουργία είναι σωστή.
            </p>
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p>Αυτό είναι ένα δοκιμαστικό περιεχόμενο για να επιβεβαιώσουμε ότι το styling λειτουργεί.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
