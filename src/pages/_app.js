import "@/styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Layout from "../components/layouts/layout";

export default function App({ Component, pageProps }) {
  const { user } = pageProps;

  const renderWithLayout =
    Component.getLayout ||
    function (page) {
      return <Layout>{page}</Layout>;
    };

  return renderWithLayout(
    <UserProvider user={user}>
      <Component {...pageProps} />
    </UserProvider>
  );
}
