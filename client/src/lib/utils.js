import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
export function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
}
export function isOverdue(d) { return d ? new Date(d) < new Date() : false; }
export function formatRelativeTime(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const s=Math.floor(diff/1000),m=Math.floor(s/60),h=Math.floor(m/60),day=Math.floor(h/24);
  if (day>30) return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  if (day>0) return `${day}d ago`;
  if (h>0) return `${h}h ago`;
  if (m>0) return `${m}m ago`;
  return "just now";
}
export function getInitials(n) { if(!n)return"?"; return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2); }
const COLORS=["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
export function getAvatarColor(n) { if(!n)return COLORS[0]; return COLORS[n.charCodeAt(0)%COLORS.length]; }
export function formatActivity(a) {
  const u=a.user?.name||"Someone", t=a.task?.title;
  switch(a.action){
    case "task created": return `${u} created "${t}"`;
    case "task status changed": return `${u} moved "${t}"`;
    case "task assigned": return `${u} updated assignment on "${t}"`;
    case "member added": return `${u} was added to the project`;
    default: return `${u} performed an action`;
  }
}
