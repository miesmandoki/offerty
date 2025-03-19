"use client";

import { FC, useState, useEffect } from "react";
import { useFirestore, useUser } from "reactfire";
import { collection, query, where, getDocs } from "firebase/firestore";
import { MainNav } from "@/components/demo-dashboard/main-nav";
import { ProposalsList } from "@/components/demo-dashboard/proposals-list";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
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

export const DemoDashboard: FC = () => {
  const firestore = useFirestore();
  const { data: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    acceptedValue: 0,
    pendingValue: 0,
    acceptedCount: 0,
    pendingCount: 0,
    needsAttentionCount: 0,
    totalCount: 0,
  });

  useEffect(() => {
    async function loadStats() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const proposalsRef = collection(firestore, "proposals");
        const proposalsQuery = query(
          proposalsRef,
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(proposalsQuery);

        let acceptedValue = 0;
        let pendingValue = 0;
        let acceptedCount = 0;
        let pendingCount = 0;
        let needsAttentionCount = 0;
        let totalCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as ProposalData;
          const amount = parseFloat(data.amount) || 0;

          totalCount++;

          if (data.status === "accepted") {
            acceptedValue += amount;
            acceptedCount++;
          } else if (data.status === "draft") {
            pendingValue += amount;
            pendingCount++;

            // Consider drafts as needing attention
            needsAttentionCount++;
          }
        });

        setStats({
          acceptedValue,
          pendingValue,
          acceptedCount,
          pendingCount,
          needsAttentionCount,
          totalCount,
        });
      } catch (error) {
        console.error("Error loading proposals stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [firestore, user]);

  return (
    <>
      <div className="flex-col md:flex">
        <div className="flex items-end justify-between space-y-2 mb-6">
          <h2 className="text-3xl leading-5 font-bold tracking-tight">
            Dashboard
          </h2>
        </div>
        <div className="flex h-16 items-center bg-muted px-6 rounded-xl">
          <MainNav />
        </div>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Värde godkända offerter
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.acceptedValue.toLocaleString("sv-SE")} SEK
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Från {stats.acceptedCount} godkända offerter
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inväntar godkännande
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.pendingCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Totalt värde: {stats.pendingValue.toLocaleString("sv-SE")}{" "}
                      SEK
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Godkända offerter
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.acceptedCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.acceptedCount > 0
                        ? `Snitt: ${Math.round(
                            stats.acceptedValue / stats.acceptedCount
                          ).toLocaleString("sv-SE")} SEK`
                        : "Inga godkända offerter"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Behöver hanteras
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.needsAttentionCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Inväntar svar
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Senaste offerter</CardTitle>
                <CardDescription>
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    `${stats.totalCount} aktiva offerter`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProposalsList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};
