import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Key, 
  FileText, 
  Shield, 
  Download, 
  AlertTriangle,
  Clock,
  Star,
  TrendingUp
} from "lucide-react"
import { getSecurityAnalysis, SecurityAnalysis } from "@/api/security"
import { getPasswords } from "@/api/passwords"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/contexts/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"

export function Dashboard() {
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null)
  const [recentPasswords, setRecentPasswords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, masterPassword } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!masterPassword) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const [analysisResponse, passwordsResponse] = await Promise.all([
          getSecurityAnalysis(masterPassword),
          getPasswords()
        ])
        
        setSecurityAnalysis(analysisResponse)
        setRecentPasswords(passwordsResponse.slice(0, 5))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please ensure your master password is correct.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast, masterPassword])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.email ? user.email.split('@')[0] : 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your digital security.
          </p>
        </div>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Score
          </CardTitle>
          <CardDescription>
            Your overall password security health is rated {securityAnalysis?.overallScore || 0}%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex items-center justify-center w-28 h-28">
              <Progress value={securityAnalysis?.overallScore || 0} className="absolute w-full h-full rounded-full" />
              <div className={`text-3xl font-bold ${getScoreColor(securityAnalysis?.overallScore || 0)}`}>
                {securityAnalysis?.overallScore || 0}%
              </div>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <span className="font-semibold">{securityAnalysis?.weakCount || 0}</span>
                    <span className="text-muted-foreground"> Weak passwords</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                   <div>
                    <span className="font-semibold">{securityAnalysis?.reusedCount || 0}</span>
                    <span className="text-muted-foreground"> Reused passwords</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                   <div>
                    <span className="font-semibold">{securityAnalysis?.oldPasswordCount || 0}</span>
                    <span className="text-muted-foreground"> Old passwords</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <span className="font-semibold">{securityAnalysis?.totalPasswords || 0}</span>
                    <span className="text-muted-foreground"> Total items secured</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate('/security')} className="w-full">
                View Security Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/passwords')}>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Key className="h-5 w-5" />
            </div>
            <CardTitle>Add Password</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/notes')}>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle>Add Secure Note</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/security')}>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle>Security Checkup</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-lg bg-muted-foreground/10 text-muted-foreground">
              <Download className="h-5 w-5" />
            </div>
            <CardTitle>Import Data</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Passwords
          </CardTitle>
          <CardDescription>
            Your recently added or updated passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPasswords.length > 0 ? (
              recentPasswords.map((password) => (
                <div key={password._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    {password.website.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{password.website}</p>
                    <p className="text-sm text-muted-foreground">{password.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {password.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent passwords.</p>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate('/passwords')}>
              View All Passwords
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}