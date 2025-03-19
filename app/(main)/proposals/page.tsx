"use client";

import { useState, useEffect } from "react";
import { useFirestore, useUser } from "reactfire";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { PlusIcon } from "lucide-react";

type ProposalData = {
  id: string;
  clientName: string;
  amount: string;
  propertyType: string;
  category: string;
  workAddress: string;
  status: string;
  createdAt: any;
};

export default function ProposalsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { data: user } = useUser();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  async function loadProposals() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setRefreshing(true);

    try {
      console.log("Fetching all proposals for user:", user.uid);
      const proposalsRef = collection(firestore, "proposals");
      const proposalsQuery = query(
        proposalsRef,
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(proposalsQuery);
      console.log("Query execution complete, docs count:", querySnapshot.size);

      const loadedProposals: ProposalData[] = [];
      querySnapshot.forEach((doc) => {
        console.log("Loading doc:", doc.id, doc.data());
        loadedProposals.push({
          id: doc.id,
          ...doc.data(),
        } as ProposalData);
      });

      loadedProposals.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt;

        if (!dateA || !dateB) return 0;

        return dateB.getTime() - dateA.getTime();
      });

      console.log("Loaded proposals:", loadedProposals);
      setProposals(loadedProposals);
    } catch (error) {
      console.error("Error loading proposals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProposals();
  }, [firestore, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge
            variant="outline"
            className="text-orange-500 border-orange-500"
          >
            Utkast
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            Godkänd
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Avböjd
          </Badge>
        );
      default:
        return <Badge variant="outline">Okänd</Badge>;
    }
  };

  // Get count of proposals by status
  const getStatusCounts = () => {
    const counts = {
      all: proposals.length,
      draft: 0,
      accepted: 0,
      rejected: 0,
    };

    proposals.forEach((proposal) => {
      if (proposal.status === "draft") counts.draft++;
      if (proposal.status === "accepted") counts.accepted++;
      if (proposal.status === "rejected") counts.rejected++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Filter proposals by status
  const filteredProposals = statusFilter
    ? proposals.filter((p) => p.status === statusFilter)
    : proposals;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dina offerter</h1>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => loadProposals()}
            disabled={refreshing}
          >
            {refreshing ? "Uppdaterar..." : "Uppdatera listan"}
          </Button>
          <Button onClick={() => router.push("/proposals/new")}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Ny offert
          </Button>
        </div>
      </div>

      {!loading && proposals.length > 0 && (
        <div className="flex space-x-2 mb-6">
          <Badge
            variant={statusFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter(null)}
          >
            Alla ({statusCounts.all})
          </Badge>
          <Badge
            variant={statusFilter === "draft" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("draft")}
          >
            Utkast ({statusCounts.draft})
          </Badge>
          <Badge
            variant={statusFilter === "accepted" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("accepted")}
          >
            Godkända ({statusCounts.accepted})
          </Badge>
          <Badge
            variant={statusFilter === "rejected" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("rejected")}
          >
            Avböjda ({statusCounts.rejected})
          </Badge>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center bg-card rounded-md p-4 shadow-sm"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="ml-4 space-y-2 flex-grow">
                <div className="h-4 w-[150px] bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-[100px] bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="ml-auto">
                <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-12">
          {proposals.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Inga matchande offerter
              </h2>
              <p className="text-muted-foreground mb-6">
                Det finns inga offerter som matchar ditt filter.
              </p>
              <Button variant="outline" onClick={() => setStatusFilter(null)}>
                Visa alla offerter
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Inga offerter än</h2>
              <p className="text-muted-foreground mb-6">
                Du har inte skapat några offerter än. Skapa din första offert
                nu!
              </p>
              <Button onClick={() => router.push("/proposals/new")}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Skapa ny offert
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">
              Visar {filteredProposals.length}{" "}
              {filteredProposals.length === 1 ? "offert" : "offerter"}
              {statusFilter && ` (filtrerade)`}
            </p>
          </div>

          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-4 rounded-md transition-colors border border-border"
              onClick={() => router.push(`/proposals/${proposal.id}`)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>
                  {proposal.clientName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 flex-grow">
                <div className="flex items-center">
                  <p className="text-sm font-medium leading-none">
                    {proposal.clientName}
                  </p>
                  <div className="ml-2">{getStatusBadge(proposal.status)}</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {proposal.workAddress} • {proposal.category}
                </p>
              </div>
              <div className="ml-4 text-right">
                <p className="font-medium">
                  {parseInt(proposal.amount).toLocaleString("sv-SE")} SEK
                </p>
                <p className="text-xs text-muted-foreground">
                  {proposal.createdAt?.toDate
                    ? format(proposal.createdAt.toDate(), "PP", { locale: sv })
                    : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
