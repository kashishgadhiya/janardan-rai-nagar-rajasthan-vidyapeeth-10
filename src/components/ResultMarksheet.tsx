import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Course, Student } from "@/data/studentData";
import { SubjectResult } from "@/utils/graceCalculations";
import { Download, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import IMG from "/A4 - 7.svg";
import universityLOGO from "/university-logo.svg";
import user from "/placeholder.png"; // Adjust the path as needed

// interface StudentMarksEntry {
//   studentId: string;
//   marks: { [subjectCode: string]: { internal: number; external: number } };
//   graceResults?: SubjectResult[];
// }
interface StudentMarksEntry {
  studentId: string;
  marks: { [subjectCode: string]: { internal: number; external: number } };
  graceResults?: SubjectResult[];
  grace?: {
    applied: boolean;
    graceMarks: number;
    status: "pass" | "grace" | "fail";
  };
}

interface ResultMarksheetProps {
  students: Student[];
  course: Course;
  semester: number;
  studentMarks: StudentMarksEntry[];
  calculateGrade: (total: number) => { grade: string; point: number };
}

export default function ResultMarksheet({
  students,
  course,
  semester,
  studentMarks,
  calculateGrade,
}: ResultMarksheetProps) {
  const marksheetRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const getSubjects = () => {
    const semesterData = course.subjects.find((s) => s.semester === semester);
    return semesterData ? semesterData.subjects : [];
  };

  // const generatePDF = async (studentId?: string) => {
  //   if (!marksheetRef.current) return;

  //   const studentsToProcess = studentId
  //     ? [students.find((s) => s.enrollmentNo === studentId)!]
  //     : students;

  //   // Import jsPDF and html2canvas dynamically
  //   const jsPDF = (await import("jspdf")).default;
  //   const html2canvas = (await import("html2canvas")).default;

  //   const pdf = new jsPDF("p", "mm", "a4");

  //   for (let i = 0; i < studentsToProcess.length; i++) {
  //     const student = studentsToProcess[i];

  //     // Hide all marksheets except current one
  //     const allMarksheets = marksheetRef.current.querySelectorAll(".marksheet");
  //     allMarksheets.forEach((marksheet, index) => {
  //       (marksheet as HTMLElement).style.display =
  //         index ===
  //         students.findIndex((s) => s.enrollmentNo === student.enrollmentNo)
  //           ? "block"
  //           : "none";
  //     });

  //     const canvas = await html2canvas(marksheetRef.current, {
  //       scale: 2,
  //       useCORS: true,
  //       allowTaint: true,
  //       backgroundColor: "#ffffff",
  //     });

  //     const imgData = canvas.toDataURL("image/png");

  //     if (i > 0) {
  //       pdf.addPage();
  //     }

  //     const imgWidth = 210;
  //     const pageHeight = 297;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  //     heightLeft -= pageHeight;

  //     while (heightLeft >= 0) {
  //       position = heightLeft - imgHeight;
  //       pdf.addPage();
  //       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;
  //     }
  //   }

  //   // Show all marksheets again
  //   const allMarksheets = marksheetRef.current.querySelectorAll(".marksheet");
  //   allMarksheets.forEach((marksheet) => {
  //     (marksheet as HTMLElement).style.display = "block";
  //   });

  //   const fileName = studentId
  //     ? `${students
  //         .find((s) => s.enrollmentNo === studentId)
  //         ?.name.replace(/\s+/g, "_")}_Marksheet.pdf`
  //     : `All_Students_Marksheet_${course.code}_Sem${semester}.pdf`;

  //   pdf.save(fileName);
  // };

  const generatePDF = async (studentId?: string) => {
    setLoading(true);
    try {
      if (!marksheetRef.current) return;

      const studentsToProcess = studentId
        ? [students.find((s) => s.enrollmentNo === studentId)!]
        : students;

      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      const pdf = new jsPDF("p", "mm", "a3"); // Change to "a4" if needed

      // Inject temporary style for clean PDF layout
      const tempStyle = document.createElement("style");
      tempStyle.id = "pdf-temp-style";
      tempStyle.textContent = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .marksheet-container-pdf {
        margin: 0 !important;
        padding: 0 !important;
        gap: 0 !important;
        space-y: 0 !important;
      }
      .marksheet-container-pdf .marksheet {
        margin: 0 !important;
        margin-bottom: 0 !important;
        border-radius: 0 !important;
      }
    `;
      document.head.appendChild(tempStyle);

      marksheetRef.current.classList.add("marksheet-container-pdf");

      for (let i = 0; i < studentsToProcess.length; i++) {
        const student = studentsToProcess[i];

        const allMarksheets =
          marksheetRef.current.querySelectorAll(".marksheet");
        allMarksheets.forEach((marksheet, index) => {
          (marksheet as HTMLElement).style.display =
            index ===
            students.findIndex((s) => s.enrollmentNo === student.enrollmentNo)
              ? "block"
              : "none";
        });

        const canvas = await html2canvas(marksheetRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");

        if (i > 0) pdf.addPage();

        const imgWidth = 297; // for A3
        const imgHeight = 420;
        // For A4 use: const imgWidth = 210; const imgHeight = 297;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      // Clean up styles
      marksheetRef.current.classList.remove("marksheet-container-pdf");
      const tempStyleElement = document.getElementById("pdf-temp-style");
      if (tempStyleElement) tempStyleElement.remove();

      // Restore visibility
      const allMarksheets = marksheetRef.current.querySelectorAll(".marksheet");
      allMarksheets.forEach((marksheet) => {
        (marksheet as HTMLElement).style.display = "block";
      });

      const fileName = studentId
        ? `${students
            .find((s) => s.enrollmentNo === studentId)
            ?.name.replace(/\s+/g, "_")}_Marksheet.pdf`
        : `All_Students_Marksheet_${course.code}_Sem${semester}.pdf`;

      pdf.save(fileName);
    } finally {
      setLoading(false);
    }
  };

  const calculateSGPA = (studentId: string) => {
    const subjects = getSubjects();
    const studentMarkEntry = studentMarks.find(
      (m) => m.studentId === studentId
    );
    if (!studentMarkEntry) return { sgpa: 0, totalCredits: 0, earnCredits: 0 };

    let totalPoints = 0;
    let totalCredits = 0;
    let earnCredits = 0;

    subjects.forEach((subject) => {
      const mark = studentMarkEntry.marks[subject.code];
      if (mark) {
        const total = mark.internal + mark.external;
        const { point } = calculateGrade(total);
        totalPoints += point * subject.credits;
        totalCredits += subject.credits;
        if (point > 0) earnCredits += subject.credits;
      }
    });

    return {
      sgpa: totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0,
      totalCredits,
      earnCredits,
    };
  };

  const getResult = (sgpa: number) => {
    if (sgpa >= 8.0) return "FIRST";
    if (sgpa >= 6.5) return "SECOND";
    if (sgpa >= 5.0) return "THIRD";
    if (sgpa >= 4.0) return "PASS";
    return "FAIL";
  };

  // Calculate total credit points for the current semester
  const calculateTotalCreditPoints = (studentId: string) => {
    const subjects = getSubjects();
    const studentMarkEntry = studentMarks.find(
      (m) => m.studentId === studentId
    );
    if (!studentMarkEntry) return 0;

    return subjects.reduce((total, subject) => {
      const mark = studentMarkEntry.marks[subject.code];
      if (mark) {
        const totalMarks = mark.internal + mark.external;
        const { point } = calculateGrade(totalMarks);
        return total + point * subject.credits;
      }
      return total;
    }, 0);
  };

  const subjects = getSubjects();

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold">Generated Results</h2>
        <Button
          onClick={() => generatePDF()}
          className="flex items-center space-x-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span className="ml-2 text-white">Downloading...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download All PDFs</span>
            </>
          )}
        </Button>
      </div>

      <div ref={marksheetRef} className="space-y-8 max-w-4xl mx-auto ">
        {students.map((student) => {
          const studentMarkEntry = studentMarks.find(
            (m) => m.studentId === student.enrollmentNo
          );
          const { sgpa, totalCredits, earnCredits } = calculateSGPA(
            student.enrollmentNo
          );
          const result = getResult(sgpa);
          const totalCreditPoints = calculateTotalCreditPoints(
            student.enrollmentNo
          );
          const totalMarks = subjects.reduce((sum, subject) => {
            const mark = studentMarkEntry?.marks[subject.code] || {
              internal: 0,
              external: 0,
            };
            return sum + mark.internal + mark.external;
          }, 0);

          const percentage = (totalMarks / 500) * 100;

          // Check if student used any grace marks
          const graceResults = studentMarkEntry?.graceResults || [];
          const hasGraceMarks = graceResults.some(
            (r) => r.graceApplied && r.graceMarks > 0
          );

          let resultDivision = "XXX";
          if (percentage >= 60) resultDivision = "FIRST";
          else if (percentage >= 45) resultDivision = "SECOND";
          else resultDivision = "XXX";

          // Append (G) if grace marks were used
          if (
            hasGraceMarks &&
            (resultDivision === "FIRST" || resultDivision === "SECOND")
          ) {
            resultDivision = resultDivision + " (G)";
          }

          return (
            <Card
              key={student.enrollmentNo}
              className="marksheet relative bg-white  print:shadow-none overflow-hidden border-2 border-blue-900"
            >
              {/* Watermark - University logo with text like reference */}
              <div className="absolute  w-full h-full z-10">
                <div>
                  <div
                    className="flex justify-center items-center h-full "
                    style={{
                      background:
                        "radial-gradient(circle, #FCF4F3 , #EFF6FD, #F6F0F2, #F2F7FB)",
                      // "radial-gradient(circle, #f0e5dc, #f4f4e2, #e2e8f0, #f0f0f0)",
                    }}
                  >
                    <img
                      src={IMG}
                      alt="University Logo"
                      className="w-full h-full opacity-10"
                    />
                  </div>
                </div>
              </div>

              <div className="relative z-20 p-5">
                {/* University Header */}
                <div className=" mb-4">
                  <div className="flex items-start p-4">
                    {/* University Info */}
                    <div className="flex-1 text-center mr-4">
                      <h1 className="text-red-600 font-bold text-xl mb-1">
                        JANARDAN RAI NAGAR RAJASTHAN VIDYAPEETH (DEEMED TO BE
                        UNIVERSITY)
                      </h1>
                      <div className="flex items-start justify-between  ">
                        {/* Left - University Logo */}
                        <div className="w-20 h-20 mr-3 flex-shrink-0">
                          <img
                            src={universityLOGO}
                            alt="University Logo"
                            className="w-full h-full  text-blue-900"
                          />
                        </div>

                        {/* Center - University Text */}
                        <div className="flex-1 text-center">
                          <p className="text-md text-red-600 font-bold mb-0">
                            UDAIPUR, RAJASTHAN
                          </p>
                          <p className="text-sm leading-tight text-blue-900">
                            (Declared Under Section 3 of the UGC Act, 1956 Vide
                            Notification
                            <br />
                            No. F-9-5/84-U-3, dated January 12, 1987 of the
                            Government of India.)
                          </p>
                        </div>

                        {/* Right - Serial Number */}
                        <div className="flex-shrink-0 text-right ml-3">
                          <p
                            className="text-lg
                           font-bold text-black"
                          >
                            S.No.:{student.sno}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-black pt-1">
                        <h2 className="font-bold text-lg">
                          STATEMENT OF MARKS & GRADES
                        </h2>
                        <p className="font-bold text-lg ">{course.name}</p>
                        <p className="text-lg font-bold">
                          {semester === 1
                            ? "FIRST"
                            : semester === 2
                            ? "SECOND"
                            : semester === 3
                            ? "THIRD"
                            : semester === 4
                            ? "FOURTH"
                            : semester === 5
                            ? "FIFTH"
                            : "SIXTH"}{" "}
                          SEMESTER EXAMINATION – JUNE, 2024
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 text-sm">
                  {/* Left Column */}
                  <div className="col-span-5 space-y-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-black w-36">
                        NAME
                      </span>
                      <span className="mx-2">:</span>
                      <span className="text-black font-semibold">
                        {student.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-black w-36">
                        FATHER'S NAME
                      </span>
                      <span className="mx-2">:</span>
                      <span className="text-black">{student.fatherName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-black w-36">
                        MOTHER'S NAME
                      </span>
                      <span className="mx-2">:</span>
                      <span className="text-black">{student.motherName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-black w-36">
                        ABC ID
                      </span>
                      <span className="mx-2">:</span>
                      <span className="text-black">{student.abcId}</span>
                    </div>
                  </div>

                  {/* Middle Column */}
                  <div className="col-span-4 space-y-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-black w-28">
                        ROLL NO.
                      </span>
                      <span className="mx-2">:</span>
                      <span className="text-black">{student.rollNo}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-black w-28">
                        ENROL. NO.
                      </span>
                      <span className="mx-2">:</span>
                      <span className="text-black">{student.enrollmentNo}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-black w-28">
                        CATEGORY
                      </span>
                      <span className="mx-2">:</span>
                      <span className="text-black">{student.category}</span>
                    </div>
                  </div>

                  {/* Right Column - Photo */}
                  <div className="col-span-3 flex justify-end">
                    <div className="w-20 h-24 border-2 border-gray-800 bg-gray-100">
                      <img
                        src={user}
                        alt="Student Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                {/* Marks Table */}

                <div className="border border-black mb-4 mt-2">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-black px-2 py-2 text-center font-bold text-xs w-20">
                          Paper Code
                        </th>
                        <th className="border border-black px-3 py-2 text-center font-bold text-xs">
                          Paper Title
                        </th>
                        <th className="border border-black px-2 py-2 text-center font-bold text-xs w-16">
                          Credits
                        </th>
                        <th
                          className="border border-black px-2 py-1 text-center font-bold text-xs"
                          colSpan={3}
                        >
                          Marks Obtained
                        </th>
                        <th className="border border-black px-2 py-2 text-center font-bold text-xs w-16">
                          Grade Letter
                        </th>
                        <th className="border border-black px-2 py-2 text-center font-bold text-xs w-16">
                          Grade Point
                        </th>
                        <th className="border border-black px-2 py-2 text-center font-bold text-xs w-20">
                          Credit Point
                        </th>
                        <th className="border border-black px-2 py-2 text-center font-bold text-xs w-20">
                          Remarks
                        </th>
                      </tr>
                      <tr>
                        <th className="border border-black px-2 py-1"></th>
                        <th className="border border-black px-2 py-1"></th>
                        <th className="border border-black px-2 py-1"></th>
                        <th className="border border-black px-2 py-1 text-center font-bold text-xs w-20">
                          Internal
                        </th>
                        <th className="border border-black px-2 py-1 text-center font-bold text-xs w-20">
                          External
                        </th>
                        <th className="border border-black px-2 py-1 text-center font-bold text-xs w-16">
                          Total
                        </th>
                        <th className="border border-black px-2 py-1"></th>
                        <th className="border border-black px-2 py-1"></th>
                        <th className="border border-black px-2 py-1"></th>
                        <th className="border border-black px-2 py-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => {
                        const mark = studentMarkEntry?.marks[subject.code] || {
                          internal: 0,
                          external: 0,
                        };
                        const total = mark.internal + mark.external;

                        // Check for grace results
                        const graceResults =
                          studentMarkEntry?.graceResults || [];
                        const subjectGraceResult = graceResults.find(
                          (r) => r.subjectCode === subject.code
                        );

                        const finalTotal = total;
                        const finalGrade =
                          subjectGraceResult?.gradeLetter ||
                          calculateGrade(total).grade;
                        const finalPoint =
                          subjectGraceResult?.gradePoint ||
                          calculateGrade(total).point;
                        const creditPoint = finalPoint * subject.credits;

                        // Determine remarks
                        let remarks = "";
                        let showAsterisk = false;
                        
                        // Check if student gets 50% aggregate for promotion
                        const totalMarksObtained = subjects.reduce((sum, subj) => {
                          const subjectMark = studentMarkEntry?.marks[subj.code] || { internal: 0, external: 0 };
                          return sum + subjectMark.internal + subjectMark.external;
                        }, 0);
                        const totalMaxMarks = subjects.length * 100;
                        const aggregatePercentage = (totalMarksObtained / totalMaxMarks) * 100;
                        const isPromotedWith50Percent = aggregatePercentage >= 50;
                        
                        // Check if this specific subject has passing marks (36%)
                        const subjectPercentage = (total / 100) * 100;
                        const hasSubjectPassed = subjectPercentage >= 36;
                        
                        // Priority order: 1. Check grace FIRST, 2. Then promotion only if no grace
                        if (subject.code === "BBA(TT)403") {
                          remarks = "P";
                        } else if (
                          subjectGraceResult?.graceApplied &&
                          subjectGraceResult.graceMarks > 0
                        ) {
                          // Grace takes absolute priority - show "G" 
                          remarks = "G";
                          showAsterisk = true;
                        } else if (
                          !subjectGraceResult?.graceApplied && 
                          (subjectGraceResult?.isPromoted || 
                           (isPromotedWith50Percent && !hasSubjectPassed && subjectPercentage >= 30))
                        ) {
                          // Show "P" for promotion ONLY if no grace was applied
                          remarks = "P";
                        }

                        return (
                          <tr key={subject.code}>
                            <td className="border border-black px-2 py-2 text-center font-semibold text-sm">
                              {subject.code}
                            </td>
                            <td className="border border-black px-3 py-2 text-left text-sm">
                              {subject.title}
                            </td>
                            <td className="border border-black px-2 py-2 text-center text-sm">
                              {subject.credits}
                            </td>
                            <td className="border border-black px-2 py-2 text-center text-sm">
                              {mark.internal || "--"}
                            </td>
                            <td className="border border-black px-2 py-2 text-center text-sm">
                              {mark.external || "--"}
                            </td>
                            <td className="border border-black px-2 py-2 text-center font-semibold text-sm">
                              {finalTotal}
                            </td>
                            <td className="border border-black px-2 py-2 text-center font-bold text-sm">
                              {finalGrade}
                            </td>
                            <td className="border border-black px-2 py-2 text-center text-sm">
                              {finalPoint}
                            </td>
                            <td className="border border-black px-2 py-2 text-center text-sm">
                              {creditPoint}
                            </td>
                            <td className="border border-black px-2 py-2 text-center font-semibold text-sm">
                              {remarks}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Total Row */}
                      <tr className="font-semibold">
                        <td
                          className="border border-black px-1 py-1 font-bold  mx-auto"
                          colSpan={2}
                        >
                          <span>Earn Credit : {totalCredits}</span>
                          <span className="ml-20">Total Credit</span>
                        </td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold">
                          {totalCredits}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center text-xs font-bold"
                          colSpan={3}
                        >
                          TOTAL :{" "}
                          {subjects.reduce((sum, subject) => {
                            const mark = studentMarkEntry?.marks[
                              subject.code
                            ] || { internal: 0, external: 0 };
                            return sum + mark.internal + mark.external;
                          }, 0)}
                          /500
                        </td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold"></td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold"></td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold">
                          {totalCreditPoints}
                        </td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold"></td>
                      </tr>

                      {/* SGPA Row */}
                      <tr className="font-semibold">
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold">
                          SGPA
                        </td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold">
                          {studentMarkEntry?.grace?.status === "grace"
                            ? "XXX"
                            : (totalCreditPoints / totalCredits).toFixed(2)}
                        </td>
                        <td
                          className="border border-black px-1 py-1 text-center text-xs font-bold"
                          colSpan={2}
                        >
                          {/* Result :{" "}
                          {studentMarkEntry?.grace?.status === "grace"
                            ? "XXX"
                            : resultDivision} */}
                          Result :{" "}
                          {(() => {
                            // Check for promoted papers first
                            const subjects = getSubjects();
                            const promotedPapers = [];
                            
                            if (studentMarkEntry) {
                              // Calculate aggregate percentage
                              const totalMarksObtained = subjects.reduce((sum, subj) => {
                                const subjectMark = studentMarkEntry.marks[subj.code] || { internal: 0, external: 0 };
                                return sum + subjectMark.internal + subjectMark.external;
                              }, 0);
                              const totalMaxMarks = subjects.length * 100;
                              const aggregatePercentage = (totalMarksObtained / totalMaxMarks) * 100;
                              const isPromotedWith50Percent = aggregatePercentage >= 50;
                              
                              subjects.forEach(subject => {
                                const mark = studentMarkEntry.marks[subject.code];
                                if (mark) {
                                  const total = mark.internal + mark.external;
                                  const subjectPercentage = (total / 100) * 100;
                                  const hasSubjectPassed = subjectPercentage >= 36;
                                  
                                  // Check for promoted papers
                                  if (subject.code === "BBA(TT)403") {
                                    promotedPapers.push(subject.code);
                                  } else if (isPromotedWith50Percent && !hasSubjectPassed && subjectPercentage >= 30) {
                                    promotedPapers.push(subject.code);
                                  }
                                }
                              });
                            }
                            
                            // If there are promoted papers, show PROMOTED
                            if (promotedPapers.length > 0) {
                              return "PROMOTED";
                            }
                            
                            if (studentMarkEntry?.grace?.status === "grace") {
                              return "XXX";
                            } else if (
                              studentMarkEntry?.grace?.status === "fail"
                            ) {
                              return "FAIL";
                            } else {
                              // Normal result calculation for pass students
                              if (percentage >= 60) return "FIRST";
                              else if (percentage >= 45) return "SECOND";
                              else return "XXX";
                            }
                          })()}
                        </td>

                        <td className="border border-black px-1 py-1 text-center text-xs font-bold">
                          {studentMarkEntry?.grace?.status === "grace" ? (
                            <>
                              G<span className="text-red-500">*</span>
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold"></td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold"></td>
                        <td className="border border-black px-1 py-1 text-center text-xs font-bold"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SGPA Summary - Dynamic display based on current semester */}
                <div className="border border-black mb-4">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="">
                        <th className="border border-black p-1 font-bold">
                          Semester
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Sem.-I
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Sem.-II
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Sem.-III
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Sem.-IV
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Sem.-V
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Sem.-VI
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Grand Total/ CGPA
                        </th>
                        <th className="border border-black p-1 font-bold">
                          Overall Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1 font-semibold">
                          Marks Obtd. :
                        </td>
                        <td className="border border-black p-1 text-center font-semibold ">
                          {semester >= 1 ? "294/500" : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 2 ? "314/500" : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {/* {semester >= 3 ? "290/500" : "XXX"} */}
                          {semester >= 3
                            ? semester === 3
                              ? subjects.reduce((sum, subject) => {
                                  const mark = studentMarkEntry?.marks[
                                    subject.code
                                  ] || { internal: 0, external: 0 };
                                  return sum + mark.internal + mark.external;
                                }, 0) + "/500"
                              : "290/500"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {/* {semester >= 4 ? "338/500" : "XXX"} */}
                          {semester >= 4
                            ? semester === 4
                              ? subjects.reduce((sum, subject) => {
                                  const mark = studentMarkEntry?.marks[
                                    subject.code
                                  ] || { internal: 0, external: 0 };
                                  return sum + mark.internal + mark.external;
                                }, 0) + "/500"
                              : "338/500"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {/* {semester >= 5 ? "266/500" : "XXX"} */}
                          {semester >= 5
                            ? semester === 5
                              ? subjects.reduce((sum, subject) => {
                                  const mark = studentMarkEntry?.marks[
                                    subject.code
                                  ] || { internal: 0, external: 0 };
                                  return sum + mark.internal + mark.external;
                                }, 0) + "/500"
                              : "266/500"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 6
                            ? subjects.reduce((sum, subject) => {
                                const mark = studentMarkEntry?.marks[
                                  subject.code
                                ] || { internal: 0, external: 0 };
                                return sum + mark.internal + mark.external;
                              }, 0) + "/500"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          1823/3000
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          B
                        </td>
                      </tr>

                      <tr>
                        <td className="border border-black p-1 font-semibold">
                          SGPA
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 1
                            ? semester === 1
                              ? studentMarkEntry?.grace?.status === "grace"
                                ? "XXX"
                                : sgpa
                              : "5.81"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 2
                            ? semester === 2
                              ? studentMarkEntry?.grace?.status === "grace"
                                ? "XXX"
                                : sgpa
                              : "6.36"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 3
                            ? semester === 3
                              ? studentMarkEntry?.grace?.status === "grace"
                                ? "XXX"
                                : sgpa
                              : "5.75"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 4
                            ? semester === 4
                              ? studentMarkEntry?.grace?.status === "grace"
                                ? "XXX"
                                : sgpa
                              : "6.33"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 5
                            ? semester === 5
                              ? studentMarkEntry?.grace?.status === "grace"
                                ? "XXX"
                                : sgpa
                              : "5.83"
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          {semester >= 6
                            ? studentMarkEntry?.grace?.status === "grace"
                              ? "XXX"
                              : sgpa
                            : "---"}
                        </td>
                        <td className="border border-black p-1 text-center font-semibold">
                          5.97
                        </td>
                        <td className="border border-black p-1"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 text-[11px] font-sans border-black pt-2">
                  {/* Left Section */}
                  <div className="leading-5">
                    <p className="font-serif font-semibold text-[13px]">
                      Due Paper(s) : {(() => {
                        const subjects = getSubjects();
                        const studentMarkEntry = studentMarks.find(m => m.studentId === student.enrollmentNo);
                        const promotedPapers = [];
                        
                        if (studentMarkEntry) {
                          // Calculate aggregate percentage
                          const totalMarksObtained = subjects.reduce((sum, subj) => {
                            const subjectMark = studentMarkEntry.marks[subj.code] || { internal: 0, external: 0 };
                            return sum + subjectMark.internal + subjectMark.external;
                          }, 0);
                          const totalMaxMarks = subjects.length * 100;
                          const aggregatePercentage = (totalMarksObtained / totalMaxMarks) * 100;
                          const isPromotedWith50Percent = aggregatePercentage >= 50;
                          
                          subjects.forEach(subject => {
                            const mark = studentMarkEntry.marks[subject.code];
                            if (mark) {
                              const total = mark.internal + mark.external;
                              const subjectPercentage = (total / 100) * 100;
                              const hasSubjectPassed = subjectPercentage >= 36;
                              
                              // Check for promoted papers
                              if (subject.code === "BBA(TT)403") {
                                promotedPapers.push(subject.code);
                              } else if (isPromotedWith50Percent && !hasSubjectPassed && subjectPercentage >= 30) {
                                promotedPapers.push(subject.code);
                              }
                            }
                          });
                        }
                        
                        return promotedPapers.join(', ');
                      })()}
                    </p>
                    <p className="mt-1">
                      Writer __________________ Checked by 1. __________________
                      2. __________________
                    </p>

                    <p className="mt-2">
                      Date : {new Date().toLocaleDateString("en-GB")}
                    </p>
                    <p className="mt-1">Udaipur</p>
                    <div className="mt-2">
                      <div className="w-14 h-14 border border-black bg-white flex items-center justify-center">
                        <span className="text-[10px] text-gray-500">QR</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Section */}
                  <div className="flex items-end justify-center text-[10px]">
                    <p className="mb-1">
                      (For further notes see on the reverse)
                    </p>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-start justify-end">
                    <p className="font-semibold text-[12px] mt-2">
                      Controller of Examination
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
