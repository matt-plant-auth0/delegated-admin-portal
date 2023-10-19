import ListCourses from "@/components/courses/list-courses";
import HomeLayout from "@/components/layouts/home-layout";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import banner from "/public/assets/pexels-ketut-subiyanto-4126743.jpg";

export default function UserHome() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  const plan = user.subscription_plan;
  if (user.subscription_status === "activation") {
    return (
      <>
        <main className="bg-white ">
          <div className="flex flex-col h-96 items-center space-y-10">
            <div className="flex-initial w-2/3 text-2xl font-extrabold text-black sm:text-3xl sm:leading-tight sm:tracking-tight">
              Congratulations! You subscribed to a{" "}
              <span className="underline">{plan}</span> plan.
            </div>
            <div className="h-20 w-1/2">
              <Link href={`/home/register-business?plan=${plan}`}>
                <button className="block w-full max-w-xs mx-auto text-white font-bold text-md p-2 min-w-[90px] rounded-md bg-[#EC0B5C] hover:bg-[#6c9096] shadow  hover:text-gray-100 transition duration-500">
                  <i className="mdi mdi-lock-outline mr-1"></i> Activate My Plan
                </button>
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <main className="bg-white">
      <div className="w-full h-32 md:h-52 mt-2 border-gray-100 relative">
        <Image
          className="md:h-full h-28 w-full object-cover bg-no-repeat bg-bottom"
          src={banner}
          alt="Banner"
          priority={true}
        />
        <div className="absolute bg-white left-1 top-1/3 md:top-1/2 p-4 md:left-8 md:p-4 flex flex-col justify-center shadow-xl h-10 md:h-20 rounded-xl md:rounded-3xl">
          {user && (
            <>
              <h2 className="text-lg md:text-3xl font-bold">
                Welcome, {user.nickname}!
              </h2>
            </>
          )}
        </div>
      </div>
      <ListCourses />
    </main>
  );
}

UserHome.getLayout = function (page) {
  return <HomeLayout>{page}</HomeLayout>;
};

export const getServerSideProps = withPageAuthRequired();
