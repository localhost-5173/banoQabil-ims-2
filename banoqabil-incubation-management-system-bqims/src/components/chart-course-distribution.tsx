import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CourseData {
  course: string
  count: number
}

interface ChartCourseDistributionProps {
  data: CourseData[]
  loading?: boolean
}

const COLORS = [
  "hsl(221, 83%, 53%)",   // blue
  "hsl(142, 71%, 45%)",   // green
  "hsl(262, 83%, 58%)",   // purple
  "hsl(38, 92%, 50%)",    // amber
  "hsl(0, 84%, 60%)",     // red
  "hsl(199, 89%, 48%)",   // cyan
  "hsl(330, 81%, 60%)",   // pink
  "hsl(25, 95%, 53%)",    // orange
  "hsl(172, 66%, 50%)",   // teal
  "hsl(45, 93%, 47%)",    // yellow
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium">{payload[0].payload.course}</p>
        <p className="text-sm text-muted-foreground">
          {payload[0].value} student{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    )
  }
  return null
}

export function ChartCourseDistribution({ data, loading }: ChartCourseDistributionProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="@container/card border-0 shadow-md">
      <CardHeader>
        <CardTitle>Course Distribution</CardTitle>
        <CardDescription>Students enrolled by course</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground">
            No course data available
          </div>
        ) : (
          <div className="flex flex-col @[500px]/card:flex-row items-center gap-6">
            <div className="w-[220px] h-[220px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="course"
                    strokeWidth={0}
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-2xl font-bold"
                  >
                    {total}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    Total
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1 w-full">
              {data.map((item, index) => (
                <div
                  key={item.course}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate text-muted-foreground">{item.course}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-medium tabular-nums">{item.count}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {total > 0 ? `${Math.round((item.count / total) * 100)}%` : "0%"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
