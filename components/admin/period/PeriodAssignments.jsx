import usePeriodStore from "@/lib/store";
import { IoMdAdd } from "react-icons/io";
import { BsInfo } from "react-icons/bs";
import { RiCloseFill } from "react-icons/ri";
import styles from "@/styles/admin/period/PeriodGrid.module.css";
import popupStyles from "@/styles/admin/period/AssignmentDetailPopup.module.css";
import { v4 as uuid } from "uuid";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import {
  calculateAssignmentWeightDisplay,
  calculateAssignmentGradeDisplay,
  calculatePointsNeededDisplay,
  NOT_GRADED_POINTS_EARNED_STR,
  NOT_GRADED_POINTS_POSSIBLE_STR,
} from "@/lib/gradebook/gradeCalc";
import { useState } from "react";

function AssignmentDetailPopup({ assignment, assignmentIndex }) {
  const { period, setPeriod } = usePeriodStore((state) => ({
    period: state.period,
    setPeriod: state.setPeriod,
  }));

  const [inputValue, setInputValue] = useState(90);

  return (
    <Popup
      trigger={
        <button className={styles.info}>
          <BsInfo className={styles.info__icon} />
        </button>
      }
      modal
      nested
      contentStyle={{ borderRadius: "0.4rem", maxWidth: "36rem", width: "90%" }}
    >
      {(close) => (
        <div className={popupStyles.popup}>
          <div className={popupStyles.heading}>
            <span>Assignment Details</span>
            <RiCloseFill onClick={close} />
          </div>
          <hr />
          <div>
            <p>
              <b>Name:</b> {assignment.name}
            </p>
            <p>
              <b>Category:</b> {period.categories[assignment.category].name}
            </p>
            <p>
              <b>Points:</b> {assignment.pointsEarned} /{" "}
              {assignment.pointsPossible}
            </p>
            <p>
              <b>Grade:</b> {calculateAssignmentGradeDisplay(assignment)}
            </p>
            <p>
              <b>Weight:</b>{" "}
              {calculateAssignmentWeightDisplay(period, assignmentIndex)}
            </p>
          </div>
          <hr />
          <div className={popupStyles.pointsNeeded__container}>
            <div>
              <span>How many points do I need to have a </span>
              <input
                type="number"
                min={0}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <span>%</span>
            </div>
            <span>
              {calculatePointsNeededDisplay(
                period,
                assignmentIndex,
                inputValue / 100
              )}
            </span>
          </div>
          <hr />
          <div className={popupStyles.button__container}>
            <button
              className={`${popupStyles.button} ${popupStyles.button___danger}`}
              onClick={() => {
                const newPeriod = { ...period };
                newPeriod.assignments.splice(assignmentIndex, 1);
                setPeriod(newPeriod);
                close();
              }}
            >
              Delete
            </button>
            <button className={`${popupStyles.button}`} onClick={close}>
              Close
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
}

function AssignmentList() {
  const { period, setPeriod } = usePeriodStore((state) => ({
    period: state.period,
    setPeriod: state.setPeriod,
  }));

  const setPeriodValue = (category, index, value) => {
    const newPeriod = { ...period };

    switch (category) {
      case "name":
        newPeriod.assignments[index].name = value;
        break;
      case "category":
        newPeriod.assignments[index].category = parseInt(value);
        break;
      case "pointsEarned":
        newPeriod.assignments[index].pointsEarned =
          value === "" ? NOT_GRADED_POINTS_EARNED_STR : parseInt(value);
        break;
      case "pointsPossible":
        newPeriod.assignments[index].pointsPossible =
          value === "" ? NOT_GRADED_POINTS_POSSIBLE_STR : parseInt(value);
        break;
      default:
        throw new Error(`Invalid category: ${category}`);
    }

    setPeriod(newPeriod);
  };

  return (
    <>
      {period.assignments?.map((assignment, i) => (
        <div
          className={`${styles.row} ${styles.rowGrid___assignment} ${styles.row___body}`}
          key={assignment.id}
        >
          <input
            type="text"
            value={assignment.name}
            onChange={(e) => setPeriodValue("name", i, e.target.value)}
          />
          <select
            value={assignment.category}
            onChange={(e) => {
              setPeriodValue("category", i, e.target.value);
            }}
          >
            {period.categories.map((category, i) => (
              <option key={category.name} value={i}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={
              assignment.pointsEarned === NOT_GRADED_POINTS_EARNED_STR
                ? ""
                : assignment.pointsEarned
            }
            placeholder={NOT_GRADED_POINTS_EARNED_STR}
            onChange={(e) => setPeriodValue("pointsEarned", i, e.target.value)}
          />
          <input
            type="number"
            value={
              assignment.pointsPossible === NOT_GRADED_POINTS_POSSIBLE_STR
                ? ""
                : assignment.pointsPossible
            }
            placeholder={NOT_GRADED_POINTS_POSSIBLE_STR}
            pattern="[0-9]*"
            onChange={(e) =>
              setPeriodValue("pointsPossible", i, e.target.value)
            }
          />
          <AssignmentDetailPopup assignment={assignment} assignmentIndex={i} />
        </div>
      ))}
    </>
  );
}

export default function Assignments() {
  const { period, setPeriod } = usePeriodStore((state) => ({
    period: state.period,
    setPeriod: state.setPeriod,
  }));

  const addAssignment = () => {
    const newPeriod = { ...period };
    newPeriod.assignments.unshift({
      name: "New Assignment",
      category: 0,
      pointsEarned: NOT_GRADED_POINTS_EARNED_STR,
      pointsPossible: NOT_GRADED_POINTS_POSSIBLE_STR,
      id: uuid(),
    });
    setPeriod(newPeriod);
  };

  return (
    <>
      <button className={styles.button} onClick={addAssignment}>
        <IoMdAdd /> Add Assignment
      </button>
      <div className={styles.wrapper}>
        <div
          className={`${styles.row} ${styles.rowGrid___assignment} ${styles.row___header}`}
        >
          <h3>Name</h3>
          <h3>Category</h3>
          <h3>Points Earned</h3>
          <h3>Points Possible</h3>
        </div>
        <AssignmentList />
      </div>
    </>
  );
}
