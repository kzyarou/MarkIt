import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export interface AttendanceRecord {
  studentId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  teacherId: string;
}

const ATTENDANCE_COLLECTION = 'attendance';

export async function saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  await addDoc(collection(db, ATTENDANCE_COLLECTION), record);
}

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, ATTENDANCE_COLLECTION), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as AttendanceRecord));
}

export async function getAttendanceForSection(sectionId: string, date: string): Promise<AttendanceRecord[]> {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('sectionId', '==', sectionId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as AttendanceRecord));
} 