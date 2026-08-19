import React, { useEffect, useRef, useState } from "react";
import api from "services/api";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdSchedule, MdPerson } from "react-icons/md";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const debounceRef = useRef(null);
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
      console.error("Error loading users for assignee dropdown", e);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadTasks(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      loadTasks(search);
    } catch (e) {
      console.error("Error saving task", e);
      const msg = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : (e.response?.data?.message || "Erreur lors de l'enregistrement");
      alert(msg);
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
    loadUsers();
    setForm({
      title: "",
      description: "",
      project_id: projects[0]?.id || "",
      status_id: statuses[0]?.id || "",
      assigned_to: "",
      priority: "normal",
      estimated_hours: "",
      due_date: "",
    });
    setModalOpen(true);
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Gestion des Tâches
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tâches des projets d'architecture, affectations et dates d'échéance
          </p>
        </div>
        <button
          onClick={openNewTaskModal}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition duration-200"
        >
          <MdAdd className="h-5 w-5" />
          Nouvelle Tâche
        </button>
      </div>

      <div className="w-full">
        <input
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Recherche tâche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Kanban Columns */}
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
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-brand-500 dark:bg-navy-700 font-semibold">
                      {statusTasks.length}
                    </span>
                  </h4>
                </div>

                {statusTasks.map((task) => (
                  <Card key={task.id} extra="p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <h5 className="font-bold text-navy-700 dark:text-white">{task.title}</h5>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] uppercase font-bold ${
                        task.priority === "urgent" ? "bg-red-100 text-red-600" : task.priority === "high" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.project && (
                      <p className="mt-1 text-xs font-semibold text-brand-500">{task.project.name}</p>
                    )}

                    {task.description && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{task.description}</p>
                    )}

                    <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-navy-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MdSchedule className="h-4 w-4 text-gray-400" />
                          <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "Pas de date"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              handleEdit(task);
                              loadUsers();
                            }}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                          >
                            <MdDelete className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <MdPerson className="h-3.5 w-3.5 text-brand-500" />
                        {task.assignee ? (
                          <span className="font-medium text-navy-600 dark:text-white">
                            {task.assignee.first_name} {task.assignee.last_name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Non assigné</span>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editingId ? "Modifier la Tâche" : "Nouvelle Tâche"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Titre</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Projet Associé</label>
                <select
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">(Tâche interne sans projet)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Statut</label>
                  <select
                    value={form.status_id}
                    onChange={(e) => setForm({ ...form, status_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Priorité</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
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
                  <select
                    value={form.assigned_to}
                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="">Sélectionnez</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                    ))}
                  </select>
                  {users.length === 0 && (
                    <p className="mt-1 text-xs text-amber-500">Aucun utilisateur disponible</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Date d'échéance</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  {editingId ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
