
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { generateReportAction } from '@/app/actions/ai';
import { useToast } from '@/hooks/use-toast';
import type { ReportOutput } from '@/ai/flows/reporting-schemas';
import { DynamicChart } from './dynamic-chart';

export function AIReportAssistant() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<ReportOutput | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse(null);
        try {
            const result = await generateReportAction(query);
            if (result.success && result.data) {
                setResponse(result.data);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Σφάλμα Αναφοράς',
                    description: result.error || 'Η AI δεν μπόρεσε να δημιουργήσει την αναφορά.',
                });
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Σφάλμα Συστήματος',
                description: 'Προέκυψε ένα μη αναμενόμενο σφάλμα.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    Βοηθός Αναφορών AI
                </CardTitle>
                <CardDescription>
                    Ρωτήστε ό,τι θέλετε για τα έργα σας σε απλή γλώσσα.
                    Δοκιμάστε: "Ποια έργα έχουν καθυστερήσει;", "Δείξε μου τα έργα του ιδιοκτήτη 'Παπαδόπουλος'", ή "Δείξε μου τα έργα ανά κατάσταση σε γράφημα πίτας".
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Κάντε μια ερώτηση..."
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !query.trim()}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Ερώτηση'}
                    </Button>
                </form>

                <div className="mt-6">
                    {isLoading ? (
                        <div className="p-4 border rounded-md bg-muted/50 min-h-[10rem] flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : response ? (
                        typeof response === 'string' ? (
                            <div className="p-4 border rounded-md bg-muted/50 min-h-[10rem]">
                                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                    {response}
                                </div>
                            </div>
                        ) : (
                            <DynamicChart chartData={response} />
                        )
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
