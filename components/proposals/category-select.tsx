"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "Målning Invändigt & Tapeter",
  "Elektriker",
  "Renovering",
  "Badrumsrenovering",
  "Rörmokare",
  "Golvslipning, Olja & Lack",
  "Avfuktning",
  "Balkong",
  "Bergvärmepumpar",
  "Betongarbete",
  "Bredbandsinstallation",
  "Brygga",
  "Bygga altan & uterum",
  "Dörrar",
  "Fasadarbeten",
  "Fasadmålare",
  "Fönster",
  "Garage & Carport",
  "Glasmästare",
  "Golvläggning",
  "Golvvärme",
  "Håltagning",
  "Isolering",
  "Kakelsättare",
  "Kamin & Skorsten",
  "Köksrenovering",
  "Luftvärmepumpar",
  "Låssmed",
  "Maskinuthyrning",
  "Mattläggning",
  "Murare",
  "Möbelmontering",
  "Möbelsnickare",
  "Nybyggnation",
  "Om- & Tillbyggnation",
  "Persienn, Markis & Solfilm",
  "Plåtslagare",
  "Relining",
  "Rivning",
  "Sanerare",
  "Slamsugning & Stamspolning",
  "Solceller",
  "Stambyte",
  "Ställningsbyggare & uthyrning",
  "Svets & Smide",
  "Tak- & Fasadrengöring",
  "Takläggare",
  "Takmålare",
  "Trappor",
  "Undertak & Akustik",
  "Ventilationsfirmor",
  "Vindsrenovering",
  "Värme- och kylsystem",
];

export function CategorySelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Välj kategori" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
