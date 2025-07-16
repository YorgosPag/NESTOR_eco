
"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { FormState } from "./types";
import type { Contact } from "@/types";


interface PersonalInfoSectionProps {
    state: FormState;
    gender: string;
    setGender: (value: string) => void;
    avatar: string;
    setAvatar: (value: string) => void;
    contact?: Partial<Contact>; // Make contact optional for creation form
}

export function PersonalInfoSection({ state, gender, setGender, avatar, setAvatar, contact = {} }: PersonalInfoSectionProps) {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleClearAvatar = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setAvatar('');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            // Handles both ISO strings and potentially other date formats
            return new Date(dateString).toISOString().substring(0, 10);
        } catch (e) {
            return '';
        }
    };

    return (
        <AccordionItem value="personal-info">
            <AccordionTrigger className="text-md font-semibold bg-muted/50 hover:bg-muted px-4 rounded-md">Προσωπικά Στοιχεία</AccordionTrigger>
            <AccordionContent className="pt-4 px-1">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="firstName">Όνομα</Label>
                              <Input id="firstName" name="firstName" defaultValue={contact.firstName} placeholder="π.χ., Γιάννης" required />
                              {state.errors?.firstName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.firstName[0]}</p>}
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="lastName">Επώνυμο</Label>
                              <Input id="lastName" name="lastName" defaultValue={contact.lastName} placeholder="π.χ., Παπαδάκης" required />
                              {state.errors?.lastName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.lastName[0]}</p>}
                          </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="fatherName">Όνομα Πατέρα</Label>
                              <Input id="fatherName" name="fatherName" defaultValue={contact.fatherName} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="motherName">Όνομα Μητέρας</Label>
                              <Input id="motherName" name="motherName" defaultValue={contact.motherName} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Ημ/νία Γέννησης</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={formatDate(contact.dateOfBirth)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="placeOfBirth">Τόπος Γέννησης</Label>
                                <Input id="placeOfBirth" name="placeOfBirth" defaultValue={contact.placeOfBirth} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gender">Φύλο</Label>
                              <Select onValueChange={setGender} value={gender}>
                                <SelectTrigger id="gender">
                                  <SelectValue placeholder="Επιλέξτε..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Άνδρας">Άνδρας</SelectItem>
                                  <SelectItem value="Γυναίκα">Γυναίκα</SelectItem>
                                  <SelectItem value="Άλλο">Άλλο</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nationality">Υπηκοότητα</Label>
                                <Input id="nationality" name="nationality" defaultValue={contact.nationality} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-40 flex-shrink-0">
                         <Label>Φωτογραφία</Label>
                         <div 
                             className="mt-2 group aspect-square w-full border-2 border-dashed rounded-lg flex items-center justify-center text-center text-xs p-2 text-muted-foreground relative cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                             onDrop={handleDrop}
                             onDragOver={handleDragOver}
                             onClick={() => !avatar && document.getElementById('avatar-upload-create')?.click()}
                         >
                            {avatar ? (
                                <>
                                    <img src={avatar} alt="Avatar preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                                     <Button 
                                        type="button"
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={handleClearAvatar}
                                        aria-label="Διαγραφή φωτογραφίας"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <span>Μεταφέρετε ή πατήστε για ανέβασμα</span>
                            )}
                            <input id="avatar-upload-create" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                         </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
