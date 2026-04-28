export type StudentStatus = 'active' | 'at-risk' | 'inactive';
export type DropoutReason = 'financial' | 'family' | 'distance' | 'health' | 'lost-interest' | 'other' | 'none';

export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  enrollmentDate: string;
  status: StudentStatus;
  riskScore: number; // 0-100
  lastContactedAt?: string;
  notes?: string;
  dropoutReason?: DropoutReason;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedAt: string;
  homeworkStatus?: 'completed' | 'incomplete' | 'not-checked';
  participationScore?: number; // 1-5
  dailyNotes?: string;
}

export type Outcome = 'answered' | 'no-answer' | 'busy' | 'switched-off' | 'wrong-number';

export interface CommunicationLog {
  id: string;
  studentId: string;
  timestamp: string;
  type: 'call' | 'whatsapp' | 'sms';
  outcome: Outcome;
  notes?: string;
}
