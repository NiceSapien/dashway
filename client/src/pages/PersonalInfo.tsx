import { useAuth } from "@/contexts/AuthContext";
import {
  deletePersonalInfo,
  getPersonalInfos,
  PersonalInfo as PersonalInfoType,
} from "@/api/personalInfo";
import { useToast } from "@/hooks/useToast";
import { PersonalInfoDialog } from "@/components/PersonalInfoDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PersonalInfo() {
  const { masterPassword } = useAuth();
  const { toast } = useToast();
  const [infos, setInfos] = useState<PersonalInfoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<PersonalInfoType | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchInfos = async () => {
    if (!masterPassword) {
      toast({
        title: "Error",
        description: "Master password is not set.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedInfos = await getPersonalInfos();
      setInfos(fetchedInfos);
    } catch (error) {
      toast({
        title: "Error fetching personal infos",
        description:
          "Could not fetch personal infos. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (masterPassword) {
      fetchInfos();
    }
  }, [masterPassword]);

  const handleAdd = () => {
    setSelectedInfo(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (info: PersonalInfoType) => {
    setSelectedInfo(info);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const originalInfos = [...infos];
    setInfos(infos.filter((info) => info.id !== id));
    try {
      await deletePersonalInfo(id);
      toast({
        title: "Personal Info Deleted",
        description: "The personal info has been successfully deleted.",
      });
    } catch (error) {
      setInfos(originalInfos);
      toast({
        title: "Error deleting personal info",
        description: "Could not delete the personal info. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    fetchInfos();
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {infos.map((info) => (
        <Card
          key={info.id}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  {info.name}
                </CardTitle>
                <CardDescription>
                  Updated: {new Date(info.updatedAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(info)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(info.id)}
                  className="text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  const renderList = () => (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {infos.map((info) => (
                <tr
                  key={info.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white mr-4">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{info.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(info.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(info)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(info.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => {
    const skeletonCount = 3;
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(skeletonCount)].map((_, i) => (
            <Card
              key={i}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8" />
              </CardHeader>
            </Card>
          ))}
        </div>
      );
    }
    return (
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(skeletonCount)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="w-8 h-8 rounded-full mr-4" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-[100px]" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Skeleton className="w-8 h-8" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Personal Information
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information entries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Info
          </Button>
        </div>
      </div>

      {loading
        ? renderSkeleton()
        : infos.length > 0
        ? viewMode === "grid"
          ? renderGrid()
          : renderList()
        : !loading && (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No personal information
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding a new personal info entry.
              </p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Info
                </Button>
              </div>
            </div>
          )}

      <PersonalInfoDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        info={selectedInfo}
      />
    </div>
  );
}