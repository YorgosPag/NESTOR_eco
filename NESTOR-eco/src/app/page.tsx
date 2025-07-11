
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to EcoFlow Manager</h1>
      <p className="text-muted-foreground mb-8">Your app is running correctly.</p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
