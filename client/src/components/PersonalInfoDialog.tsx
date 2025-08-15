import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  PersonalInfo,
  PersonalInfoData,
  createPersonalInfo,
  updatePersonalInfo,
  decryptPersonalInfo,
} from "@/api/personalInfo";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

interface PersonalInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  info?: PersonalInfo | null;
}

export function PersonalInfoDialog({
  isOpen,
  onClose,
  onSave,
  info,
}: PersonalInfoDialogProps) {
  const { masterPassword } = useAuth();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PersonalInfoData & { name: string }>();

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (info && masterPassword) {
        try {
          const decryptedData = await decryptPersonalInfo(
            info.id,
            masterPassword
          );
          reset({ name: info.name, ...decryptedData });
        } catch (error) {
          toast({
            title: "Decryption Failed",
            description: "Could not decrypt personal info.",
            variant: "destructive",
          });
          onClose();
        }
      } else {
        reset({
          name: "",
          firstName: "",
          middleName: "",
          lastName: "",
          username: "",
          identityNumber: "",
          passportNumber: "",
          driverLicenseNumber: "",
          email: "",
          phone: "",
          website: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        });
      }
    };

    if (isOpen) {
      fetchAndSetData();
    }
  }, [info, isOpen, masterPassword, reset, toast, onClose]);

  const onSubmit = async (data: PersonalInfoData & { name: string }) => {
    if (!masterPassword) {
      toast({
        title: "Error",
        description: "Master password is not set.",
        variant: "destructive",
      });
      return;
    }

    const { name, ...personalInfoData } = data;

    try {
      if (info) {
        await updatePersonalInfo(
          info.id,
          name,
          personalInfoData,
          masterPassword
        );
        toast({ description: "Personal info updated successfully." });
      } else {
        await createPersonalInfo(name, personalInfoData, masterPassword);
        toast({ description: "Personal info created successfully." });
      }
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save personal info.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {info ? "Edit Personal Info" : "Add Personal Info"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the personal information entry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Entry Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Main Profile, Work Details"
                  {...register("name", { required: "Entry name is required." })}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <Tabs defaultValue="identity" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="identity">Identity</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                </TabsList>
                <TabsContent value="identity" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" {...register("firstName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input id="middleName" {...register("middleName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" {...register("lastName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" {...register("username")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="identityNumber">
                        Identity Number (SSN)
                      </Label>
                      <Input
                        id="identityNumber"
                        {...register("identityNumber")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passportNumber">Passport Number</Label>
                      <Input
                        id="passportNumber"
                        {...register("passportNumber")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverLicenseNumber">
                        Driver's License
                      </Label>
                      <Input
                        id="driverLicenseNumber"
                        {...register("driverLicenseNumber")}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="contact" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...register("phone")} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" {...register("website")} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="address" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" {...register("address")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register("city")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" {...register("state")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                      <Input id="zipCode" {...register("zipCode")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" {...register("country")} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}