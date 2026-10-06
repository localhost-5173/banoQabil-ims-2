import Loader from "@/components/Loader";
import SimplePagination from "@/components/simple-pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import { teamRepo } from "@/repositories/teamRepo";
import { userRepo } from "@/repositories/userRepo";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { MdDeleteSweep, MdEditSquare } from "react-icons/md";

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldEnumValues, setFieldEnumValues] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [limit] = useState(10) // Items per page

  const [formData, setFormData] = useState({
    teamName: "",
    teamLeader: "",
    members: [] as string[],
    field: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ===== API Calls =====


  const fetchTeams = async (page = 1) => {
    setLoading(true);
    try {
      // Fetch teams with pagination
      const teamsResponse = await teamRepo.getAllTeams(page, limit);
      console.log(totalUsers);

      // Format the teams data
      const formatted = (teamsResponse.data || []).map((team: any) => {
        const leader = team.members?.find((m: any) => m.role === "Team Leader");
        const members = team.members?.filter((m: any) => m.role === "Member") || [];

        return {
          ...team,
          teamLeader: leader?.user || null, // Direct user object for UI
          members: members.map((m: any) => m.user).filter(Boolean) // Only user objects, remove nulls
        };
      });

      // Update state with formatted data
      setTeams(formatted);
      setTotalPages(teamsResponse.pagination?.totalPages || 1);
      setTotalUsers(teamsResponse.pagination?.total || 0);
      setCurrentPage(teamsResponse.pagination?.currentPage || page);
    } catch (error) {
      toast.error("Failed to fetch teams");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      // Fetch users with pagination
      const usersResponse = await userRepo.getAllUsers(page, limit)

      // Fetch status data with same pagination


      // Extract data from paginated response
      setAllUsers(usersResponse.data || [])
      setTotalPages(usersResponse.pagination?.totalPages || 1)
      setTotalUsers(usersResponse.pagination?.total || 0)
      setCurrentPage(usersResponse.pagination?.currentPage || page)
    } catch (error) {
      toast.error("Failed to fetch users or attendance")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }


  const fetchFields = async () => {
    try {
      const fields = await teamRepo.getfields();
      setFieldEnumValues(fields);
    } catch {
      toast.error("Failed to fetch fields");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchTeams(page);
    fetchUsers(page)
  }

  useEffect(() => {
    let isMounted = true

    const initializeData = async () => {
      if (isMounted) {
        await fetchUsers(1)
        await fetchTeams(1)
        await fetchFields()
      }
    }

    initializeData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSave = async () => {
    try {
      // ✅ Team Leader ko members array ke andar add karo
      const payload = {
        teamName: formData.teamName,
        field: formData.field,
        members: [
          {
            user: formData.teamLeader, // leader ka id
            role: "Team Leader"
          },
          ...formData.members
            .filter((id: string) => id !== formData.teamLeader) // leader ko dobara member na banaye
            .map((id: string) => ({
              user: id,
              role: "Member"
            }))
        ]
      };

      if (editingId) {
        await teamRepo.updateTeam(editingId, payload);
        toast.success("Team updated successfully");
      } else {
        await teamRepo.addTeams(payload);
        toast.success("Team added successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchTeams();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Action failed");
      }
    }
  };


  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await teamRepo.deleteTeam(deleteId);
      setTeams(prev => prev.filter(team => team._id !== deleteId));
      toast.success("Team deleted successfully");
    } catch {
      toast.error("Failed to delete team");
    } finally {
      setDeleteId(null);
    }
  };

  const openEditModal = (team: any) => {
    const leader = team.members.find((m: any) => m.role === "Team Leader");
    const members = team.members.filter((m: any) => m.role === "Member");

    setFormData({
      teamName: team.teamName,
      teamLeader: leader?.user._id || "",
      members: members.map((m: any) => m.user._id),
      field: team.field
    });

    setEditingId(team._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ teamName: "", teamLeader: "", members: [], field: "" });
    setEditingId(null);
    setErrors({});
  };

  // ===== UI =====
  return (
    <div className="min-h-screen w-full p-6">
      <UrlBreadcrumb />
      <div className="flex justify-between items-center mb-6 mt-5">
        <h2 className="text-2xl font-bold">Registered Teams</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Team</Button>
      </div>

      <div className="rounded-lg border shadow-sm bg-white dark:bg-neutral-900">
        {loading ? (
          <Loader />
        ) : (
          <Table>
            <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Team Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Field</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length > 0 ? (
                teams.map((team, index) => (
                  <TableRow key={team._id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{team.teamName}</TableCell>
                    <TableCell>{team.teamLeader?.name || "—"}</TableCell>
                    <TableCell>
                      {team.members?.length
                        ? team.members.map((m: any, i: number) => (
                          <span
                            key={i}
                            className="inline-block mr-1 text-sm bg-gray-200 px-2 py-1 rounded"
                          >
                            {m?.name}
                          </span>
                        ))
                        : "—"}
                    </TableCell>

                    <TableCell>{team.field}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button onClick={() => openEditModal(team)} size="icon" className="rounded-full">
                        <MdEditSquare className="text-white" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(team._id)}
                        variant="destructive"
                        size="icon"
                        className="rounded-full"
                      >
                        <MdDeleteSweep className="text-white" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No teams found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

        )}


      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t">
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{editingId ? "Edit Team" : "Create Team"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-7">
            {/* Team Name */}
            <div className="space-y-2">
              <Input
                placeholder="Team Name"
                value={formData.teamName}
                onChange={(e) => setFormData((prev) => ({ ...prev, teamName: e.target.value }))}
              />
              {errors.teamName && <p className="text-red-500 text-xs">{errors.teamName}</p>}
            </div>

            {/* Leader */}
            <div className="space-y-2">
              <Select
                value={formData.teamLeader}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, teamLeader: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Team Leader" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamLeader && <p className="text-red-500 text-xs">{errors.teamLeader}</p>}
            </div>

            {/* Members */}
            <div className="space-y-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground">
                    {formData.members.length > 0
                      ? `${formData.members.length} Member(s) Selected`
                      : "Select Members"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                  <DropdownMenuLabel>Select Members</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allUsers
                    .filter((user) => user._id !== formData.teamLeader)
                    .map((user) => (
                      <DropdownMenuCheckboxItem
                        key={user._id}
                        checked={formData.members.includes(user._id)}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => {
                            if (checked) {
                              return { ...prev, members: [...prev.members, user._id] };
                            } else {
                              return {
                                ...prev,
                                members: prev.members.filter((id) => id !== user._id),
                              };
                            }
                          });
                        }}
                      >
                        {user.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.members && <p className="text-red-500 text-xs">{errors.members}</p>}
            </div>

            {/* Field */}
            <div className="space-y-2">
              <Select
                value={formData.field}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, field: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldEnumValues.map((field) => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.field && <p className="text-red-500 text-xs">{errors.field}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full h-11 text-lg font-medium" onClick={handleSave}>
              {editingId ? "Update Team" : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this team?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


export default Teams