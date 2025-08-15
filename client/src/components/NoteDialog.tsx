import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { SecureNote, createNote } from "@/api/notes"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/contexts/AuthContext"

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: SecureNote | null
  onSave: () => void
}

export function NoteDialog({ open, onOpenChange, note, onSave }: NoteDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { masterPassword } = useAuth();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      content: "",
    }
  })

  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content || "",
      })
    } else {
      reset({
        title: "",
        content: "",
      })
    }
  }, [note, reset])

  const onSubmit = async (data: any) => {
    if (!masterPassword) {
        toast({
            title: "Error",
            description: "Master password is not set.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true)
    try {
      // For now, we only support creating notes. Editing will be implemented later.
      await createNote(data, masterPassword)
      toast({
        title: "Success",
        description: "Note added successfully",
      })

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving note:', error)
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>
            {note ? 'Edit Note' : 'Add New Note'}
          </DialogTitle>
          <DialogDescription>
            {note ? 'Update your secure note' : 'Add a new secure note to your vault'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter note title"
                {...register("title", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your secure note content"
                rows={8}
                {...register("content", { required: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : note ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}