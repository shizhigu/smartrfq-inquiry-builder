
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Mail, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
};

// Mock data - in a real app this would come from Clerk
const mockUsers: User[] = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "active",
  },
  {
    id: "user_3",
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "Viewer",
    status: "inactive",
  },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "User" });
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    // In a real app, this would call Clerk's API to create a user
    const user: User = {
      id: `user_${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "pending",
    };
    
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "User" });
    setOpenDialog(false);
    toast.success("User invitation sent");
  };

  const handleInviteUser = (userId: string) => {
    // In a real app, this would send an invitation email via Clerk
    toast.success("Invitation resent");
  };

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would call Clerk's API to delete/deactivate
    setUsers(users.filter(user => user.id !== userId));
    toast.success("User removed");
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Users" 
        description="Manage user accounts and permissions"
      >
        <Button onClick={() => setOpenDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <div className="p-4 flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  user.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : user.status === "inactive"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {user.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleInviteUser(user.id)}
                      title="Resend Invitation"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit User"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Remove User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={newUser.name} 
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
