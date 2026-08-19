import React, { useEffect, useRef, useState } from "react";
import api from "services/api";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdLocationOn, MdAttachMoney, MdSquareFoot, MdPerson, MdFolder, MdCreateNewFolder } from "react-icons/md";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [types, setTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const debounceRef = useRef(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderProject, setFolderProject] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderLoading, setFolderLoading] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [form, setForm] = useState({
    name: "",
    reference: "",
    client_id: "",
    project_type_id: "",
    project_status_id: "",
    manager_user_id: "",
    city: "Casablanca",
    address: "",
    land_surface: "",
    estimated_built_surface: "",
    estimated_budget: "",
    priority: "normal",
    description: "",
  });

  const loadProjects = async (searchTerm) => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const [projRes, clientRes, typeRes, statusRes] = await Promise.allSettled([
        api.get("/projects", { params }),
        api.get("/clients"),
        api.get("/project-types"),
        api.get("/project-statuses"),
      ]);

      setProjects(projRes.status === "fulfilled" ? (projRes.value.data.data || projRes.value.data || []) : []);
      setClients(clientRes.status === "fulfilled" ? (clientRes.value.data.data || clientRes.value.data || []) : []);
      setTypes(typeRes.status === "fulfilled" ? (typeRes.value.data || []) : []);
      setStatuses(statusRes.status === "fulfilled" ? (statusRes.value.data || []) : []);
    } catch (e) {
      console.error("Error loading projects data", e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users-list");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading users for architect dropdown", e);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProjects(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        reference: form.reference || `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        client_id: form.client_id ? Number(form.client_id) : null,
        project_type_id: form.project_type_id ? Number(form.project_type_id) : null,
        project_status_id: form.project_status_id ? Number(form.project_status_id) : null,
        manager_user_id: form.manager_user_id ? Number(form.manager_user_id) : null,
        estimated_budget: form.estimated_budget ? Number(form.estimated_budget) : null,
        land_surface: form.land_surface ? Number(form.land_surface) : null,
        estimated_built_surface: form.estimated_built_surface ? Number(form.estimated_built_surface) : null,
      };

      if (editingId) {
        await api.put(`/projects/${editingId}`, payload);
      } else {
        await api.post("/projects", payload);
      }
      setModalOpen(false);
      setEditingId(null);
      loadProjects(search);
    } catch (e) {
      console.error("Error saving project", e);
      const msg = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : (e.response?.data?.message || "Erreur lors de l'enregistrement");
      alert(msg);
    }
  };

  const handleEdit = (proj) => {
    setEditingId(proj.id);
    loadUsers();
    setForm({
      name: proj.name || "",
      reference: proj.reference || "",
      client_id: proj.client_id || "",
      project_type_id: proj.project_type_id || "",
      project_status_id: proj.project_status_id || "",
      manager_user_id: proj.manager_user_id || "",
      city: proj.city || "Casablanca",
      address: proj.address || "",
      land_surface: proj.land_surface || "",
      estimated_built_surface: proj.estimated_built_surface || "",
      estimated_budget: proj.estimated_budget || "",
      priority: proj.priority || "normal",
      description: proj.description || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet architectural ?")) {
      try {
        await api.delete(`/projects/${id}`);
        loadProjects(search);
      } catch (e) {
        console.error("Error deleting project", e);
      }
    }
  };

  const openFolderModal = async (proj) => {
    setFolderProject(proj);
    setFolderModalOpen(true);
    setFolderLoading(true);
    try {
      const res = await api.get("/folders", { params: { project_id: proj.id } });
      setFolders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading folders", e);
      setFolders([]);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !folderProject) return;
    try {
      const res = await api.post("/folders", {
        name: folderName.trim(),
        project_id: folderProject.id,
      });
      setFolders((prev) => [res.data.folder, ...prev]);
      setFolderName("");
    } catch (e) {
      console.error("Error creating folder", e);
      const msg = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : (e.response?.data?.message || "Erreur lors de la création du dossier");
      alert(msg);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Supprimer ce dossier ?")) return;
    try {
      await api.delete(`/folders/${folderId}`);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
    } catch (e) {
      console.error("Error deleting folder", e);
    }
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Projets Architecturaux
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Suivi des projets, architectes responsables et progressions
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            loadUsers();
            setForm({
              name: "",
              reference: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
              client_id: clients[0]?.id || "",
              project_type_id: types[0]?.id || "",
              project_status_id: statuses[0]?.id || "",
              manager_user_id: users[0]?.id || "",
              city: "Casablanca",
              address: "",
              land_surface: "",
              estimated_built_surface: "",
              estimated_budget: "",
              priority: "normal",
              description: "",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition duration-200"
        >
          <MdAdd className="h-5 w-5" />
          Nouveau Projet
        </button>
      </div>

      <div className="w-full">
        <input
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Recherche projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card extra="w-full p-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des projets...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun projet trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-navy-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Réf / Projet</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Type & Statut</th>
                  <th className="px-4 py-3">Architecte Responsable</th>
                  <th className="px-4 py-3">Surfaces / Budget</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-navy-700 dark:border-navy-700">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-navy-700 dark:text-white">{proj.name}</div>
                      <div className="text-xs text-brand-500 font-mono">{proj.reference}</div>
                    </td>
                    <td className="px-4 py-3">
                      {proj.client ? (
                        proj.client.client_type === "company" ? proj.client.company_name : `${proj.client.first_name} ${proj.client.last_name}`
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{proj.type?.name || "-"}</span>
                        <span className="inline-block w-max rounded-full bg-blue-100 px-2.5 py-0.5 font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {proj.status?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {proj.manager ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-navy-700 dark:text-white">
                          <MdPerson className="text-brand-500" />
                          <span>{proj.manager.first_name} {proj.manager.last_name}</span>
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {proj.estimated_budget ? <div><MdAttachMoney className="inline text-green-600" /> {Number(proj.estimated_budget).toLocaleString()} MAD</div> : null}
                      {proj.estimated_built_surface ? <div><MdSquareFoot className="inline text-amber-500" /> {proj.estimated_built_surface} m²</div> : null}
                      {proj.city ? <div><MdLocationOn className="inline text-red-500" /> {proj.city}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openFolderModal(proj)}
                          className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-navy-600"
                          title="Dossiers"
                        >
                          <MdFolder className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(proj)}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-navy-600"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-navy-600"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editingId ? "Modifier le Projet" : "Créer un Projet Architectural"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Nom du Projet</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Référence Unique</label>
                  <input
                    type="text"
                    required
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Client</label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="">Sélectionnez un client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.client_type === "company" ? c.company_name : `${c.first_name} ${c.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Architecte Responsable</label>
                  <select
                    value={form.manager_user_id}
                    onChange={(e) => setForm({ ...form, manager_user_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="">Sélectionnez un responsable</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </option>
                    ))}
                  </select>
                  {users.length === 0 && (
                    <p className="mt-1 text-xs text-amber-500">Aucun utilisateur disponible</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Type de projet</label>
                  <select
                    value={form.project_type_id}
                    onChange={(e) => setForm({ ...form, project_type_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Statut du projet</label>
                  <select
                    value={form.project_status_id}
                    onChange={(e) => setForm({ ...form, project_status_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Budget (MAD)</label>
                  <input
                    type="number"
                    value={form.estimated_budget}
                    onChange={(e) => setForm({ ...form, estimated_budget: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Surface Terrain (m²)</label>
                  <input
                    type="number"
                    value={form.land_surface}
                    onChange={(e) => setForm({ ...form, land_surface: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Surface Construite (m²)</label>
                  <input
                    type="number"
                    value={form.estimated_built_surface}
                    onChange={(e) => setForm({ ...form, estimated_built_surface: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:border-navy-600 dark:bg-navy-700 dark:text-white"
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

      {/* Folder Modal */}
      {folderModalOpen && folderProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              <MdFolder className="mb-1 inline h-5 w-5 text-amber-500" /> Dossiers — {folderProject.name}
            </h3>

            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Nouveau dossier..."
                className="flex-1 rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
              />
              <button
                onClick={handleCreateFolder}
                className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                <MdCreateNewFolder className="h-5 w-5" />
                Ajouter
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {folderLoading ? (
                <p className="py-4 text-center text-sm text-gray-400">Chargement...</p>
              ) : folders.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">Aucun dossier pour ce projet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-navy-700">
                  {folders.map((f) => (
                    <li key={f.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <MdFolder className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-navy-700 dark:text-white">{f.name}</span>
                        {f.documents?.length > 0 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-navy-600 dark:text-gray-300">
                            {f.documents.length} fichier{f.documents.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteFolder(f.id)}
                        className="rounded-lg p-1 text-red-500 hover:bg-red-50 dark:hover:bg-navy-700"
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => { setFolderModalOpen(false); setFolderProject(null); setFolders([]); setFolderName(""); }}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
