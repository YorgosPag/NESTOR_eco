
"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { isSameDay, isPast, format } from 'date-fns';
import { el } from 'date-fns/locale';
import type { DayProps } from "react-day-picker";
import type { StageStatus } from "@/types";
import { Badge } from "../ui/badge";

interface CalendarEvent {
    date: Date;
    title: string;
    projectTitle: string;
    status: StageStatus;
    projectId: string;
}

interface CalendarViewProps {
    events: CalendarEvent[];
}

function CustomDay(props: DayProps & { events: CalendarEvent[] }) {
    const { date, displayMonth, events } = props;

    const eventsForDay = events.filter(event => 
        date && isSameDay(event.date, date)
    );
    
    const isOutside = date && props.displayMonth.getMonth() !== date.getMonth();

    const dayContent = (
        <div className={cn("relative h-full w-full flex flex-col items-start justify-start p-2", isOutside ? 'opacity-50' : '')}>
            <time dateTime={date?.toISOString()}>{date?.getDate()}</time>
            {eventsForDay.length > 0 && (
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {eventsForDay.slice(0, 4).map((event, index) => (
                        <div key={index} className={cn("h-2 w-2 rounded-full", {
                            "bg-red-500": isPast(event.date) && event.status !== 'completed',
                            "bg-blue-500": !isPast(event.date) && event.status !== 'completed',
                            "bg-green-500": event.status === 'completed'
                        })}></div>
                    ))}
                </div>
            )}
        </div>
    );
    
    if (eventsForDay.length === 0) {
        return dayContent;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="h-full w-full text-left focus:z-10 focus:relative focus:outline-none focus:ring-2 focus:ring-ring rounded-md">
                    {dayContent}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Προθεσμίες για {date ? format(date, "d MMMM yyyy", { locale: el }) : ''}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {eventsForDay.map((event, index) => (
                        <Link
                            key={`${event.projectId}-${index}`}
                            href={`/projects/${event.projectId}`}
                            className="block p-3 rounded-lg hover:bg-muted transition-colors border"
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{event.projectTitle}</p>
                                 <Badge variant={
                                    event.status === 'completed' ? 'secondary'
                                    : (isPast(event.date) ? 'destructive' : 'default')
                                 } className="capitalize text-xs">
                                     {isPast(event.date) && event.status !== 'completed' ? 'Καθυστερημένο' : (event.status === 'completed' ? 'Ολοκληρωμένο' : 'Ενεργό')}
                                 </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.title}</p>
                        </Link>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function CalendarView({ events }: CalendarViewProps) {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    
    return (
        <div className="rounded-md border bg-card">
             <Calendar
                locale={el}
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex border-b bg-muted/50",
                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] p-2",
                    row: "flex w-full mt-2",
                    cell: "h-24 w-full border text-sm p-0 relative first:rounded-l-md last:rounded-r-md",
                    day: cn(
                        "h-full w-full p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground",
                    day_disabled: "text-muted-foreground opacity-50",
                }}
                components={{
                    Day: (dayProps) => <CustomDay {...dayProps} events={events} />
                }}
            />
        </div>
    );
}
