import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Flag,
  LayoutDashboard
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock events for demo
    const mockEvents = [
      { id: '1', title: 'Project Kickoff', date: new Date(2026, 2, 22), type: 'milestone', project: 'E-commerce Redesign' },
      { id: '2', title: 'Bug Bash', date: new Date(2026, 2, 25), type: 'task', project: 'Mobile App' },
      { id: '3', title: 'Client Review', date: new Date(2026, 2, 28), type: 'meeting', project: 'E-commerce Redesign' },
      { id: '4', title: 'Final Launch', date: new Date(2026, 3, 5), type: 'milestone', project: 'Mobile App' },
    ];
    setEvents(mockEvents);
    setLoading(false);
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
            <CalendarIcon className="text-[#4F46E5]" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
            <p className="text-sm text-[var(--dark-grey)]">Project milestones and deadlines.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-all"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20">
            <Plus size={20} />
            Add Event
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-[var(--dark-grey)] uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayEvents = events.filter(e => isSameDay(e.date, cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[120px] bg-white/5 border border-white/10 p-2 transition-all group relative",
              !isSameMonth(day, monthStart) ? "opacity-20" : "hover:bg-white/10",
              isToday(day) ? "bg-indigo-500/5 border-indigo-500/20" : ""
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "text-sm font-bold",
                isToday(day) ? "text-[#4F46E5]" : "text-white"
              )}>
                {formattedDate}
              </span>
              {isToday(day) && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] shadow-[0_0_8px_#4F46E5]" />
              )}
            </div>
            <div className="space-y-1">
              {dayEvents.map(event => (
                <div 
                  key={event.id}
                  className={cn(
                    "text-[10px] p-1.5 rounded-lg border truncate font-bold uppercase tracking-wider",
                    event.type === 'milestone' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    event.type === 'meeting' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                    "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  )}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="rounded-3xl overflow-hidden border border-white/10">{rows}</div>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {renderHeader()}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {renderDays()}
          {renderCells()}
        </div>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Flag size={18} className="text-[#4F46E5]" />
              Upcoming Milestones
            </h3>
            <div className="space-y-4">
              {events.filter(e => e.type === 'milestone').map(event => (
                <div key={event.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs font-bold text-white">{event.title}</div>
                    <div className="text-[10px] text-emerald-500 font-bold uppercase">Milestone</div>
                  </div>
                  <div className="text-[10px] text-[var(--dark-grey)] mb-3">{event.project}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--dark-grey)]">
                    <Clock size={12} />
                    {format(event.date, 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              Deadlines
            </h3>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <p className="text-xs text-amber-500 font-bold mb-1">Mobile App Launch</p>
              <p className="text-[10px] text-amber-500/60">Final deployment scheduled for next week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
