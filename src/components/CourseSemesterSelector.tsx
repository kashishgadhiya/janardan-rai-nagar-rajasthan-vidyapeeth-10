import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface Subject {
  code: string;
  title: string;
  credits: number;
}

interface SemesterData {
  semester: number;
  subjects: Subject[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  subjects: SemesterData[];
}

interface Props {
  courses: Course[];
  selectedCourse: string;
  selectedSemester: number;
  selectedCourseData?: Course;
  subjects: Subject[];
  handleCourseSelect: (value: string) => void;
  handleSemesterSelect: (value: string) => void;
}

export default function CourseSemesterSelector({
  courses,
  selectedCourse,
  selectedSemester,
  selectedCourseData,
  subjects,
  handleCourseSelect,
  handleSemesterSelect,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Course & Semester Configuration</span>
        </CardTitle>
        <CardDescription>
          Select course and semester to manage student marks
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select value={selectedCourse} onValueChange={handleCourseSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
                <br />
                More courses will be added Soon...
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={selectedSemester.toString()}
              onValueChange={handleSemesterSelect}
              disabled={!selectedCourse}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {selectedCourseData?.subjects.map((sem) => (
                  <SelectItem
                    key={sem.semester}
                    value={sem.semester.toString()}
                  >
                    Semester {sem.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="space-y-2">
            <Label>Subjects for Semester {selectedSemester}</Label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Badge key={subject.code} variant="secondary">
                  {subject.code} - {subject.title} ({subject.credits} credits)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
