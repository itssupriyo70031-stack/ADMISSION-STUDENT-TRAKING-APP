import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Users, 
  CalendarCheck2, 
  PhoneOff, 
  LayoutDashboard, 
  Plus, 
  Phone, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  TrendingDown,
  ChevronRight,
  PhoneCall,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { db } from './lib/firebase';
import { studentService, attendanceService, communicationService } from './services/db';
import { Student, Attendance, CommunicationLog, StudentStatus, Outcome } from './types';
import { cn } from './lib/utils';

// --- Components ---

function StatCard({ title, value, subValue, icon: Icon, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl glass hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{value}</h3>
          {subValue && <p className="text-xs mt-1 text-slate-400">{subValue}</p>}
        </div>
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const config = 
    score > 70 ? { color: 'bg-rose-100 text-rose-700', label: 'Critical' } :
    score > 40 ? { color: 'bg-amber-100 text-amber-700', label: 'Watch' } :
    { color: 'bg-emerald-100 text-emerald-700', label: 'Safe' };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", config.color)}>
      {config.label}
    </span>
  );
}

// --- Main App ---

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'students' | 'risks'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await studentService.getAll();
    if (data) setStudents(data);
  };

  const handleDelete = async () => {
    if (studentToDelete) {
      await studentService.delete(studentToDelete.id);
      setStudentToDelete(null);
      loadData();
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
    );
  }, [students, searchQuery]);

  const atRiskCount = useMemo(() => students.filter(s => s.riskScore > 40).length, [students]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col p-6 z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display leading-tight">EduTracker</h2>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Management v1.0</span>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'attendance', label: 'Daily Activity', icon: CalendarCheck2 },
            { id: 'students', label: 'Students List', icon: Users },
            { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all group",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.label}
              {item.id === 'risks' && atRiskCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full">
                  {atRiskCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center gap-3 justify-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
            Institute Administrator Mode
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-display">
                {activeTab === 'dashboard' && "Hello, Good Morning!"}
                {activeTab === 'attendance' && "Today's Activity"}
                {activeTab === 'students' && "All Registered Students"}
                {activeTab === 'risks' && "Engagement Red Zone"}
              </h1>
              <p className="text-slate-500 mt-1">
                {format(new Date(), 'EEEE, MMMM do yyyy')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 w-full md:w-64 transition-all"
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Students" value={students.length} icon={Users} color="bg-indigo-600" />
                  <StatCard title="Calls Needed" value={students.filter(s => s.riskScore > 40).length} subValue="Urgent attention" icon={PhoneOff} color="bg-rose-500" />
                  <StatCard title="At-Risk" value={atRiskCount} subValue="High dropout chance" icon={AlertTriangle} color="bg-amber-500" />
                  <StatCard title="Recovered" value={students.filter(s => s.status === 'active' && s.riskScore < 20).length} subValue="Successfully engaged" icon={CheckCircle2} color="bg-emerald-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass rounded-3xl overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          Recent Risk Alerts
                        </h3>
                        <button onClick={() => setActiveTab('risks')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {students.filter(s => s.riskScore > 40).slice(0, 5).map(student => (
                          <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <RiskBadge score={student.riskScore} />
                              <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                                <PhoneCall className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="glass rounded-3xl p-6 h-full">
                      <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={() => setActiveTab('attendance')}
                          className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all group"
                        >
                          <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                            <CalendarCheck2 className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-900">Log Activity</p>
                            <p className="text-[10px] text-slate-500">Record daily interactions</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => setShowAddModal(true)}
                          className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all group"
                        >
                          <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-900">New Admission</p>
                            <p className="text-[10px] text-slate-500">Add a new student</p>
                          </div>
                        </button>
                      </div>

                      <div className="mt-8 p-4 bg-indigo-600 rounded-2xl text-white">
                        <p className="text-xs font-medium opacity-80 mb-1">Weekly Growth</p>
                        <h4 className="text-xl font-bold">+12%</h4>
                        <div className="w-full h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden">
                          <div className="w-3/4 h-full bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <AttendanceView students={filteredStudents} onUpdate={loadData} />
            )}

            {activeTab === 'students' && (
              <StudentsView students={filteredStudents} onUpdate={loadData} setStudentToDelete={setStudentToDelete} />
            )}

            {activeTab === 'risks' && (
              <RiskView students={students} onUpdate={loadData} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <AddStudentModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }} 
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStudentToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Are you sure?</h3>
              <p className="text-sm text-slate-500 mt-2 mb-8">
                You are about to delete <span className="font-bold text-slate-900">{studentToDelete.name}</span>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setStudentToDelete(null)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3.5 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- View Components ---

function AttendanceView({ students, onUpdate }: { students: Student[], onUpdate: () => void }) {
  const [activityMap, setActivityMap] = useState<Record<string, Partial<Attendance>>>({});
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    attendanceService.getByDate(today).then(data => {
      if (data) {
        const map: any = {};
        data.forEach(a => map[a.studentId] = a);
        setActivityMap(map);
      }
    });
  }, [today]);

  const updateActivity = async (studentId: string, updates: Partial<Attendance>) => {
    const current = activityMap[studentId] || { studentId, date: today, status: 'absent' };
    const merged = { ...current, ...updates } as Omit<Attendance, 'id'>;
    
    await attendanceService.mark(merged);
    setActivityMap(prev => ({ 
      ...prev, 
      [studentId]: { ...merged } 
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-3xl overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900">Daily Log</h3>
          <p className="text-xs text-slate-500">Track presence, homework, and performance</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {Object.values(activityMap).filter((v: any) => v.status === 'present').length} Present
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {students.map(student => {
          const activity = activityMap[student.id] || {};
          return (
            <div key={student.id} className="p-6 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-lg border border-indigo-100">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.phone}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  {/* Presence */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
                    <div className="flex gap-1">
                      {[
                        { id: 'present', label: 'P', color: 'bg-emerald-500', icon: CheckCircle2 },
                        { id: 'absent', label: 'A', color: 'bg-rose-500', icon: XCircle },
                        { id: 'late', label: 'L', color: 'bg-amber-500', icon: CalendarCheck2 },
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => updateActivity(student.id, { status: type.id as any })}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                            activity.status === type.id 
                              ? cn(type.color, "text-white border-transparent shadow-md")
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                          )}
                          title={type.id.toUpperCase()}
                        >
                          <type.icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Homework */}
                  {activity.status === 'present' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Homework</p>
                      <div className="flex gap-1">
                        {[
                          { id: 'completed', label: 'Done', color: 'bg-indigo-600' },
                          { id: 'incomplete', label: 'No', color: 'bg-slate-400' },
                        ].map(type => (
                          <button
                            key={type.id}
                            onClick={() => updateActivity(student.id, { homeworkStatus: type.id as any })}
                            className={cn(
                              "px-3 h-10 rounded-xl text-[10px] font-bold transition-all border",
                              activity.homeworkStatus === type.id 
                                ? cn(type.color, "text-white border-transparent shadow-md")
                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Participation */}
                  {activity.status === 'present' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participation (1-5)</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            onClick={() => updateActivity(student.id, { participationScore: score })}
                            className={cn(
                              "w-8 h-10 rounded-xl text-xs font-bold transition-all border",
                              activity.participationScore === score 
                                ? "bg-amber-400 text-slate-900 border-transparent shadow-md"
                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 shadow-sm"
                            )}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 w-full lg:w-auto">
                  <input 
                    type="text"
                    placeholder="Quick note for today..."
                    value={activity.dailyNotes || ''}
                    onChange={(e) => updateActivity(student.id, { dailyNotes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function StudentsView({ students, onUpdate, setStudentToDelete }: { students: Student[], onUpdate: () => void, setStudentToDelete: (s: {id: string, name: string}) => void }) {
  const [selectedForHistory, setSelectedForHistory] = useState<string | null>(null);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);

  const fetchLogs = async (id: string) => {
    const data = await communicationService.getByStudent(id);
    if (data) setLogs(data);
    setSelectedForHistory(id);
  };

  const handleQuickAction = async (student: Student, type: 'no-answer' | 'answered') => {
    await communicationService.log({
      studentId: student.id,
      type: 'call',
      outcome: type,
      notes: type === 'no-answer' ? 'Quick log: Student did not pick up.' : 'Quick log: Student confirmed attendance.',
      timestamp: new Date().toISOString()
    });

    let newScore = student.riskScore;
    if (type === 'no-answer') newScore = Math.min(100, newScore + 15);
    if (type === 'answered') newScore = Math.max(0, newScore - 15);

    await studentService.update(student.id, {
      riskScore: newScore,
      status: newScore > 60 ? 'at-risk' : (newScore < 20 ? 'active' : student.status),
      lastContactedAt: new Date().toISOString()
    });
    onUpdate();
  };

  const updateReason = async (id: string, reason: any) => {
    await studentService.update(id, { dropoutReason: reason });
    onUpdate();
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {students.map(student => (
          <motion.div 
            layout
            key={student.id}
            className="glass rounded-3xl p-6 group hover:shadow-xl transition-all duration-300 relative border-l-4"
            style={{ borderLeftColor: student.riskScore > 70 ? '#f43f5e' : (student.riskScore > 40 ? '#f59e0b' : '#10b981') }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-2xl text-indigo-600">
                {student.name.charAt(0)}
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <div className="flex items-center gap-2">
                  <RiskBadge score={student.riskScore} />
                  <button 
                    onClick={() => setStudentToDelete({ id: student.id, name: student.name })}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Risk: {student.riskScore}%</div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-slate-500 text-sm flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {student.phone}
              </p>
              <button 
                onClick={() => fetchLogs(student.id)}
                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-tighter"
              >
                View History
              </button>
            </div>

            <div className="mt-4">
              <select 
                value={student.dropoutReason || 'none'}
                onChange={(e) => updateReason(student.id, e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="none">Set Dropout Reason</option>
                <option value="financial">Financial Issues</option>
                <option value="family">Family Problems</option>
                <option value="distance">Distance/Commute</option>
                <option value="lost-interest">Lost Interest</option>
                <option value="health">Health Issues</option>
                <option value="other">Other Reason</option>
              </select>
            </div>
            
            <div className="mt-6 flex gap-2">
              <a 
                href={`tel:${student.phone}`}
                className="flex-[1.5] flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold transition-all hover:bg-indigo-700 shadow-md active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                Call Now
              </a>
              <button 
                onClick={() => handleQuickAction(student, 'no-answer')}
                className="flex-1 flex flex-col items-center justify-center bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold border border-rose-100 hover:bg-rose-100 transition-colors"
                title="Mark as Missed Call"
              >
                <PhoneOff className="w-4 h-4 mb-0.5" />
                Missed
              </button>
              <button 
                onClick={() => handleQuickAction(student, 'answered')}
                className="flex-1 flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                title="Mark as Confirmed Attendance"
              >
                <CheckCircle2 className="w-4 h-4 mb-0.5" />
                Coming
              </button>
            </div>

            {student.lastContactedAt && (
              <p className="mt-3 text-[9px] text-slate-400 text-center italic uppercase tracking-wider">
                Last checked: {format(new Date(student.lastContactedAt), 'MMM d, h:mm a')}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* History Side Modal */}
      <AnimatePresence>
        {selectedForHistory && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedForHistory(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Communication Log</h3>
                  <p className="text-xs text-slate-500">Contact history for student</p>
                </div>
                <button onClick={() => setSelectedForHistory(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {logs.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">No history found.</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={log.id} className="relative pl-6 border-l-2 border-slate-100 pb-2">
                      <div className={cn(
                        "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white",
                        log.outcome === 'answered' ? 'bg-emerald-500' : 'bg-rose-500'
                      )} />
                      <p className="text-xs font-bold text-slate-900">{format(new Date(log.timestamp), 'MMMM d, h:mm a')}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{log.type.toUpperCase()} • {log.outcome.replace('-', ' ').toUpperCase()}</p>
                      {log.notes && <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">"{log.notes}"</p>}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RiskView({ students, onUpdate }: { students: Student[], onUpdate: () => void }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [outcome, setOutcome] = useState<Outcome>('no-answer');
  const [notes, setNotes] = useState('');

  const riskStudents = useMemo(() => 
    students.filter(s => s.riskScore > 40).sort((a, b) => b.riskScore - a.riskScore),
  [students]);

  const handleLogCommunication = async () => {
    if (!selectedStudent) return;
    await communicationService.log({
      studentId: selectedStudent.id,
      type: 'call',
      outcome,
      notes,
      timestamp: new Date().toISOString()
    });
    
    // Simple mock logic for risk score adjustment
    let newScore = selectedStudent.riskScore;
    if (outcome === 'no-answer') newScore = Math.min(100, newScore + 10);
    if (outcome === 'answered') newScore = Math.max(0, newScore - 20);

    await studentService.update(selectedStudent.id, {
      riskScore: newScore,
      status: newScore > 60 ? 'at-risk' : 'active'
    });

    setSelectedStudent(null);
    setNotes('');
    onUpdate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Risk List */}
      <div className="glass rounded-3xl overflow-hidden p-6">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PhoneOff className="w-5 h-5 text-rose-500" />
          High Risk Outreach
        </h3>
        <div className="space-y-4">
          {riskStudents.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-slate-500">All students are currently engaged!</p>
            </div>
          ) : (
            riskStudents.map(student => (
              <div 
                key={student.id} 
                onClick={() => setSelectedStudent(student)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                  selectedStudent?.id === student.id 
                    ? "bg-indigo-50 border-indigo-200 shadow-md" 
                    : "bg-white border-slate-100 hover:border-indigo-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                    student.riskScore > 80 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                    <p className="text-xs text-slate-500">Last contact: {student.lastContactedAt ? format(new Date(student.lastContactedAt), 'MMM d') : 'Never'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Risk Score</div>
                  <div className={cn(
                    "text-lg font-bold",
                    student.riskScore > 80 ? "text-rose-600" : "text-amber-600"
                  )}>
                    {student.riskScore}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Panel */}
      <div className="space-y-6">
        {selectedStudent ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-8 sticky top-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-600">{selectedStudent.name.charAt(0)}</div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h3>
              <p className="text-slate-500 text-lg">{selectedStudent.phone}</p>
              <div className="mt-4 flex justify-center gap-4">
                <a 
                  href={`tel:${selectedStudent.phone}`}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
                >
                  <PhoneCall className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Call Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'answered', label: 'Answered', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { id: 'no-answer', label: 'No Answer', color: 'bg-rose-50 text-rose-600 border-rose-100' },
                    { id: 'busy', label: 'Busy', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                    { id: 'switched-off', label: 'Switched Off', color: 'bg-slate-100 text-slate-600 border-slate-200' },
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setOutcome(btn.id as any)}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold border transition-all",
                        outcome === btn.id ? btn.color + " ring-2 ring-offset-2" : "bg-white text-slate-400 border-slate-100"
                      )}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Follow-up Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened during the call?"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 min-h-[100px] transition-all"
                />
              </div>

              <button 
                onClick={handleLogCommunication}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
              >
                Log Call & Update Risk
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Select a Student</h4>
            <p className="text-sm text-slate-500 max-w-[200px] mt-2">Pick a student from the risk list to log outreach activity.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddStudentModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await studentService.add({
      ...formData,
      enrollmentDate: new Date().toISOString(),
      status: 'active',
      riskScore: 10,
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 pb-0">
          <h3 className="text-2xl font-bold text-slate-900 font-display">Add New Student</h3>
          <p className="text-slate-500 mb-6">Enter official admission details.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" 
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
              <input 
                required
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" 
                placeholder="10 digit mobile"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Email (Optional)</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" 
                placeholder="student@email.com"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Admin Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all min-h-[100px]" 
              placeholder="Batch details, special concerns..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              Add Student
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
