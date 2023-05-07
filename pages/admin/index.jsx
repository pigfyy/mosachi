import Period from "@/components/admin/period/Period";
import Dashboard from "@/components/admin/dashboard/Dashboard";
import getGradebook from "@/lib/gradebook/getGradebook";
import { useState } from "react";
import Head from "next/head";

import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "@/lib/sessionOptions";

const INVALID_CREDENTIALS_STR = "Invalid credentials";

// fetch gradebook data
async function fetchGradebook({ req }) {
  // redirect user to login if they are not logged in
  if (!req.session.user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { username, password, urlSubdomain } = req.session.user;

  const gradebook = await getGradebook(username, password, urlSubdomain);

  // redirect user to login and logs them out if their credentials are invalid
  if (gradebook === INVALID_CREDENTIALS_STR) {
    req.session.destroy();
    return {
      redirect: {
        destination: `/login?error=invalid-credentials&timestamp=${Date.now()}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      gradebook,
    },
  };
}

// use withIronSessionSsr to provide session data to the page
export const getServerSideProps = withIronSessionSsr(
  fetchGradebook,
  sessionOptions
);

export default function Admin(props) {
  const { gradebook } = props;

  const [view, setView] = useState("dashboard");
  const [period, setPeriod] = useState(0);

  // set view to show a period and sets the period to the period number shown
  const showClass = (period) => {
    setView("period");
    setPeriod(period);
  };

  // set view to show the dashboard
  const showDashboard = () => {
    setView("dashboard");
  };

  return (
    <>
      <Head>
        <title>Mosachi | The Smart Gradebook</title>
      </Head>
      <div>
        {view === "period" && (
          <Period
            initialPeriod={gradebook[period]}
            showDashboard={showDashboard}
          />
        )}
        {view === "dashboard" && (
          <Dashboard gradebook={gradebook} showClass={showClass} />
        )}
      </div>
    </>
  );
}
