import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Unlock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InternalMarksTable from "./InternalMarksTable";
import ExternalMarksTable from "./ExternalMarksTable";
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

interface TabbedMarksEntryProps {
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
  userRole?: "college" | "university" | "admin"; // college can only see internal, university only external, admin sees both
}

export default function TabbedMarksEntry({
  students,
  subjects,
  studentMarks,
  selectedStudents,
  onSelectStudent,
  onMarksChange,
  calculateGrade,
  userRole = "admin", // default to admin for backward compatibility
}: TabbedMarksEntryProps) {
  const [activeTab, setActiveTab] = useState(
    userRole === "university" ? "external" : "internal"
  );
  const [isInternalLocked, setIsInternalLocked] = useState(false);

  const handleLockInternal = () => {
    setIsInternalLocked(true);
    if (userRole !== "college") {
      setActiveTab("external");
    }
  };

  const handleUnlockInternal = () => {
    setIsInternalLocked(false);
    setActiveTab("internal");
  };

  // Role-based tab visibility
  const showInternalTab = userRole === "college" || userRole === "admin";
  const showExternalTab = userRole === "university" || userRole === "admin";

  return (
    <div className="w-full space-y-4">
      {/* Role indicator */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Access Level: <span className="font-medium capitalize">{userRole}</span>
        </div>
        {isInternalLocked && userRole !== "university" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlockInternal}
            className="flex items-center gap-2"
          >
            <Unlock className="h-4 w-4" />
            Unlock Internal Marks
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${showInternalTab && showExternalTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {showInternalTab && (
            <TabsTrigger value="internal" className="flex items-center gap-2">
              Internal Marks (College)
              {isInternalLocked && <span className="text-xs">(Locked)</span>}
            </TabsTrigger>
          )}
          {showExternalTab && (
            <TabsTrigger 
              value="external" 
              disabled={!isInternalLocked && userRole !== "admin"}
              className="flex items-center gap-2"
            >
              External Marks (University)
              {!isInternalLocked && userRole !== "admin" && <span className="text-xs">(Locked)</span>}
            </TabsTrigger>
          )}
        </TabsList>

        {showInternalTab && (
          <TabsContent value="internal" className="mt-6">
            <InternalMarksTable
              students={students}
              subjects={subjects}
              studentMarks={studentMarks}
              selectedStudents={selectedStudents}
              onSelectStudent={onSelectStudent}
              onMarksChange={onMarksChange}
              onLockInternal={handleLockInternal}
              onUnlockInternal={handleUnlockInternal}
              isLocked={isInternalLocked}
            />
          </TabsContent>
        )}

        {showExternalTab && (
          <TabsContent value="external" className="mt-6">
            <ExternalMarksTable
              students={students}
              subjects={subjects}
              studentMarks={studentMarks}
              selectedStudents={selectedStudents}
              onSelectStudent={onSelectStudent}
              onMarksChange={onMarksChange}
              calculateGrade={calculateGrade}
              isInternalLocked={isInternalLocked}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}