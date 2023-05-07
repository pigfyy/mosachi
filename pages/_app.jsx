import "@/styles/globals.css";
import "@/styles/reset.css";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const showFooter =
    router.pathname !== "/login" && router.pathname !== "/admin";

  return (
    <>
      <Component {...pageProps} />
      {showFooter && <Footer />}
    </>
  );
}
