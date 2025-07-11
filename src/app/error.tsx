'use client' 

import { useEffect } from 'react'
import { FirebaseErrorDisplay } from '@/components/layout/firebase-error-display'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  // Check for our specific Firebase error signature
  if (error && error.message.includes('FIREBASE_INIT_ERROR:')) {
    return <FirebaseErrorDisplay error={error.message} />
  }

  // Fallback for all other errors
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle />Προέκυψε κάποιο σφάλμα</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Η εφαρμογή αντιμετώπισε ένα απρόβλεπτο πρόβλημα.</p>
                 <div className="mt-4 text-xs text-muted-foreground">
                    <p className="font-bold">Error Details:</p>
                    <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2 font-mono">{error?.message || 'No error message available'}</pre>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={() => reset()}>Δοκιμάστε Ξανά</Button>
            </CardFooter>
        </Card>
    </main>
  );
}
