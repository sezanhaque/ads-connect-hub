import { useState } from 'react';
import { format, subDays, subWeeks, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESET_OPTIONS = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last week', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 4 weeks', getValue: () => ({ from: subWeeks(new Date(), 4), to: new Date() }) },
  { label: 'Last 12 weeks', getValue: () => ({ from: subWeeks(new Date(), 12), to: new Date() }) },
  { label: 'Current month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last Calendar month', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Last 3 Calendar months', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 3)), to: endOfMonth(new Date()) }) },
];

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<Date>(value.from);
  const [customToDate, setCustomToDate] = useState<Date>(value.to);
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  const getCurrentPresetLabel = () => {
    const preset = PRESET_OPTIONS.find(option => {
      const range = option.getValue();
      return range.from.toDateString() === value.from.toDateString() && 
             range.to.toDateString() === value.to.toDateString();
    });
    return preset?.label || 'Custom range';
  };

  const handlePresetSelect = (preset: typeof PRESET_OPTIONS[0]) => {
    const range = preset.getValue();
    onChange(range);
    setOpen(false);
  };

  const handleCustomApply = () => {
    onChange({ from: customFromDate, to: customToDate });
    setOpen(false);
  };

  const handleCustomCancel = () => {
    setCustomFromDate(value.from);
    setCustomToDate(value.to);
    setActiveTab('preset');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[180px] justify-between font-normal text-sm",
            !value && "text-muted-foreground"
          )}
        >
          <span>{getCurrentPresetLabel()}</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'preset' | 'custom')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">Preset</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preset" className="p-0">
            <div className="max-h-[300px] overflow-y-auto">
              {PRESET_OPTIONS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 rounded-none hover:bg-muted"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={format(customFromDate, 'yyyy-MM-dd')}
                  onChange={(e) => setCustomFromDate(new Date(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={format(customToDate, 'yyyy-MM-dd')}
                  onChange={(e) => setCustomToDate(new Date(e.target.value))}
                />
              </div>
            </div>
            
            <Calendar
              mode="range"
              selected={{ from: customFromDate, to: customToDate }}
              onSelect={(range) => {
                if (range?.from) setCustomFromDate(range.from);
                if (range?.to) setCustomToDate(range.to);
              }}
              className="pointer-events-auto"
              disabled={{ after: new Date() }}
            />
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleCustomCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCustomApply} className="flex-1">
                Apply
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};