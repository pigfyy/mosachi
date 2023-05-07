import usePeriodStore from "@/lib/store";
import styles from "@/styles/admin/period/PeriodGrid.module.css";
import { calculateCategoryDetailsDisplay } from "@/lib/gradebook/gradeCalc";
import { v4 as uuid } from "uuid";

function CategoryList() {
  const period = usePeriodStore((state) => state.period);
  const categories = period.categories
    ? calculateCategoryDetailsDisplay(period)
    : [];

  return (
    <>
      {categories?.map((category) => (
        <div
          className={`${styles.row} ${styles.rowGrid___category} ${styles.row___body}`}
          key={uuid()}
        >
          <span>{category.name}</span>
          <span>{category.pointsEarned}</span>
          <span>{category.pointsPossible}</span>
          <span>{category.displayWeight}</span>
          <span>{category.displayGrade}</span>
        </div>
      ))}
    </>
  );
}

export default function Categories() {
  return (
    <>
      <h3 className={styles.category__header}>Category List</h3>
      <div className={styles.wrapper}>
        <div
          className={`${styles.row} ${styles.rowGrid___category} ${styles.row___header}`}
        >
          <h4>Name</h4>
          <h4>Points Earned</h4>
          <h4>Points Possible</h4>
          <h4>Weight</h4>
          <h4>Grade</h4>
        </div>
        <CategoryList />
      </div>
    </>
  );
}
