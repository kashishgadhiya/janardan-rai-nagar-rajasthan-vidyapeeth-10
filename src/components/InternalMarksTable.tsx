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
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import type { Subject, Student } from "@/data/studentData";

interface StudentMarksEntry {
  studentId: string;
  marks: { [subjectCode: string]: { internal: number; external: number } };
  grace?: {
    applied: boolean;
    graceMarks: number;
    status: "pass" | "grace" | "fail";
  };
}

interface InternalMarksTableProps {
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
  onLockInternal: () => void;
  onUnlockInternal: () => void;
  isLocked: boolean;
}

function areAllInternalMarksEntered(
  studentMarkEntry: StudentMarksEntry | undefined,
  subjects: Subject[]
): boolean {
  if (!studentMarkEntry) return false;

  return subjects.every((subject) => {
    const mark = studentMarkEntry.marks[subject.code];
    return (
      mark &&
      typeof mark.internal === "number" &&
      mark.internal >= 0
    );
  });
}

export default function InternalMarksTable({
  students,
  subjects,
  studentMarks,
  selectedStudents,
  onSelectStudent,
  onMarksChange,
  onLockInternal,
  onUnlockInternal,
  isLocked,
}: InternalMarksTableProps) {
  const allStudentsHaveInternalMarks = students.every((student) => {
    const studentMarkEntry = studentMarks.find(
      (m) => m.studentId === student.enrollmentNo
    );
    return areAllInternalMarksEntered(studentMarkEntry, subjects);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Internal Marks Entry (College)</h3>
        <div className="flex items-center gap-2">
          {!isLocked && (
            <Button 
              onClick={onLockInternal}
              disabled={!allStudentsHaveInternalMarks}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Lock Internal & Proceed to External
            </Button>
          )}
          {isLocked && (
            <>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                Internal marks locked
              </Badge>
              <Button 
                onClick={onUnlockInternal}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                Unlock to Edit
              </Button>
            </>
          )}
        </div>
      </div>

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
                <TableHead key={subject.code} className="text-center min-w-24">
                  {subject.code}
                  <div className="text-xs text-muted-foreground">
                    Internal (Max 30)
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-24">Total Internal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const studentMarkEntry = studentMarks.find(
                (m) => m.studentId === student.enrollmentNo
              );

              return (
                <TableRow key={student.enrollmentNo}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.enrollmentNo)}
                      onCheckedChange={(checked) =>
                        onSelectStudent(student.enrollmentNo, checked as boolean)
                      }
                      disabled={isLocked}
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

                    return (
                      <TableCell key={subject.code} className="text-center">
                        <Input
                          type="number"
                          placeholder="Internal"
                          value={subjectMark.internal || ""}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (value > 30) {
                              alert("Internal marks cannot exceed 30");
                              return;
                            }
                            onMarksChange(
                              student.enrollmentNo,
                              subject.code,
                              "internal",
                              value.toString()
                            );
                          }}
                          className="w-20 h-8 text-xs text-center"
                          min="0"
                          max="30"
                          disabled={isLocked}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-medium">
                    {studentMarkEntry
                      ? Object.values(studentMarkEntry.marks).reduce(
                          (sum, mark) => sum + mark.internal,
                          0
                        )
                      : 0}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}