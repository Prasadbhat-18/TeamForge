import { useState, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { getTasks, patchTaskStatus, createTask, updateTask, deleteTask } from "../api/tasks.js";
import { formatDate, isOverdue, getInitials, getAvatarColor } from "../lib/utils.js";
import TaskDialog from "./TaskDialog.jsx";
import { Plus, Search, Trash2, X } from "lucide-react";

const COLS = [
  { id: "TODO",        label: "To Do",       color: "bg-gray-400" },
  { id: "IN_PROGRESS", label: "In Progress",  color: "bg-blue-500" },
  { id: "REVIEW",      label: "Review",       color: "bg-purple-500" },
  { id: "DONE",        label: "Done",         color: "bg-green-500" },
];

function PriorityBadge({ p }) {
  const map = {
    HIGH:   "bg-red-100 text-red-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    LOW:    "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${map[p] || ""}`}>
      {p}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ fontSize: "10px", backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}

function TaskCard({ task, idx, onEdit, onDelete }) {
  const overdue = isOverdue(task.dueDate);
  return (
    <Draggable draggableId={task._id} index={idx}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing group transition-shadow ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-indigo-300" : ""
          }`}
          onClick={() => onEdit(task)}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 flex-1">
              {task.title}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
              aria-label="Delete task"
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <PriorityBadge p={task.priority} />
            {task.dueDate && (
              <span className={`text-[11px] font-medium ${overdue ? "text-red-500" : "text-gray-400"}`}>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
          {task.assignee && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
              <Avatar name={task.assignee.name} />
              <span className="text-[11px] text-gray-500 truncate">{task.assignee.name}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default function Board({ projectId, members }) {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [dialog, setDialog] = useState({ open: false, task: null, status: "TODO" });

  // Load tasks on mount / projectId change
  useEffect(() => {
    getTasks(projectId)
      .then((t) => { setTasks(t); setLoaded(true); })
      .catch(() => { toast.error("Failed to load tasks"); setLoaded(true); });
  }, [projectId]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.description || "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterAssignee && (t.assignee?._id ?? t.assignee)?.toString() !== filterAssignee) return false;
      return true;
    });
  }, [tasks, search, filterPriority, filterAssignee]);

  const byCol = (status) =>
    filtered.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId;
    const newPos = destination.index + 1;

    // Snapshot for rollback
    const snapshot = tasks.map((t) => ({ ...t }));

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus, position: newPos } : t))
    );

    try {
      const updated = await patchTaskStatus(draggableId, { status: newStatus, position: newPos });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch {
      setTasks(snapshot); // rollback to snapshot
      toast.error("Failed to move task — changes reverted");
    }
  };

  const handleCreate = async (data) => {
    try {
      const t = await createTask(projectId, data);
      setTasks((prev) => [...prev, t]);
      toast.success("Task created");
      setDialog({ open: false, task: null, status: "TODO" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create task");
    }
  };

  const handleEdit = async (data) => {
    try {
      const t = await updateTask(dialog.task._id, data);
      setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x)));
      toast.success("Task updated");
      setDialog({ open: false, task: null, status: "TODO" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const sel =
    "text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <div className="relative flex-1 min-w-0 min-w-[180px]">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className={`w-full pl-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${search ? "pr-7" : "pr-3"}`}
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <select className={sel} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select className={sel} value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          <option value="">All assignees</option>
          {members.map((m) => (
            <option key={m.user._id} value={m.user._id}>
              {m.user.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setDialog({ open: true, task: null, status: "TODO" })}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors ml-auto"
        >
          <Plus size={15} /> New Task
        </button>
      </div>

      {/* Kanban columns */}
      <div className="w-full overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 pb-4 -mx-1 px-1">
          {COLS.map((col) => {
            const colTasks = byCol(col.id);
            return (
              <div
                key={col.id}
                className="flex-shrink-0 w-72 flex flex-col gap-2 bg-gray-50 rounded-xl p-3"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs font-medium">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setDialog({ open: true, task: null, status: col.id })}
                    aria-label={`Add task to ${col.label}`}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Droppable area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-2 min-h-[200px] rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-indigo-50" : ""
                      }`}
                    >
                      {!loaded ? (
                        [...Array(2)].map((_, i) => (
                          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                        ))
                      ) : colTasks.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center py-8">
                          <p className="text-xs text-gray-400 text-center">
                            No tasks
                            <br />
                            <button
                              className="text-indigo-500 hover:text-indigo-700 mt-1"
                              onClick={() => setDialog({ open: true, task: null, status: col.id })}
                            >
                              + Add one
                            </button>
                          </p>
                        </div>
                      ) : (
                        colTasks.map((t, i) => (
                          <TaskCard
                            key={t._id}
                            task={t}
                            idx={i}
                            onEdit={(task) => setDialog({ open: true, task, status: task.status })}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
      </div>

      <TaskDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, task: null, status: "TODO" })}
        onSave={dialog.task ? handleEdit : handleCreate}
        task={dialog.task}
        defaultStatus={dialog.status}
        members={members}
      />
    </div>
  );
}
