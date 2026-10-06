import React, { useEffect, useState } from "react";
import { Calendar, ConfigProvider } from "antd";
import type { CalendarProps } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { calendarRepo } from "@/repositories/calendarRepo";
import type { CalendarEntry } from "@/repositories/calendarRepo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconSettings, IconTrash, IconCalendarPlus } from "@tabler/icons-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Define event types and colors map for Badge variants or styles
const EVENT_TYPES = {
    Holiday: "destructive", // Red
    Event: "default",      // Primary
    Meeting: "secondary",  // Gray
    "Working Day": "outline", // Outline
    Other: "secondary",
} as const;

// Types for Antd Badge status mapping if needed, or we use custom classes inside cell
// Types for Antd Badge status mapping if needed, or we use custom classes inside cell
// const ANT_BADGE_STATUS = { ... };

// Zod Schema
const eventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["Holiday", "Event", "Meeting", "Working Day", "Other"]),
    status: z.enum(["Upcoming", "Completed", "Cancelled"]).optional(),
    // We use a simpler startDate/endDate for native inputs in the form
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z.string().optional(),
    description: z.string().optional(),
    recurrence: z.enum(["None", "Daily", "Weekly", "Monthly", "Yearly"]),
});

type EventFormValues = z.infer<typeof eventSchema>;

const AdminCalendar: React.FC = () => {
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
    const [savingSettings, setSavingSettings] = useState(false);

    // Loading States
    // const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            type: "Event",
            status: "Upcoming",
            recurrence: "None",
        }
    }) as unknown as UseFormReturn<EventFormValues>;

    // Fetch entries
    const fetchEntries = async () => {
        // setIsLoading(true);
        try {
            const res = await calendarRepo.getEntries();
            setEntries(res.data);
            if (res.workingDays) {
                setWorkingDays(res.workingDays);
            }
        } catch (error) {
            toast.error("Failed to fetch calendar entries");
        } finally {
            // setIsLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await calendarRepo.getSettings();
            if (res.data?.workingDays) {
                setWorkingDays(res.data.workingDays);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    }

    useEffect(() => {
        fetchEntries();
        fetchSettings();
    }, []);

    // Cell Render Logic
    const getListData = (value: Dayjs) => {
        const events = entries.filter((entry) => {
            const date = dayjs(entry.startDate);
            return date.isSame(value, 'day');
        });
        return events;
    };

    const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
        if (info.type === 'date') {
            const listData = getListData(current);
            const isWorkingDay = workingDays.includes(current.day());

            return (
                <div className="h-full flex flex-col gap-1">
                    {!isWorkingDay && (
                        <div className="absolute top-0 right-0 p-1">
                            <span className="flex h-2 w-2 rounded-full bg-red-500" />
                        </div>
                    )}
                    <ul className="events p-0 m-0 list-none space-y-1">
                        {listData.map((item) => (
                            <li key={item._id} onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                                {/* Using Shadcn Badge inside Antd Cell */}
                                <Badge
                                    variant={EVENT_TYPES[item.type] as any || "default"}
                                    className="cursor-pointer hover:opacity-80 text-[10px] px-1 py-0 h-auto w-full truncate block"
                                >
                                    {item.title}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        return info.originNode;
    };

    // Modal & Form Handlers
    const showDialog = (date?: Dayjs) => {
        setEditingEntry(null);
        form.reset();

        const defaultDate = date ? date.format("YYYY-MM-DDTHH:mm") : dayjs().format("YYYY-MM-DDTHH:mm");
        const defaultEnd = date ? date.add(1, 'hour').format("YYYY-MM-DDTHH:mm") : dayjs().add(1, 'hour').format("YYYY-MM-DDTHH:mm");

        form.reset({
            title: "",
            type: "Event",
            status: "Upcoming",
            startDate: defaultDate,
            endDate: defaultEnd,
            description: "",
            location: "",
            recurrence: "None"
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (entry: CalendarEntry) => {
        setEditingEntry(entry);
        form.reset({
            title: entry.title,
            description: entry.description || "",
            type: entry.type,
            status: entry.status,
            location: entry.location || "",
            startDate: dayjs(entry.startDate).format("YYYY-MM-DDTHH:mm"),
            endDate: dayjs(entry.endDate).format("YYYY-MM-DDTHH:mm"),
            recurrence: entry.recurrence
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!editingEntry?._id) return;
        setIsDeleting(true);
        try {
            await calendarRepo.deleteEntry(editingEntry._id);
            toast.success("Entry deleted");
            setIsDialogOpen(false);
            fetchEntries();
        } catch (error) {
            toast.error("Failed to delete entry");
        } finally {
            setIsDeleting(false);
        }
    };

    const onSubmit = async (values: EventFormValues) => {
        setIsSaving(true);
        try {
            const data: any = {
                ...values,
                startDate: new Date(values.startDate).toISOString(),
                endDate: new Date(values.endDate).toISOString(),
                color: "#3b82f6", // Default color, or determine based on type
                isFullDay: true
            };

            if (editingEntry?._id) {
                await calendarRepo.updateEntry(editingEntry._id, data);
                toast.success("Entry updated");
            } else {
                await calendarRepo.createEntry(data);
                toast.success("Entry created");
            }
            setIsDialogOpen(false);
            fetchEntries();
        } catch (error) {
            toast.error("Failed to save entry");
        } finally {
            setIsSaving(false);
        }
    };

    // Working Days Logic
    const handleWorkingDayToggle = (day: number) => {
        const newDays = workingDays.includes(day)
            ? workingDays.filter(d => d !== day)
            : [...workingDays, day].sort();
        setWorkingDays(newDays);
    }

    const saveWorkingDays = async () => {
        setSavingSettings(true);
        try {
            await calendarRepo.updateSettings(workingDays);
            toast.success("Working days updated");
        } catch (error) {
            toast.error("Failed to update working days");
        } finally {
            setSavingSettings(false);
        }
    }

    const onSelect = (date: Dayjs, info: { source: 'year' | 'month' | 'customize' | 'date' }) => {
        if (info.source === 'date') {
            showDialog(date);
        }
    };

    const DAYS = [
        { value: 0, label: "Sun" },
        { value: 1, label: "Mon" },
        { value: 2, label: "Tue" },
        { value: 3, label: "Wed" },
        { value: 4, label: "Thu" },
        { value: 5, label: "Fri" },
        { value: 6, label: "Sat" },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Incubation Calendar</h1>
                    <p className="text-muted-foreground">Manage holidays, events, and working days.</p>
                </div>
                <Button onClick={() => showDialog()}>
                    <IconCalendarPlus className="mr-2 h-4 w-4" /> Add Entry
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <IconSettings className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Working Days</CardTitle>
                            <CardDescription>Select which days are considered working days.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 items-center">
                        {DAYS.map((day) => (
                            <div
                                key={day.value}
                                onClick={() => handleWorkingDayToggle(day.value)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer text-sm font-medium transition-colors
                                    ${workingDays.includes(day.value)
                                        ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                    }
                                `}
                            >
                                <Checkbox
                                    checked={workingDays.includes(day.value)}
                                    // Prevent double toggle issue since parent div has onClick
                                    onClick={(e) => e.stopPropagation()}
                                    onCheckedChange={() => handleWorkingDayToggle(day.value)}
                                />
                                {day.label}
                            </div>
                        ))}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={saveWorkingDays}
                            disabled={savingSettings}
                            className="ml-auto"
                        >
                            {savingSettings && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Save Config
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-white rounded-lg border shadow-sm p-2">
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#0f172a', // Slate 900 to match default Shadcn
                            borderRadius: 6,
                        },
                    }}
                >
                    <Calendar
                        cellRender={cellRender}
                        onSelect={onSelect}
                        className="rounded-md"
                    />
                </ConfigProvider>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? "Edit Entry" : "Add Entry"}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Event title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.keys(EVENT_TYPES).map(t => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Location (optional)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Event description..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2 sm:gap-0">
                                {editingEntry && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="mr-auto"
                                    >
                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconTrash className="mr-2 h-4 w-4" />}
                                        Delete
                                    </Button>
                                )}
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCalendar;
