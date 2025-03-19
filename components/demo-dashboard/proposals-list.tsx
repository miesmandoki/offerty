"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useUser } from "reactfire";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

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

export function ProposalsList() {
  const router = useRouter();
  const firestore = useFirestore();
  const { data: user } = useUser();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProposals() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log("Fetching proposals for user:", user.uid);
      const proposalsRef = collection(firestore, "proposals");

      // First, just query by userId without orderBy to avoid index issues
      const proposalsQuery = query(
        proposalsRef,
        where("userId", "==", user.uid)
      );

      console.log("Query created:", proposalsQuery);
      const querySnapshot = await getDocs(proposalsQuery);
      console.log("Query execution complete, docs count:", querySnapshot.size);

      // Sort the results in memory instead of using orderBy
      const loadedProposals: ProposalData[] = [];
      querySnapshot.forEach((doc) => {
        console.log("Loading doc:", doc.id, doc.data());
        loadedProposals.push({
          id: doc.id,
          ...doc.data(),
        } as ProposalData);
      });

      // Sort the proposals by createdAt in memory
      loadedProposals.sort((a, b) => {
        // Handle the case where createdAt might be a Firestore Timestamp
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt;

        // If we can't extract valid dates, just keep original order
        if (!dateA || !dateB) return 0;

        // Sort in descending order (newest first)
        return dateB.getTime() - dateA.getTime();
      });

      // Take only the first 5 after sorting
      const recentProposals = loadedProposals.slice(0, 5);

      console.log("Loaded proposals:", recentProposals);
      setProposals(recentProposals);
    } catch (error) {
      console.error("Error loading proposals:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          Du har inga offerter än. Skapa din första offert nu!
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="text-primary font-medium"
            onClick={() => router.push("/proposals/new")}
          >
            + Skapa ny offert
          </button>
          <button className="text-blue-500 font-medium" onClick={loadProposals}>
            ↻ Uppdatera listan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <button
          className="text-sm text-blue-500 hover:text-blue-700"
          onClick={loadProposals}
        >
          ↻ Uppdatera
        </button>
      </div>
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
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
      <div className="text-center pt-4">
        <button
          className="text-primary text-sm font-medium"
          onClick={() => router.push("/proposals")}
        >
          Visa alla offerter →
        </button>
      </div>
    </div>
  );
}
