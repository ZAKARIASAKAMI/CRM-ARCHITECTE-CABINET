import React, { useEffect, useState } from "react";
import { documentsService } from "services/api";
import { getStoredUser } from "services/auth";
import Card from "components/card";
import { MdUploadFile, MdDelete, MdEdit, MdInsertDriveFile, MdFolder, MdDownload } from "react-icons/md";

export default function DocumentsPage() {
  const user = getStoredUser();
  const userRole = user?.roles?.[0]?.name;
  const isSecretary = userRole === "Secretary";
  const isCollaborator = userRole === "Collaborator";
  const canDelete = !isSecretary;
  const canEdit = userRole === "Administrator" || userRole === "Architect";
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    folder_id: "",
    category_id: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", folder_id: "", category_id: "", description: "" });

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await documentsService.getAll();
      setDocuments(res.data.documents || []);
      setCategories(res.data.categories || []);
      setFolders(res.data.folders || []);
    } catch (e) {
      console.error("Error loading documents", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.folder_id) formData.append("folder_id", form.folder_id);
      if (form.category_id) formData.append("category_id", form.category_id);
      if (form.description) formData.append("description", form.description);
      if (file) formData.append("file", file);
      await documentsService.create(formData);
      setModalOpen(false);
      setForm({ name: "", folder_id: "", category_id: "", description: "" });
      setFile(null);
      setFormError("");
      loadDocs();
    } catch (e) {
      const msg = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : (e.response?.data?.message || "Erreur lors de l'ajout du document");
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce document ?")) {
      try {
        await documentsService.delete(id);
        loadDocs();
      } catch (e) {
        console.error("Error deleting document", e);
      }
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await documentsService.download(doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.original_name || doc.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error downloading document", e);
    }
  };

  const openEdit = (doc) => {
    setEditDoc(doc);
    setEditForm({
      name: doc.name || "",
      folder_id: doc.folder_id || "",
      category_id: doc.category_id || "",
      description: doc.description || "",
    });
    setEditModalOpen(true);
    setFormError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await documentsService.update(editDoc.id, editForm);
      setEditModalOpen(false);
      setEditDoc(null);
      loadDocs();
    } catch (e) {
      const msg = e.response?.data?.message || "Erreur lors de la modification";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Gestion Documentaire
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fichiers, plans, cahiers de charges et versions documentaires
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition duration-200"
        >
          <MdUploadFile className="h-5 w-5" />
          Ajouter un Document
        </button>
      </div>

      <Card extra="w-full p-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun document téléversé.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-navy-700">
                    <MdInsertDriveFile className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-navy-700 dark:text-white line-clamp-1">{doc.name}</h5>
                    <p className="text-xs text-gray-400">
                      Version v{doc.current_version || 1} • {doc.category?.name || "Général"}
                    </p>
                    {doc.folder && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-brand-500">
                        <MdFolder className="h-3 w-3" />
                        <span>{doc.folder.name}</span>
                        {doc.folder.project && (
                          <span className="text-gray-400">• {doc.folder.project.name}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="rounded-lg p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-navy-700"
                >
                  <MdDownload className="h-5 w-5" />
                </button>
                {canDelete && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-navy-700"
                >
                  <MdDelete className="h-5 w-5" />
                </button>
                )}
                {canEdit && (
                <button
                  onClick={() => openEdit(doc)}
                  className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-navy-700"
                >
                  <MdEdit className="h-5 w-5" />
                </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Ajouter un Document
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Nom du document</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Dossier / Projet</label>
                <select
                  value={form.folder_id}
                  onChange={(e) => setForm({ ...form, folder_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Sans dossier</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}{f.project ? ` (${f.project.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Catégorie</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fichier</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-3 file:py-1 file:text-sm file:font-medium file:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {formError && (
                  <p className="mr-auto text-sm text-red-500">{formError}</p>
                )}
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {submitting ? "Ajout en cours..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Modifier le Document
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Nom du document</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Dossier / Projet</label>
                <select
                  value={editForm.folder_id}
                  onChange={(e) => setEditForm({ ...editForm, folder_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Sans dossier</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}{f.project ? ` (${f.project.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Catégorie</label>
                <select
                  value={editForm.category_id}
                  onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Description</label>
                <textarea
                  rows="2"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {formError && (
                  <p className="mr-auto text-sm text-red-500">{formError}</p>
                )}
                <button
                  type="button"
                  onClick={() => { setEditModalOpen(false); setEditDoc(null); }}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
