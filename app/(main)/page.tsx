import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <>
      <div className="grow flex flex-col items-center justify-evenly">
        <section className="space-y-6">
          <div className="container flex flex-col items-center gap-8 text-center">
            <Badge variant="secondary">
              Öka din försäljning— och spara tid!
            </Badge>
            <Badge className="space-x-4 font-normal text-sm uppercase">
              <p>Offerter</p>
              <p>Avtalssignering</p>
              <p>Ändringar</p>
              <p>Tillägg</p>
            </Badge>
            <h1 className="max-w-4xl font-heading font-semibold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter">
              Offerter som folk faktiskt signerar.
            </h1>
            <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Skapa offerter snabbt och enkelt med hjälp av AI, och skicka
              direkt till dina kunder. De godkänner direkt.
            </p>
            <div className="space-x-4">
              <Link target="_blank" href="https://github.com/enesien/venefish">
                <Button size="lg" variant="link">
                  Boka en demo &rarr;
                </Button>
                <Link href="/login">
                  <Button size="lg">Börja öka din försäljning nu</Button>
                </Link>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
