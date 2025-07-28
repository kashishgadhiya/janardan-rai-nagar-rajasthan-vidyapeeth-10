import type { Subject } from "@/data/studentData";

export interface StudentMarksEntry {
  studentId: string;
  marks: {
    [subjectCode: string]: {
      internal: number;
      external: number;
    };
  };
}

export interface ResultWithGrace {
  studentId: string;
  totalGraceUsed: number;
  totalSubjectsFailed: number;
  hasPassed: boolean;
  updatedMarks: {
    [subjectCode: string]: {
      internal: number;
      external: number;
      total: number;
      graceApplied: number;
    };
  };
  graceSubjects: string[];
}

export function getStudentResultWithGrace(
  entry: StudentMarksEntry,
  subjects: Subject[],
  maxGraceMarks: number
): ResultWithGrace {
  // Calculate grace based on BBA TT specification
  const theorySubjects = subjects.filter(s => s.type === "theory");
  const totalTheoryAggregate = theorySubjects.length * 100;
  const maxGraceFromAggregate = Math.floor(totalTheoryAggregate * 0.01); // 1% of theory aggregate
  const maxAllowedGrace = Math.min(maxGraceFromAggregate, 6); // Max 6 marks, whichever is minimum
  
  let graceLeft = maxAllowedGrace;
  let totalSubjectsFailed = 0;
  const graceSubjects: string[] = [];

  const updatedMarks: ResultWithGrace["updatedMarks"] = {};

  for (const subject of subjects) {
    const marks = entry.marks[subject.code];
    const internal = marks?.internal ?? 0;
    let external = marks?.external ?? 0;
    let total = internal + external;
    
    // BBA TT requirements: 36% minimum per subject
    const minPass = 36;
    let graceApplied = 0;

    // Grace only applies to theory subjects
    if (subject.type === "theory" && total < minPass && graceLeft > 0) {
      const needed = minPass - total;
      graceApplied = Math.min(needed, graceLeft);
      total += graceApplied;
      external += graceApplied; // Apply grace to external
      graceLeft -= graceApplied;

      if (graceApplied > 0) {
        graceSubjects.push(subject.code);
      }
    }

    // Check if subject failed (36% minimum)
    if (total < minPass) {
      totalSubjectsFailed++;
    }

    updatedMarks[subject.code] = {
      internal,
      external,
      total,
      graceApplied,
    };
  }

  // Additional check: Must have 45% aggregate and minimum 4.0 SGPA
  const totalMarks = Object.values(updatedMarks).reduce((sum, mark) => sum + mark.total, 0);
  const totalMaxMarks = subjects.length * 100;
  const aggregatePercentage = (totalMarks / totalMaxMarks) * 100;
  
  // Student must pass aggregate requirement (45%) as well
  const hasPassedAggregate = aggregatePercentage >= 45;
  
  return {
    studentId: entry.studentId,
    totalGraceUsed: maxAllowedGrace - graceLeft,
    totalSubjectsFailed,
    hasPassed: totalSubjectsFailed === 0 && hasPassedAggregate,
    updatedMarks,
    graceSubjects,
  };
}
