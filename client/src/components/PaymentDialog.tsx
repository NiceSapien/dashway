import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { Payment, PaymentData, createPayment, updatePayment, decryptPayment } from "@/api/payments"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/contexts/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment?: Payment | null
  onSave: () => void
}

type FormData = {
    name: string;
    type: 'card' | 'bankAccount';
} & PaymentData;


export function PaymentDialog({ open, onOpenChange, payment, onSave }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { masterPassword } = useAuth()
  const [activeTab, setActiveTab] = useState<'card' | 'bankAccount'>('card');

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<FormData>();

  const type = watch("type");

  useEffect(() => {
    const initialTab = payment?.type || 'card';
    setActiveTab(initialTab);
    setValue('type', initialTab);

  if (payment && masterPassword) {
        setLoading(true);
    decryptPayment(payment.id, masterPassword).then(decrypted => {
            reset({
                name: payment.name,
                type: payment.type,
                ...decrypted,
            });
        }).catch(() => {
            toast({
                title: "Error",
                description: "Could not decrypt payment details.",
                variant: "destructive",
            });
            onOpenChange(false);
        }).finally(() => setLoading(false));
    } else {
      reset({
        name: '',
        type: initialTab,
        cardholderName: '',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        cardType: undefined,
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: undefined,
      });
    }
  }, [payment, masterPassword, reset, setValue, onOpenChange, toast]);

  useEffect(() => {
    if (!payment) {
        setValue('type', activeTab);
    }
  }, [activeTab, payment, setValue]);

  const onSubmit = async (formData: FormData) => {
    if (!masterPassword) {
      toast({
        title: "Error",
        description: "Master password is not set.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const { name, type, ...data } = formData;
      
      if (payment) {
        await updatePayment(payment.id, type, name, data, masterPassword);
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        })
      } else {
        await createPayment(type, name, data, masterPassword);
        toast({
          title: "Success",
          description: "Payment method added successfully",
        })
      }

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving payment method:', error)
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {payment ? `Edit Payment Method` : `Add New Payment Method`}
          </DialogTitle>
          <DialogDescription>
            {payment ? `Update your payment information` : `Add a new credit card or bank account to your vault`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nickname</Label>
                <Input
                    id="name"
                    placeholder="e.g., Main Credit Card or Personal Checking"
                    {...register("name", { required: true })}
                />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'card' | 'bankAccount')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card" disabled={!!payment && payment.type !== 'card'}>Credit Card</TabsTrigger>
                    <TabsTrigger value="bankAccount" disabled={!!payment && payment.type !== 'bankAccount'}>Bank Account</TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4 pt-4">
                    {activeTab === 'card' && (
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cardholderName">Cardholder Name</Label>
                                <Input
                                id="cardholderName"
                                placeholder="John Doe"
                                {...register("cardholderName", { required: type === 'card' })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                {...register("cardNumber", { required: type === 'card' })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                <Label htmlFor="expirationDate">Expiry Date</Label>
                                <Input
                                    id="expirationDate"
                                    placeholder="MM/YY"
                                    {...register("expirationDate", { required: type === 'card' })}
                                />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    placeholder="123"
                                    {...register("cvv", { required: type === 'card' })}
                                />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="cardType">Card Type</Label>
                                <Controller
                                    name="cardType"
                                    control={control}
                                    rules={{ required: type === 'card' }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="visa">Visa</SelectItem>
                                                <SelectItem value="mastercard">Mastercard</SelectItem>
                                                <SelectItem value="amex">American Express</SelectItem>
                                                <SelectItem value="discover">Discover</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="bankAccount" className="space-y-4 pt-4">
                    {activeTab === 'bankAccount' && (
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Input
                                id="bankName"
                                placeholder="Chase Bank"
                                {...register("bankName", { required: type === 'bankAccount' })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountType">Account Type</Label>
                                <Controller
                                    name="accountType"
                                    control={control}
                                    rules={{ required: type === 'bankAccount' }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="checking">Checking</SelectItem>
                                                <SelectItem value="savings">Savings</SelectItem>
                                                <SelectItem value="business">Business</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                <Input
                                id="accountHolderName"
                                placeholder="John Doe"
                                {...register("accountHolderName", { required: type === 'bankAccount' })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number</Label>
                                <Input
                                id="accountNumber"
                                placeholder="1234567890"
                                {...register("accountNumber", { required: type === 'bankAccount' })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="routingNumber">Routing Number</Label>
                                <Input
                                id="routingNumber"
                                placeholder="021000021"
                                {...register("routingNumber", { required: type === 'bankAccount' })}
                                />
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : payment ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}