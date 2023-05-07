import { v4 as uuid } from "uuid";
import { calculateGradeDisplay } from "@/lib/gradebook/gradeCalc";
import styles from "@/styles/admin/Dashboard.module.css";
import { ImArrowRight2 } from "react-icons/im";
import { useRouter } from "next/router";

export default function Dashboard({ gradebook, showClass }) {
  const router = useRouter();

  const logUserOut = async () => {
    const res = await fetch(`/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (res.status === 200) {
      router.push("/login");
    } else {
      const data = await res.json();
      alert(data.message);
      router.push("/404");
    }
  };

  return (
    <>
      <button className={styles.logoutButton} onClick={logUserOut}>
        Logout
      </button>
      <div className={styles.dashboard}>
        <h1 className={`${styles.welcome} heading`}>Welcome!</h1>
        <div className={styles.classes}>
          {gradebook.map((period, i) => (
            <div className={styles.classWrapper} key={uuid()}>
              <div>
                <h2 className={styles.class__name}>{period.name}</h2>
                <p className={styles.class__grade}>
                  {calculateGradeDisplay(period)}
                </p>
              </div>
              <button
                className={styles.class__button}
                onClick={() => showClass(i)}
              >
                Details <ImArrowRight2 className={styles.class__button__icon} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
