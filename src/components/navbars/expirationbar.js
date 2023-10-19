import Link from "next/link";

export default function ExpirationBar({
  remaining_days = 21,
  subscription_plan = "trial",
}) {
  const hasExpired = Boolean(remaining_days <= 0);

  if (subscription_plan.toLowerCase() !== "trial") {
    return <></>;
  }

  return (
    <>
      <div className="flex items-stretch w-full">
        <nav className="flex-auto">
          <h4 className=" text-black font-bold text-xs md:text-lg p-2 min-w-[90px] bg-gray-100 text-center rounded-md py-1 sm:py-2 border border-gray-300 h-10">
            {hasExpired && <>You {subscription_plan} subscription expired.</>}
            {!hasExpired && (
              <>
                You have {Intl.NumberFormat().format(remaining_days)} day(s)
                left on your {subscription_plan} subscription.
              </>
            )}{" "}
            Click{" "}
            <Link href="/home/upgrade-plan" className="underline">
              here
            </Link>{" "}
            to subscribe to a plan.
          </h4>
        </nav>
      </div>
    </>
  );
}
