// components/ExcelEntry.tsx
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TabbedMarksEntry from "./TabbedMarksEntry";
import type { Student, Subject } from "@/data/studentData";

interface StudentMarksEntry {
  studentId: string;
  marks: { [subjectCode: string]: { internal: number; external: number } };
}

interface ExcelEntryProps {
  uploadedStudents: Student[];
  currentStudents: Student[];
  subjects: Subject[];
  studentMarks: StudentMarksEntry[];
  selectedStudents: string[];
  uploadError: string;
  onExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

export default function ExcelEntry({
  uploadedStudents,
  currentStudents,
  subjects,
  studentMarks,
  selectedStudents,
  uploadError,
  onExcelUpload,
  onSelectStudent,
  onMarksChange,
  calculateGrade,
  onToggleSelectAll,
}: ExcelEntryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
        <div className="text-center space-y-4">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Upload Excel File</h3>
            <p className="text-sm text-muted-foreground">
              Upload an Excel file with student data
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Choose Excel File</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={onExcelUpload}
              className="hidden"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Required columns: ABCID, RNO, ENO, NAME, SEX, FNAME, MNAME, PAPERS,
            CAT, CAST, I1, I2, I3, I4 (Internal Marks), E1, E2, E3, E4 (External Marks)
          </div>
        </div>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {uploadedStudents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Uploaded Students ({uploadedStudents.length})</Label>
            <Button variant="outline" size="sm" onClick={onToggleSelectAll}>
              {selectedStudents.length === uploadedStudents.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          <TabbedMarksEntry
            students={currentStudents}
            subjects={subjects}
            studentMarks={studentMarks}
            selectedStudents={selectedStudents}
            onSelectStudent={onSelectStudent}
            onMarksChange={onMarksChange}
            calculateGrade={calculateGrade}
            userRole="admin" // Change to "college" for college users, "university" for university users
          />
        </div>
      )}
    </div>
  );
}
