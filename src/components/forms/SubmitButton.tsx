
"use client";

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
    text: string;
    pendingText: string;
}

export function SubmitButton({ text, pendingText }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {pendingText}
        </>
      ) : text}
    </Button>
  );
}
