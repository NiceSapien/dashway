import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSecurityAnalysis, SecurityAnalysis, PasswordAnalysis } from "@/api/security";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export function SecurityDashboard() {
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { masterPassword } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!masterPassword) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getSecurityAnalysis(masterPassword);
        setAnalysis(data);
      } catch (error) {
        console.error("Error fetching security analysis:", error);
        toast({
          title: "Error",
          description: "Failed to load security analysis.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [masterPassword, toast]);

  const getScoreColor = (score: number) => {
    if (score > 80) return "bg-green-500";
    if (score > 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="mt-6 h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!masterPassword) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Master Password Required</CardTitle>
            <CardDescription>
              Please enter your master password to view your security analysis.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (!analysis) {
    return <div>No analysis data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Security Dashboard
        </h1>
        <p className="text-muted-foreground">
          An overview of your password security health.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Security Score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-gray-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={`${getScoreColor(analysis.overallScore).replace('bg-', 'text-')}`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${analysis.overallScore}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{analysis.overallScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground">
              Your security score is an assessment of your password strength.
              A higher score means stronger security.
            </p>
            <Progress value={analysis.overallScore} className={`mt-2 h-3 ${getScoreColor(analysis.overallScore)}`} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weak Passwords</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.weakCount}</div>
            <p className="text-xs text-muted-foreground">
              Passwords that are too short or easy to guess.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reused Passwords</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.reusedCount}</div>
            <p className="text-xs text-muted-foreground">
              Using the same password across multiple sites.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Old Passwords</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.oldPasswordCount}</div>
            <p className="text-xs text-muted-foreground">
              Passwords that haven't been changed in over a year.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Password Health</CardTitle>
          <CardDescription>
            Review these passwords to improve your security score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website/Service</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.passwords.filter(p => p.isWeak || p.isReused || p.isOld).map((p: PasswordAnalysis) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {p.isWeak && <Badge variant="destructive">Weak</Badge>}
                      {p.isReused && <Badge variant="destructive">Reused</Badge>}
                      {p.isOld && <Badge variant="outline">Old</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}