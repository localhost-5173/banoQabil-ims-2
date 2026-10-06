import { useEffect, useState } from "react"
import { attendanceRepo } from "@/repositories/attendanceRepo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import Loader from "@/components/Loader"
import SimplePagination from "@/components/simple-pagination"
import { Link } from "react-router-dom"
import {
  IconCalendarStats,
  IconSearch,
  IconSettings,
  IconClock,
  IconLogin,
  IconLogout,
  IconUsers,
  IconCalendar,
  IconRefresh,
  IconAlertCircle
} from "@tabler/icons-react"

interface AttendanceRecord {
  key: string
  user: {
    _id: string
    name: string
    email?: string
    avatar?: string
    bq_id?: string
    incubation_id?: string
  }
  date: string
  status: string
  shift: string
  checkInTime: string | null
  checkOutTime: string | null
  offDayReason?: string | null
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Present: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
  Late: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400" },
  Absent: { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-400" },
  "Early Leave": { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-400" },
  "Checked In": { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400" },
  "Off Day": { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-400" },
  Holiday: { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-400" },
}

const DATE_FILTERS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "previousMonth", label: "Previous Month" },
  { value: "overall", label: "All Time" },
]

const Attendance = () => {
  const [searchName, setSearchName] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState("overall")
  const [statusFilter, setStatusFilter] = useState("all")
  const [shiftFilter, setShiftFilter] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [limit] = useState(15)
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 })
  const [calendarInfo, setCalendarInfo] = useState<any>(null)

  const fetchAllHistory = async (page = 1) => {
    setLoading(true)
    try {
      const filters: any = {}
      if (statusFilter !== "all") filters.status = statusFilter
      if (shiftFilter !== "all") filters.shift = shiftFilter
      if (searchName.trim()) filters.search = searchName.trim()

      // Calculate start and end dates based on dateFilter
      const today = new Date()
      const formatDateForAPI = (d: Date) => d.toISOString().split("T")[0]

      if (dateFilter === "today") {
        filters.startDate = formatDateForAPI(today)
        filters.endDate = formatDateForAPI(today)
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        filters.startDate = formatDateForAPI(yesterday)
        filters.endDate = formatDateForAPI(yesterday)
      } else if (dateFilter === "thisWeek") {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        filters.startDate = formatDateForAPI(weekStart)
        filters.endDate = formatDateForAPI(today)
      } else if (dateFilter === "thisMonth") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        filters.startDate = formatDateForAPI(monthStart)
        filters.endDate = formatDateForAPI(today)
      } else if (dateFilter === "previousMonth") {
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        filters.startDate = formatDateForAPI(prevMonthStart)
        filters.endDate = formatDateForAPI(prevMonthEnd)
      }

      let response
      if (dateFilter === "today" || dateFilter === "yesterday") {
        const date = dateFilter === "today" ? formatDateForAPI(today) : formatDateForAPI(new Date(today.getTime() - 86400000))
        response = await attendanceRepo.getAllUserStatus(page, limit, { ...filters, date })
      } else {
        response = await attendanceRepo.getAttendanceHistory(page, limit, filters)
      }

      const data = response.data || []

      // Transform raw data to AttendanceRecord format
      const transformed = data.map((item: any) => ({
        key: item._id,
        user: item.user || {
          _id: item._id,
          name: item.name,
          email: item.email,
          avatar: item.avatar,
          bq_id: item.bq_id,
          incubation_id: item.incubation_id
        },
        date: item.createdAt || response.date,
        status: item.status,
        shift: item.shift || item.assignedShift,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime,
        offDayReason: item.offDayReason
      }))

      setFilteredHistory(transformed)
      setTotalPages(response.pagination?.totalPages || 1)

      setStats(response.stats || { total: 0, present: 0, late: 0, absent: 0 })
      setCalendarInfo(response.calendarInfo || null)
      setCurrentPage(page)
    } catch (error) {
      toast.error("Failed to fetch attendance history")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchAllHistory(page)
  }

  // Effect for filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllHistory(1)
    }, 500) // Debounce search
    return () => clearTimeout(timer)
  }, [dateFilter, statusFilter, shiftFilter, searchName])

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleShiftFilterChange = (value: string) => {
    setShiftFilter(value)
  }

  const handleSearch = () => {
    fetchAllHistory(1)
  }

  const handleRefresh = () => {
    fetchAllHistory(currentPage)
  }

  const formatTime = (time: string | null) => {
    if (!time) return "—"
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading && filteredHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <IconCalendarStats className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance History</h1>
            <p className="text-sm text-muted-foreground">Monitor and manage attendance records</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <IconRefresh className={`size-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/attendance/settings">
              <IconSettings className="size-4 mr-1" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {calendarInfo?.isNonWorking && (
        <div className="bg-purple-500/10 border border-purple-200/50 dark:border-purple-800/50 rounded-xl p-4 flex items-center gap-3 text-purple-700 dark:text-purple-400">
          <IconAlertCircle className="size-5 shrink-0" />
          <div className="text-sm font-medium">
            This day is marked as <span className="font-bold underlineDecoration-wavy decoration-purple-500/50">{calendarInfo.reason}</span> ({calendarInfo.type}). No typical attendance expected.
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <IconUsers className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <IconLogin className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-200/50 dark:border-amber-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <IconClock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-200/50 dark:border-red-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <IconLogout className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <IconSearch className="size-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search Student</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by Name, BQ ID, ID or Email..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-9"
                />
                <Button onClick={handleSearch} size="sm" variant="secondary" className="h-9">
                  <IconSearch className="size-4" />
                </Button>
              </div>
            </div>

            {/* Date Filter */}
            <div className="min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                <IconCalendar className="size-3 inline mr-1" />
                Date Range
              </label>
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Early Leave">Early Leave</SelectItem>
                  <SelectItem value="Checked In">Checked In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Shift Filter */}
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Shift</label>
              <Select value={shiftFilter} onValueChange={handleShiftFilterChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((record) => (
                  <TableRow key={record.key} className="group hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={record.user?.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(record.user?.name || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm leading-none mb-1">{record.user?.name || "Unknown"}</p>
                          <div className="flex gap-2 items-center">
                            {record.user?.bq_id && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {record.user.bq_id}
                              </span>
                            )}
                            {record.user?.incubation_id && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                {record.user.incubation_id}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">{record.user?.email || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {record.shift}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="secondary"
                          className={`${STATUS_STYLES[record.status]?.bg || "bg-gray-100"} ${STATUS_STYLES[record.status]?.text || "text-gray-700"} border-0 font-medium whitespace-nowrap`}
                        >
                          {record.status}
                        </Badge>
                        {record.offDayReason && (
                          <span className="text-[10px] text-muted-foreground font-medium px-1 italic">
                            {record.offDayReason}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {formatTime(record.checkInTime)}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {formatTime(record.checkOutTime)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {
        totalPages > 1 && (
          <div className="flex justify-center">
            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )
      }
    </div >
  )
}

export default Attendance
