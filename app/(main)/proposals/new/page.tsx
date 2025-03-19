"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { CategorySelect } from "@/components/proposals/category-select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFirestore } from "reactfire";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser } from "reactfire";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { forwardRef } from "react";

const propertyTypes = [
  "Lägenhet",
  "Villa/Radhus",
  "Kontor",
  "Restaurang",
  "Annat",
] as const;

const formSchema = z.object({
  clientName: z.string().min(1, "Kundnamn krävs"),
  amount: z.string().min(1, "Belopp krävs"),
  propertyType: z.string().min(1, "Typ av bostad krävs"),
  category: z.string().min(1, "Kategori krävs"),
  subCategory: z.string().min(1, "Underkategori krävs"),
  includeMaterials: z.boolean(),
  includeVAT: z.boolean(),
  generalInfo: z.string().trim().min(1, "Allmän information krävs"),
  startDate: z.date().optional(),
  validityPeriod: z.string().min(1, "Giltighetstid krävs"),
  clientEmail: z.string().email("Ogiltig e-postadress"),
  clientPhone: z.string().min(1, "Telefonnummer krävs"),
  workAddress: z.string().min(1, "Arbetsadress krävs"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewProposalPage() {
  const { toast } = useToast();
  const { data: user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Firestore instance:", firestore);
    console.log("User status:", user ? "Logged in" : "Not logged in");
    if (user) {
      console.log("User ID:", user.uid);
    }
  }, [firestore, user]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      amount: "",
      propertyType: "",
      category: "",
      subCategory: "",
      includeMaterials: false,
      includeVAT: false,
      generalInfo: "",
      startDate: undefined,
      validityPeriod: "",
      clientEmail: "",
      clientPhone: "",
      workAddress: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form data being submitted:", data);

    if (!user) {
      toast({
        title: "Fel",
        description: "Du måste vara inloggad för att skapa en offert.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Attempting to write to Firestore...");

      const proposalData = {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
        status: "draft",
      };

      console.log("Proposal data:", JSON.stringify(proposalData, null, 2));
      console.log("User ID being used:", user.uid);
      console.log("Using Firestore instance:", !!firestore);

      const proposalRef = await addDoc(
        collection(firestore, "proposals"),
        proposalData
      );
      console.log("Successfully wrote to Firestore, doc ID:", proposalRef.id);
      console.log("Document path:", proposalRef.path);

      // Add a small delay to ensure Firestore has time to update the document
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Offert skapad!",
        description: "Din offert har skapats framgångsrikt.",
      });

      router.push(`/proposals/${proposalRef.id}`);
    } catch (error) {
      console.error("Detailed error creating proposal:", error);
      toast({
        title: "Fel",
        description: "Det uppstod ett fel när offerten skulle skapas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast({
      title: "Valideringsfel",
      description: "Vänligen fyll i alla obligatoriska fält korrekt.",
      variant: "destructive",
    });
  };

  const formData = form.watch();
  const amount = parseFloat(formData.amount) || 0;
  const amountWithVAT = amount * 1.25;

  console.log("generalInfo value:", formData.generalInfo);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Skapa ny offert</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Tillbaka
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Offertdetaljer</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit, onError)}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatars/01.png" alt="Kund" />
                  <AvatarFallback>
                    {formData.clientName.slice(0, 2).toUpperCase() || "KL"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Label htmlFor="clientName">Kundnamn</Label>
                  <Input
                    id="clientName"
                    {...form.register("clientName")}
                    placeholder="Ange kundnamn"
                  />
                  {form.formState.errors.clientName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.clientName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Belopp (SEK)</Label>
                <Input
                  id="amount"
                  type="number"
                  {...form.register("amount")}
                  placeholder="Ange belopp"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Typ av bostad</Label>
                <select
                  id="propertyType"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  {...form.register("propertyType")}
                >
                  <option value="">Välj typ av bostad</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {form.formState.errors.propertyType && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.propertyType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <CategorySelect
                  value={formData.category}
                  onValueChange={(value) => form.setValue("category", value)}
                />
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory">Underkategori</Label>
                <Input
                  id="subCategory"
                  {...form.register("subCategory")}
                  placeholder="Ange underkategori"
                />
                {form.formState.errors.subCategory && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.subCategory.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeMaterials"
                  checked={formData.includeMaterials}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue("includeMaterials", checked)
                  }
                />
                <Label htmlFor="includeMaterials">Inkludera material</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeVAT"
                  checked={formData.includeVAT}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue("includeVAT", checked)
                  }
                />
                <Label htmlFor="includeVAT">Visa pris inkl moms</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="generalInfo">Allmän info</Label>
                <Textarea
                  id="generalInfo"
                  {...form.register("generalInfo", {
                    onChange: (e) => {
                      console.log("Textarea onChange:", e.target.value);
                      form.setValue("generalInfo", e.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    },
                  })}
                  placeholder="Ange allmän information"
                  className="min-h-[100px]"
                />
                {form.formState.errors.generalInfo && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.generalInfo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Förväntat startdatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <div>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "PPP", { locale: sv })
                        ) : (
                          <span>Välj ett datum</span>
                        )}
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="flex w-auto flex-col space-y-2 p-2"
                  >
                    <div className="rounded-md border">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => {
                          form.setValue("startDate", date);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        locale={sv}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {form.formState.errors.startDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validityPeriod">Offert giltighetstid</Label>
                <Input
                  id="validityPeriod"
                  {...form.register("validityPeriod")}
                  placeholder="Ange giltighetstid"
                />
                {form.formState.errors.validityPeriod && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.validityPeriod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Mail till kund</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  {...form.register("clientEmail")}
                  placeholder="Ange kundens e-post"
                />
                {form.formState.errors.clientEmail && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.clientEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefonnummer till kund</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  {...form.register("clientPhone")}
                  placeholder="Ange kundens telefonnummer"
                />
                {form.formState.errors.clientPhone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.clientPhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workAddress">Arbetsadress</Label>
                <Input
                  id="workAddress"
                  {...form.register("workAddress")}
                  placeholder="Ange arbetsadress"
                />
                {form.formState.errors.workAddress && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.workAddress.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Skapar offert..." : "Skapa offert"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Förhandsvisning</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hur din offert kommer att se ut för kunden
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatars/01.png" alt="Kund" />
                  <AvatarFallback>
                    {formData.clientName.slice(0, 2).toUpperCase() || "KL"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {formData.clientName || "Kundnamn"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.workAddress || "Arbetsadress"}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {formData.amount ? `${formData.amount} SEK` : "0 SEK"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Offertdetaljer</h3>
                  <Badge variant="secondary">Utkast</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Typ av bostad:</span>{" "}
                    {formData.propertyType || "Ej angiven"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Kategori:</span>{" "}
                    {formData.category || "Ej angiven"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Underkategori:</span>{" "}
                    {formData.subCategory || "Ej angiven"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Startdatum:</span>{" "}
                    {formData.startDate
                      ? format(formData.startDate, "PPP", { locale: sv })
                      : "Ej angivet"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Giltighetstid:</span>{" "}
                    {formData.validityPeriod || "Ej angiven"}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    {formData.generalInfo || "Ingen allmän information angiven"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Totalt belopp
                  </span>
                  <span className="font-semibold">
                    {formData.includeVAT
                      ? `${amountWithVAT.toFixed(2)} SEK (inkl moms)`
                      : `${amount.toFixed(2)} SEK (exkl moms)`}
                  </span>
                </div>
                {formData.includeVAT && (
                  <div className="text-sm text-muted-foreground text-right">
                    {amount.toFixed(2)} SEK (exkl moms)
                  </div>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {formData.includeMaterials
                      ? "✓ Inkluderar material"
                      : "✗ Exkluderar material"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.includeVAT
                      ? "✓ Inkluderar moms (25%)"
                      : "✗ Exkluderar moms"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  Avböj
                </Button>
                <Button variant="outline">Fråga</Button>
                <Button>Godkänn</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
