import { useForm } from "react-hook-form";
import styles from "@/styles/Login.module.css";
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";

import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "@/lib/sessionOptions";

// redirect user to admin page if they are logged in
async function redirectIfLoggedIn({ req }) {
  if (req.session.user) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      success: true,
    },
  };
}

// use withIronSessionSsr to provide session data to redirectIfLoggedIn function
export const getServerSideProps = withIronSessionSsr(
  redirectIfLoggedIn,
  sessionOptions
);

export default function Login() {
  const router = useRouter();
  const { error } = router.query;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [router.asPath]);

  useEffect(() => {
    if (error) {
      toast.error("Invalid credentials");
    }
  }, [router.asPath, error]);

  // saves user data to session and redirects them to the admin page
  const logUserIn = async ({ username, password, urlSubdomain }) => {
    setLoading(true);

    const res = await fetch(
      `/api/login?username=${encodeURIComponent(
        username
      )}&password=${encodeURIComponent(
        password
      )}&urlSubdomain=${encodeURIComponent(urlSubdomain)}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res.status === 200) {
      router.push("/admin");
    } else {
      const data = await res.json();
      alert(data.message);
      router.push("/404");
    }
  };

  return (
    <>
      <Head>
        <title>Mosachi - Login</title>
      </Head>
      <Toaster />
      <div className={styles.login}>
        <img src="/title-logo.svg" alt="Mosachi" className={styles.logo} />
        <form onSubmit={handleSubmit(logUserIn)} className={styles.form}>
          <p className={`${styles.text_grey}`}>
            Login with your StudentVUE credentials
          </p>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && <span>{errors.username.message}</span>}
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <span>{errors.password.message}</span>}
          <p className={`${styles.text_grey} ${styles.text_small}`}>
            We won&apos;t store your credentials
          </p>
          <label htmlFor="school-district">School District</label>
          <select
            name="school-district"
            defaultValue="wa-bsd405-psv"
            {...register("urlSubdomain")}
          >
            <option value="wa-bsd405-psv">BSD</option>
            <option value="wa-nor-psv">NSD</option>
            <option value="ca-egusd-psv">EGUSD</option>
          </select>
          {!loading ? (
            <button>Log in</button>
          ) : (
            <MoonLoader size={28} color="#0d6dfd" />
          )}
        </form>
      </div>
    </>
  );
}
