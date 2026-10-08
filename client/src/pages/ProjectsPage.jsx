import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getProjects, createProject } from "../api/projects.js";
import { FolderKanban, Plus, Users, Calendar, X, Loader2, CheckSquare } from "lucide-react";
import { formatDate } from "../lib/utils.js";

const schema = z.object({
  name: z.string().min(1,"Name required").max(100),
  description: z.string().max(500).optional(),
});

function Skeleton({ className }) { return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />; }

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const load = () => getProjects().then(setProjects).catch(e => toast.error(e.response?.data?.message || 'Failed to load projects')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const p = await createProject(data);
      setProjects(prev => [p, ...prev]);
      toast.success("Project created!");
      reset(); setOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create project");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length!==1?"s":""}</p>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i)=><Skeleton key={i} className="h-40" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <FolderKanban size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Create your first project to get started</p>
          <button onClick={() => setOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <Link key={p._id} to={`/projects/${p._id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <FolderKanban size={20} className="text-indigo-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
              {p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users size={13} />{p.members?.length||0} members</span>
                <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(p.createdAt)}</span>
                <span className="flex items-center gap-1"><CheckSquare size={13} />{p.totalTasks ?? 0} tasks · {p.doneTasks ?? 0} done</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600 p-1"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="pname">Project name *</label>
                <input id="pname" placeholder="e.g. Website Redesign"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name?"border-red-400":"border-gray-300"}`}
                  {...register("name")} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="pdesc">Description</label>
                <textarea id="pdesc" rows={3} placeholder="What is this project about?"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  {...register("description")} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
