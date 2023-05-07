import axios from "axios";
import { parseStringPromise } from "xml2js";

// Synergy data fetching

const QUARTERS = {
  "wa-bsd405-psv": 3, //3 for S2
  "wa-nor-psv": 3, //3 for S2
  "ca-egusd-psv": 7, //7 for S2
};
const DEFAULT_QUARTER = 1;
//value of pointsEarned if assignment is not graded. Make sure this matches with front-end calculation/display code
const NOT_GRADED_STR = "Not graded";
//name of single category if there are no categories
const NO_CATEGORY_CATEGORY_NAME = "TOTAL";
const INVALID_CREDENTIALS_STR = "Invalid credentials";

/**
 * Fetches gradebook data from Edupoint using the provided credentials and subdomain.
 *
 * @async
 * @function
 * @param {string} username - The username to use for authentication.
 * @param {string} password - The password to use for authentication.
 * @param {string} urlSubdomain - The subdomain to use for the Edupoint URL.
 * @returns {Array<Object>|string} An array of period objects or an error string.
 */

export default async function getGradebook(username, password, urlSubdomain) {
  try {
    const response = await axios.post(
      `https://${urlSubdomain}.edupoint.com/Service/PXPCommunication.asmx/ProcessWebServiceRequest`,
      {
        userID: username,
        password,
        skipLoginLog: "true",
        parent: "false",
        webServiceHandleName: "PXPWebServices",
        methodName: "Gradebook",
        paramStr: `<Parms><ChildIntID>0</ChildIntID><ReportPeriod>${
          QUARTERS[urlSubdomain] ?? DEFAULT_QUARTER
        }</ReportPeriod></Parms>`,
      }
    );

    // get json from xml
    const resJSON = await parseStringPromise(response.data.d);

    // if login failed, return INVALID_CREDENTIALS_STR
    if ("RT_ERROR" in resJSON) {
      return INVALID_CREDENTIALS_STR;
    }

    // get periods
    const periodsSrc = resJSON.Gradebook.Courses[0].Course;
    const periods = periodsSrc
      .map((periodSrc) => {
        try {
          return getPeriod(periodSrc);
        } catch (error) {
          console.error(error);
          return null;
        }
      })
      .filter((period) => period !== null);

    if (periods.length > 0 && periods[0].hasOwnProperty("name")) {
      return periods;
    }
    return INVALID_CREDENTIALS_STR;
  } catch (error) {
    console.error(error);
    return INVALID_CREDENTIALS_STR;
  }
}

/**
 * Extracts period information from a period source object.
 *
 * @param {object} periodSrc - The period source object.
 * @param {string} periodSrc.$.Title - The title of the period, which includes the period name and code.
 * @param {object} periodSrc.Marks - The marks of the period.
 * @param {object} periodSrc.Marks.Mark - The mark for the period.
 * @param {object} periodSrc.Marks.Mark.Assignments - The assignments for the period.
 * @param {Array<object>} periodSrc.Marks.Mark.Assignments.Assignment - The individual assignment objects for the period.
 *
 * @returns {object} The period object with name, categories, and assignments properties.
 * @property {string} name - The name of the period.
 * @property {Array<object>} categories - The categories for the period.
 * @property {Array<object>} assignments - The assignments for the period.
 */
function getPeriod(periodSrc) {
  const period = {};

  // Extract name from Title
  period.name = periodSrc.$.Title.replace(/ \([\s\S]*?\)/g, "");

  // Extract assignments and handle errors
  const assignmentsSrc =
    periodSrc?.Marks?.[0]?.Mark?.[0]?.Assignments?.[0]?.Assignment ?? [];

  // Extract categories if they exist, otherwise create a default category
  const hasCategories =
    periodSrc?.Marks?.[0]?.Mark?.[0]?.GradeCalculationSummary?.[0]
      ?.AssignmentGradeCalc;

  if (hasCategories) {
    const categoriesSrc =
      periodSrc.Marks[0].Mark[0].GradeCalculationSummary[0].AssignmentGradeCalc;

    period.categories = getCategories(categoriesSrc);

    period.assignments = assignmentsSrc.map((assignmentSrc) =>
      getAssignmentsWithCategories(assignmentSrc, period.categories)
    );
  } else {
    period.categories = [{ name: NO_CATEGORY_CATEGORY_NAME, weight: 1 }];

    period.assignments = assignmentsSrc.map((assignmentSrc) => {
      const assignment = getAssignmentsWithoutCategories(
        assignmentSrc,
        period.categories
      );
      assignment.category = 0;
      return assignment;
    });
  }

  return period;
}

/**
 * Extracts category information from a category source array.
 *
 * @param {Array<object>} categoriesSrc - The category source array.
 * @returns {Array<object>} The category array with name and weight properties.
 * @property {string} name - The name of the category.
 * @property {number} weight - The weight of the category.
 */
function getCategories(categoriesSrc) {
  const excludedCategoryType = "TOTAL";
  const weightConversionFactor = 0.01;

  const categories = [];
  categoriesSrc.forEach((categorySrc) => {
    const categoryType = categorySrc.$.Type;
    if (categoryType === excludedCategoryType) {
      return;
    }

    const categoryWeight =
      parseFloat(categorySrc.$.Weight) * weightConversionFactor;
    const category = {
      name: categoryType,
      weight: categoryWeight,
    };
    categories.push(category);
  });

  return categories;
}

/**
 * Retrieves an assignment object from a source object and assigns a category to it.
 *
 * @param {Object} assignmentSrc - The source object containing the assignment data.
 * @param {Object[]} categories - An array of category objects to choose from.
 * @param {string} categories[].name - The name of the category.
 * @param {number} categories[].weight - The weight assigned to the category.
 * @returns {Object} - An assignment object with a category property assigned.
 */
function getAssignmentsWithCategories(assignmentSrc, categories) {
  const categoryName = assignmentSrc.$.Type;
  let categoryIndex = categories.findIndex(
    (category) => category.name === categoryName
  );

  if (categoryIndex === -1) {
    categories.push({ name: categoryName, weight: 0 });
  }

  const assignment = getAssignmentsWithoutCategories(assignmentSrc);
  assignment.category =
    categoryIndex === -1 ? categories.length - 1 : categoryIndex;
  return assignment;
}

/**
 * Extracts relevant properties from an assignment source object, and returns them in a new object.
 * If the assignment has not been graded, sets `pointsEarned` to the value of the constant NOT_GRADED_STR.
 *
 * @param {object} assignmentSrc - The assignment source object.
 * @param {string} assignmentSrc.$.GradebookID - The ID of the assignment.
 * @param {string} assignmentSrc.$.Measure - The name of the assignment.
 * @param {string} assignmentSrc.$.Points - The points earned by the student, and the points possible, separated by a forward slash ("/").
 *                                          If the assignment has not been graded, this should be the points possible only.
 * @returns {object} A new object with the following properties:
 *                   - `id` (string): The ID of the assignment.
 *                   - `name` (string): The name of the assignment.
 *                   - `pointsEarned` (number|string): The points earned by the student, or the string NOT_GRADED_STR if the assignment has not been graded.
 *                   - `pointsPossible` (number): The points possible for the assignment.
 */
function getAssignmentsWithoutCategories(assignmentSrc) {
  const { GradebookID, Measure, Points } = assignmentSrc.$;
  const [pointsEarnedStr, pointsPossibleStr] = Points.includes("/")
    ? Points.split("/")
    : [null, Points];
  const pointsEarned = pointsEarnedStr
    ? parseFloat(pointsEarnedStr)
    : NOT_GRADED_STR;
  const pointsPossible = parseFloat(pointsPossibleStr);

  return {
    id: GradebookID,
    name: Measure,
    pointsEarned,
    pointsPossible,
  };
}
