"use client"
import React, { useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, subMonths, format } from 'date-fns';
import moment from 'moment/moment';

function MonthSelection({ selectedMonth }) {
    const today = new Date();
    const [month, setMonth] = useState(today);

    const handlePrevMonth = () => {
        const prev = subMonths(month, 1);
        setMonth(prev);
        selectedMonth(prev);
    };

    const handleNextMonth = () => {
        const next = addMonths(month, 1);
        setMonth(next);
        selectedMonth(next);
    };

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline"
                        className="flex gap-2 items-center text-slate-500">
                        <CalendarDays className='h-5 w-5' />
                        {moment(month).format('MMM yyyy')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col items-center gap-2 w-56">
                    <div className="flex items-center justify-between w-full">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <span className="font-medium">{format(month, 'MMMM yyyy')}</span>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default MonthSelection