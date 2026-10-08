import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(1,"Title required").max(255),
  description: z.string().max(2000).optional().default(""),
  status: z.enum(["TODO","IN_PROGRESS","REVIEW","DONE"]),
  priority: z.enum(["LOW","MEDIUM","HIGH"]),
  assignee: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export default function TaskDialog({ open, onClose, onSave, task, defaultStatus="TODO", members=[] }) {
  const editing = !!task;
  const { register, handleSubmit, reset, formState:{errors} } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title:"", description:"", status:defaultStatus, priority:"MEDIUM", assignee:"", dueDate:"" },
  });

  useEffect(() => {
    if (open) {
      reset(task ? {
        title: task.title||"",
        description: task.description||"",
        status: task.status||"TODO",
        priority: task.priority||"MEDIUM",
        assignee: task.assignee?._id||task.assignee||"",
        dueDate: task.dueDate ? task.dueDate.slice(0,10) : "",
      } : { title:"", description:"", status:defaultStatus, priority:"MEDIUM", assignee:"", dueDate:"" });
    }
  }, [open, task, defaultStatus, reset]);

  if (!open) return null;

  const sel = "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{editing?"Edit Task":"New Task"}</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 p-1"><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ttitle">Title *</label>
            <input id="ttitle" placeholder="Task title"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title?"border-red-400":"border-gray-300"}`}
              {...register("title")} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tdesc">Description</label>
            <textarea id="tdesc" rows={3} placeholder="Optional description"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tstatus">Status</label>
              <select id="tstatus" className={sel} {...register("status")}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tpriority">Priority</label>
              <select id="tpriority" className={sel} {...register("priority")}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tassignee">Assignee</label>
              <select id="tassignee" className={sel} {...register("assignee")}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tdue">Due Date</label>
              <input id="tdue" type="date" className={sel} {...register("dueDate")} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg">
              {editing ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
