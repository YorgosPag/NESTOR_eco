
"use client";

import { AccordionContent, AccordionItem } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlusCircle, ChevronDown, Trash2, Pencil } from "lucide-react";
import type { CustomList, CustomListItem } from "@/types";
import { ListItemTable } from "./list-item-table";
import { columns as itemColumns } from "./list-item-columns";
import { CreateItemDialog } from "./create-item-dialog";
import { DeleteListDialog } from "./delete-list-dialog";
import { EditListDialog } from "./edit-list-dialog";
import { cn } from "@/lib/utils";

interface CustomListCardProps {
    list: CustomList;
    items: CustomListItem[];
}

export function CustomListCard({ list, items }: CustomListCardProps) {
    // The items are now pre-sorted from the data source to prevent hydration errors.

    return (
        <AccordionItem value={list.id} className="border-b-0">
            <Card>
                <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger className="flex w-full items-center justify-between p-6 hover:bg-muted/50 transition-colors rounded-t-lg data-[state=open]:border-b [&[data-state=open]>svg]:rotate-180">
                        <div className="text-left">
                            <CardTitle>{list.name}</CardTitle>
                            <CardDescription className="pt-1">{items.length} αντικείμενα</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                <CreateItemDialog listId={list.id}>
                                    <div className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Προσθήκη
                                    </div>
                                </CreateItemDialog>
                                <EditListDialog list={list}>
                                     <div className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-9 w-9 cursor-pointer")}>
                                        <Pencil className="h-4 w-4" />
                                     </div>
                                </EditListDialog>
                                <DeleteListDialog list={list}>
                                     <div className={cn(buttonVariants({ variant: "destructive", size: "icon" }), "h-9 w-9 cursor-pointer")}>
                                        <Trash2 className="h-4 w-4" />
                                     </div>
                                </DeleteListDialog>
                            </div>
                            <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                        </div>
                    </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent>
                     <CardContent className="pt-6">
                        <ListItemTable columns={itemColumns} data={items} />
                    </CardContent>
                </AccordionContent>
            </Card>
        </AccordionItem>
    );
}
