"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser } from "reactfire";
import { doc, getDoc } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Home,
  PenLine,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { updateDoc } from "firebase/firestore";

type ProposalData = {
  clientName: string;
  amount: string;
  propertyType: string;
  category: string;
  subCategory: string;
  includeMaterials: boolean;
  includeVAT: boolean;
  generalInfo: string;
  startDate?: Date;
  validityPeriod: string;
  clientEmail: string;
  clientPhone: string;
  workAddress: string;
  createdAt: any;
  status: string;
  userId: string;
};

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const firestore = useFirestore();
  const { data: user } = useUser();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function loadProposal() {
      try {
        setLoading(true);
        if (!id) return;

        const proposalRef = doc(firestore, "proposals", id);
        const proposalSnapshot = await getDoc(proposalRef);

        if (!proposalSnapshot.exists()) {
          toast({
            title: "Offert hittades inte",
            description: "Den begärda offerten kunde inte hittas.",
            variant: "destructive",
          });
          router.push("/proposals");
          return;
        }

        // Convert Firestore timestamp to Date
        const data = proposalSnapshot.data() as ProposalData;
        if (data.startDate) {
          data.startDate = (data.startDate as any).toDate();
        }

        setProposal(data);
      } catch (error) {
        console.error("Error loading proposal:", error);
        toast({
          title: "Fel",
          description: "Det uppstod ett fel när offerten skulle hämtas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProposal();
  }, [id, firestore, router]);

  const updateProposalStatus = async (newStatus: string) => {
    if (!id || !proposal) return;

    try {
      setUpdatingStatus(true);
      const proposalRef = doc(firestore, "proposals", id);
      await updateDoc(proposalRef, {
        status: newStatus,
      });

      setProposal({
        ...proposal,
        status: newStatus,
      });

      toast({
        title: newStatus === "accepted" ? "Offert godkänd!" : "Offert avböjd",
        description:
          newStatus === "accepted"
            ? "Du har godkänt offerten. Entreprenören kommer att kontakta dig snart."
            : "Du har avböjt offerten.",
      });
    } catch (error) {
      console.error("Error updating proposal status:", error);
      toast({
        title: "Fel",
        description:
          "Det uppstod ett fel när offertens status skulle uppdateras.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-md w-1/3 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded-md mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Offert hittades inte</h1>
        <p className="text-muted-foreground mb-8">
          Offerten du söker finns inte eller har tagits bort.
        </p>
        <Button onClick={() => router.push("/proposals")}>
          Tillbaka till offerter
        </Button>
      </div>
    );
  }

  // Calculate amount with/without VAT
  const amount = parseFloat(proposal.amount) || 0;
  const amountWithVAT = amount * 1.25;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Offert från entreprenör</h1>
          <p className="text-muted-foreground">
            Skapad:{" "}
            {proposal.createdAt?.toDate
              ? format(proposal.createdAt.toDate(), "PPP", { locale: sv })
              : "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {proposal.status === "draft" && (
            <Badge
              variant="outline"
              className="text-orange-500 border-orange-500"
            >
              Utkast
            </Badge>
          )}
          {proposal.status === "accepted" && (
            <Badge
              variant="outline"
              className="text-green-500 border-green-500"
            >
              Godkänd
            </Badge>
          )}
          {proposal.status === "rejected" && (
            <Badge variant="outline" className="text-red-500 border-red-500">
              Avböjd
            </Badge>
          )}
          <Button variant="outline" onClick={() => router.push("/proposals")}>
            Alla offerter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Offertdetaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <div className="w-16">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="/avatars/01.png" alt="Entreprenör" />
                    <AvatarFallback>EN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">
                    {proposal.clientName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.workAddress}
                  </p>
                </div>
                <div className="font-medium text-xl">
                  {proposal.includeVAT
                    ? `${amountWithVAT.toLocaleString("sv-SE")} SEK`
                    : `${amount.toLocaleString("sv-SE")} SEK`}
                  <span className="text-sm text-muted-foreground block text-right">
                    {proposal.includeVAT ? "inkl. moms" : "exkl. moms"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Offertinformation
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-sm">
                      <Home className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Typ av bostad:
                      </span>
                      <span className="font-medium">
                        {proposal.propertyType}
                      </span>
                    </li>
                    <li className="flex items-center text-sm">
                      <PenLine className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Kategori:
                      </span>
                      <span className="font-medium">{proposal.category}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <PenLine className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Underkategori:
                      </span>
                      <span className="font-medium">
                        {proposal.subCategory}
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Tidsinformation</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Startdatum:
                      </span>
                      <span className="font-medium">
                        {proposal.startDate
                          ? format(proposal.startDate, "PPP", { locale: sv })
                          : "Ej angivet"}
                      </span>
                    </li>
                    <li className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Giltighetstid:
                      </span>
                      <span className="font-medium">
                        {proposal.validityPeriod}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Allmän information</h4>
                <div className="bg-muted rounded-md p-4 whitespace-pre-wrap">
                  {proposal.generalInfo || "Ingen information tillgänglig"}
                </div>
              </div>

              <Separator />

              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium mb-3">Prisdetaljer</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Offertbelopp (exkl. moms)
                    </span>
                    <span>{amount.toLocaleString("sv-SE")} SEK</span>
                  </div>
                  {proposal.includeVAT && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Moms (25%)
                        </span>
                        <span>
                          {(amount * 0.25).toLocaleString("sv-SE")} SEK
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Totalbelopp (inkl. moms)</span>
                        <span>{amountWithVAT.toLocaleString("sv-SE")} SEK</span>
                      </div>
                    </>
                  )}
                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        proposal.includeMaterials
                          ? "text-green-600 border-green-600"
                          : "text-red-600 border-red-600"
                      )}
                    >
                      {proposal.includeMaterials
                        ? "✓ Material ingår"
                        : "✗ Material ingår ej"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Kontaktinformation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Arbetsadress</h4>
                    <p className="text-muted-foreground">
                      {proposal.workAddress}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Mail className="w-5 h-5 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">E-post</h4>
                    <p className="text-muted-foreground">
                      {proposal.clientEmail}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Phone className="w-5 h-5 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Telefon</h4>
                    <p className="text-muted-foreground">
                      {proposal.clientPhone}
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ta beslut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Granska offerten noggrant. Vid frågor, kontakta entreprenören
                direkt innan du beslutar.
              </p>

              {proposal.status === "draft" && (
                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => updateProposalStatus("rejected")}
                    disabled={updatingStatus}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Avböj offert
                  </Button>

                  <Button
                    className="w-full"
                    onClick={() => updateProposalStatus("accepted")}
                    disabled={updatingStatus}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Godkänn offert
                  </Button>

                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ställ en fråga
                  </Button>
                </div>
              )}

              {proposal.status === "accepted" && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
                  <h4 className="font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Offert godkänd
                  </h4>
                  <p className="text-sm mt-1">
                    Du har godkänt denna offert. Entreprenören kommer att
                    kontakta dig inom kort för att planera arbetet.
                  </p>
                </div>
              )}

              {proposal.status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                  <h4 className="font-medium flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Offert avböjd
                  </h4>
                  <p className="text-sm mt-1">
                    Du har avböjt denna offert. Om detta var ett misstag,
                    vänligen kontakta entreprenören direkt.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
