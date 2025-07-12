// src/components/shared/GenericActionDialog.tsx

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';

// Πρέπει να εισάγετε τα components Dialog, Button κ.λπ. από το κατάλληλο UI library σας (εδώ φαίνεται να είναι το shadcn/ui).

type ActionType = 'create' | 'edit' | 'delete';

interface GenericActionDialogProps {
    actionType: ActionType;
    entityName: string; 
    title: string;
    description: string;
    trigger?: React.ReactNode; 
    children: React.ReactNode; 
}

export function GenericActionDialog({ 
    actionType, 
    entityName, 
    title, 
    description, 
    trigger, 
    children 
}: GenericActionDialogProps) {
    return (
        <Dialog>
            {/* If a trigger element is provided, use it to open the dialog */}
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}