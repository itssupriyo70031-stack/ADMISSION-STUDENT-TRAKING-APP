import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Attendance, CommunicationLog, Outcome, StudentStatus } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const studentService = {
  async getAll() {
    const path = 'students';
    try {
      const q = query(collection(db, path), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async add(student: Omit<Student, 'id'>) {
    const path = 'students';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...student,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async update(id: string, data: Partial<Student>) {
    const path = `students/${id}`;
    try {
      await updateDoc(doc(db, 'students', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  }
};

export const attendanceService = {
  async mark(attendance: Omit<Attendance, 'id'>) {
    const path = 'attendance';
    try {
      // Use setDoc with a unique ID per student/date to prevent duplicates
      const id = `${attendance.studentId}_${attendance.date}`;
      await setDoc(doc(db, path, id), {
        ...attendance,
        markedAt: new Date().toISOString(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async getByDate(date: string) {
    const path = 'attendance';
    try {
      const q = query(collection(db, path), where('date', '==', date));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Attendance);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }
};

export const communicationService = {
  async log(log: Omit<CommunicationLog, 'id'>) {
    const path = 'communicationLogs';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...log,
        timestamp: new Date().toISOString(),
      });
      
      // Update student's lastContactedAt and riskScore logic
      await studentService.update(log.studentId, {
        lastContactedAt: new Date().toISOString(),
      });
      
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async getByStudent(studentId: string) {
    const path = 'communicationLogs';
    try {
      const q = query(
        collection(db, path), 
        where('studentId', '==', studentId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunicationLog));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }
};
