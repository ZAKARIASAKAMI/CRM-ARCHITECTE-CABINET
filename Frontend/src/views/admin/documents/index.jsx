import React, { useEffect, useState } from "react";
import { documentsService } from "services/api";
import Card from "components/card";
import { MdUploadFile, MdDelete, MdInsertDriveFile } from "react-icons/md";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    folder_id: "",
    category_id: "",
    description: "",
  });
  const [file, setFile] = useState(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await documentsService.getAll();
      setDocuments(res.data.documents || []);
      setCategories(res.data.categories || []);
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
      loadDocs();
    } catch (e) {
      console.error("Error uploading document", e);
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
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-navy-700"
                >
                  <MdDelete className="h-5 w-5" />
                </button>
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
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
