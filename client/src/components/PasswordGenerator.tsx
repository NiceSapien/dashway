import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"
import { Badge } from "./ui/badge"
import { Copy, RefreshCw } from "lucide-react"
import { generatePassword } from "@/api/passwords"
import { useToast } from "@/hooks/useToast"

interface PasswordGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUsePassword?: (password: string) => void
}

export function PasswordGenerator({ open, onOpenChange, onUsePassword }: PasswordGeneratorProps) {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState([16])
  const [options, setOptions] = useState({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false
  })
  const [strength, setStrength] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await generatePassword({
        length: length[0],
        ...options
      })
      setPassword(response.password)
      setStrength(response.strength)
    } catch (error) {
      console.error('Error generating password:', error)
      toast({
        title: "Error",
        description: "Failed to generate password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleUsePassword = () => {
    if (onUsePassword) {
      onUsePassword(password)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Password Generator</DialogTitle>
          <DialogDescription>
            Generate a strong, secure password
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generated Password Display */}
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono break-all flex-1 mr-4">
                  {password || "Click generate to create password"}
                </code>
                {password && (
                  <div className="flex items-center gap-2">
                    <Badge variant={strength === 'strong' ? 'default' : strength === 'medium' ? 'secondary' : 'destructive'}>
                      {strength}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Generate Password'}
            </Button>
          </div>

          {/* Password Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Length: {length[0]} characters</Label>
              <Slider
                value={length}
                onValueChange={setLength}
                max={128}
                min={8}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
                <Switch
                  id="uppercase"
                  checked={options.includeUppercase}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeUppercase: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
                <Switch
                  id="lowercase"
                  checked={options.includeLowercase}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeLowercase: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="numbers">Numbers (0-9)</Label>
                <Switch
                  id="numbers"
                  checked={options.includeNumbers}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeNumbers: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
                <Switch
                  id="symbols"
                  checked={options.includeSymbols}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeSymbols: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ambiguous">Exclude Ambiguous Characters</Label>
                <Switch
                  id="ambiguous"
                  checked={options.excludeAmbiguous}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, excludeAmbiguous: checked }))}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {onUsePassword && password && (
            <Button onClick={handleUsePassword}>
              Use This Password
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}