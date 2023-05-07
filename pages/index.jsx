import Link from "next/link";
import bannerStyles from "@/styles/home/Banner.module.css";
import aboutStyles from "@/styles/home/About.module.css";
import { FiLogIn } from "react-icons/fi";
import { FaListUl } from "react-icons/fa";
import { BsCalculatorFill } from "react-icons/bs";
import Period from "@/components/admin/period/Period";
import Head from "next/head";
import demoPeriod from "@/lib/gradebook/demoPeriod.json";
import { useState } from "react";
import { MoonLoader } from "react-spinners";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Head>
        <title>Mosachi - The Smart Gradebook</title>
      </Head>
      <div>
        <section className={bannerStyles.banner}>
          <div className={bannerStyles.container}>
            <div className={bannerStyles.main}>
              <img
                src="/title-logo-white.svg"
                alt="Mosachi"
                className={bannerStyles.title}
              />
              <h1 className={bannerStyles.description}>
                The gradebook calculator for Synergy
              </h1>
              {!loading ? (
                <Link
                  href="/login"
                  className={bannerStyles.button}
                  onClick={() => setLoading(true)}
                >
                  Log in
                </Link>
              ) : (
                <MoonLoader size={36} color="#0d6dfd" />
              )}
            </div>
            <div>
              <img
                src="/iphone-screenshot.png"
                alt="screenshot of mosachi"
                className={bannerStyles.image}
              />
            </div>
          </div>
        </section>
        <section>
          <Period initialPeriod={demoPeriod} />
        </section>
        <section className={aboutStyles.about}>
          <h2 className={aboutStyles.heading}>About</h2>
          <ul className={aboutStyles.list}>
            <li className={aboutStyles.list__item}>
              <FiLogIn className={aboutStyles.icon} />
              <h3 className={aboutStyles.heading___small}>Login</h3>
              <p className={aboutStyles.description}>
                No sign up needed. Simply login with your Synergy credentials so
                that we can fetch your grades.
              </p>
            </li>
            <li className={aboutStyles.list__item}>
              <FaListUl className={aboutStyles.icon} />
              <h3 className={aboutStyles.heading___small}>Class List</h3>
              <p className={aboutStyles.description}>
                Right when you log in to Mosachi, you get a centralized,
                clutter-free view of all your classes. Refreshing.
              </p>
            </li>
            <li className={aboutStyles.list__item}>
              <BsCalculatorFill className={aboutStyles.icon} />
              <h3 className={aboutStyles.heading___small}>Calculate</h3>
              <p className={aboutStyles.description}>
                Make a change to any assignment and see how it impacts your
                grade.
              </p>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
