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
import { FileText } from "lucide-react";
import type { Subject, Student } from "@/data/studentData";
import { calculateGraceMarks } from "@/utils/graceCalculations";

interface StudentMarksEntry {
  studentId: string;
  marks: { [subjectCode: string]: { internal: number; external: number } };
  grace?: {
    applied: boolean;
    graceMarks: number;
    status: "pass" | "grace" | "fail";
  };
}

interface ExternalMarksTableProps {
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
  isInternalLocked: boolean;
  onGeneratePDF?: () => void;
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
): GraceResult {
  if (!studentMarkEntry) {
    return {
      graceMarks: 0,
      graceApplied: false,
      graceNeeded: 0,
      maxGrace: 0,
      status: "default",
    };
  }

  // Convert to the format expected by utils function
  const subjectsData = subjects.map(subject => {
    const mark = studentMarkEntry.marks[subject.code];
    return {
      code: subject.code,
      internal: mark?.internal || 0,
      external: mark?.external || 0,
      isTheory: subject.type === "theory",
      maxMarks: 100, // BBA TT subjects are typically 100 marks each
    };
  });

  const graceResults = calculateGraceMarks(subjectsData);
  
  let totalGraceApplied = 0;
  let totalGraceNeeded = 0;
  let hasFailingSubjects = false;
  
  graceResults.forEach(result => {
    if (result.graceApplied) {
      totalGraceApplied += result.graceMarks;
    }
    if (result.totalMarks < (result.isTheory ? 36 : 40)) {
      if (!result.graceApplied) {
        totalGraceNeeded += (result.isTheory ? 36 : 40) - result.totalMarks;
        hasFailingSubjects = true;
      }
    }
  });

  // Calculate max grace available
  const theoryAggregate = graceResults
    .filter(r => r.isTheory)
    .reduce((sum, r) => sum + r.totalMarks, 0);
  const maxGrace = Math.min(Math.floor(theoryAggregate * 0.01), 6);

  if (!hasFailingSubjects && totalGraceApplied === 0) {
    return {
      graceMarks: 0,
      graceApplied: false,
      graceNeeded: 0,
      maxGrace,
      status: "pass",
    };
  }

  if (totalGraceApplied > 0) {
    return {
      graceMarks: totalGraceApplied,
      graceApplied: true,
      graceNeeded: 0,
      maxGrace,
      status: "grace",
    };
  }

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
    return (
      mark &&
      typeof mark.internal === "number" &&
      mark.internal >= 0 &&
      typeof mark.external === "number" &&
      mark.external >= 0
    );
  });
}

export default function ExternalMarksTable({
  students,
  subjects,
  studentMarks,
  selectedStudents,
  onSelectStudent,
  onMarksChange,
  calculateGrade,
  isInternalLocked,
}: ExternalMarksTableProps) {
  if (!isInternalLocked) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">Please complete and lock internal marks first</p>
          <p className="text-sm">Switch to Internal tab to enter marks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">External Marks Entry (University)</h3>
        <div className="flex items-center gap-2">
          <Badge variant="default">Internal marks are locked</Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              // Generate PDF for selected students
              const selectedStudentData = students.filter(s => 
                selectedStudents.includes(s.enrollmentNo)
              );
              
              if (selectedStudentData.length === 0) {
                alert("Please select students to generate PDF");
                return;
              }
              
              // Create a simple PDF with jsPDF
              try {
                const jsPDF = (await import("jspdf")).default;
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Add title
                pdf.setFontSize(16);
                pdf.text("Student Marks Report", 20, 20);
                
                let y = 40;
                
                selectedStudentData.forEach((student, index) => {
                  const studentMarkEntry = studentMarks.find(m => m.studentId === student.enrollmentNo);
                  
                  if (y > 250) {
                    pdf.addPage();
                    y = 20;
                  }
                  
                  pdf.setFontSize(14);
                  pdf.text(`${index + 1}. ${student.name}`, 20, y);
                  y += 10;
                  
                  pdf.setFontSize(10);
                  pdf.text(`Enrollment: ${student.enrollmentNo}`, 20, y);
                  y += 8;
                  
                  if (studentMarkEntry) {
                    subjects.forEach(subject => {
                      const marks = studentMarkEntry.marks[subject.code];
                      if (marks) {
                        pdf.text(`${subject.code}: Int=${marks.internal}, Ext=${marks.external}, Total=${marks.internal + marks.external}`, 20, y);
                        y += 6;
                      }
                    });
                  }
                  
                  y += 10;
                });
                
                pdf.save(`Selected_Students_Marks_${new Date().toISOString().split('T')[0]}.pdf`);
              } catch (error) {
                console.error("PDF generation failed:", error);
                alert("Failed to generate PDF");
              }
            }}
            className="flex items-center gap-2"
            disabled={selectedStudents.length === 0}
          >
            <FileText className="h-4 w-4" />
            Generate PDF ({selectedStudents.length})
          </Button>
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
                <TableHead key={subject.code} className="text-center min-w-32">
                  {subject.code}
                  <div className="text-xs text-muted-foreground">
                    Internal | External
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
                            {/* Internal marks - disabled and shows locked value */}
                            <Input
                              type="number"
                              value={subjectMark.internal || ""}
                              className="w-14 h-8 text-xs bg-muted"
                              disabled
                              title="Internal marks (locked)"
                            />
                            {/* External marks - editable */}
                            <Input
                              type="number"
                              placeholder="Ext"
                              value={subjectMark.external || ""}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value > 70) {
                                  alert("External marks cannot exceed 70");
                                  return;
                                }
                                onMarksChange(
                                  student.enrollmentNo,
                                  subject.code,
                                  "external",
                                  value.toString()
                                );
                              }}
                              className="w-14 h-8 text-xs"
                              min="0"
                              max="70"
                            />
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
                    {studentMarkEntry
                      ? Object.values(studentMarkEntry.marks).reduce(
                          (sum, mark) => sum + mark.internal + mark.external,
                          0
                        )
                      : "--"}
                  </TableCell>

                  <TableCell className="text-center text-xs">
                    {(() => {
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
    </div>
  );
}