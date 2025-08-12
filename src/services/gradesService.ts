import { Grade, Student, Section, StudentConnection } from "@/types/grading";
import { calculateQuarterGrade } from "@/utils/gradeCalculations";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc
} from "firebase/firestore";

// Mock data storage
let grades: Grade[] = [];
let sections: Section[] = [];

// Clear all mock data on module load
grades = [];
sections = [];

export class GradesService {
  static async getGradesForUser(userId: string, includeHidden = false): Promise<Grade[]> {
    const gradesRef = collection(db, "grades");
    let q = query(gradesRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    let grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    if (!includeHidden) {
      grades = grades.filter(grade => !grade.hidden);
    }
    return grades;
  }

  static async saveGrade(grade: Omit<Grade, 'id'>): Promise<Grade> {
    const gradesRef = collection(db, "grades");
    const docRef = await addDoc(gradesRef, grade);
    return { ...grade, id: docRef.id };
  }

  static async syncGradesFromSection(
    userId: string,
    sectionId: string,
    student: Student,
    section: Section,
    hidden = false
  ): Promise<void> {
    // Remove existing grades for this user in this section
    const gradesRef = collection(db, "grades");
    const q = query(gradesRef, where("userId", "==", userId), where("sectionId", "==", sectionId));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "grades", docSnap.id));
    }

    // Convert section-based grades to user-based grades
    for (const subject of section.subjects) {
      const subjectGrades = student.gradeData[subject.id];
      if (!subjectGrades) continue;

      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterKey = `quarter${quarter}` as keyof typeof subjectGrades;
        const quarterScores = subjectGrades[quarterKey];
        if (quarterScores) {
          const quarterResult = calculateQuarterGrade(quarterScores, subject);
          if (quarterResult.transmutedGrade > 0) {
            const grade = {
              userId,
              subject: subject.name,
              quarter,
              score: quarterResult.transmutedGrade,
              sectionId,
              createdAt: new Date().toISOString(),
              hidden: hidden || false // Ensure not hidden by default
            };
            await this.saveGrade(grade);
            if (import.meta.env.MODE === 'development') {
              console.log('[syncGradesFromSection] Saved grade:', grade);
            }
          }
        }
      }
    }
    if (import.meta.env.MODE === 'development') {
      console.log('[syncGradesFromSection] Finished syncing grades for user', userId, 'section', sectionId);
    }
  }

  static async toggleGradesVisibility(userId: string, sectionId: string, hidden: boolean): Promise<void> {
    const gradesRef = collection(db, "grades");
    const q = query(gradesRef, where("userId", "==", userId), where("sectionId", "==", sectionId));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, "grades", docSnap.id), { hidden });
    }
  }

  static async debugGradeSync(userId: string, sectionId: string): Promise<any> {
    const userGrades = await this.getGradesForUser(userId, true);
    const sectionGrades = userGrades.filter(g => g.sectionId === sectionId);
    return {
      totalGrades: userGrades.length,
      sectionGrades: sectionGrades.length,
      grades: sectionGrades,
      hiddenGrades: sectionGrades.filter(g => g.hidden).length
    };
  }
}

export class StudentUserService {
  static async connectStudentToUser(
    student: Student,
    userData: any,
    section: Section,
    connectedBy: string
  ): Promise<{ success: boolean; data?: StudentConnection; error?: string }> {
    try {
      const connection: StudentConnection = {
        id: Date.now().toString(),
        studentId: student.id,
        userId: userData.id,
        userLRN: userData.lrn,
        userEmail: userData.email,
        sectionId: section.id,
        sectionName: section.name,
        gradeLevel: section.gradeLevel,
        connectedAt: new Date().toISOString(),
        connectedBy,
        isActive: true
      };

      // Persist connection in Firestore
      const connectionsRef = collection(db, 'connections');
      await setDoc(doc(connectionsRef, connection.id), connection);

      // Sync existing grades
      await GradesService.syncGradesFromSection(
        userData.id,
        section.id,
        student,
        section
      );

      return { success: true, data: connection };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async disconnectStudentFromUser(
    studentId: string,
    userId: string,
    sectionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove connection from Firestore
      const connectionsRef = collection(db, 'connections');
      const connectionsQuery = query(
        connectionsRef,
        where('studentId', '==', studentId),
        where('userId', '==', userId),
        where('sectionId', '==', sectionId)
      );
      const connectionsSnap = await getDocs(connectionsQuery);
      for (const docSnap of connectionsSnap.docs) {
        await deleteDoc(doc(connectionsRef, docSnap.id));
      }

      // Remove grades for this user in this section from Firestore
      const gradesRef = collection(db, 'grades');
      const gradesQuery = query(
        gradesRef,
        where('userId', '==', userId),
        where('sectionId', '==', sectionId)
      );
      const gradesSnap = await getDocs(gradesQuery);
      for (const docSnap of gradesSnap.docs) {
        await deleteDoc(doc(gradesRef, docSnap.id));
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getUserSections(userLRN: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Query Firestore for connections by userLRN
      const connectionsRef = collection(db, 'connections');
      const q = query(connectionsRef, where('userLRN', '==', userLRN), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      const userConnections = snapshot.docs.map(doc => doc.data() as StudentConnection);
      return { success: true, data: userConnections };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getSectionConnectedUsers(sectionId: string): Promise<{ success: boolean; data?: StudentConnection[]; error?: string }> {
    try {
      // Query Firestore for connections by sectionId
      const connectionsRef = collection(db, 'connections');
      const q = query(connectionsRef, where('sectionId', '==', sectionId), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      const sectionConnections = snapshot.docs.map(doc => doc.data() as StudentConnection);
      return { success: true, data: sectionConnections };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Firestore-based section CRUD
export async function getSections(): Promise<Section[]> {
  const sectionsRef = collection(db, "sections");
  const snapshot = await getDocs(sectionsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
}

// Get sections handled/created by a specific teacher
export async function getTeacherSections(teacherUserId: string): Promise<Section[]> {
  const sectionsRef = collection(db, "sections");
  const q = query(sectionsRef, where("createdBy", "==", teacherUserId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
}

export async function saveSection(section: Section): Promise<void> {
  const sectionRef = doc(db, "sections", section.id);
  await setDoc(sectionRef, section);
}

export async function deleteSection(sectionId: string): Promise<void> {
  const sectionRef = doc(db, "sections", sectionId);
  await deleteDoc(sectionRef);
}

export async function deleteAllUserData(userId: string): Promise<void> {
  // Delete all grades for this user
  const gradesRef = collection(db, "grades");
  const gradesQuery = query(gradesRef, where("userId", "==", userId));
  const gradesSnap = await getDocs(gradesQuery);
  for (const docSnap of gradesSnap.docs) {
    await deleteDoc(doc(db, "grades", docSnap.id));
  }

  // Delete all sections created by this user (if teacher)
  const sectionsRef = collection(db, "sections");
  const sectionsQuery = query(sectionsRef, where("createdBy", "==", userId));
  const sectionsSnap = await getDocs(sectionsQuery);
  for (const docSnap of sectionsSnap.docs) {
    const sectionId = docSnap.id;
    // Delete all grades for students in this section
    const sectionGradesQuery = query(gradesRef, where("sectionId", "==", sectionId));
    const sectionGradesSnap = await getDocs(sectionGradesQuery);
    for (const gradeDoc of sectionGradesSnap.docs) {
      await deleteDoc(doc(db, "grades", gradeDoc.id));
    }
    // Delete all student connections for this section
    const connectionsRef = collection(db, "connections");
    const sectionConnectionsQuery = query(connectionsRef, where("sectionId", "==", sectionId));
    const sectionConnectionsSnap = await getDocs(sectionConnectionsQuery);
    for (const connDoc of sectionConnectionsSnap.docs) {
      await deleteDoc(doc(db, "connections", connDoc.id));
    }
    // Delete the section itself
    await deleteDoc(doc(db, "sections", sectionId));
  }

  // Delete all student connections for this user (if stored in a collection)
  const connectionsRef = collection(db, "connections");
  const connectionsQuery = query(connectionsRef, where("userId", "==", userId));
  const connectionsSnap = await getDocs(connectionsQuery);
  for (const docSnap of connectionsSnap.docs) {
    await deleteDoc(doc(db, "connections", docSnap.id));
  }
}

export async function leaveSection(userId: string, sectionId: string): Promise<void> {
  // Remove connection from 'connections' collection
  const connectionsRef = collection(db, 'connections');
  const connectionsQuery = query(connectionsRef, where('userId', '==', userId), where('sectionId', '==', sectionId));
  const connectionsSnap = await getDocs(connectionsQuery);
  for (const docSnap of connectionsSnap.docs) {
    await deleteDoc(doc(db, 'connections', docSnap.id));
  }
  // Remove grades for this user in this section
  const gradesRef = collection(db, 'grades');
  const gradesQuery = query(gradesRef, where('userId', '==', userId), where('sectionId', '==', sectionId));
  const gradesSnap = await getDocs(gradesQuery);
  for (const docSnap of gradesSnap.docs) {
    await deleteDoc(doc(db, 'grades', docSnap.id));
  }
}

export async function repairStudentConnection({ userLRN, studentId, sectionId, userData, section, connectedBy }) {
  const connectionsRef = collection(db, 'connections');
  const q = query(connectionsRef, where('userLRN', '==', userLRN), where('studentId', '==', studentId), where('sectionId', '==', sectionId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    // Create new connection
    const connection = {
      id: Date.now().toString(),
      studentId,
      userId: userData.id,
      userLRN,
      userEmail: userData.email,
      sectionId,
      sectionName: section.name,
      gradeLevel: section.gradeLevel,
      connectedAt: new Date().toISOString(),
      connectedBy,
      isActive: true
    };
    await setDoc(doc(connectionsRef, connection.id), connection);
    return { created: true, activated: false };
  } else {
    // Update isActive if needed
    let activated = false;
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (!data.isActive) {
        await updateDoc(doc(connectionsRef, docSnap.id), { isActive: true });
        activated = true;
      }
    }
    return { created: false, activated };
  }
}
