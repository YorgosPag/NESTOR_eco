
"use client";

import { useState } from "react";
import type { CustomList, CustomListItem } from "@/types";
import { CreateListDialog } from "./create-list-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, ListChecks } from "lucide-react";
import { CustomListCard } from "./custom-list-card";
import { Accordion } from "@/components/ui/accordion";

interface CustomListsManagerProps {
    lists: CustomList[];
    items: CustomListItem[];
}

export function CustomListsManager({ lists, items }: CustomListsManagerProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLists = searchTerm
        ? lists.filter(list => list.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : lists;
    

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        Προσαρμοσμένες Λίστες
                    </h2>
                    <p className="text-muted-foreground">Δημιουργήστε και διαχειριστείτε τις δικές σας λίστες για χρήση στην εφαρμογή.</p>
                </div>
                <CreateListDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Δημιουργία Νέας Λίστας
                    </Button>
                </CreateListDialog>
            </div>
            
            <div className="flex items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Αναζήτηση λίστας..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {filteredLists.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-4">
                    {filteredLists.map((list) => {
                        return (
                             <CustomListCard 
                                key={list.id} 
                                list={list}
                                items={items.filter(item => item.listId === list.id)}
                            />
                        );
                    })}
                </Accordion>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 min-h-[200px]">
                    <h3 className="text-lg font-semibold tracking-tight">
                        {lists.length > 0 ? "Δεν βρέθηκαν λίστες" : "Δεν υπάρχουν προσαρμοσμένες λίστες"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                         {lists.length > 0 
                            ? "Δοκιμάστε έναν διαφορετικό όρο αναζήτησης." 
                            : 'Πατήστε "Δημιουργία Νέας Λίστας" για να ξεκινήσετε.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}
