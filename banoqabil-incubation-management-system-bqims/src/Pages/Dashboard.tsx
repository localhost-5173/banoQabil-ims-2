import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartCourseDistribution } from "@/components/chart-course-distribution"
import { toast } from "sonner"
import { SectionCards } from "@/components/section-cards"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { userRepo } from "@/repositories/userRepo"
import { dashboardRepo, type DashboardStats } from "@/repositories/dashboardRepo"
import SimplePagination from "@/components/simple-pagination"
import Loader from "@/components/Loader"

interface User {
  _id: string
  name: string
  bq_id: string
  email: string
  phone: string
  CNIC: string
  course: string
}

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(10)

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const data = await dashboardRepo.getStats()
      setStats(data)
    } catch (error) {
      toast.error("Failed to fetch dashboard statistics")
      console.error("Stats error:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const usersResponse = await userRepo.getAllUsers(page, limit)
      setUsers(usersResponse.data || [])
      setTotalPages(usersResponse.pagination?.totalPages || 1)
      setCurrentPage(usersResponse.pagination?.currentPage || page)
    } catch (error) {
      toast.error("Failed to fetch users")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchUsers(page)
  }

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* KPI Cards */}
          <SectionCards stats={stats} loading={statsLoading} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-5">
            <div className="@3xl/main:col-span-3">
              <ChartAreaInteractive
                data={stats?.attendanceTrend || []}
                loading={statsLoading}
              />
            </div>
            <div className="@3xl/main:col-span-2">
              <ChartCourseDistribution
                data={stats?.courseDistribution || []}
                loading={statsLoading}
              />
            </div>
          </div>

          {/* Recent Students Table */}
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border-0 shadow-md bg-card">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">Recent Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Overview of enrolled incubatees
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader />
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>BQ Id</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>CNIC</TableHead>
                        <TableHead>Course</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user, index) => (
                          <TableRow key={user._id}>
                            <TableCell className="text-center">
                              {(currentPage - 1) * limit + index + 1}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{user.bq_id}</TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>{user.CNIC}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                {user.course}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No students found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="p-4 border-t">
                      <SimplePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
