export interface GraceResult {
  graceApplied: boolean;
  graceMarks: number;
  finalMarks: number;
  isPromoted: boolean;
  gradeLetter: string;
  gradePoint: number;
}

export interface DivisionResult {
  division: string;
  percentage: number;
  result: string;
}

export interface SubjectResult extends GraceResult {
  subjectCode: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  isTheory: boolean;
}

// Grace marks calculation for BBA Tourism & Travel - CORRECTED per specification
export function calculateGraceMarks(
  subjects: Array<{
    code: string;
    internal: number;
    external: number;
    isTheory: boolean;
    maxMarks: number;
  }>
): SubjectResult[] {
  const results: SubjectResult[] = [];

  // Calculate total theory aggregate for grace calculation
  const theorySubjects = subjects.filter((s) => s.isTheory);
  const totalTheoryMarks = theorySubjects.reduce(
    (sum, s) => sum + s.maxMarks,
    0
  );
  const maxGraceFromAggregate = Math.floor(totalTheoryMarks * 0.01); // 1% of theory aggregate
  const maxGraceAllowed = Math.min(maxGraceFromAggregate, 6); // Max 6 marks - whichever is minimum

  let graceUsed = 0;

  subjects.forEach((subject) => {
    const totalMarks = subject.internal + subject.external;
    const percentage = (totalMarks / subject.maxMarks) * 100;

    // BBA TT Requirements: Each subject 36%, theory/practical 40%, aggregate 45%
    const minSubjectPass = subject.maxMarks * 0.36; // 36% per subject
    const minTheoryPractical = subject.maxMarks * 0.4; // 40% for theory/practical

    let finalMarks = totalMarks;
    let graceApplied = false;
    let graceMarks = 0;
    let isPromoted = false;

    // Apply grace ONLY for theory subjects that need it
    // Grace can only be applied to make subjects pass the 36% requirement
    if (
      subject.isTheory &&
      totalMarks < minSubjectPass &&
      graceUsed < maxGraceAllowed
    ) {
      const requiredGrace = Math.ceil(minSubjectPass - totalMarks);
      const availableGrace = maxGraceAllowed - graceUsed;

      if (availableGrace > 0 && requiredGrace <= availableGrace) {
        graceMarks = requiredGrace;
        finalMarks = totalMarks + graceMarks;
        graceApplied = true;
        graceUsed += graceMarks;
      }
    }

    // Check if student needs promotion (passed with grace)
    if (graceApplied) {
      isPromoted = true;
    }

    const { grade, point } = calculateGrade(finalMarks, subject.maxMarks);

    results.push({
      subjectCode: subject.code,
      internalMarks: subject.internal,
      externalMarks: subject.external,
      totalMarks,
      finalMarks,
      graceApplied,
      graceMarks,
      isPromoted,
      gradeLetter: grade,
      gradePoint: point,
      isTheory: subject.isTheory,
    });
  });

  return results;
}

export function calculateGrade(
  marks: number,
  maxMarks: number = 100
): { grade: string; point: number } {
  const percentage = (marks / maxMarks) * 100;

  if (percentage >= 91) return { grade: "O", point: 10 };
  if (percentage >= 81) return { grade: "A+", point: 9 };
  if (percentage >= 71) return { grade: "A", point: 8 };
  if (percentage >= 61) return { grade: "B+", point: 7 };
  if (percentage >= 51) return { grade: "B", point: 6 };
  if (percentage >= 41) return { grade: "C+", point: 5 };
  if (percentage >= 36) return { grade: "C", point: 4 };
  return { grade: "F", point: 0 };
}

export function calculateDivision(
  semesterResults: Array<{
    marks: number;
    maxMarks: number;
    graceApplied: boolean;
  }>
): DivisionResult {
  const totalMarks = semesterResults.reduce(
    (sum, result) => sum + result.marks,
    0
  );
  const totalMaxMarks = semesterResults.reduce(
    (sum, result) => sum + result.maxMarks,
    0
  );
  const percentage = (totalMarks / totalMaxMarks) * 100;

  let division = "";
  let result = "";

  // BBA TT Division Requirements: First 60%, Second 45%, Third (removed per spec)
  if (percentage >= 60) {
    division = "FIRST";
    result = "FIRST";
  } else if (percentage >= 45) {
    // CORRECTED: Second division is 45%, not 50%
    division = "SECOND";
    result = "SECOND";
  } else {
    division = "FAIL";
    result = "FAIL";
  }

  // Add grace indicator if any subject used grace
  const hasGrace = semesterResults.some((r) => r.graceApplied);
  if (hasGrace) {
    if (result !== "FAIL") {
      result += " (G)";
    } else {
      result = "FAIL (G)"; // Show grace even in failure
    }
  }

  return {
    division,
    percentage: Math.round(percentage * 100) / 100,
    result,
  };
}

export function calculateSGPA(
  subjectResults: SubjectResult[],
  subjects: any[]
): number {
  const totalCredits = subjects.reduce(
    (sum, subject) => sum + subject.credits,
    0
  );

  const totalGradePoints = subjectResults.reduce((sum, result, index) => {
    const subject = subjects[index];
    return sum + result.gradePoint * subject.credits;
  }, 0);

  const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  // BBA TT requires minimum 4.0 SGPA to pass
  return Math.round(sgpa * 100) / 100;
}

export function calculateCGPA(sgpaArray: number[]): number {
  const validSGPAs = sgpaArray.filter((sgpa) => sgpa > 0);
  if (validSGPAs.length === 0) return 0;

  const totalSGPA = validSGPAs.reduce((sum, sgpa) => sum + sgpa, 0);
  return Math.round((totalSGPA / validSGPAs.length) * 100) / 100;
}

// Comprehensive validation function to check all BBA TT requirements
export function validateStudentResult(
  subjectResults: SubjectResult[],
  sgpa: number
): {
  isPassed: boolean;
  failureReasons: string[];
  passDetails: {
    individualSubjects: boolean;
    theoryPracticalRequirement: boolean;
    aggregateRequirement: boolean;
    sgpaRequirement: boolean;
  };
} {
  const failureReasons: string[] = [];
  const passDetails = {
    individualSubjects: true,
    theoryPracticalRequirement: true,
    aggregateRequirement: true,
    sgpaRequirement: true,
  };

  // Check 1: Individual subject requirement (36% each)
  const failedSubjects = subjectResults.filter(
    (result) => (result.finalMarks / 100) * 100 < 36
  );
  if (failedSubjects.length > 0) {
    passDetails.individualSubjects = false;
    failureReasons.push(
      `Failed ${failedSubjects.length} subject(s): ${failedSubjects
        .map((s) => s.subjectCode)
        .join(", ")} (below 36%)`
    );
  }

  // Check 2: Theory/Practical requirement (40% each)
  const theoryPracticalFailed = subjectResults.filter(
    (result) => (result.finalMarks / 100) * 100 < 40
  );
  if (theoryPracticalFailed.length > 0) {
    passDetails.theoryPracticalRequirement = false;
    failureReasons.push(
      `Failed theory/practical requirement in: ${theoryPracticalFailed
        .map((s) => s.subjectCode)
        .join(", ")} (below 40%)`
    );
  }

  // Check 3: Aggregate requirement (45%)
  const totalMarks = subjectResults.reduce((sum, result) => sum + result.finalMarks, 0);
  const totalMaxMarks = subjectResults.length * 100;
  const aggregatePercentage = (totalMarks / totalMaxMarks) * 100;
  
  if (aggregatePercentage < 45) {
    passDetails.aggregateRequirement = false;
    failureReasons.push(
      `Failed aggregate requirement: ${aggregatePercentage.toFixed(2)}% (below 45%)`
    );
  }

  // Check 4: SGPA requirement (minimum 4.0)
  if (sgpa < 4.0) {
    passDetails.sgpaRequirement = false;
    failureReasons.push(`Failed SGPA requirement: ${sgpa} (below 4.0)`);
  }

  const isPassed = failureReasons.length === 0;

  return {
    isPassed,
    failureReasons,
    passDetails,
  };
}
