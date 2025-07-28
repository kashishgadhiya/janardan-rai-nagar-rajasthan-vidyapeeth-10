import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student, Subject } from "@/data/studentData";
import { courses, getSubjectsBySemester, students } from "@/data/studentData";
import { Download, Upload, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import CourseSemesterSelector from "./CourseSemesterSelector";
import ExcelEntry from "./ExcelUpload";
import ManualEntry from "./ManualStudent";
import ResultMarksheet from "./ResultMarksheet";
import SectionHeader from "./SectionHeader";
import { BBATTRequirements } from "./BBATTRequirements";
import UniversityLOGO from "/university-logo.svg"; // Adjust the path as needed

interface StudentMarksEntry {
  studentId: string;
  marks: { [subjectCode: string]: { internal: number; external: number } };
  grace?: {
    applied: boolean;
    graceMarks: number;
    status: "pass" | "grace" | "fail";
  };
}

interface ExcelStudent extends Student {
  ABCID?: string;
  RNO?: string;
  ENO?: string;
  SEX?: string;
  FNAME?: string;
  MNAME?: string;
  PAPERS?: string;
  CAT?: string;
  CAST?: string;
}

export function ERPDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSemester, setSemester] = useState<number>(0);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentMarks, setStudentMarks] = useState<StudentMarksEntry[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "excel">("manual");
  const [uploadedStudents, setUploadedStudents] = useState<ExcelStudent[]>([]);
  const [currentStudents, setCurrentStudents] = useState<Student[]>(students);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   if (!selectedCourse || selectedSemester === 0 || studentMarks.length === 0)
  //     return;

  //   const subjects = getSubjectsBySemester(selectedCourse, selectedSemester);

  //   const updatedMarks = studentMarks.map((entry) => {
  //     // Per-subject grace results
  //     const graceResults = subjects.map((subject) => {
  //       const marks = entry.marks[subject.code] || { internal: 0, external: 0 };
  //       const total = (marks.internal || 0) + (marks.external || 0);
  //       const { grade, point } = calculateGrade(total);

  //       let graceApplied = false;
  //       let graceMarks = 0;
  //       let finalMarks = total;
  //       let gradeLetter = grade;
  //       let gradePoint = point;

  //       if (grade === "F") {
  //         const requiredMarks = 40 - total; // <-- use 40 here
  //         if (requiredMarks > 0 && requiredMarks <= 5) {
  //           graceApplied = true;
  //           graceMarks = requiredMarks;
  //           finalMarks = total + requiredMarks;
  //           // update grade/point with finalMarks
  //         }
  //       }

  //       return {
  //         subjectCode: subject.code,
  //         graceApplied,
  //         graceMarks,
  //         finalMarks,
  //         gradeLetter,
  //         gradePoint,
  //       };
  //     });

  //     const totalGrace = graceResults.reduce(
  //       (sum, r) => sum + (r.graceMarks || 0),
  //       0
  //     );
  //     const hasFail = graceResults.some((r) => r.gradeLetter === "F");
  //     const graceStatus = hasFail ? "fail" : totalGrace > 0 ? "grace" : "pass";

  //     return {
  //       ...entry,
  //       graceResults,
  //       grace: {
  //         applied: totalGrace > 0,
  //         graceMarks: totalGrace,
  //         status: graceStatus,
  //       },
  //     };
  //   });

  //   // Only update if changed
  //   if (JSON.stringify(updatedMarks) !== JSON.stringify(studentMarks)) {
  //     setStudentMarks(updatedMarks);
  //   }
  // }, [studentMarks, selectedCourse, selectedSemester]);

  // useEffect(() => {
  //   if (!selectedCourse || selectedSemester === 0 || studentMarks.length === 0)
  //     return;

  //   const subjects = getSubjectsBySemester(selectedCourse, selectedSemester);

  //   const updatedMarks = studentMarks.map((entry) => {
  //     // Calculate grace for each student
  //     let totalGraceNeeded = 0;
  //     let canPassWithGrace = true;

  //     // Check each theory subject for grace requirement
  //     const graceResults = subjects.map((subject) => {
  //       const marks = entry.marks[subject.code] || { internal: 0, external: 0 };
  //       const total = (marks.internal || 0) + (marks.external || 0);
  //       const { grade, point } = calculateGrade(total);

  //       let graceApplied = false;
  //       let graceMarks = 0;
  //       let finalMarks = total;
  //       let finalGrade = grade;
  //       let finalPoint = point;

  //       // Apply grace only for theory subjects that failed
  //       if (subject.type === "theory" && total < 40) {
  //         const requiredMarks = 40 - total;
  //         if (requiredMarks <= 5) {
  //           // Max 5 grace marks per subject
  //           graceApplied = true;
  //           graceMarks = requiredMarks;
  //           finalMarks = 40; // With grace, minimum is 40
  //           finalGrade = "C"; // Grade for 40 marks
  //           finalPoint = 4;
  //           totalGraceNeeded += requiredMarks;
  //         } else {
  //           canPassWithGrace = false; // Cannot pass even with grace
  //         }
  //       }

  //       return {
  //         subjectCode: subject.code,
  //         graceApplied,
  //         graceMarks,
  //         finalMarks,
  //         gradeLetter: finalGrade,
  //         gradePoint: finalPoint,
  //       };
  //     });

  //     // Calculate total theory subjects and max allowed grace
  //     const theorySubjects = subjects.filter((s) => s.type === "theory").length;
  //     const maxAllowedGrace = Math.min(
  //       Math.floor(theorySubjects * 100 * 0.01),
  //       6
  //     );

  //     // Determine final status
  //     let graceStatus: "pass" | "grace" | "fail";
  //     if (totalGraceNeeded === 0) {
  //       graceStatus = "pass"; // No grace needed
  //     } else if (canPassWithGrace && totalGraceNeeded <= maxAllowedGrace) {
  //       graceStatus = "grace"; // Passed with grace
  //     } else {
  //       graceStatus = "fail"; // Failed even with grace
  //     }

  //     return {
  //       ...entry,
  //       graceResults,
  //       grace: {
  //         applied: totalGraceNeeded > 0 && graceStatus === "grace",
  //         graceMarks: graceStatus === "grace" ? totalGraceNeeded : 0,
  //         status: graceStatus,
  //       },
  //     };
  //   });

  //   // Only update if changed
  //   if (JSON.stringify(updatedMarks) !== JSON.stringify(studentMarks)) {
  //     setStudentMarks(updatedMarks);
  //   }
  // }, [studentMarks, selectedCourse, selectedSemester]);

  useEffect(() => {
    if (!selectedCourse || selectedSemester === 0 || studentMarks.length === 0)
      return;

    const subjects = getSubjectsBySemester(selectedCourse, selectedSemester);
    const theorySubjects = subjects.filter(
      (subject) => subject.type === "theory"
    );

    const updatedMarks = studentMarks.map((entry) => {
      // Calculate total theory aggregate
      const totalTheoryAggregate = theorySubjects.length * 100;

      // Calculate max grace: 1% of aggregate OR 6, whichever is minimum
      const maxGraceFromAggregate = Math.floor(totalTheoryAggregate * 0.01);
      const maxAllowedGrace = Math.min(maxGraceFromAggregate, 6);

      let totalGraceNeeded = 0;
      let failingSubjects = [];

      // First pass: identify subjects that need grace
      const graceResults = subjects.map((subject) => {
        const marks = entry.marks[subject.code] || { internal: 0, external: 0 };
        const total = (marks.internal || 0) + (marks.external || 0);
        const { grade, point } = calculateGrade(total);

        let graceApplied = false;
        let graceMarks = 0;
        let finalMarks = total;
        let finalGrade = grade;
        let finalPoint = point;

        // BBA TT: Only theory subjects can get grace, need 36% minimum per subject
        if (subject.type === "theory" && total < 36) {
          const graceNeeded = 36 - total;
          totalGraceNeeded += graceNeeded;
          failingSubjects.push({
            subjectCode: subject.code,
            graceNeeded: graceNeeded,
            total: total,
          });
        }

        return {
          subjectCode: subject.code,
          graceApplied: false, // Will be updated in second pass
          graceMarks: 0, // Will be updated in second pass
          finalMarks: total,
          gradeLetter: grade,
          gradePoint: point,
        };
      });

      // Second pass: apply grace if within limits
      let actualGraceUsed = 0;
      if (totalGraceNeeded > 0 && totalGraceNeeded <= maxAllowedGrace) {
        graceResults.forEach((result) => {
          const failingSubject = failingSubjects.find(
            (f) => f.subjectCode === result.subjectCode
          );

          if (failingSubject) {
            result.graceApplied = true;
            result.graceMarks = failingSubject.graceNeeded;
            result.finalMarks = 36; // With grace, minimum is 36%
            result.gradeLetter = "C"; // Grade for 36 marks
            result.gradePoint = 4;
            actualGraceUsed += failingSubject.graceNeeded;
          }
        });
      }

      // Calculate SGPA to check 4.0 minimum requirement
      const totalCredits = subjects.reduce(
        (sum, subject) => sum + subject.credits,
        0
      );
      const totalGradePoints = graceResults.reduce((sum, result, index) => {
        return sum + result.gradePoint * subjects[index].credits;
      }, 0);
      const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

      // Check aggregate percentage (40% minimum)
      const totalMarks = graceResults.reduce(
        (sum, result) => sum + result.finalMarks,
        0
      );
      const totalMaxMarks = subjects.length * 100;
      const aggregatePercentage = (totalMarks / totalMaxMarks) * 100;

      // Check practical subjects separately (40% minimum)
      const practicalSubjects = subjects.filter((s) => s.type === "practical");
      let practicalFailed = false;
      practicalSubjects.forEach((subject) => {
        const marks = entry.marks[subject.code] || { internal: 0, external: 0 };
        const total = (marks.internal || 0) + (marks.external || 0);
        if (total < 40) {
          // 40% for practical subjects
          practicalFailed = true;
        }
      });

      // Determine final status based on all BBA TT requirements
      let graceStatus: "pass" | "grace" | "fail";
      if (
        totalGraceNeeded === 0 &&
        sgpa >= 4.0 &&
        aggregatePercentage >= 40 &&
        !practicalFailed
      ) {
        graceStatus = "pass";
      } else if (
        totalGraceNeeded <= maxAllowedGrace &&
        sgpa >= 4.0 &&
        aggregatePercentage >= 40 &&
        !practicalFailed
      ) {
        graceStatus = "grace";
      } else {
        graceStatus = "fail";
      }

      return {
        ...entry,
        graceResults,
        grace: {
          applied: graceStatus === "grace",
          graceMarks: graceStatus === "grace" ? actualGraceUsed : 0,
          status: graceStatus,
        },
      };
    });

    // Only update if changed
    if (JSON.stringify(updatedMarks) !== JSON.stringify(studentMarks)) {
      setStudentMarks(updatedMarks);
    }
  }, [studentMarks, selectedCourse, selectedSemester]);

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setSemester(0);
    setSelectedStudents([]);
    setStudentMarks([]);
  };

  const handleSemesterSelect = (semester: string) => {
    const sem = parseInt(semester);
    setSemester(sem);
    setSelectedStudents([]);

    const subjects = getSubjectsBySemester(selectedCourse, sem);
    const initialMarks = currentStudents.map((student) => ({
      studentId: student.enrollmentNo,
      marks: subjects.reduce(
        (acc, subject) => ({
          ...acc,
          [subject.code]: { internal: 0, external: 0 },
        }),
        {}
      ),
    }));
    setStudentMarks(initialMarks);
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const requiredColumns = [
          "ABCID",
          "RNO",
          "ENO",
          "NAME",
          "SEX",
          "FNAME",
          "MNAME",
          "PAPERS",
          "CAT",
          "CAST",
        ];

        const normalizedData = jsonData.map((row: any) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              key.trim().toUpperCase(),
              value,
            ])
          )
        );

        if (!normalizedData[0]) {
          setUploadError("Excel file is empty or not properly formatted.");
          return;
        }

        const presentColumns = Object.keys(normalizedData[0]);
        const missingColumns = requiredColumns.filter(
          (col) => !presentColumns.includes(col)
        );

        if (missingColumns.length > 0) {
          setUploadError(
            `Missing required columns: ${missingColumns.join(", ")}`
          );
          return;
        }

        const transformedStudents: ExcelStudent[] = normalizedData.map(
          (row: any, index) => ({
            id: row.ABCID || `student-${index}`,
            sno: (index + 1).toString(),
            abcId: row.ABCID || "",
            rollNo: row.RNO || "",
            enrollmentNo: row.ENO || "",
            name: row.NAME || "",
            sex: (row.SEX === "F" ? "F" : "M") as "M" | "F",
            fatherName: row.FNAME || "",
            motherName: row.MNAME || "",
            category: row.CAT || "REG",
            cast: row.CAST || "GEN",
            photo: "/placeholder.png",
            email: `${row.ENO || "student"}@university.edu`,
            phone: "9999999999",
            papers: row.PAPERS || "",
            rno: row.RNO || "",
            eno: row.ENO || "",
            ABCID: row.ABCID || "",
            RNO: row.RNO || "",
            ENO: row.ENO || "",
            SEX: row.SEX || "",
            FNAME: row.FNAME || "",
            MNAME: row.MNAME || "",
            PAPERS: row.PAPERS || "",
            CAT: row.CAT || "",
            CAST: row.CAST || "",
          })
        );

        setUploadedStudents(transformedStudents);
        setCurrentStudents(transformedStudents);
        setActiveTab("excel");
        setSelectedStudents([]);

        // Initialize studentMarks for uploaded students with Excel marks data
        const subjects = getSubjectsBySemester(selectedCourse, selectedSemester);
        
        console.log("=== EXCEL UPLOAD DEBUG ===");
        console.log("First Excel row:", normalizedData[0]);
        console.log("All available columns:", Object.keys(normalizedData[0]));
        console.log("Current subjects:", subjects.map(s => s.code));
        
        // Check what mark columns are actually present
        const markColumns = Object.keys(normalizedData[0]).filter(col => 
          col.startsWith('I') || col.startsWith('E')
        );
        console.log("Mark columns found:", markColumns);
        
        const initialMarks = transformedStudents.map((student, studentIndex) => {
          const excelRow = normalizedData[studentIndex];
          
          console.log(`\n--- Student ${studentIndex + 1}: ${student.name} ---`);
          console.log("Excel row data:", excelRow);
          
          const marks = subjects.reduce((acc, subject, subjectIndex) => {
            // Try multiple possible column name formats
            const internalColumns = [
              `I${subjectIndex + 1}`,
              `I-${subjectIndex + 1}`,
              `INT${subjectIndex + 1}`,
              `INTERNAL${subjectIndex + 1}`
            ];
            
            const externalColumns = [
              `E${subjectIndex + 1}`,
              `E-${subjectIndex + 1}`,
              `EXT${subjectIndex + 1}`,
              `EXTERNAL${subjectIndex + 1}`
            ];
            
            let internalMark = 0;
            let externalMark = 0;
            
            // Find internal mark
            for (const col of internalColumns) {
              if (excelRow[col] !== undefined && excelRow[col] !== null && excelRow[col] !== '') {
                internalMark = Number(excelRow[col]) || 0;
                console.log(`Found internal mark for ${subject.code} in column ${col}: ${internalMark}`);
                break;
              }
            }
            
            // Find external mark
            for (const col of externalColumns) {
              if (excelRow[col] !== undefined && excelRow[col] !== null && excelRow[col] !== '') {
                externalMark = Number(excelRow[col]) || 0;
                console.log(`Found external mark for ${subject.code} in column ${col}: ${externalMark}`);
                break;
              }
            }
            
            console.log(`Subject ${subject.code}: Internal=${internalMark}, External=${externalMark}`);
            
            return {
              ...acc,
              [subject.code]: { 
                internal: internalMark, 
                external: externalMark 
              },
            };
          }, {});
          
          console.log(`Final marks for ${student.name}:`, marks);
          
          return {
            studentId: student.enrollmentNo,
            marks: marks,
          };
        });
        
        setStudentMarks(initialMarks);
        console.log("=== END DEBUG ===");

        console.log(
          `✅ Successfully uploaded ${transformedStudents.length} students from Excel`
        );
      } catch (error) {
        setUploadError("❌ Error reading Excel file. Please check the format.");
        console.error("Excel upload error:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleTabChange = (tab: "manual" | "excel") => {
    setActiveTab(tab);
    if (tab === "manual") {
      setCurrentStudents(students);
    } else {
      setCurrentStudents(uploadedStudents);
    }
    // Reset selections when switching tabs
    setSelectedStudents([]);
    setStudentMarks([]);
  };

  const calculateSGPA = (
    studentMarks: StudentMarksEntry,
    studentId: string,
    semester: number
  ) => {
    const subjects = getSubjectsBySemester(selectedCourse, semester);
    let totalCredits = 0;
    let totalGradePoints = 0;

    subjects.forEach((subject) => {
      const marks = studentMarks.marks[subject.code];
      if (marks) {
        const total = marks.internal + marks.external;
        const { point } = calculateGrade(total);
        totalGradePoints += point * subject.credits;
        totalCredits += subject.credits;
      }
    });

    return totalCredits > 0
      ? (totalGradePoints / totalCredits).toFixed(2)
      : "0.00";
  };

  const calculateCGPA = (studentId: string) => {
    const currentSGPA = parseFloat(
      calculateSGPA(
        studentMarks.find((m) => m.studentId === studentId) || {
          studentId,
          marks: {},
        },
        studentId,
        selectedSemester
      )
    );

    // Dummy calculation - in real scenario, you'd have all semester SGPAs
    const allSemesters = Array.from(
      { length: selectedSemester },
      (_, i) => i + 1
    );
    const totalSGPA = allSemesters.reduce((acc, sem) => {
      if (sem === selectedSemester) return acc + currentSGPA;
      // Use dummy SGPAs for previous semesters (in real app, get from database)
      return acc + (6.5 + Math.random() * 2); // Random SGPA between 6.5-8.5
    }, 0);

    return (totalSGPA / selectedSemester).toFixed(2);
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleMarksChange = (
    studentId: string,
    subjectCode: string,
    type: "internal" | "external",
    value: string
  ) => {
    const marks = parseInt(value) || 0;
    setStudentMarks((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId
          ? {
              ...entry,
              marks: {
                ...entry.marks,
                [subjectCode]: {
                  ...entry.marks[subjectCode],
                  [type]: marks,
                },
              },
            }
          : entry
      )
    );
  };

  const calculateGrade = (total: number): { grade: string; point: number } => {
    if (total >= 91) return { grade: "O", point: 10 }; // Outstanding
    if (total >= 81) return { grade: "A+", point: 9 }; // Excellent
    if (total >= 71) return { grade: "A", point: 8 }; // Very Good
    if (total >= 61) return { grade: "B+", point: 7 }; // Good
    if (total >= 51) return { grade: "B", point: 6 }; // Above Average
    if (total >= 41) return { grade: "C+", point: 5 }; // Average
    if (total >= 36) return { grade: "C", point: 4 }; // Pass
    if (total === 0) return { grade: "AB", point: 0 }; // Absent
    return { grade: "F", point: 0 }; // Fail (Below 36)
  };

  const generateResults = () => {
    setShowResults(true);
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

    // Get only theory subjects
    const theorySubjects = subjects.filter(
      (subject) => subject.type === "theory"
    );

    // Calculate total theory aggregate (maximum possible marks)
    const totalTheoryAggregate = theorySubjects.length * 100; // Each theory paper is 100 marks

    // Calculate maximum grace allowed: 1% of aggregate OR 6, whichever is minimum
    const maxGraceFromAggregate = Math.floor(totalTheoryAggregate * 0.01); // 1% of total
    const maxGrace = Math.min(maxGraceFromAggregate, 6); // Whichever is minimum

    let totalGraceNeeded = 0;
    let failingSubjects = [];

    // Check each theory subject for grace requirement
    theorySubjects.forEach((subject) => {
      const mark = studentMarkEntry.marks[subject.code];
      const total = (mark?.internal || 0) + (mark?.external || 0);

      if (total < 36) {
        // Failing mark - BBA TT requires 36% minimum
        const graceNeeded = 36 - total;
        totalGraceNeeded += graceNeeded;
        failingSubjects.push({
          subjectCode: subject.code,
          currentMarks: total,
          graceNeeded: graceNeeded,
        });
      }
    });

    // Determine status based on grace needed vs max allowed
    if (totalGraceNeeded === 0) {
      return {
        graceMarks: 0,
        graceApplied: false,
        graceNeeded: 0,
        maxGrace,
        status: "pass",
      };
    }

    if (totalGraceNeeded <= maxGrace) {
      return {
        graceMarks: totalGraceNeeded,
        graceApplied: true,
        graceNeeded: totalGraceNeeded,
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

  // const handleMarksChange = (
  //   studentId: string,
  //   subjectCode: string,
  //   type: "internal" | "external",
  //   value: number
  // ) => {
  //   const updatedStudents = studentMarks.map((entry) => {
  //     if (entry.studentId === studentId) {
  //       const updatedMarks = {
  //         ...entry.marks,
  //         [subjectCode]: {
  //           ...entry.marks[subjectCode],
  //           [type]: value,
  //         },
  //       };

  //       const graceResult =
  //         subjects.length > 0
  //           ? calculateGrace(
  //               {
  //                 studentId,
  //                 marks: updatedMarks,
  //               },
  //               subjects
  //             )
  //           : undefined;

  //       return {
  //         ...entry,
  //         marks: updatedMarks,
  //         grace: graceResult
  //           ? {
  //               applied: graceResult.graceApplied,
  //               graceMarks: graceResult.graceMarks,
  //               status:
  //                 graceResult.status === "G"
  //                   ? "grace"
  //                   : graceResult.status === "Pass"
  //                   ? "pass"
  //                   : "fail",
  //             }
  //           : undefined,
  //       };
  //     }
  //     return entry;
  //   });

  //   setStudentMarks(updatedStudents); // ✅ This should work now
  // };

  const subjects =
    selectedCourse && selectedSemester
      ? getSubjectsBySemester(selectedCourse, selectedSemester)
      : [];

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);

  if (showResults) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setShowResults(false)}
            className="group inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-black hover:shadow-md mt-5 ml-10"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            Back to Dashboard
          </Button>
        </div>
        <ResultMarksheet
          students={currentStudents.filter((s) =>
            selectedStudents.includes(s.enrollmentNo)
          )}
          course={selectedCourseData!}
          semester={selectedSemester}
          studentMarks={studentMarks}
          calculateGrade={calculateGrade}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className=" py-3 flex items-center space-x-4">
        <img src={UniversityLOGO} alt="University Logo" className="h-10 w-10" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black uppercase">
          Janardan Rai Nagar Rajasthan Vidyapeeth (Deemed to be University)
        </h1>
      </div>
      <CourseSemesterSelector
        courses={courses}
        selectedCourse={selectedCourse}
        selectedSemester={selectedSemester}
        selectedCourseData={selectedCourseData}
        subjects={subjects}
        handleCourseSelect={handleCourseSelect}
        handleSemesterSelect={handleSemesterSelect}
      />

      {/* BBA TT Requirements Display */}
      {selectedCourse === "bba-tourism" && <BBATTRequirements />}

      {/* Student Data Input Methods */}
      {selectedCourse && selectedSemester > 0 && (
        <Card>
          <SectionHeader
            icon={<Users className="h-5 w-5" />}
            title="Student Data Management"
            description="Input student data manually or upload from Excel file"
          />
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                handleTabChange(value as "manual" | "excel")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="manual"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Manual Entry</span>
                </TabsTrigger>
                <TabsTrigger
                  value="excel"
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Excel Upload</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <ManualEntry
                  students={currentStudents}
                  subjects={subjects}
                  studentMarks={studentMarks}
                  selectedStudents={selectedStudents}
                  onSelectStudent={handleStudentSelect}
                  onMarksChange={handleMarksChange}
                  calculateGrade={calculateGrade}
                  onToggleSelectAll={() =>
                    setSelectedStudents(
                      selectedStudents.length === currentStudents.length
                        ? []
                        : currentStudents.map((s) => s.enrollmentNo)
                    )
                  }
                />
              </TabsContent>
              <TabsContent value="excel" className="space-y-4">
                <ExcelEntry
                  uploadedStudents={uploadedStudents}
                  currentStudents={currentStudents}
                  subjects={subjects}
                  studentMarks={studentMarks}
                  selectedStudents={selectedStudents}
                  uploadError={uploadError}
                  onExcelUpload={handleExcelUpload}
                  onSelectStudent={handleStudentSelect}
                  onMarksChange={handleMarksChange}
                  calculateGrade={calculateGrade}
                  onToggleSelectAll={() =>
                    setSelectedStudents(
                      selectedStudents.length === uploadedStudents.length
                        ? []
                        : uploadedStudents.map((s) => s.enrollmentNo)
                    )
                  }
                />
              </TabsContent>
            </Tabs>

            {selectedStudents.length > 0 && (
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={generateResults}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Generate Results & PDF</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
