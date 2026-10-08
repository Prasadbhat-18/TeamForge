import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { getProject, addMember, removeMember } from "../api/projects.js";
import { getActivity } from "../api/activity.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials, getAvatarColor, formatRelativeTime, formatActivity } from "../lib/utils.js";
import Board from "../components/Board.jsx";
import { Users, Activity, KanbanSquare, UserPlus, Trash2, Loader2, Shield, User } from "lucide-react";

function Tab({ label, active, onClick, icon:Icon }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active?"border-indigo-600 text-indigo-700":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
      <Icon size={16}/>{label}
    </button>
  );
}

function Skeleton({ className }) { return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />; }

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tab, setTab] = useState("board");
  const [activities, setActivities] = useState([]);
  const [actLoading, setActLoading] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProject(id).then(setProject).finally(()=>setLoading(false));
  }, [id]);

  const loadActivity = () => {
    setActLoading(true);
    getActivity(id).then(setActivities).finally(()=>setActLoading(false));
  };

  useEffect(() => {
    if (tab === "activity") loadActivity();
  }, [tab]);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
  if (!project) return <div className="text-sm text-gray-500 p-4">Project not found</div>;

  const isOwner = project.owner._id === user?._id || project.owner._id?.toString() === user?._id?.toString();

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setMemberLoading(true);
    try {
      const updated = await addMember(id, { email: memberEmail.trim() });
      setProject(updated);
      setMemberEmail("");
      toast.success("Member added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally { setMemberLoading(false); }
  };

  const handleRemoveMember = async (uid) => {
    try {
      const updated = await removeMember(id, uid);
      setProject(updated);
      toast.success("Member removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
        {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        <Tab label="Board" icon={KanbanSquare} active={tab==="board"} onClick={()=>setTab("board")} />
        <Tab label="Team" icon={Users} active={tab==="team"} onClick={()=>setTab("team")} />
        <Tab label="Activity" icon={Activity} active={tab==="activity"} onClick={()=>setTab("activity")} />
      </div>

      {/* Board tab */}
      {tab === "board" && <Board projectId={id} members={project.members} />}

      {/* Team tab */}
      {tab === "team" && (
        <div className="space-y-4 max-w-2xl">
          {isOwner && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><UserPlus size={16} className="text-indigo-500"/>Add Member</h2>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input type="email" placeholder="colleague@company.com" value={memberEmail}
                  onChange={e=>setMemberEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Member email" />
                <button type="submit" disabled={memberLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                  {memberLoading ? <Loader2 size={14} className="animate-spin"/> : <UserPlus size={14}/>}
                  Add
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">{project.members.length} Members</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {project.members.map(m => {
                const isMe = m.user._id?.toString() === user?._id?.toString();
                return (
                  <div key={m.user._id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: getAvatarColor(m.user.name) }}>
                        {getInitials(m.user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{m.user.name}{isMe && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}</p>
                        <p className="text-xs text-gray-400">{m.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.role==="owner"?"bg-indigo-50 text-indigo-700":"bg-gray-100 text-gray-600"}`}>
                        {m.role==="owner" ? <><Shield size={11}/>Owner</> : <><User size={11}/>Member</>}
                      </span>
                      {isOwner && m.role !== "owner" && (
                        <button onClick={()=>handleRemoveMember(m.user._id)} aria-label="Remove member"
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Activity tab */}
      {tab === "activity" && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {actLoading ? (
              <div className="p-4 space-y-3">{[...Array(5)].map((_,i)=><Skeleton key={i} className="h-12"/>)}</div>
            ) : activities.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                <Activity size={32} className="mx-auto mb-3 text-gray-300"/>
                No activity recorded yet
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-10 top-0 bottom-0 w-px bg-gray-100" />
                <div className="divide-y divide-gray-50">
                  {activities.map(a => (
                    <div key={a._id} className="flex items-start gap-3 px-5 py-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 z-10"
                        style={{ backgroundColor: getAvatarColor(a.user?.name) }}>
                        {getInitials(a.user?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{formatActivity(a)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(a.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
