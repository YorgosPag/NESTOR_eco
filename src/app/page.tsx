
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the main dashboard. If there's an error loading the dashboard,
  // the root error.tsx boundary will catch it and display instructions.
  redirect('/dashboard');
}
