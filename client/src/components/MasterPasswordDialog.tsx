import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface MasterPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MasterPasswordDialog({ open, onOpenChange }: MasterPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const { setMasterPassword } = useAuth();

  const handleSubmit = () => {
    if (password) {
      setMasterPassword(password);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Master Password</DialogTitle>
          <DialogDescription>
            To access your encrypted data, please enter your master password. This password is used to decrypt your data and is not stored on our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="master-password" className="text-right">
              Password
            </Label>
            <Input
              id="master-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Unlock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
