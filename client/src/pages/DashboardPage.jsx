import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/dashboard.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate, formatRelativeTime, isOverdue, getInitials, getAvatarColor, formatActivity } from "../lib/utils.js";
import { TrendingUp, CheckCircle2, AlertTriangle, Zap, Clock, FolderKanban } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function PriorityBadge({ p }) {
  const map = { HIGH:"bg-red-100 text-red-700", MEDIUM:"bg-amber-100 text-amber-700", LOW:"bg-green-100 text-green-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[p]||"bg-gray-100 text-gray-500"}`}>{p}</span>;
}

function Skeleton({ className }) { return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />; }

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greet = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=><Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );

  const sc = data?.statusCounts || {};
  const stats = [
    { icon:FolderKanban, label:"Total Projects", value:data?.totalProjects||0, sub:"Projects you manage", color:"bg-indigo-50 text-indigo-600" },
    { icon:CheckCircle2, label:"Total Tasks", value:data?.totalTasks||0, sub:`${sc.DONE||0} completed`, color:"bg-green-50 text-green-600" },
    { icon:TrendingUp, label:"In Progress", value:sc.IN_PROGRESS||0, sub:`${sc.REVIEW||0} in review`, color:"bg-blue-50 text-blue-600" },
    { icon:AlertTriangle, label:"Due This Week", value:data?.dueSoonTasks?.length||0, sub:"within 7 days", color:"bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{greet}, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening across your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap size={17} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">My Assigned Tasks</h2>
            </div>
            <Link to="/projects" className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View all →</Link>
          </div>
          {data?.assignedTasks?.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No tasks assigned to you</p>
              <Link to="/projects" className="mt-2 inline-block text-sm text-indigo-600 font-medium hover:text-indigo-700">Browse projects →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(data?.assignedTasks||[]).slice(0,8).map(t => (
                <div key={t._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-indigo-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                      <p className="text-xs text-gray-400 truncate">{t.project?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <PriorityBadge p={t.priority} />
                    {t.dueDate && (
                      <span className={`text-xs font-medium ${isOverdue(t.dueDate)?"text-red-500":"text-gray-400"}`}>
                        {formatDate(t.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Clock size={17} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          </div>
          {data?.recentActivity?.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No activity yet</div>
          ) : (
            <div className="p-4 space-y-3">
              {(data?.recentActivity||[]).map(a => (
                <div key={a._id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: getAvatarColor(a.user?.name) }}>
                    {getInitials(a.user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{formatActivity(a)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming deadlines */}
      {data?.dueSoonTasks?.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-100 bg-amber-50">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-800">Upcoming Deadlines (next 7 days)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.dueSoonTasks.map(t => (
              <div key={t._id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-medium text-gray-800">{t.title}</p>
                <div className="flex items-center gap-2">
                  <PriorityBadge p={t.priority} />
                  <span className="text-xs font-semibold text-amber-600">{formatDate(t.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
