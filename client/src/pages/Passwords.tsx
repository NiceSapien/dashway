import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Star,
  Edit,
  Trash2,
  Filter,
  Grid,
  List,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getPasswords, decryptPassword, Password, deletePassword } from "@/api/passwords"
import { useToast } from "@/hooks/useToast"
import { PasswordDialog } from "@/components/PasswordDialog"
import { PasswordGenerator } from "@/components/PasswordGenerator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

export function Passwords() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [visiblePasswords, setVisiblePasswords] = useState<Map<number | string, string>>(new Map())
  const [passwordToDelete, setPasswordToDelete] = useState<Password | null>(null);
  const { toast } = useToast()
  const { masterPassword } = useAuth();

  const fetchPasswords = async () => {
    if (!masterPassword) return;
    try {
      setLoading(true);
      const fetchedPasswords = await getPasswords()
      setPasswords(fetchedPasswords);
      setFilteredPasswords(fetchedPasswords);
    } catch (error) {
      console.error('Error fetching passwords:', error)
      toast({
        title: "Error",
        description: "Failed to load passwords",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (masterPassword) {
      fetchPasswords()
    }
  }, [masterPassword, toast])

  useEffect(() => {
    const filtered = passwords.filter(password =>
      password.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPasswords(filtered)
  }, [searchTerm, passwords])

  const handleDelete = async () => {
    if (!passwordToDelete) return;
    try {
      await deletePassword(passwordToDelete.id);
      toast({
        title: "Success",
        description: "Password deleted successfully",
      });
      await fetchPasswords();
    } catch (error) {
      console.error('Error deleting password:', error);
      toast({
        title: "Error",
        description: "Failed to delete password",
        variant: "destructive",
      });
    } finally {
      setPasswordToDelete(null);
    }
  };

  const togglePasswordVisibility = async (passwordId: number | string) => {
    if (!masterPassword) return;
    const newVisible = new Map(visiblePasswords);
    if (newVisible.has(passwordId)) {
      newVisible.delete(passwordId);
    } else {
      try {
        const { password } = await decryptPassword(passwordId, masterPassword);
        newVisible.set(passwordId, password);
    } catch (error: any) {
        toast({
          title: "Error",
      description: error?.message || "Failed to decrypt password",
          variant: "destructive",
        });
      }
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (password: Password) => {
    setSelectedPassword(password)
    setShowPasswordDialog(true)
  }

  const handleAddNew = () => {
    setSelectedPassword(null)
    setShowPasswordDialog(true)
  }

  const handleSave = async () => {
    setShowPasswordDialog(false);
    await fetchPasswords();
  }

  if (!masterPassword) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader>
            <CardTitle>Master Password Required</CardTitle>
            <CardDescription>
              Please enter your master password in the dialog to view and manage your passwords.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Loader can be improved here */}
        <p>Loading passwords...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold">Passwords</h1>
          <p className="text-muted-foreground">
            Manage your {passwords.length} saved passwords securely.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowGenerator(true)} className="flex-1 sm:flex-none">
            Generate Password
          </Button>
          <Button onClick={handleAddNew} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Add Password
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search passwords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/40"
              />
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden sm:flex">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Items</DropdownMenuItem>
                  <DropdownMenuItem>Favorites</DropdownMenuItem>
                  <DropdownMenuItem>Weak Passwords</DropdownMenuItem>
                  <DropdownMenuItem>Recently Used</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex border rounded-md p-0.5">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredPasswords.map((password) => (
                <div key={password.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {password.website.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{password.website}</h3>
                      <p className="text-sm text-muted-foreground truncate">{password.username}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground font-mono tracking-wider">
                        {visiblePasswords.has(password.id) ? visiblePasswords.get(password.id) : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => togglePasswordVisibility(password.id)}
                      >
                        {visiblePasswords.has(password.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(password.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(password.username, 'Username')}>
                      <Copy className="h-4 w-4" />
                    </Button>
          <Button variant="ghost" size="icon" onClick={() => {
            if (visiblePasswords.has(password.id)) {
              copyToClipboard(visiblePasswords.get(password.id)!, 'Password')
                        } else {
                            toast({ title: "Please reveal the password first" })
                        }
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(password)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setPasswordToDelete(password)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the password for "{password.website}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setPasswordToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPasswords.map((password) => (
                <Card key={password.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {password.website.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium truncate max-w-[180px] sm:max-w-none">{password.website}</h3>
                          <p className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-none">{password.username}</p>
                        </div>
                      </div>
                      {password.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <span className="text-sm text-muted-foreground flex-1 font-mono tracking-wider">
                        {visiblePasswords.has(password.id) ? visiblePasswords.get(password.id) : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => togglePasswordVisibility(password.id)}
                      >
                        {visiblePasswords.has(password.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(password.username, 'Username')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (visiblePasswords.has(password.id)) {
                            copyToClipboard(visiblePasswords.get(password.id)!, 'Password')
                        } else {
                            toast({ title: "Please reveal the password first" })
                        }
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(password)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setPasswordToDelete(password)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the password for "{password.website}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPasswordToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        password={selectedPassword}
        onSave={handleSave}
      />

      <PasswordGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
      />
    </div>
  )
}