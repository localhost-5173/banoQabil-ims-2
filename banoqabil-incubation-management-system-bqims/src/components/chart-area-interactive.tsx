import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface AttendanceTrendData {
  date: string
  present: number
  absent: number
  late: number
  total: number
}

interface ChartAreaInteractiveProps {
  data: AttendanceTrendData[]
  loading?: boolean
}

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(142, 71%, 45%)",
  },
  late: {
    label: "Late",
    color: "hsl(38, 92%, 50%)",
  },
  absent: {
    label: "Absent",
    color: "hsl(0, 84%, 60%)",
  },
}

export function ChartAreaInteractive({ data, loading }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []

    const now = new Date()
    let daysToSubtract = 30
    if (timeRange === "14d") daysToSubtract = 14
    else if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return data.filter((item) => new Date(item.date) >= startDate)
  }, [data, timeRange])

  return (
    <Card className="@container/card border-0 shadow-md">
      <CardHeader>
        <CardTitle>Attendance Trend</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily attendance breakdown over time
          </span>
          <span className="@[540px]/card:hidden">Attendance trend</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="14d">Last 14 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="14d" className="rounded-lg">Last 14 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No attendance data available for this period
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis tickLine={false} axisLine={false} width={30} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="present"
                type="monotone"
                fill="url(#fillPresent)"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
              />
              <Area
                dataKey="late"
                type="monotone"
                fill="url(#fillLate)"
                stroke="hsl(38, 92%, 50%)"
                strokeWidth={2}
              />
              <Area
                dataKey="absent"
                type="monotone"
                fill="url(#fillAbsent)"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
