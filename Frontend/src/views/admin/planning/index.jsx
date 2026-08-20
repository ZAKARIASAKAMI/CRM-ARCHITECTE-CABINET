import React, { useEffect, useState } from "react";
import { eventsService } from "services/api";
import Card from "components/card";
import { MdEvent, MdAdd, MdDelete, MdEdit, MdLocationOn, MdAccessTime } from "react-icons/md";

export default function PlanningPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    title: "",
    event_type: "Rendez-vous client",
    start_at: "",
    location: "",
    project_id: "",
    client_id: "",
    description: "",
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsService.getAll();
      setEvents(res.data || []);
    } catch (e) {
      console.error("Error loading events", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await eventsService.update(editingId, {
          ...form,
          project_id: form.project_id || null,
          client_id: form.client_id || null,
        });
      } else {
        await eventsService.create({
          ...form,
          project_id: form.project_id || null,
          client_id: form.client_id || null,
        });
      }
      setModalOpen(false);
      setEditingId(null);
      setForm({ title: "", event_type: "Rendez-vous client", start_at: "", location: "", project_id: "", client_id: "", description: "" });
      setFormError("");
      loadEvents();
    } catch (e) {
      const msg = e.response?.data?.message || "Erreur lors de l'enregistrement";
      setFormError(msg);
    }
  };

  const handleEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title || "",
      event_type: ev.event_type || "Rendez-vous client",
      start_at: ev.start_at ? ev.start_at.slice(0, 16) : "",
      location: ev.location || "",
      project_id: ev.project_id || "",
      client_id: ev.client_id || "",
      description: ev.description || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Annuler cet événement ?")) {
      try {
        await eventsService.delete(id);
        loadEvents();
      } catch (e) {
        console.error("Error deleting event", e);
      }
    }
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Planning & Agenda
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rendez-vous client, réunions de chantier et échéances
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ title: "", event_type: "Rendez-vous client", start_at: "", location: "", project_id: "", client_id: "", description: "" }); setFormError(""); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition duration-200"
        >
          <MdAdd className="h-5 w-5" />
          Nouvel Événement
        </button>
      </div>

      <Card extra="w-full p-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement du planning...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun événement prévu.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-navy-700">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-navy-700">
                    <MdEvent className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-navy-700 dark:text-white">{ev.title}</h5>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                        {ev.event_type}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MdAccessTime /> {new Date(ev.start_at).toLocaleString()}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MdLocationOn /> {ev.location}
                        </span>
                      )}
                      {ev.project && (
                        <span className="font-semibold text-brand-500">Projet: {ev.project.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(ev)}
                  className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-navy-700"
                >
                  <MdEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-navy-700"
                >
                  <MdDelete className="h-5 w-5" />
                </button>
                </div>
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
              {editingId ? "Modifier l'Événement" : "Nouvel Événement"}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Type</label>
                  <select
                    value={form.event_type}
                    onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="Rendez-vous client">Rendez-vous client</option>
                    <option value="Réunion chantier">Réunion chantier</option>
                    <option value="Visite terrain">Visite terrain</option>
                    <option value="Échéance projet">Échéance projet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Date et Heure</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start_at}
                    onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Lieu</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {formError && (
                  <p className="mr-auto text-sm text-red-500">{formError}</p>
                )}
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setEditingId(null); setFormError(""); }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  {editingId ? "Enregistrer" : "Planifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
