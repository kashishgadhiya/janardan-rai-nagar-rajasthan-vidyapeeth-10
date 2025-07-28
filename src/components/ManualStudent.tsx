// components/ManualEntry.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import TabbedMarksEntry from "./TabbedMarksEntry";
import type { Student, Subject } from "@/data/studentData";

interface StudentMarksEntry {
  studentId: string;
  marks: { [subjectCode: string]: { internal: number; external: number } };
}

interface ManualEntryProps {
  students: Student[];
  subjects: Subject[];
  studentMarks: StudentMarksEntry[];
  selectedStudents: string[];
  onSelectStudent: (id: string, checked: boolean) => void;
  onMarksChange: (
    studentId: string,
    subjectCode: string,
    type: "internal" | "external",
    value: string
  ) => void;
  calculateGrade: (total: number) => { grade: string; point: number };
  onToggleSelectAll: () => void;
}

export default function ManualEntry({
  students,
  subjects,
  studentMarks,
  selectedStudents,
  onSelectStudent,
  onMarksChange,
  calculateGrade,
  onToggleSelectAll,
}: ManualEntryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select Students</Label>
        <Button variant="outline" size="sm" onClick={onToggleSelectAll}>
          {selectedStudents.length === students.length
            ? "Deselect All"
            : "Select All"}
        </Button>
      </div>
      <TabbedMarksEntry
        students={students}
        subjects={subjects}
        studentMarks={studentMarks}
        selectedStudents={selectedStudents}
        onSelectStudent={onSelectStudent}
        onMarksChange={onMarksChange}
        calculateGrade={calculateGrade}
        userRole="admin" // Change to "college" for college users, "university" for university users
      />
    </div>
  );
}
