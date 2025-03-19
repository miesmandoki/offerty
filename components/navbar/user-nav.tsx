"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useUser } from "reactfire";

export function UserNav() {
  const { data: user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const doLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      toast({
        title: "Utloggad",
        description: "Du har loggats ut.",
      });
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Utloggning misslyckades",
        description: "Det uppstod ett fel vid utloggningen.",
        variant: "destructive",
      });
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="relative h-8 w-8 mt-2 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={user?.photoURL || "/avatars/04.png"}
            alt="User avatar"
          />
          <AvatarFallback>
            {user?.displayName?.slice(0, 2) || user?.email?.slice(0, 2) || ""}
          </AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium leading-none">
                {user?.displayName ||
                  user?.email?.slice(0, user?.email?.indexOf("@")) ||
                  "Användare"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user?.email || "Ingen e-post"}
              </p>
            </div>

            <div className="p-1">
              <button
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => {
                  router.push("/app");
                  setIsOpen(false);
                }}
              >
                Dashboard
              </button>
              <button
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => {
                  router.push("/proposals");
                  setIsOpen(false);
                }}
              >
                Offerter
              </button>
              <button
                disabled
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-400"
                onClick={() => {
                  // Not implemented yet
                  setIsOpen(false);
                }}
              >
                Inställningar
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-1">
              <button
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={doLogout}
              >
                Logga ut
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
