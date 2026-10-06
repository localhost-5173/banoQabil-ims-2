import {
  IconUsers,
  IconUserShield,
  IconFolderFilled,
  IconUsersGroup,
  IconClipboardCheck,
} from "@tabler/icons-react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardStats } from "@/repositories/dashboardRepo"

interface SectionCardsProps {
  stats: DashboardStats | null
  loading?: boolean
}

const kpiCards = [
  {
    key: "totalStudents" as const,
    label: "Total Students",
    icon: IconUsers,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Enrolled incubatees",
  },
  {
    key: "totalPMs" as const,
    label: "Project Managers",
    icon: IconUserShield,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Assigned mentors",
  },
  {
    key: "totalTeams" as const,
    label: "Active Teams",
    icon: IconUsersGroup,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Collaborative groups",
  },
  {
    key: "totalProjects" as const,
    label: "Active Projects",
    icon: IconFolderFilled,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: "In-progress projects",
  },
]

export function SectionCards({ stats, loading }: SectionCardsProps) {
  const attendanceRate = stats?.todayAttendance?.rate ?? 0
  const attendanceColor =
    attendanceRate >= 75
      ? "text-emerald-500"
      : attendanceRate >= 50
        ? "text-amber-500"
        : "text-red-500"

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon
        const value = stats ? stats[kpi.key] : 0
        return (
          <Card
            key={kpi.key}
            className="@container/card relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-70">
                  {kpi.label}
                </CardDescription>
                <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                  <Icon className={`size-4 ${kpi.color}`} />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold tabular-nums tracking-tight">
                {loading ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  value
                )}
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardFooter>
          </Card>
        )
      })}

      {/* Today's Attendance Rate Card */}
      <Card className="@container/card relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-70">
              Today's Attendance
            </CardDescription>
            <div className="rounded-lg p-2 bg-teal-500/10">
              <IconClipboardCheck className="size-4 text-teal-500" />
            </div>
          </div>
          <CardTitle className={`text-3xl font-bold tabular-nums tracking-tight ${attendanceColor}`}>
            {loading ? (
              <span className="inline-block h-9 w-16 animate-pulse rounded bg-muted" />
            ) : (
              `${attendanceRate}%`
            )}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex items-center gap-2 pt-0 pb-3">
          <p className="text-xs text-muted-foreground">
            {stats ? `${stats.todayAttendance.present} of ${stats.totalStudents} present` : "—"}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
