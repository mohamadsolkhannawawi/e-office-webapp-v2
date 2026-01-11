"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date?: Date;
    onDateChange?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({
    date,
    onDateChange,
    placeholder = "Pick a date",
    className,
}: DatePickerProps) {
    // Validasi date untuk menghindari Invalid Date
    const isValidDate = date instanceof Date && !isNaN(date.getTime());
    const [open, setOpen] = React.useState(false);
    
    const handleSelect = (selectedDate: Date | undefined) => {
        onDateChange?.(selectedDate);
        setOpen(false); // Tutup popover setelah memilih tanggal
    };
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!isValidDate}
                    className={cn(
                        "data-[empty=true]:text-muted-foreground w-full h-11 justify-start text-left font-normal border-gray-300",
                        !isValidDate && "text-gray-500",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {isValidDate ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={isValidDate ? date : undefined}
                    onSelect={handleSelect}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                />
            </PopoverContent>
        </Popover>
    );
}
