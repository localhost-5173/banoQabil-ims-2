import { useEffect, useState } from "react"
import { attendanceRepo } from "@/repositories/attendanceRepo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { toast } from "sonner"
import Loader from "@/components/Loader"
import { IconClock, IconSun, IconMoon, IconSettings, IconDeviceFloppy } from "@tabler/icons-react"

interface ShiftConfig {
    name: string
    startHour: number
    endHour: number
    lateThresholdMinutes: number
    earlyLeaveThresholdMinutes: number
    noCheckoutLateMinutes: number
    minHoursForPresent: number
    workingDays: number[]
}

interface AttendanceSettingsData {
    shifts: {
        Morning: ShiftConfig
        Evening: ShiftConfig
    }
    allowEarlyCheckIn: number
    timezone: string
    allowedIPs: string[]
}



const AttendanceSettings = () => {
    const [settings, setSettings] = useState<AttendanceSettingsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [ipInput, setIpInput] = useState("")
    const [currentIP, setCurrentIP] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const data = await attendanceRepo.getSettings()
            setSettings(data.settings || data)
            try {
                const ipData = await attendanceRepo.checkIP()
                if (ipData && ipData.clientIP) {
                    setCurrentIP(ipData.clientIP)
                }
            } catch (ipErr) {
                console.error("Failed to fetch client IP:", ipErr)
            }
        } catch (error) {
            toast.error("Failed to load settings")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleShiftChange = (shift: "Morning" | "Evening", field: keyof ShiftConfig, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            shifts: {
                ...settings.shifts,
                [shift]: {
                    ...settings.shifts[shift],
                    [field]: value,
                },
            },
        })
    }



    const handleGlobalChange = (field: keyof AttendanceSettingsData, value: any) => {
        if (!settings) return
        setSettings({ ...settings, [field]: value })
    }

    const addIP = () => {
        if (!ipInput.trim() || !settings) return
        if (settings.allowedIPs.includes(ipInput.trim())) {
            toast.error("IP already exists")
            return
        }
        setSettings({
            ...settings,
            allowedIPs: [...settings.allowedIPs, ipInput.trim()],
        })
        setIpInput("")
    }

    const removeIP = (ip: string) => {
        if (!settings) return
        setSettings({
            ...settings,
            allowedIPs: settings.allowedIPs.filter((i) => i !== ip),
        })
    }

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            await attendanceRepo.updateSettings(settings)
            toast.success("Settings saved successfully!")
        } catch (error) {
            toast.error("Failed to save settings")
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader />
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Failed to load settings</p>
            </div>
        )
    }

    const ShiftCard = ({ shift, icon: Icon, color }: { shift: "Morning" | "Evening"; icon: any; color: string }) => (
        <Card className="flex-1">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="size-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{shift} Shift</CardTitle>
                        <CardDescription>Configure {shift.toLowerCase()} shift rules</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Start Hour (24h)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={23}
                            value={settings.shifts[shift].startHour}
                            onChange={(e) => handleShiftChange(shift, "startHour", parseInt(e.target.value) || 0)}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">End Hour (24h)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={23}
                            value={settings.shifts[shift].endHour}
                            onChange={(e) => handleShiftChange(shift, "endHour", parseInt(e.target.value) || 0)}
                            className="h-10"
                        />
                    </div>
                </div>

                {/* Thresholds */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Late After (mins)</Label>
                        <Input
                            type="number"
                            min={0}
                            value={settings.shifts[shift].lateThresholdMinutes}
                            onChange={(e) => handleShiftChange(shift, "lateThresholdMinutes", parseInt(e.target.value) || 0)}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Early Leave Before (mins)</Label>
                        <Input
                            type="number"
                            min={0}
                            value={settings.shifts[shift].earlyLeaveThresholdMinutes}
                            onChange={(e) => handleShiftChange(shift, "earlyLeaveThresholdMinutes", parseInt(e.target.value) || 0)}
                            className="h-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Min Hours for Present</Label>
                    <Input
                        type="number"
                        min={1}
                        max={12}
                        value={settings.shifts[shift].minHoursForPresent}
                        onChange={(e) => handleShiftChange(shift, "minHoursForPresent", parseInt(e.target.value) || 1)}
                        className="h-10"
                    />
                </div>

                <p className="text-xs text-muted-foreground pt-2 border-t">
                    💡 Working days are now managed in the <span className="font-medium text-primary">Calendar</span> page.
                </p>
            </CardContent>
        </Card>
    )

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                        <IconSettings className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Attendance Settings</h1>
                        <p className="text-sm text-muted-foreground">Configure shift timings and attendance rules</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <IconDeviceFloppy className="size-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* Shift Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                <ShiftCard shift="Morning" icon={IconSun} color="bg-amber-500" />
                <ShiftCard shift="Evening" icon={IconMoon} color="bg-indigo-500" />
            </div>

            {/* Global Settings */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500">
                            <IconClock className="size-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Global Settings</CardTitle>
                            <CardDescription>General attendance configuration</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Allow Early Check-in (mins)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={settings.allowEarlyCheckIn}
                                onChange={(e) => handleGlobalChange("allowEarlyCheckIn", parseInt(e.target.value) || 0)}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Timezone</Label>
                            <Input
                                type="text"
                                value={settings.timezone}
                                onChange={(e) => handleGlobalChange("timezone", e.target.value)}
                                className="h-10"
                                placeholder="Asia/Karachi"
                            />
                        </div>
                    </div>

                     {/* Allowed IPs */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Allowed IPs</Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={ipInput}
                                onChange={(e) => setIpInput(e.target.value)}
                                placeholder="Enter IP address"
                                className="h-10 flex-1"
                                onKeyDown={(e) => e.key === "Enter" && addIP()}
                            />
                            <Button onClick={addIP} variant="secondary" className="h-10">
                                Add
                            </Button>
                        </div>
                        {currentIP && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2 rounded-lg bg-secondary/50 border text-sm mt-2">
                                <div>
                                    <span className="text-muted-foreground">Your Current IP: </span>
                                    <code className="font-mono font-bold text-foreground bg-background px-1.5 py-0.5 rounded border">{currentIP}</code>
                                </div>
                                {!settings.allowedIPs.includes(currentIP) ? (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => {
                                            setSettings({
                                                ...settings,
                                                allowedIPs: [...settings.allowedIPs, currentIP]
                                            });
                                            toast.success(`Added ${currentIP} to whitelist (Don't forget to save changes!)`);
                                        }}
                                    >
                                        Whitelist My IP
                                    </Button>
                                ) : (
                                    <span className="text-xs text-green-500 font-medium">✓ Whitelisted</span>
                                )}
                            </div>
                        )}
                        {settings.allowedIPs.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {settings.allowedIPs.map((ip) => (
                                    <span
                                        key={ip}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm"
                                    >
                                        {ip}
                                        <button
                                            onClick={() => removeIP(ip)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {settings.allowedIPs.length === 0 && (
                            <p className="text-xs text-muted-foreground">No IP restrictions (all IPs allowed)</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AttendanceSettings
