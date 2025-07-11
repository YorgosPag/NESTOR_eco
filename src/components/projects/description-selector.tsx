'use client';

import { useState, useEffect } from 'react';
import type { CustomList, CustomListItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DescriptionSelectorProps {
    customLists: CustomList[];
    customListItems: CustomListItem[];
    initialValue?: string;
    onDescriptionChange: (description: string) => void;
    list1Name: string;
    list2Name: string;
}

export function DescriptionSelector({ customLists, customListItems, initialValue, onDescriptionChange, list1Name, list2Name }: DescriptionSelectorProps) {
    const list1 = customLists.find(l => l.name === list1Name);
    const list2 = customLists.find(l => l.name === list2Name);

    const list1Items = list1 ? customListItems.filter(item => item.listId === list1.id) : [];
    const list2Items = list2 ? customListItems.filter(item => item.listId === list2.id) : [];

    const [part1, setPart1] = useState('');
    const [part2, setPart2] = useState('');

    useEffect(() => {
        if (initialValue) {
            const parts = initialValue.split(' - ');
            if (parts.length === 2) {
                if (list1Items.some(item => item.name === parts[0])) {
                    setPart1(parts[0]);
                }
                 if (list2Items.some(item => item.name === parts[1])) {
                    setPart2(parts[1]);
                }
            }
        }
    }, [initialValue, list1Items, list2Items]);


    useEffect(() => {
        if (part1 && part2) {
            onDescriptionChange(`${part1} - ${part2}`);
        } else {
            onDescriptionChange('');
        }
    }, [part1, part2, onDescriptionChange]);
    
    if (!list1 || !list2) {
        return (
            <div className='text-sm text-destructive bg-destructive/10 p-3 rounded-md'>
                <p>Σφάλμα: Για τη λειτουργία αυτή απαιτούνται οι προσαρμοσμένες λίστες "{list1Name}" και "{list2Name}".</p>
                <p className='mt-1'>Παρακαλώ δημιουργήστε τις από τη σελίδα διαχείρισης.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 rounded-md border p-4 bg-muted/50">
             <div className="space-y-2">
                <Label>{list1.name}</Label>
                <Select value={part1} onValueChange={setPart1}>
                    <SelectTrigger>
                        <SelectValue placeholder={`Επιλέξτε ${list1.name}...`} />
                    </SelectTrigger>
                    <SelectContent>
                        {list1Items.map(item => (
                            <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>{list2.name}</Label>
                <Select value={part2} onValueChange={setPart2}>
                    <SelectTrigger>
                        <SelectValue placeholder={`Επιλέξτε ${list2.name}...`} />
                    </SelectTrigger>
                    <SelectContent>
                        {list2Items.map(item => (
                            <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
