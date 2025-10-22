import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnualCashflow } from "@/actions/transaction";
import { getTransactionYearsRange } from "@/actions/transaction";
import CashflowFilters from "@/components/cashflow-filters";
import { CashflowContent } from "@/components/cashflow-content";

type Props = {
  year?: string;
};

export default async function Cashflow({ year: yearParam }: Props) {
  const parsedYear = yearParam ? parseInt(yearParam, 10) : null;
  const year =
    parsedYear && !isNaN(parsedYear) ? parsedYear : new Date().getFullYear();

  const [{ data: cashflow = [] }, { data: yearsRange = [] }] =
    await Promise.all([getAnnualCashflow(year), getTransactionYearsRange()]);

  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Cashflow</span>
          <CashflowFilters year={year} yearsRange={yearsRange} />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr_250px]">
        <CashflowContent annualCashflow={cashflow} />
      </CardContent>
    </Card>
  );
}
