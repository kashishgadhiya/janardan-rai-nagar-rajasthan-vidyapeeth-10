export interface Student {
  // grace: any;
  id: string;
  name: string;
  sno: string; // Student Number
  fatherName: string;
  motherName: string;
  enrollmentNo: string;
  abcId: string;
  rollNo: string;
  sex: "M" | "F";
  category: string;
  cast: string;
  photo: string;
  email: string;
  phone: string;
  papers: string;
  // Additional fields for comprehensive data
  rno: string;
  eno: string;
  // Previous semester marks for grace calculation
  previousSemesters?: {
    [semester: number]: {
      [subjectCode: string]: {
        internal: number;
        external: number;
        total: number;
        grade: string;
        passed: boolean;
        graceApplied?: boolean;
      };
    };
  };
}

export interface Subject {
  code: string;
  title: string;
  credits: number;
  type: "theory" | "practical";
}

export interface CourseSubject {
  semester: number;
  subjects: Subject[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  duration: string;
  subjects: CourseSubject[];
}

export interface StudentMarks {
  studentId: string;
  subjectCode: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
}

export interface SemesterResult {
  studentId: string;
  semester: number;
  courseId: string;
  marks: StudentMarks[];
  sgpa: number;
  totalCredits: number;
  earnCredits: number;
  result: "FIRST" | "SECOND" | "THIRD" | "PASS" | "FAIL";
}

// Comprehensive courses data with all 6 semesters
export const courses: Course[] = [
  {
    id: "bba-tourism",
    name: "B.B.A. (TOURISM & TRAVEL)",
    code: "BBA(TT)",
    duration: "6 Semesters",
    subjects: [
      {
        semester: 1,
        subjects: [
          {
            code: "BBA(TT)101",
            title: "PRINCIPLES OF MANAGEMENT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)102",
            title: "TOURISM FUNDAMENTALS",
            credits: 4,
            type: "theory",
          },
          {
            code: "BBA(TT)103",
            title: "BUSINESS COMMUNICATION",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)P01",
            title: "COMPUTER APPLICATIONS",
            credits: 6,
            type: "practical",
          },
          {
            code: "BBA(TT)105",
            title: "ENVIRONMENTAL STUDIES",
            credits: 2,
            type: "theory",
          },
        ],
      },
      {
        semester: 2,
        subjects: [
          {
            code: "BBA(TT)201",
            title: "ORGANIZATIONAL BEHAVIOR",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)202",
            title: "TOURISM GEOGRAPHY",
            credits: 4,
            type: "theory",
          },
          {
            code: "BBA(TT)203",
            title: "ACCOUNTING FOR MANAGERS",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)204",
            title: "TRAVEL AGENCY OPERATIONS",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)P02",
            title: "PERSONALITY DEVELOPMENT",
            credits: 2,
            type: "practical",
          },
        ],
      },
      {
        semester: 3,
        subjects: [
          {
            code: "BBA(TT)301",
            title: "MARKETING MANAGEMENT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)302",
            title: "HOTEL MANAGEMENT-I",
            credits: 4,
            type: "theory",
          },
          {
            code: "BBA(TT)303",
            title: "FINANCIAL MANAGEMENT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)304",
            title: "TOUR OPERATIONS",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)P03",
            title: "PRACTICAL TRAINING",
            credits: 2,
            type: "practical",
          },
        ],
      },
      {
        semester: 4,
        subjects: [
          {
            code: "BBA(TT)401",
            title: "HUMAN RESOURCE MANAGEMENT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)402",
            title: "HOTEL MANAGEMENT-II",
            credits: 4,
            type: "theory",
          },
          {
            code: "BBA(TT)404",
            title: "RESEARCH METHODOLOGY",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)405",
            title: "EVENT MANAGEMENT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)P04",
            title: "INTERNSHIP",
            credits: 2,
            type: "practical",
          },
        ],
      },
      {
        semester: 5,
        subjects: [
          {
            code: "BBA(TT)501",
            title: "STRATEGIC MANAGEMENT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)502",
            title: "HOTEL MANAGEMENT-III",
            credits: 4,
            type: "theory",
          },
          {
            code: "BBA(TT)503",
            title: "TOURISM MARKETING",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)504",
            title: "AIRLINE & AIRPORT MANAGEMENT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)P05",
            title: "PROJECT WORK",
            credits: 2,
            type: "practical",
          },
        ],
      },
      {
        semester: 6,
        subjects: [
          {
            code: "BBA(TT)601",
            title: "TOURISM CONCEPTS & IMPACTS",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)602",
            title: "HOTEL & RESORT MANAGEMENT-IV (FOOD PRODUCTION)",
            credits: 4,
            type: "theory",
          },
          {
            code: "BBA(TT)603",
            title: "STUDY TOUR & REPORT",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)604",
            title: "TOUR GUIDING & INTERPRETATION (ACCOMMODATION OPERATION)",
            credits: 6,
            type: "theory",
          },
          {
            code: "BBA(TT)P07",
            title: "HOTEL & RESORT MANAGEMENT-IV (FOOD PRODUCTION)",
            credits: 2,
            type: "practical",
          },
          {
            code: "BBA(TT)403",
            title: "DUE OF PREVIOUS SEM.",
            credits: 4,
            type: "theory",
          },
        ],
      },
    ],
  },
];

// Comprehensive students data matching Excel format
export const students: Student[] = [
  {
    id: "984550732227",
    name: "ATUL MENARIA",
    sno: "127892",
    fatherName: "JEEVAN MENARIA",
    motherName: "LALITA MENARIA",
    enrollmentNo: "2K21/4271",
    abcId: "984550732227",
    rollNo: "68101",
    rno: "68101",
    eno: "2K21/4271",
    sex: "M",
    category: "REG",
    cast: "GEN",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "atul.menaria@example.com",
    phone: "+91 9876543210",
  },
  {
    id: "332758984288",
    name: "KUNAL PICHOLIYA",
    sno: "127872",
    fatherName: "GANESH PICHOLIYA",
    motherName: "RANJANA PICHOLIYA",
    enrollmentNo: "2K21/4272",
    abcId: "332758984288",
    rollNo: "68102",
    rno: "68102",
    eno: "2K21/4272",
    sex: "M",
    category: "REG",
    cast: "GEN",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "kunal.picholiya@example.com",
    phone: "+91 9876543211",
  },
  {
    id: "366089071738",
    name: "LATIKA CHITTORA",
    sno: "127882",
    fatherName: "SANJAY CHITTORA",
    motherName: "ANJANA CHITTORA",
    enrollmentNo: "2K21/4273",
    abcId: "366089071738",
    rollNo: "68103",
    rno: "68103",
    eno: "2K21/4273",
    sex: "F",
    category: "REG",
    cast: "MIN",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "latika.chittora@example.com",
    phone: "+91 9876543212",
  },
  {
    id: "995712859964",
    name: "POONAM MEHTA",
    sno: "137895",
    fatherName: "GANAPAT LAL MEHATA",
    motherName: "LAXMI BAI",
    enrollmentNo: "2K21/4274",
    abcId: "995712859964",
    rollNo: "68104",
    rno: "68104",
    eno: "2K21/4274",
    sex: "F",
    category: "REG",
    cast: "GEN",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "poonam.mehta@example.com",
    phone: "+91 9876543213",
  },
  {
    id: "721985135549",
    name: "PRANAY TAMBOLI",
    sno: "187892",
    fatherName: "LALIT TAMBOLI",
    motherName: "SUSHMA TAMBOLI",
    enrollmentNo: "2K21/4275",
    abcId: "721985135549",
    rollNo: "68105",
    rno: "68105",
    eno: "2K21/4275",
    sex: "M",
    category: "REG",
    cast: "OBC",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "pranay.tamboli@example.com",
    phone: "+91 9876543214",
  },
  {
    id: "959262658475",
    name: "RAHUL SINGH MEHTA",
    sno: "127802",
    fatherName: "CHANDRA SINGH MEHTA",
    motherName: "RADHIKA DEVI",
    enrollmentNo: "2K21/4276",
    abcId: "959262658475",
    rollNo: "68106",
    rno: "68106",
    eno: "2K21/4276",
    sex: "M",
    category: "REG",
    cast: "GEN",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "rahul.mehta@example.com",
    phone: "+91 9876543215",
  },
  {
    id: "608310825691",
    name: "SOHAN LAL DANGI",
    sno: "129892",
    fatherName: "KANHAIYA LAL DANGI",
    motherName: "DALI DEVI",
    enrollmentNo: "2K21/4277",
    abcId: "608310825691",
    rollNo: "68107",
    rno: "68107",
    eno: "2K21/4277",
    sex: "M",
    category: "REG",
    cast: "OBC",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "sohan.dangi@example.com",
    phone: "+91 9876543216",
  },
  {
    id: "752606583513",
    name: "UMESH MENARIA",
    sno: "128892",
    fatherName: "PURNA SHANKAR MENARIA",
    motherName: "BASANTI DEVI MENARIA",
    enrollmentNo: "2K21/4278",
    abcId: "752606583513",
    rollNo: "68108",
    rno: "68108",
    eno: "2K21/4278",
    sex: "M",
    category: "REG",
    cast: "GEN",
    papers: "601-605",
    photo: "/placeholder.png",
    email: "umesh.menaria@example.com",
    phone: "+91 9876543217",
  },
];

// Dummy semester results
export const semesterResults: SemesterResult[] = [
  {
    studentId: "1",
    semester: 6,
    courseId: "bba-tourism",
    marks: [
      {
        studentId: "1",
        subjectCode: "BBA(T)601",
        internalMarks: 18,
        externalMarks: 35,
        totalMarks: 53,
        grade: "B",
        gradePoint: 6,
      },
      {
        studentId: "1",
        subjectCode: "BBA(T)602",
        internalMarks: 18,
        externalMarks: 39,
        totalMarks: 57,
        grade: "B",
        gradePoint: 6,
      },
      {
        studentId: "1",
        subjectCode: "BBA(T)603",
        internalMarks: 15,
        externalMarks: 30,
        totalMarks: 45,
        grade: "C+",
        gradePoint: 5,
      },
      {
        studentId: "1",
        subjectCode: "BBA(T)604",
        internalMarks: 18,
        externalMarks: 39,
        totalMarks: 57,
        grade: "B",
        gradePoint: 6,
      },
      {
        studentId: "1",
        subjectCode: "BBA(T)P04",
        internalMarks: 19,
        externalMarks: 35,
        totalMarks: 54,
        grade: "B",
        gradePoint: 6,
      },
      {
        studentId: "1",
        subjectCode: "BBA(T)403",
        internalMarks: 0,
        externalMarks: 54,
        totalMarks: 54,
        grade: "B",
        gradePoint: 6,
      },
    ],
    sgpa: 5.75,
    totalCredits: 24,
    earnCredits: 24,
    result: "FIRST",
  },
];

// Helper functions
export const getStudentById = (id: string): Student | undefined => {
  return students.find((student) => student.enrollmentNo === id);
};

export const getCourseById = (id: string): Course | undefined => {
  return courses.find((course) => course.id === id);
};

export const getStudentResult = (
  studentId: string,
  semester: number,
  courseId: string
): SemesterResult | undefined => {
  return semesterResults.find(
    (result) =>
      result.studentId === studentId &&
      result.semester === semester &&
      result.courseId === courseId
  );
};

export const getSubjectsBySemester = (
  courseId: string,
  semester: number
): Subject[] => {
  const course = getCourseById(courseId);
  if (!course) return [];

  const semesterData = course.subjects.find((s) => s.semester === semester);
  return semesterData ? semesterData.subjects : [];
};
