# EducHub: Philippine K-12 Academic Management Platform

## Overview

**EducHub** is a modern, all-in-one platform for managing student grades, attendance, and academic records, designed specifically for the Philippine K-12 education system. It empowers teachers and students to efficiently handle grades, attendance, and academic progress, while ensuring compliance with the Department of Education (DepEd) standards and legal requirements.

---

## Table of Contents
- [Key Features](#key-features)
- [DepEd and Legal Basis](#deped-and-legal-basis)
- [Grading and Calculation Formulas](#grading-and-calculation-formulas)
- [Technical Stack](#technical-stack)
- [Data Structures](#data-structures)
- [How to Use](#how-to-use)
- [Deployment](#deployment)
- [Other Technicalities](#other-technicalities)

---

## Key Features

### For Teachers
- **Section and Subject Management**: Create, edit, and manage sections and subjects. Assign custom weights for Written Work (WW), Performance Tasks (PT), and Quarterly Exams (QE) (weights must total 100%).
- **Student Management**: Add, edit, and connect students to sections. Each student can be linked via LRN (Learner Reference Number).
- **Grade Calculation**: Input scores for WW, PT, and QE per quarter. Grades are automatically calculated and transmuted using DepEd's official transmutation table.
- **Attendance Tracking**: Record daily attendance (present, absent, late) for each student. Save drafts and upload attendance records.
- **Reports and Class Records**: Generate DepEd-compliant class records and individual report cards. Print or export reports for official use.
- **Drafts and Offline Support**: Save drafts of sections and attendance for later upload.

### For Students
- **Personal Dashboard**: View overall grades, subject grades, and attendance statistics.
- **Report Card Access**: Securely view and print official DepEd report cards.
- **Academic Records**: Access comprehensive academic history, including grades and attendance.

### General
- **Onboarding Carousel**: Guided introduction to platform features.
- **Role-based Access**: Separate flows for teachers and students.
- **Mobile-Ready**: Responsive design for use on any device.
- **Secure Authentication**: Powered by Firebase Auth.

---

## DepEd and Legal Basis

EducHub strictly follows the official guidelines and formulas set by the Philippine Department of Education:

- **DepEd Order No. 8, s. 2015**: "Policy Guidelines on Classroom Assessment for the K to 12 Basic Education Program" ([Official PDF](https://www.deped.gov.ph/wp-content/uploads/2015/04/DO_s2015_08.pdf))
  - **Grading Components**: Written Work, Performance Tasks, Quarterly Assessment
  - **Weight Distribution**: Default is 40% WW, 40% PT, 20% QE (customizable per subject)
  - **Transmutation Table**: Used to convert initial grades to quarterly grades
  - **Grading Scale**:
    - 90-100: Outstanding
    - 85-89: Very Satisfactory
    - 80-84: Satisfactory
    - 75-79: Fairly Satisfactory
    - Below 75: Did Not Meet Expectations
- **LRN (Learner Reference Number)**: Used for unique student identification (DepEd Order No. 22, s. 2012)

All calculations, records, and reports are designed to be compliant with these DepEd policies.

---

## Grading and Calculation Formulas

### 1. **Category Percentage**
For each category (WW, PT, QE):

```
Category Percentage = (Sum of Scores / Sum of Total Points) × 100
```

### 2. **Initial Grade**

```
Initial Grade = (WW% × WW Weight) + (PT% × PT Weight) + (QE% × QE Weight)
```

### 3. **Transmutation (DepEd Table)**
The initial grade is converted to the quarterly grade using the official DepEd transmutation table (see [DepEd Order 8, s. 2015](https://www.deped.gov.ph/wp-content/uploads/2015/04/DO_s2015_08.pdf)). Example:

| Initial Grade Range | Transmuted Grade |
|--------------------|------------------|
| 98.40 - 100.00     | 100              |
| 95.20 - 98.39      | 99               |
| ...                | ...              |
| 0.00 - 2.39        | 75               |

### 4. **Quarterly and Final Grades**
- **Quarterly Grade**: Transmuted grade for each quarter
- **Final Grade**: Average of all available quarterly grades (rounded)
- **General Average**: Average of all final grades across subjects (rounded)

### 5. **Grading Scale**
- 90-100: Outstanding
- 85-89: Very Satisfactory
- 80-84: Satisfactory
- 75-79: Fairly Satisfactory
- Below 75: Did Not Meet Expectations

---

## Technical Stack
- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **State Management**: React Context, React Query
- **Authentication & Database**: Firebase (Firestore, Auth, Storage)
- **Mobile Support**: Capacitor (Android/iOS wrappers)
- **Other**: Framer Motion, Lucide Icons, Lottie Animations

---

## Data Structures

### Student
```ts
interface Student {
  id: string;
  name: string;
  lrn?: string;
  gradeData: StudentGradeData;
  connectedUserId?: string;
  connectedUserLRN?: string;
  connectedUserEmail?: string;
}
```

### Section
```ts
interface Section {
  id: string;
  name: string;
  gradeLevel: string;
  students: Student[];
  subjects: Subject[];
  createdBy: string;
  createdAt: string;
}
```

### Subject
```ts
interface Subject {
  id: string;
  name: string;
  writtenWorkWeight: number;
  performanceTaskWeight: number;
  quarterlyExamWeight: number;
  assessments?: Assessment[];
}
```

### Assessment
```ts
interface Assessment {
  id: string;
  name: string;
  category: 'writtenWork' | 'performanceTask' | 'quarterlyExam';
  quarter: 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4';
  totalPoints: number;
}
```

---

## How to Use

### Local Development
1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Start the development server**
   ```sh
npm run dev
```

### Editing Subjects and Weights
- When adding/editing a subject, you must set the weights for WW, PT, and QE. The total must be exactly 100% (validated by the app).

### Attendance
- Teachers can record daily attendance for each section and save drafts for later upload.

### Reports
- Generate and print DepEd-compliant class records and report cards from the Reports page.

### Authentication
- Secure login/signup for both teachers and students. Students use LRN; teachers use Employee ID.

---

## Deployment
- **Web**: Deploy via Vite or your preferred static hosting.
- **Mobile**: Build Android/iOS apps using Capacitor wrappers.
- **Firebase**: Configure your own Firebase project for Auth, Firestore, and Storage.

---

## Other Technicalities
- **Role-based Routing**: Teachers and students see different dashboards and features.
- **Drafts**: All major data (sections, attendance) can be saved as drafts for offline/temporary work.
- **Customizable Subjects**: Teachers can add, edit, and remove subjects, including custom quick-add lists.
- **Data Validation**: All weights and required fields are validated in-app.
- **Accessibility**: Designed for usability on both desktop and mobile devices.
- **Security**: All data is protected via Firebase Auth and Firestore security rules.

---

## Legal and Policy References
- [DepEd Order No. 8, s. 2015](https://www.deped.gov.ph/wp-content/uploads/2015/04/DO_s2015_08.pdf) — Policy Guidelines on Classroom Assessment for the K to 12 Basic Education Program
- [DepEd Order No. 22, s. 2012](https://www.deped.gov.ph/2012/03/20/do-22-s-2012/) — Adoption of the Unique Learner Reference Number (LRN)

---

## Credits
- Built with ❤️ for Philippine educators and learners.
- Powered by open-source technologies and the official DepEd guidelines.

## Subject Track and Type (DepEd Compliance)

- Each subject now includes:
  - **track**: For Senior High School (Grades 11-12), choose from 'Core', 'Academic', 'TVL', or 'Sports/Arts'.
  - **type**: For Junior High School/Elementary, choose from 'Languages', 'AP', 'EsP', 'Science', 'Math', 'MAPEH', or 'EPP/TLE'.
- These fields are used to automatically select the correct DepEd grading formula and weights for each subject, based on the latest DepEd Orders (including 2025 for SHS).
- The subject's track/type is displayed in the app UI (subject cards, report cards, etc.) for full transparency.
