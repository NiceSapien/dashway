import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Building2,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  GripVertical,
  List,
} from "lucide-react";
import {
  getPayments,
  decryptPayment,
  deletePayment,
  Payment,
  PaymentData,
} from "@/api/payments";
import { useToast } from "@/hooks/useToast";
import { PaymentDialog } from "@/components/PaymentDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type ViewMode = "grid" | "list";

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [decryptedData, setDecryptedData] = useState<Map<number, PaymentData>>(
    new Map()
  );
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { toast } = useToast();
  const { masterPassword } = useAuth();

  const fetchPayments = async () => {
    if (!masterPassword) return;
    try {
      setLoading(true);
      const fetchedPayments = await getPayments();
      setPayments(fetchedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (masterPassword) {
      fetchPayments();
    }
  }, [masterPassword]);

  const handleAddNew = () => {
    setSelectedPayment(null);
    setDialogOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleSave = () => {
    setDialogOpen(false);
    fetchPayments();
    // Clear decrypted data for the edited item if it exists
    if (selectedPayment && decryptedData.has(selectedPayment.id)) {
      const newDecrypted = new Map(decryptedData);
      newDecrypted.delete(selectedPayment.id);
      setDecryptedData(newDecrypted);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    try {
  await deletePayment(paymentToDelete.id);
      toast({
        title: "Success",
        description: `"${paymentToDelete.name}" has been deleted.`,
      });
      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment method.",
        variant: "destructive",
      });
    } finally {
      setPaymentToDelete(null);
    }
  };

  const toggleDecryption = async (paymentId: number) => {
    if (!masterPassword) return;

    if (decryptedData.has(paymentId)) {
      const newDecrypted = new Map(decryptedData);
      newDecrypted.delete(paymentId);
      setDecryptedData(newDecrypted);
    } else {
      try {
        const decrypted = await decryptPayment(paymentId, masterPassword);
        const newDecrypted = new Map(decryptedData);
        newDecrypted.set(paymentId, decrypted);
        setDecryptedData(newDecrypted);
      } catch (error) {
        toast({
          title: "Decryption Failed",
          description: "Could not decrypt payment. The master password may be incorrect.",
          variant: "destructive",
        });
      }
    }
  };

  const copyToClipboard = (text: string | undefined, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${fieldName} copied to clipboard.` });
  };

  const cards = useMemo(
    () => payments.filter((p) => p.type === "card"),
    [payments]
  );
  const bankAccounts = useMemo(
    () => payments.filter((p) => p.type === "bankAccount"),
    [payments]
  );

  const renderPaymentCard = (payment: Payment) => {
  const data = decryptedData.get(payment.id);
    const isCard = payment.type === "card";
    const icon = isCard ? (
      <CreditCard className="h-6 w-6 text-gray-500" />
    ) : (
      <Building2 className="h-6 w-6 text-gray-500" />
    );

    return (
  <Card key={payment.id} className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {icon}
              <div>
                <CardTitle>{payment.name}</CardTitle>
                <CardDescription>
                  {isCard
                    ? data?.cardholderName ?? "Card Holder"
                    : data?.bankName ?? "Bank Name"}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(payment)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPaymentToDelete(payment)}
                  className="text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          {data ? (
            isCard ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono tracking-wider">{data.cardNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(data.cardNumber, "Card Number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Expires</p>
                    <p>{data.expirationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CVV</p>
                    <p>{data.cvv}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {data.accountType && <Badge>{data.accountType}</Badge>}
                <div className="flex items-center justify-between">
                  <span className="font-mono">{data.accountNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(data.accountNumber, "Account Number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono">{data.routingNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(data.routingNumber, "Routing Number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Click Reveal to see details
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Updated {formatDistanceToNow(new Date(payment.updatedAt), { addSuffix: true })}
          </p>
          <Button variant="secondary" onClick={() => toggleDecryption(payment.id)}>
            {decryptedData.has(payment.id) ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {decryptedData.has(payment.id) ? "Hide" : "Reveal"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderPaymentList = (payments: Payment[]) => (
     <Card>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr className="border-b">
                            <th className="p-4 text-left font-semibold">Name</th>
                            <th className="p-4 text-left font-semibold">Type</th>
                            <th className="p-4 text-left font-semibold">Last Updated</th>
                            <th className="p-4 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment.id} className="border-b">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {payment.type === 'card' ? <CreditCard className="h-5 w-5 text-muted-foreground" /> : <Building2 className="h-5 w-5 text-muted-foreground" />}
                                        <span className="font-medium">{payment.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 capitalize text-muted-foreground">{payment.type === 'card' ? 'Card' : 'Bank Account'}</td>
                                <td className="p-4 text-muted-foreground">{formatDistanceToNow(new Date(payment.updatedAt), { addSuffix: true })}</td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}>Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardContent>
     </Card>
  );

  const renderContent = (items: Payment[]) => {
    if (loading) {
      return (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/50"></Card>
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold">No payment methods yet</h3>
          <p className="text-muted-foreground mt-2">
            Click "Add New" to add your first payment method.
          </p>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(renderPaymentCard)}
        </div>
      );
    }
    return renderPaymentList(items);
  };

  if (!masterPassword) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Master Password Required</CardTitle>
            <CardDescription>
              Please provide your master password to view your payments.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Your saved credit cards and bank accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddNew} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cards">
            Credit Cards ({cards.length})
          </TabsTrigger>
          <TabsTrigger value="accounts">
            Bank Accounts ({bankAccounts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="pt-6">
          {renderContent(cards)}
        </TabsContent>
        <TabsContent value="accounts" className="pt-6">
          {renderContent(bankAccounts)}
        </TabsContent>
      </Tabs>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payment={selectedPayment}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!paymentToDelete}
        onOpenChange={() => setPaymentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              payment method "{paymentToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}