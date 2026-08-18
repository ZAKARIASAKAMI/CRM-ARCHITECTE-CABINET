import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "services/api";

const defaultForm = {
  first_name: "",
  last_name: "",
  company_name: "",
  email: "",
  phone: "",
  status_id: "",
  source_id: "",
  client_type: "individual",
  project_type: "",
  estimated_budget: "",
  notes: "",
};

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [conversionData, setConversionData] = useState({
    create_project: true,
    project_name: "",
    project_type_id: "",
    manager_user_id: "",
  });
  const [converting, setConverting] = useState(false);
  const [conversionError, setConversionError] = useState("");
  const debounceRef = useRef(null);

  const loadProspects = async (searchTerm, statusId) => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusId) params.status_id = statusId;
      const res = await api.get("/prospects", { params });
      setProspects(res.data.data || res.data || []);
    } catch (error) {
      console.error("Failed to load prospects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/prospects-statuses").then((r) => setStatuses(r.data || [])).catch(() => {});
    api.get("/prospect-sources").then((r) => setSources(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProspects(search, statusFilter);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...form,
        estimated_budget: form.estimated_budget
          ? Number(form.estimated_budget)
          : null,
      };

      if (editingId) {
        await api.put(`/prospects/${editingId}`, payload);
      } else {
        await api.post("/prospects", payload);
      }

      setForm(defaultForm);
      setEditingId(null);
      setModalOpen(false);
      loadProspects(search, statusFilter);
    } catch (error) {
      console.error("Failed to save prospect", error);
    }
  };

  const handleEdit = (prospect) => {
    setEditingId(prospect.id);
    setForm({
      first_name: prospect.first_name || "",
      last_name: prospect.last_name || "",
      company_name: prospect.company_name || "",
      email: prospect.email || "",
      phone: prospect.phone || "",
      status_id: prospect.status_id || "",
      source_id: prospect.source_id || "",
      client_type: prospect.client_type || "individual",
      project_type: prospect.project_type || "",
      estimated_budget: prospect.estimated_budget || "",
      notes: prospect.notes || "",
    });
    setModalOpen(true);
  };

  const handleConvert = (prospect) => {
    setSelectedProspect(prospect);
    setConversionData({
      create_project: true,
      project_name:
        prospect.company_name ||
        `${prospect.first_name || ""} ${prospect.last_name || ""}`.trim(),
      project_type_id: "",
      manager_user_id: "",
    });
    setConversionError("");
    setConvertOpen(true);
  };

  const handleDelete = (prospect) => {
    setSelectedProspect(prospect);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProspect) return;
    try {
      await api.delete(`/prospects/${selectedProspect.id}`);
      setDeleteOpen(false);
      setSelectedProspect(null);
      loadProspects(search, statusFilter);
    } catch (error) {
      console.error("Failed to delete prospect", error);
    }
  };

  const submitConversion = async () => {
    if (!selectedProspect) return;

    setConverting(true);
    setConversionError("");
    try {
      await api.post(`/prospects/${selectedProspect.id}/convert`, {
        ...conversionData,
      });
      setConvertOpen(false);
      setSelectedProspect(null);
      setConversionError("");
      loadProspects(search, statusFilter);
    } catch (error) {
      const msg =
        error.response?.data?.message || "La conversion a échoué. Veuillez réessayer.";
      setConversionError(msg);
    } finally {
      setConverting(false);
    }
  };

  const totalWon = useMemo(
    () =>
      prospects.filter(
        (p) =>
          Number(p.status_id) ===
          Number(statuses.find((s) => s.code === "WON")?.id)
      ).length,
    [prospects, statuses]
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-md md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700">Prospects</h2>
          <p className="text-sm text-gray-500">
            Pipeline des prospects et conversion client
          </p>
        </div>
        <button
          className="rounded-xl bg-brand-500 px-4 py-2 text-white"
          onClick={() => {
            setEditingId(null);
            setForm(defaultForm);
            setModalOpen(true);
          }}
        >
          + Nouveau prospect
        </button>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-md">
        <input
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="rounded-xl border border-gray-200 bg-white p-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>

          <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700">
            Conversion : {totalWon}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Source</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : prospects.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Aucun prospect trouvé.
                </td>
              </tr>
            ) : (
              prospects.map((prospect) => (
                <tr key={prospect.id} className="border-t border-gray-100">
                  <td className="p-3">
                    <div className="font-semibold text-navy-700">
                      {prospect.company_name ||
                        `${prospect.first_name || ""} ${
                          prospect.last_name || ""
                        }`.trim()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {prospect.client_type}
                    </div>
                  </td>
                  <td className="p-3">{prospect.email || "-"}</td>
                  <td className="p-3">{prospect.phone || "-"}</td>
                  <td className="p-3">{prospect.status?.name || "-"}</td>
                  <td className="p-3">{prospect.source?.name || "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg bg-gray-100 px-2 py-1 text-sm"
                        onClick={() => handleEdit(prospect)}
                      >
                        Modifier
                      </button>
                      <button
                        className="rounded-lg bg-brand-500 px-2 py-1 text-sm text-white"
                        onClick={() => handleConvert(prospect)}
                      >
                        Convertir
                      </button>
                      <button
                        className="rounded-lg bg-red-500 px-2 py-1 text-sm text-white"
                        onClick={() => handleDelete(prospect)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="bg-black/30 fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingId ? "Modifier" : "Ajouter"} un prospect
              </h3>
              <button onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-lg border p-3"
                placeholder="Prénom"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Nom"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
              <input
                className="rounded-lg border p-3 md:col-span-2"
                placeholder="Raison sociale"
                value={form.company_name}
                onChange={(e) =>
                  setForm({ ...form, company_name: e.target.value })
                }
              />
              <input
                className="rounded-lg border p-3"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <select
                className="rounded-lg border p-3"
                value={form.status_id}
                onChange={(e) =>
                  setForm({ ...form, status_id: e.target.value })
                }
              >
                <option value="">Statut</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border p-3"
                value={form.source_id}
                onChange={(e) =>
                  setForm({ ...form, source_id: e.target.value })
                }
              >
                <option value="">Source</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border p-3"
                value={form.client_type}
                onChange={(e) =>
                  setForm({ ...form, client_type: e.target.value })
                }
              >
                <option value="individual">Particulier</option>
                <option value="company">Entreprise</option>
              </select>
              <input
                className="rounded-lg border p-3"
                placeholder="Type de projet"
                value={form.project_type}
                onChange={(e) =>
                  setForm({ ...form, project_type: e.target.value })
                }
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Budget estimé"
                value={form.estimated_budget}
                onChange={(e) =>
                  setForm({ ...form, estimated_budget: e.target.value })
                }
              />
              <textarea
                className="rounded-lg border p-3 md:col-span-2"
                placeholder="Notes"
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />

              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2"
                  onClick={() => setModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-white"
                >
                  {editingId ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {convertOpen && selectedProspect && (
        <div className="bg-black/30 fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Convertir en client</h3>
              <button onClick={() => setConvertOpen(false)}>✕</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-lg border p-3"
                placeholder="Nom du projet"
                value={conversionData.project_name}
                onChange={(e) =>
                  setConversionData({
                    ...conversionData,
                    project_name: e.target.value,
                  })
                }
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Référence"
                value={conversionData.reference || ""}
                onChange={(e) =>
                  setConversionData({
                    ...conversionData,
                    reference: e.target.value,
                  })
                }
              />
              <select
                className="rounded-lg border p-3"
                value={conversionData.project_type_id}
                onChange={(e) =>
                  setConversionData({
                    ...conversionData,
                    project_type_id: e.target.value,
                  })
                }
              >
                <option value="">Type de projet</option>
                <option value="1">Villa</option>
                <option value="2">Immeuble</option>
                <option value="3">Commercial</option>
              </select>

              <label className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={conversionData.create_project}
                  onChange={(e) =>
                    setConversionData({
                      ...conversionData,
                      create_project: e.target.checked,
                    })
                  }
                />
                Créer aussi le projet dans la même transaction
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {conversionError && (
                <p className="mr-auto text-sm text-red-500">{conversionError}</p>
              )}
              <button
                className="rounded-lg border px-4 py-2"
                onClick={() => setConvertOpen(false)}
                disabled={converting}
              >
                Annuler
              </button>
              <button
                className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50"
                onClick={submitConversion}
                disabled={converting}
              >
                {converting ? "Conversion..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && selectedProspect && (
        <div className="bg-black/30 fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Supprimer le prospect</h3>
              <button onClick={() => setDeleteOpen(false)}>✕</button>
            </div>
            <p className="mb-6 text-gray-600">
              Voulez-vous vraiment supprimer le prospect{" "}
              <strong>
                {selectedProspect.company_name ||
                  `${selectedProspect.first_name || ""} ${selectedProspect.last_name || ""}`.trim()}
              </strong>{" "}
              ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg border px-4 py-2"
                onClick={() => setDeleteOpen(false)}
              >
                Annuler
              </button>
              <button
                className="rounded-lg bg-red-500 px-4 py-2 text-white"
                onClick={confirmDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
