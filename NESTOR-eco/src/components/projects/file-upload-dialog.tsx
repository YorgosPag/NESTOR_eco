
"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { processDocumentAction } from "@/app/client-actions";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tags, Send } from "lucide-react";
import type { Stage } from "@/types";
import type { ProcessMessageOutput } from "@/ai/flows/schemas";

interface FileUploadDialogProps {
  stage: Stage;
  children: ReactNode;
}

export function FileUploadDialog({ stage, children }: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProcessMessageOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Ελλιπή Στοιχεία",
        description: "Παρακαλώ επιλέξτε ένα αρχείο.",
      });
      return;
    }
    const messageText = description || `Αρχείο για το στάδιο ${stage.title}`;

    setIsLoading(true);
    setResult(null);

    try {
      const dataUri = await fileToDataUri(file);
      const response = await processDocumentAction({
        messageText,
        fileInfo: {
          dataUri,
          name: file.name,
          mimeType: file.type
        }
      });

      if (response.success && response.data) {
        setResult(response.data);
         toast({
          title: "Επιτυχής Ανάλυση",
          description: response.data.responseText,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Η ανάλυση AI απέτυχε",
          description: response.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε ένα μη αναμενόμενο σφάλμα.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
      setFile(null);
      setDescription("");
      setIsLoading(false);
      setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetState();
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Επεξεργασία Εγγράφου</DialogTitle>
          <DialogDescription>
            Μεταφορτώστε ένα έγγραφο για το στάδιο: <strong>{stage.title}</strong>. Η AI θα το αναλύσει και θα προτείνει ενέργειες.
          </DialogDescription>
        </DialogHeader>
        {!result ? (
            <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="document">Έγγραφο</Label>
                <Input id="document" type="file" onChange={handleFileChange} />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="description">Περιγραφή (Προαιρετικό)</Label>
                <Input
                id="description"
                type="text"
                placeholder="π.χ., Τελικό τιμολόγιο από προμηθευτή"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            </div>
        ) : (
            <div className="py-4 space-y-4">
                {result.tags && result.tags.length > 0 && (
                  <div>
                      <h4 className="font-semibold flex items-center mb-2"><Tags className="w-4 h-4 mr-2" />Προτεινόμενες Ετικέτες</h4>
                      <div className="flex flex-wrap gap-2">
                          {result.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                      </div>
                  </div>
                )}
                 {result.forwardingRecommendation && (
                  <div>
                      <h4 className="font-semibold flex items-center mb-2"><Send className="w-4 h-4 mr-2" />Πρόταση Προώθησης</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{result.forwardingRecommendation}</p>
                  </div>
                 )}
            </div>
        )}
        <DialogFooter>
          {result ? (
            <Button onClick={() => setOpen(false)}>Κλείσιμο</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading || !file}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Ανάλυση..." : "Λήψη Προτάσεων AI"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
