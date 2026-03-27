import BillingSuccessClient from "./BillingSuccessClient";

type BillingSuccessPageProps = {
  searchParams?: Promise<{
    type?: string | string[];
    days?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BillingSuccessPage({
  searchParams,
}: BillingSuccessPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const isPass = firstValue(resolvedSearchParams.type) === "pass";
  const passDays = firstValue(resolvedSearchParams.days) ?? "1";

  return <BillingSuccessClient isPass={isPass} passDays={passDays} />;
}
