// Validation utilities for BBA TT course requirements

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateBBATTRequirements(
  subjectResults: Array<{
    subjectCode: string;
    totalMarks: number;
    finalMarks: number;
    gradePoint: number;
    isTheory: boolean;
  }>,
  subjects: Array<{ credits: number; type: string }>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check minimum 36% per subject
  subjectResults.forEach((result, index) => {
    const percentage = (result.finalMarks / 100) * 100;
    if (percentage < 36) {
      errors.push(`Subject ${result.subjectCode}: Below minimum 36% (got ${percentage.toFixed(1)}%)`);
    }
  });

  // 2. Check 40% aggregate requirement
  const totalMarks = subjectResults.reduce((sum, result) => sum + result.finalMarks, 0);
  const totalMaxMarks = subjectResults.length * 100;
  const aggregatePercentage = (totalMarks / totalMaxMarks) * 100;
  
  if (aggregatePercentage < 40) {
    errors.push(`Aggregate below 40% requirement (got ${aggregatePercentage.toFixed(1)}%)`);
  }

  // 3. Check theory and practical separately pass requirement
  const theoryResults = subjectResults.filter(r => r.isTheory);
  const practicalResults = subjectResults.filter(r => !r.isTheory);

  theoryResults.forEach(result => {
    const percentage = (result.finalMarks / 100) * 100;
    if (percentage < 40) {
      errors.push(`Theory subject ${result.subjectCode}: Below 40% requirement (got ${percentage.toFixed(1)}%)`);
    }
  });

  practicalResults.forEach(result => {
    const percentage = (result.finalMarks / 100) * 100;
    if (percentage < 40) {
      errors.push(`Practical subject ${result.subjectCode}: Below 40% requirement (got ${percentage.toFixed(1)}%)`);
    }
  });

  // 4. Check minimum 4.0 SGPA requirement
  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const totalGradePoints = subjectResults.reduce((sum, result, index) => {
    return sum + (result.gradePoint * subjects[index].credits);
  }, 0);
  
  const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  
  if (sgpa < 4.0) {
    errors.push(`SGPA below minimum 4.0 requirement (got ${sgpa.toFixed(2)})`);
  }

  // 5. Division warnings
  if (aggregatePercentage >= 60) {
    warnings.push("Eligible for FIRST Division");
  } else if (aggregatePercentage >= 45) {
    warnings.push("Eligible for SECOND Division");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateGraceEligibility(
  theorySubjects: Array<{ totalMarks: number; maxMarks: number }>,
  totalTheoryAggregate: number
): { maxGraceAllowed: number; graceFromAggregate: number } {
  // 1% of theory aggregate or 6 marks, whichever is minimum
  const graceFromAggregate = Math.floor(totalTheoryAggregate * 0.01);
  const maxGraceAllowed = Math.min(graceFromAggregate, 6);
  
  return {
    maxGraceAllowed,
    graceFromAggregate
  };
}