import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  FileText,
  Filter
} from "lucide-react"
import { getNotes, decryptNote, SecureNote } from "@/api/notes"
import { useToast } from "@/hooks/useToast"
import { NoteDialog } from "@/components/NoteDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

export function SecureNotes() {
  const [notes, setNotes] = useState<SecureNote[]>([])
  const [filteredNotes, setFilteredNotes] = useState<SecureNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNote, setSelectedNote] = useState<SecureNote | null>(null)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const { toast } = useToast()
  const { masterPassword } = useAuth();

  const fetchNotes = async () => {
    if (!masterPassword) return;
    try {
      setLoading(true);
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes);
      setFilteredNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (masterPassword) {
      fetchNotes()
    }
  }, [masterPassword, toast])

  useEffect(() => {
    let filtered = notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredNotes(filtered)
  }, [searchTerm, notes])

  const handleEdit = async (note: SecureNote) => {
    if (!masterPassword) return;
    try {
        const { content } = await decryptNote(note.id, masterPassword);
        setSelectedNote({ ...note, content });
        setShowNoteDialog(true);
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to decrypt note.",
            variant: "destructive",
        });
    }
  }

  const handleAddNew = () => {
    setSelectedNote(null)
    setShowNoteDialog(true)
  }

  const handleSave = async () => {
    setShowNoteDialog(false);
    await fetchNotes();
  }

  if (!masterPassword) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader>
            <CardTitle>Master Password Required</CardTitle>
            <CardDescription>
              Please enter your master password in the dialog to view and manage your secure notes.
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
        <p>Loading notes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold">Secure Notes</h1>
          <p className="text-muted-foreground">
            Manage your {notes.length} secure notes.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/40"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All Notes</DropdownMenuItem>
                <DropdownMenuItem>Favorites</DropdownMenuItem>
                <DropdownMenuItem>Recently Modified</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => handleEdit(note)}>
                  <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-primary" />
                          <h3 className="font-semibold line-clamp-1 flex-1">{note.title}</h3>
                      </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-4">
                          Click to view content
                      </p>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground pt-3">
                      Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </CardFooter>
                </Card>
            ))}
            </div>
        </CardContent>
      </Card>

      <NoteDialog
        open={showNoteDialog}
        onOpenChange={setShowNoteDialog}
        note={selectedNote}
        onSave={handleSave}
      />
    </div>
  )
}