import { v4 as uuid } from "uuid";
import cloneDeep from "lodash.clonedeep";
import usePeriodStore from "@/lib/store";
import { useEffect } from "react";
import { calculateGradeDisplay } from "@/lib/gradebook/gradeCalc";
import PeriodAssignments from "@/components/admin/period/PeriodAssignments";
import PeriodCategories from "@/components/admin/period/PeriodCategories";
import styles from "@/styles/admin/period/Period.module.css";
import { IoReturnDownBackSharp } from "react-icons/io5";

export default function Period({ initialPeriod, showDashboard }) {
  const { period, setPeriod } = usePeriodStore((state) => ({
    period: state.period,
    setPeriod: state.setPeriod,
  }));

  useEffect(() => {
    const period = (() => {
      const period = cloneDeep(initialPeriod);
      period.assignments.forEach((assignment) => {
        assignment.id = uuid();
      });
      return period;
    })();

    setPeriod(period);
  }, [setPeriod, initialPeriod]);

  return (
    <div
      className={`${styles.periodWrapper} ${
        showDashboard && styles.min_h_screen
      }`}
    >
      <div className={styles.period}>
        <h1 className={styles.name}>{period.name}</h1>
        {showDashboard && (
          <button className={styles.returnButton} onClick={showDashboard}>
            <IoReturnDownBackSharp />
            Return to Class List
          </button>
        )}
        <h2 className={styles.grade}>
          {period.name && calculateGradeDisplay(period)}
        </h2>
        <PeriodAssignments />
        <PeriodCategories />
      </div>
    </div>
  );
}
