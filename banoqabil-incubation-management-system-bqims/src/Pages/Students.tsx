import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userRepo } from "@/repositories/userRepo"
import { studentSchema } from "./StudentSchema"
import type { StudentFormValues } from "./StudentSchema"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Loader from "@/components/Loader"
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconBrandWhatsapp,
  IconSearch,
  IconId,
  IconUsers,
  IconGenderMale,
  IconClock,
  IconCheck,
  IconMail,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Student {
  _id: string
  name: string
  email: string
  phone: string
  bq_id: string
  incubation_id: string
  course: string
  shift: string
  gender: string
  location: string
  avatar?: string
  CNIC: string
  isVerified?: boolean
}

interface Enums {
  courses: string[]
  genders: string[]
  shifts: string[]
  locations: string[]
}

interface PaginationData {
  total: number
  currentPage: number
  totalPages: number
  limit: number
  hasMore: boolean
}

interface StatsData {
  total: number
  gender: { _id: string; count: number }[]
  shifts: { _id: string; count: number }[]
}

const Students: React.FC = () => {
  const [users, setUsers] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [enums, setEnums] = useState<Enums | null>(null)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)

  // Filters state
  const [filters, setFilters] = useState({
    course: "all",
    shift: "all",
    gender: "all",
    location: "all"
  })

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      bq_id: "",
      email: "",
      phone: "92",
      CNIC: "",
      password: "",
      course: "",
      gender: "",
      shift: "",
      location: "",
      termsAccepted: true,
    },
  })

  const fetchUsers = async (page = 1, search = "", currentFilters = filters) => {
    setLoading(true)
    try {
      const res = await userRepo.getAllUsers(page, limit, search, currentFilters)
      setUsers(res.data || [])
      setPagination(res.pagination)
      setStats(res.stats)
    } catch {
      toast.error("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const fetchEnums = async () => {
    try {
      const res = await userRepo.getEnums()
      setEnums(res)
    } catch {
      toast.error("Failed to fetch form options")
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, searchTerm, filters)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, filters])

  useEffect(() => {
    fetchEnums()
  }, [])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchUsers(newPage, searchTerm, filters)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Removed local filteredUsers as search is now server-side

  const onAddClick = () => {
    setIsEditing(null)
    form.reset({
      name: "",
      bq_id: "",
      email: "",
      phone: "92",
      CNIC: "",
      password: "",
      course: "",
      gender: "",
      shift: "",
      location: "",
      termsAccepted: true,
    })
    setIsModalOpen(true)
  }

  const onEditClick = (user: Student) => {
    setIsEditing(user._id)
    form.reset({
      name: user.name || "",
      bq_id: user.bq_id || "",
      email: user.email || "",
      phone: user.phone || "92",
      CNIC: user.CNIC || "",
      password: "", // Leave blank for updates
      course: user.course || "",
      gender: user.gender || "",
      shift: user.shift || "",
      location: user.location || "",
      termsAccepted: true,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      await userRepo.deleteUser(id)
      toast.success("Student deleted")
      fetchUsers(currentPage, searchTerm)
    } catch {
      toast.error("Failed to delete student")
    }
  }

  const handleVerify = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to verify ${name}?`)) return
    try {
      await userRepo.verifyUser(id)
      toast.success("Student verified successfully")
      fetchUsers(currentPage, searchTerm)
    } catch {
      toast.error("Failed to verify student")
    }
  }

  const handleResend = async (user: Student) => {
    if (!confirm(`Resend verification email to ${user.name}?`)) return
    try {
      await userRepo.resendVerification(user.email)
      toast.success("Verification email sent")
    } catch {
      toast.error("Failed to send email")
    }
  }

  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (isEditing) {
        // Remove password if blank
        const updateData: any = { ...data }
        if (!updateData.password) delete updateData.password
        await userRepo.updateUser(isEditing, updateData)
        toast.success("Student updated successfully")
      } else {
        await userRepo.addUser(data as any)
        toast.success("Student added successfully")
      }
      setIsModalOpen(false)
      fetchUsers(currentPage, searchTerm)
    } catch (error: any) {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]
        : error.response?.data?.message || "Operation failed"
      toast.error(msg as string)
    }
  }

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "")
    const url = `https://wa.me/${cleanPhone}`
    window.open(url, "_blank")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-1">Manage intake, details and communications.</p>
        </div>
        <Button onClick={onAddClick} className="gap-2">
          <IconPlus size={18} />
          Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50 dark:border-blue-800/50 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IconUsers size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{stats?.total || 0}</p>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200/50 dark:border-purple-800/50 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <IconGenderMale size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {stats?.gender.find(g => g._id === 'Male')?.count || 0} / {stats?.gender.find(g => g._id === 'Female')?.count || 0}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Male / Female</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-200/50 dark:border-orange-800/50 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <IconClock size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {stats?.shifts.find(s => s._id === 'Morning')?.count || 0} / {stats?.shifts.find(s => s._id === 'Evening')?.count || 0}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Morning / Evening</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-muted/20">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by name, ID or email..."
                className="pl-10 bg-background h-10 border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={filters.course} onValueChange={(v) => handleFilterChange("course", v)}>
                <SelectTrigger className="h-10 bg-background border-none shadow-none focus-visible:ring-1 w-full md:w-[140px]">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {enums?.courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filters.shift} onValueChange={(v) => handleFilterChange("shift", v)}>
                <SelectTrigger className="h-10 bg-background border-none shadow-none focus-visible:ring-1 w-full md:w-[140px]">
                  <SelectValue placeholder="Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  {enums?.shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filters.gender} onValueChange={(v) => handleFilterChange("gender", v)}>
                <SelectTrigger className="h-10 bg-background border-none shadow-none focus-visible:ring-1 w-full md:w-[140px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {enums?.genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filters.location} onValueChange={(v) => handleFilterChange("location", v)}>
                <SelectTrigger className="h-10 bg-background border-none shadow-none focus-visible:ring-1 w-full md:w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {enums?.locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[300px]">Student</TableHead>
                <TableHead>IDs</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center"><Loader /></TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">No students found.</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="group hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="size-10 border">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                              {getInitials(user.name || "UN")}
                            </AvatarFallback>
                          </Avatar>
                          {user.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-background" title="Verified User">
                              <IconCheck size={10} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm leading-none mb-1">{user.name}</p>
                            {user.isVerified && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-green-500/10 text-green-600 border-none">Verified</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <IconId size={14} className="text-blue-500" />
                          <span className="text-xs font-medium">{user.bq_id}</span>
                        </div>
                        <Badge variant="outline" className="w-fit text-[10px] py-0 px-1.5 h-4 font-normal text-orange-600 bg-orange-50 border-orange-200">
                          {user.incubation_id}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{user.course}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal capitalize">
                        {user.shift}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{user.phone}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => openWhatsApp(user.phone)}
                        >
                          <IconBrandWhatsapp size={16} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => onEditClick(user)}>
                          <IconEdit size={16} />
                        </Button>
                        {!user.isVerified && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50" title="Verify User" onClick={() => handleVerify(user._id, user.name)}>
                              <IconCheck size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Resend Verification Email" onClick={() => handleResend(user)}>
                              <IconMail size={16} />
                            </Button>
                          </div>
                        )}
                        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user._id, user.name)}>
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Showing {users.length} of {pagination.total} students
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.currentPage > 1 && handlePageChange(pagination.currentPage - 1)}
                  className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={pagination.currentPage === page}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => pagination.hasMore && handlePageChange(pagination.currentPage + 1)}
                  className={!pagination.hasMore ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Muhammad Ahmed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bq_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BQ ID</FormLabel>
                      <FormControl>
                        <Input placeholder="BQ-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (WhatsApp)</FormLabel>
                      <FormControl>
                        <Input placeholder="923001234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="CNIC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNIC</FormLabel>
                      <FormControl>
                        <Input placeholder="42101-1234567-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isEditing ? "New Password (Optional)" : "Password"}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {enums?.courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {enums?.genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {enums?.shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campus Location</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {enums?.locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : isEditing ? "Update Student" : "Create Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Students
