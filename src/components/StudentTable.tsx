import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Subject, Student } from "@/data/studentData";
import { useEffect } from "react";

interface StudentMarksEntry {
  studentId: string;
  marks: { [subjectCode: string]: { internal: number; external: number } };
  grace?: {
    applied: boolean;
    graceMarks: number;
    status: "pass" | "grace" | "fail";
  };
}

interface StudentTableProps {
  students: Student[];
  subjects: Subject[];
  studentMarks: StudentMarksEntry[];
  selectedStudents: string[];
  onSelectStudent: (studentId: string, checked: boolean) => void;
  onMarksChange: (
    studentId: string,
    subjectCode: string,
    type: "internal" | "external",
    value: string
  ) => void;
  calculateGrade: (total: number) => { grade: string; point: number };
}

type GraceResult = {
  graceMarks: number;
  graceApplied: boolean;
  graceNeeded: number;
  maxGrace: number;
  status: "pass" | "grace" | "fail" | "default";
};

function calculateGrace(
  studentMarkEntry: StudentMarksEntry | undefined,
  subjects: Subject[]
): {
  graceMarks: number;
  graceApplied: boolean;
  graceNeeded: number;
  maxGrace: number;
  status: "pass" | "grace" | "fail" | "default";
} {
  if (!studentMarkEntry) {
    return {
      graceMarks: 0,
      graceApplied: false,
      graceNeeded: 0,
      maxGrace: 0,
      status: "default",
    };
  }

  let totalTheoryAggregate = 0;
  let totalTheorySubjects = 0;
  let totalGraceNeeded = 0;
  let hasFailingSubjects = false;

  // Calculate theory aggregate and check for failures
  subjects.forEach((subject) => {
    if (subject.type === "theory") {
      const mark = studentMarkEntry.marks[subject.code];
      const total = (mark?.internal || 0) + (mark?.external || 0);
      totalTheorySubjects += 1;
      totalTheoryAggregate += total;

      // BBA TT: Each subject needs 36% minimum
      const minRequired = 36; // 36% of 100 marks
      if (total < minRequired) {
        totalGraceNeeded += minRequired - total;
        hasFailingSubjects = true;
      }
    }
  });

  // Grace calculation: 1% of theory aggregate OR 6 marks (whichever is minimum)
  const graceFromAggregate = Math.floor(totalTheoryAggregate * 0.01);
  const maxGrace = Math.min(graceFromAggregate, 6);

  // If no ing subjects, student passes
  if (!hasFailingSubjects) {
    return {
      graceMarks: 0,
      graceApplied: false,
      graceNeeded: 0,
      maxGrace,
      status: "pass",
    };
  }

  // If grace can cover all failures, apply grace
  if (totalGraceNeeded <= maxGrace) {
    return {
      graceMarks: totalGraceNeeded,
      graceApplied: true,
      graceNeeded: totalGraceNeeded,
      maxGrace,
      status: "grace",
    };
  }

  // Grace insufficient, student fails
  return {
    graceMarks: 0,
    graceApplied: false,
    graceNeeded: totalGraceNeeded,
    maxGrace,
    status: "fail",
  };
}

function areAllMarksEntered(
  studentMarkEntry: StudentMarksEntry | undefined,
  subjects: Subject[]
): boolean {
  if (!studentMarkEntry) return false;

  return subjects.every((subject) => {
    const mark = studentMarkEntry.marks[subject.code];
    // Check if both internal and external marks are present and are valid numbers > 0
    // or at least one of them is > 0 (allowing 0 as a valid mark)
    return (
      mark &&
      typeof mark.internal === "number" &&
      mark.internal >= 0 &&
      typeof mark.external === "number" &&
      mark.external >= 0 &&
      // At least ensure that the marks object exists and has been touched
      (mark.internal > 0 ||
        mark.external > 0 ||
        (mark.internal === 0 &&
          mark.external === 0 &&
          studentMarkEntry.marks[subject.code] !== undefined))
    );
  });
}

function hasMarksEntered(
  studentMarkEntry: StudentMarksEntry | undefined,
  subjects: Subject[]
): boolean {
  if (!studentMarkEntry) return false;

  return subjects.some((subject) => {
    const mark = studentMarkEntry.marks[subject.code];
    return (
      mark &&
      ((typeof mark.internal === "number" && mark.internal > 0) ||
        (typeof mark.external === "number" && mark.external > 0) ||
        // Even if marks are 0, if they've been explicitly set
        (mark.internal === 0 && mark.external === 0 && mark !== undefined))
    );
  });
}

export default function StudentTable({
  students,
  subjects,
  studentMarks,
  selectedStudents,
  onSelectStudent,
  onMarksChange,
  calculateGrade,
}: StudentTableProps) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Select</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Enrollment No</TableHead>
            <TableHead>Roll No</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Father Name</TableHead>
            {subjects.map((subject) => (
              <TableHead key={subject.code} className="text-center min-w-32">
                {subject.code}
                <div className="text-xs text-muted-foreground">
                  Internal | External{" "}
                </div>
              </TableHead>
            ))}
            <TableHead className="w-24">Total</TableHead>
            <TableHead className="w-24">Grace</TableHead>
            <TableHead className="w-24">Grace Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const studentMarkEntry = studentMarks.find(
              (m) => m.studentId === student.enrollmentNo
            );

            // Check if any marks have been entered
            const hasAnyMarks = hasMarksEntered(studentMarkEntry, subjects);
            const allMarksEntered = areAllMarksEntered(
              studentMarkEntry,
              subjects
            );
            return (
              <TableRow key={student.enrollmentNo}>
                <TableCell>
                  <Checkbox
                    checked={selectedStudents.includes(student.enrollmentNo)}
                    onCheckedChange={(checked) =>
                      onSelectStudent(student.enrollmentNo, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.enrollmentNo}</TableCell>
                <TableCell>{student.rollNo}</TableCell>
                <TableCell>
                  <Badge variant="outline">{student.category}</Badge>
                </TableCell>
                <TableCell>{student.sex}</TableCell>
                <TableCell>{student.fatherName}</TableCell>
                {subjects.map((subject) => {
                  const subjectMark = studentMarkEntry?.marks[subject.code] || {
                    internal: 0,
                    external: 0,
                  };
                  const total = subjectMark.internal + subjectMark.external;
                  const { grade, point } = calculateGrade(total);

                  return (
                    <TableCell key={subject.code} className="text-center">
                      <div className="space-y-1">
                        <div className="flex space-x-1">
                          <Input
                            type="number"
                            placeholder="Int"
                            value={subjectMark.internal || ""}
                            // onChange={(e) =>
                            //   onMarksChange(
                            //     student.enrollmentNo,
                            //     subject.code,
                            //     "internal",
                            //     e.target.value
                            //   )
                            // }
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value > 70) {
                                alert("External marks cannot exceed 30");
                                onMarksChange(
                                  student.enrollmentNo,
                                  subject.code,
                                  "internal",
                                  "0"
                                );
                              } else {
                                onMarksChange(
                                  student.enrollmentNo,
                                  subject.code,
                                  "internal",
                                  value.toString()
                                );
                              }
                            }}
                            className="w-14 h-8 text-xs"
                            min="0"
                            max="30"
                          />

                          <Input
                            type="number"
                            placeholder="Ext"
                            value={subjectMark.external || ""}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value > 70) {
                                alert("External marks cannot exceed 70");
                                onMarksChange(
                                  student.enrollmentNo,
                                  subject.code,
                                  "external",
                                  "0"
                                );
                              } else {
                                onMarksChange(
                                  student.enrollmentNo,
                                  subject.code,
                                  "external",
                                  value.toString()
                                );
                              }
                            }}
                            className="w-14 h-8 text-xs"
                            min="0"
                            max="70"
                          />
                          {/* <Input
                            type="number"
                            placeholder="Ext"
                            value={subjectMark.external || ""}
                            onChange={(e) =>
                              onMarksChange(
                                student.enrollmentNo,
                                subject.code,
                                "external",
                                e.target.value
                              )
                            }
                            className="w-14 h-8 text-xs"
                            min="0"
                            max="50"
                          /> */}
                        </div>
                        {total > 0 && (
                          <div className="text-xs space-y-1">
                            <div className="font-semibold">{total}</div>
                            <Badge
                              variant={point >= 6 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {grade} ({point})
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  {hasAnyMarks && studentMarkEntry
                    ? Object.values(studentMarkEntry.marks).reduce(
                        (sum, mark) => sum + mark.internal + mark.external,
                        0
                      )
                    : "--"}
                </TableCell>

                <TableCell className="text-center text-xs">
                  {(() => {
                    // Only show grace calculation if all marks are entered
                    if (!allMarksEntered) {
                      return "--";
                    }

                    const result = calculateGrace(studentMarkEntry, subjects);
                    if (result.status === "grace") {
                      return `G(+${result.graceMarks})`;
                    } else if (
                      result.status === "fail" &&
                      result.graceNeeded > 0
                    ) {
                      return `F (need ${result.graceNeeded}, max ${result.maxGrace})`;
                    }
                    return "--";
                  })()}
                </TableCell>

                <TableCell className="text-center font-semibold text-xs">
                  {(() => {
                    // Only show status if all marks are entered
                    if (!allMarksEntered) {
                      return "--";
                    }

                    const result = calculateGrace(studentMarkEntry, subjects);
                    if (result.status === "pass")
                      return <Badge variant="default">Pass</Badge>;
                    if (result.status === "grace")
                      return <Badge variant="outline">Pass (Grace)</Badge>;
                    if (result.status === "fail")
                      return <Badge variant="destructive">Fail</Badge>;
                    if (result.status === "default")
                      return <Badge variant="secondary">---</Badge>;
                  })()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
