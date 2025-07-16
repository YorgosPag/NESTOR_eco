
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import type { FormState } from "./types";

interface TaxisInfoSectionProps {
    state: FormState;
    showPassword: boolean;
    setShowPassword: (value: boolean) => void;
}

export function TaxisInfoSection({ state, showPassword, setShowPassword }: TaxisInfoSectionProps) {
    return (
        <AccordionItem value="taxis-info">
            <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Στοιχεία Σύνδεσης Taxis</AccordionTrigger>
            <AccordionContent className="pt-4 px-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="usernameTaxis">Username Taxis</Label>
                        <Input id="usernameTaxis" name="usernameTaxis" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="passwordTaxis">Password Taxis</Label>
                        <div className="relative">
                            <Input id="passwordTaxis" name="passwordTaxis" type={showPassword ? 'text' : 'password'} />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
