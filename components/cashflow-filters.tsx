"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryState, parseAsInteger } from "nuqs";
import { useRouter } from "next/navigation";

type Props = {
  year: number;
  yearsRange: number[];
};

export default function CashflowFilters({ year, yearsRange }: Props) {
  const [yearQuery, setYearQuery] = useQueryState("year", parseAsInteger);
  const router = useRouter();

  const handleYearChange = async (value: string) => {
    await setYearQuery(parseInt(value));
    router.refresh();
  };

  return (
    <div>
      <Select
        value={yearQuery?.toString() || year.toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {yearsRange.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
