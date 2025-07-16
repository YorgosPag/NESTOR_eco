
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormState } from "./types";
import type { Contact } from "@/types";


interface SocialMediaSectionProps {
    state: FormState;
    contact?: Partial<Contact>;
}

export function SocialMediaSection({ state, contact = {} }: SocialMediaSectionProps) {
    return (
        <AccordionItem value="social-media">
            <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Κοινωνικά Δίκτυα</AccordionTrigger>
            <AccordionContent className="pt-4 px-1 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook</Label>
                    <Input id="facebookUrl" name="facebookUrl" defaultValue={contact.facebookUrl} placeholder="https://www.facebook.com/username" />
                    {state.errors?.facebookUrl && <p className="text-sm font-medium text-destructive mt-1">{state.errors.facebookUrl[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram</Label>
                    <Input id="instagramUrl" name="instagramUrl" defaultValue={contact.instagramUrl} placeholder="https://www.instagram.com/username" />
                    {state.errors?.instagramUrl && <p className="text-sm font-medium text-destructive mt-1">{state.errors.instagramUrl[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tiktokUrl">TikTok</Label>
                    <Input id="tiktokUrl" name="tiktokUrl" defaultValue={contact.tiktokUrl} placeholder="https://www.tiktok.com/@username" />
                    {state.errors?.tiktokUrl && <p className="text-sm font-medium text-destructive mt-1">{state.errors.tiktokUrl[0]}</p>}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
