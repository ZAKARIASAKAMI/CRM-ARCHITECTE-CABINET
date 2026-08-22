import React, { useEffect, useRef, useState } from "react";
import api from "services/api";
import Card from "components/card";
import { getStoredUser } from "services/auth";
import {
  MdAdd, MdEdit, MdDelete, MdSchedule, MdPerson, MdComment,
  MdVisibility, MdCheckCircle, MdCheckBoxOutlineBlank, MdAttachFile,
  MdUpload, MdDeleteOutline,
} from "react-icons/md";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);

  // Detail modal states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Checklist
  const [checklist, setChecklist] = useState([]);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [attachFile, setAttachFile] = useState(null);
  const [attachLoading, setAttachLoading] = useState(false);

  // Quick-edit fields in detail modal
  const [detailStatusId, setDetailStatusId] = useState("");
  const [detailProgress, setDetailProgress] = useState(0);
  const [detailSpentHours, setDetailSpentHours] = useState("");

  const currentUser = getStoredUser();
  const isCollaborator = currentUser?.roles?.[0]?.name === "Collaborator";
  const canEdit = !isCollaborator;

  const [form, setForm] = useState({
    title: "",
    description: "",
    project_id: "",
    status_id: "",
    assigned_to: "",
    priority: "normal",
    estimated_hours: "",
    due_date: "",
  });

  const loadTasks = async (searchTerm) => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const [tasksRes, statusRes, projRes] = await Promise.allSettled([
        api.get("/tasks", { params }),
        api.get("/task-statuses"),
        api.get("/projects"),
      ]);
      setTasks(tasksRes.status === "fulfilled" ? tasksRes.value.data : []);
      setStatuses(statusRes.status === "fulfilled" ? statusRes.value.data : []);
      setProjects(projRes.status === "fulfilled" ? (projRes.value.data.data || projRes.value.data || []) : []);
    } catch (e) {
      console.error("Error loading tasks", e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users-list");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setUsers([]);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { loadTasks(search); }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        project_id: form.project_id ? Number(form.project_id) : null,
        status_id: form.status_id ? Number(form.status_id) : null,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
        due_date: form.due_date || null,
      };
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      setModalOpen(false);
      setEditingId(null);
      setFormError("");
      loadTasks(search);
    } catch (e) {
      const msg = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : (e.response?.data?.message || "Erreur");
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      project_id: task.project_id || "",
      status_id: task.status_id || "",
      assigned_to: task.assigned_to || "",
      priority: task.priority || "normal",
      estimated_hours: task.estimated_hours || "",
      due_date: task.due_date ? task.due_date.substring(0, 10) : "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette tâche ?")) {
      try {
        await api.delete(`/tasks/${id}`);
        loadTasks(search);
      } catch (e) {
        console.error("Error deleting task", e);
      }
    }
  };

  const openNewTaskModal = () => {
    setEditingId(null);
    setFormError("");
    loadUsers();
    setForm({
      title: "", description: "", project_id: projects[0]?.id || "",
      status_id: statuses[0]?.id || "", assigned_to: "", priority: "normal",
      estimated_hours: "", due_date: "",
    });
    setModalOpen(true);
  };

  // ── Detail Modal ──

  const openDetailModal = async (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
    setDetailStatusId(task.status_id || "");
    setDetailProgress(task.progress_percentage || 0);
    setDetailSpentHours(task.spent_hours || "");
    setCommentText("");
    setNewCheckItem("");
    setAttachFile(null);
    setComments([]);
    setChecklist([]);
    setAttachments([]);
    await Promise.all([
      loadComments(task.id),
      loadChecklist(task.id),
      loadAttachments(task.id),
    ]);
  };

  // Comments
  const loadComments = async (taskId) => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setCommentsLoading(false); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/tasks/${selectedTask.id}/comments`, { comment: commentText.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      setCommentText("");
    } catch (e) { console.error(e); }
    finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedTask) return;
    try {
      await api.delete(`/tasks/${selectedTask.id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) { console.error(e); }
  };

  // Checklist
  const loadChecklist = async (taskId) => {
    setChecklistLoading(true);
    try {
      const res = await api.get(`/tasks/${taskId}/checklist`);
      setChecklist(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setChecklistLoading(false); }
  };

  const handleAddCheckItem = async () => {
    if (!newCheckItem.trim() || !selectedTask) return;
    try {
      const res = await api.post(`/tasks/${selectedTask.id}/checklist`, {
        title: newCheckItem.trim(),
        sort_order: checklist.length,
      });
      setChecklist((prev) => [...prev, res.data.item]);
      setNewCheckItem("");
    } catch (e) { console.error(e); }
  };

  const handleToggleCheckItem = async (itemId) => {
    if (!selectedTask) return;
    try {
      const res = await api.patch(`/tasks/${selectedTask.id}/checklist/${itemId}/toggle`);
      setChecklist((prev) => prev.map((i) => i.id === itemId ? res.data.item : i));
    } catch (e) { console.error(e); }
  };

  const handleDeleteCheckItem = async (itemId) => {
    if (!selectedTask) return;
    try {
      await api.delete(`/tasks/${selectedTask.id}/checklist/${itemId}`);
      setChecklist((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) { console.error(e); }
  };

  // Attachments
  const loadAttachments = async (taskId) => {
    try {
      const res = await api.get(`/tasks/${taskId}/attachments`);
      setAttachments(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
  };

  const handleUploadAttachment = async () => {
    if (!attachFile || !selectedTask) return;
    setAttachLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", attachFile);
      const res = await api.post(`/tasks/${selectedTask.id}/attachments`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAttachments((prev) => [res.data.attachment, ...prev]);
      setAttachFile(null);
    } catch (e) { console.error(e); }
    finally { setAttachLoading(false); }
  };

  const handleDeleteAttachment = async (attId) => {
    if (!selectedTask) return;
    try {
      await api.delete(`/tasks/${selectedTask.id}/attachments/${attId}`);
      setAttachments((prev) => prev.filter((a) => a.id !== attId));
    } catch (e) { console.error(e); }
  };

  // Quick-save status/progress/spent_hours from detail modal
  const handleDetailSave = async (fields) => {
    if (!selectedTask) return;
    try {
      const res = await api.put(`/tasks/${selectedTask.id}`, fields);
      setSelectedTask((prev) => ({ ...prev, ...res.data.task }));
      loadTasks(search);
    } catch (e) { console.error(e); }
  };

  const checkDone = checklist.length > 0 ? checklist.filter((i) => i.is_completed).length : 0;
  const checkTotal = checklist.length;

  return (
    <div className="mt-5 grid grid-cols-1 gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">Gestion des Tâches</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tâches des projets d'architecture, affectations et dates d'échéance
          </p>
        </div>
        {!isCollaborator && (
          <button onClick={openNewTaskModal}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition duration-200">
            <MdAdd className="h-5 w-5" /> Nouvelle Tâche
          </button>
        )}
      </div>

      <div className="w-full">
        <input className="w-full rounded-xl border border-gray-200 dark:text-black p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Recherche tâche..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Kanban */}
      {loading ? (
        <Card extra="p-8 text-center text-gray-500">Chargement des tâches...</Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {statuses.map((status) => {
            const statusTasks = tasks.filter((t) => t.status_id === status.id);
            return (
              <div key={status.id} className="flex flex-col gap-3 rounded-2xl bg-gray-100/70 p-4 dark:bg-navy-800/60">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-navy-700 dark:text-white flex items-center gap-2">
                    <span>{status.name}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-brand-500 dark:bg-navy-700 font-semibold">{statusTasks.length}</span>
                  </h4>
                </div>
                {statusTasks.map((task) => (
                  <Card key={task.id} extra="p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <h5 className="font-bold text-navy-700 dark:text-white">{task.title}</h5>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] uppercase font-bold ${
                        task.priority === "urgent" ? "bg-red-100 text-red-600" : task.priority === "high" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                      }`}>{task.priority}</span>
                    </div>
                    {task.project && <p className="mt-1 text-xs font-semibold text-brand-500">{task.project.name}</p>}
                    {task.description && <p className="mt-2 text-xs text-gray-500 line-clamp-2">{task.description}</p>}
                    {/* Progress bar */}
                    {task.progress_percentage > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${task.progress_percentage}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-navy-700 dark:text-white">{task.progress_percentage}%</span>
                      </div>
                    )}
                    <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-navy-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MdSchedule className="h-4 w-4 text-gray-400" />
                          <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "Pas de date"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openDetailModal(task)} className="rounded p-1 text-green-600 hover:bg-green-50" title="Voir / Détails">
                            <MdVisibility className="h-4 w-4" />
                          </button>
                          {canEdit && (
                            <>
                              <button onClick={() => { handleEdit(task); loadUsers(); }} className="rounded p-1 text-blue-600 hover:bg-blue-50"><MdEdit className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(task.id)} className="rounded p-1 text-red-600 hover:bg-red-50"><MdDelete className="h-4 w-4" /></button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs">
                          <MdPerson className="h-3.5 w-3.5 text-brand-500" />
                          {task.assignee ? (
                            <span className="font-medium text-navy-600 dark:text-white">{task.assignee.first_name} {task.assignee.last_name}</span>
                          ) : (
                            <span className="text-gray-400 italic">Non assigné</span>
                          )}
                        </div>
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MdComment className="h-3.5 w-3.5" /> <span>{task.comments.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editingId ? "Modifier la Tâche" : "Nouvelle Tâche"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Titre</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Projet Associé</label>
                <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                  <option value="">(Tâche interne sans projet)</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Statut</label>
                  <select value={form.status_id} onChange={(e) => setForm({ ...form, status_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Priorité</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Responsable</label>
                  <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    <option value="">Sélectionnez</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Date d'échéance</label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Heures estimées</label>
                  <input type="number" step="0.5" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                {formError && <p className="mr-auto text-sm text-red-500">{formError}</p>}
                <button type="button" onClick={() => setModalOpen(false)} disabled={submitting}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={submitting}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                  {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-navy-700 dark:text-white">{selectedTask.title}</h3>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Info + Quick-edit */}
            <div className="mb-5 rounded-xl bg-gray-50 p-4 dark:bg-navy-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Projet</span>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selectedTask.project?.name || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">Assigné à</span>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {selectedTask.assignee ? `${selectedTask.assignee.first_name} ${selectedTask.assignee.last_name}` : "Non assigné"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">Échéance</span>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">Priorité</span>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selectedTask.priority || "—"}</p>
                </div>
              </div>

              {/* Statut dropdown */}
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Statut</label>
                  <select value={detailStatusId} onChange={(e) => {
                    setDetailStatusId(e.target.value);
                    handleDetailSave({ status_id: Number(e.target.value) });
                  }}
                    className="w-full rounded-lg border border-gray-200 p-2 text-sm dark:border-navy-600 dark:bg-navy-800 dark:text-white">
                    {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Progression ({detailProgress}%)</label>
                  <input type="range" min="0" max="100" value={detailProgress}
                    onChange={(e) => setDetailProgress(Number(e.target.value))}
                    onMouseUp={() => handleDetailSave({ progress_percentage: detailProgress })}
                    onTouchEnd={() => handleDetailSave({ progress_percentage: detailProgress })}
                    className="w-full mt-1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Heures passées</label>
                  <input type="number" step="0.5" value={detailSpentHours}
                    onBlur={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      if (val !== (selectedTask.spent_hours || null)) {
                        setDetailSpentHours(e.target.value);
                        handleDetailSave({ spent_hours: val });
                      }
                    }}
                    onChange={(e) => setDetailSpentHours(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2 text-sm dark:border-navy-600 dark:bg-navy-800 dark:text-white" />
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div className="mb-5">
                <h4 className="mb-2 font-bold text-navy-700 dark:text-white">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
            )}

            {/* Checklist */}
            <div className="mb-5">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-navy-700 dark:text-white">
                Checklist {checkTotal > 0 && <span className="text-xs text-gray-400">({checkDone}/{checkTotal})</span>}
              </h4>
              {checkTotal > 0 && (
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${Math.round((checkDone / checkTotal) * 100)}%` }} />
                </div>
              )}
              {checklistLoading ? (
                <p className="text-xs text-gray-400">Chargement...</p>
              ) : (
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-lg border border-gray-100 p-2 dark:border-navy-600">
                      <button onClick={() => handleToggleCheckItem(item.id)} className="flex-shrink-0">
                        {item.is_completed
                          ? <MdCheckCircle className="h-5 w-5 text-green-500" />
                          : <MdCheckBoxOutlineBlank className="h-5 w-5 text-gray-300" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.is_completed ? "line-through text-gray-400" : "text-navy-700 dark:text-white"}`}>
                        {item.title}
                      </span>
                      <button onClick={() => handleDeleteCheckItem(item.id)} className="text-gray-400 hover:text-red-500">
                        <MdDeleteOutline className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCheckItem()}
                      placeholder="Ajouter un élément..." disabled={checklistLoading}
                      className="flex-1 rounded-lg border border-gray-200 p-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                    <button onClick={handleAddCheckItem} disabled={!newCheckItem.trim() || checklistLoading}
                      className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                      <MdAdd className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="mb-5">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-navy-700 dark:text-white">
                <MdAttachFile className="h-5 w-5 text-brand-500" />
                Pièces jointes ({attachments.length})
              </h4>
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2 dark:border-navy-600">
                    <div className="flex items-center gap-2">
                      <MdAttachFile className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-navy-700 dark:text-white">{att.name}</span>
                      <span className="text-[10px] text-gray-400">({(att.file_size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => handleDeleteAttachment(att.id)} className="text-gray-400 hover:text-red-500">
                      <MdDeleteOutline className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-2">
                  <label className="flex flex-1 items-center gap-2 rounded-lg border border-dashed border-gray-300 p-2 text-sm text-gray-400 cursor-pointer hover:border-brand-500 hover:text-brand-500 transition">
                    <MdUpload className="h-4 w-4" />
                    <span>{attachFile ? attachFile.name : "Choisir un fichier..."}</span>
                    <input type="file" className="hidden" onChange={(e) => setAttachFile(e.target.files[0] || null)} />
                  </label>
                  <button onClick={handleUploadAttachment} disabled={!attachFile || attachLoading}
                    className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                    {attachLoading ? "..." : "Envoyer"}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-bold text-navy-700 dark:text-white">
                <MdComment className="h-5 w-5 text-brand-500" />
                Commentaires ({comments.length})
              </h4>
              <div className="mb-3 flex gap-2">
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Écrire un commentaire..." disabled={commentLoading}
                  className="flex-1 rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                <button onClick={handleAddComment} disabled={!commentText.trim() || commentLoading}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                  {commentLoading ? "..." : "Envoyer"}
                </button>
              </div>
              {commentsLoading ? (
                <p className="py-4 text-center text-sm text-gray-400">Chargement...</p>
              ) : comments.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">Aucun commentaire.</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-xl border border-gray-100 p-3 dark:border-navy-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                            {c.user ? `${(c.user.first_name || "")[0] || ""}${(c.user.last_name || "")[0] || ""}`.toUpperCase() : "?"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-navy-700 dark:text-green-400">
                              {c.user ? `${c.user.first_name} ${c.user.last_name}` : "Utilisateur"}
                            </p>
                            <p className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {currentUser && c.user_id === currentUser.id && (
                          <button onClick={() => handleDeleteComment(c.id)} className="text-gray-400 hover:text-red-500">
                            <MdDelete className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{c.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
