import React, { useEffect, useRef, useState } from "react";
import api from "services/api";
import { getStoredUser } from "services/auth";
import Card from "components/card";
import { MdPersonAdd, MdEdit, MdDelete, MdPhone, MdEmail, MdBusiness } from "react-icons/md";

export default function ClientsPage() {
  const user = getStoredUser();
  const isSecretary = user?.roles?.[0]?.name === "Secretary";
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);
  const [form, setForm] = useState({
    client_type: "individual",
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    ice: "",
    tax_identifier: "",
    trade_register: "",
    address: "",
    city: "Casablanca",
    notes: "",
  });

  const loadClients = async (searchTerm) => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const res = await api.get("/clients", { params });
      setClients(res.data.data || res.data || []);
    } catch (e) {
      console.error("Error loading clients", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadClients(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
      } else {
        await api.post("/clients", form);
      }
      setModalOpen(false);
      setEditingId(null);
      setFormError("");
      setForm({
        client_type: "individual",
        first_name: "",
        last_name: "",
        company_name: "",
        email: "",
        phone: "",
        ice: "",
        tax_identifier: "",
        trade_register: "",
        address: "",
        city: "Casablanca",
        notes: "",
      });
      loadClients(search);
    } catch (e) {
      const msg =
        e.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join(", ")
          : e.response?.data?.message || "Erreur lors de l'enregistrement";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (client) => {
    setEditingId(client.id);
    setForm({
      client_type: client.client_type || "individual",
      first_name: client.first_name || "",
      last_name: client.last_name || "",
      company_name: client.company_name || "",
      email: client.email || "",
      phone: client.phone || "",
      ice: client.ice || "",
      tax_identifier: client.tax_identifier || "",
      trade_register: client.trade_register || "",
      address: client.address || "",
      city: client.city || "Casablanca",
      notes: client.notes || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await api.delete(`/clients/${id}`);
        loadClients(search);
      } catch (e) {
        console.error("Error deleting client", e);
      }
    }
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Gestion des Clients
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Clients physiques et morales du cabinet d'architecture
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              client_type: "individual",
              first_name: "",
              last_name: "",
              company_name: "",
              email: "",
              phone: "",
              ice: "",
              tax_identifier: "",
              trade_register: "",
              address: "",
              city: "Casablanca",
              notes: "",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition duration-200"
        >
          <MdPersonAdd className="h-5 w-5" />
          Nouveau Client
        </button>
      </div>

      <div className="w-full">
        <input
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-black placeholder-gray-700 focus:border-brand-500  focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-[#111c44cc] dark:text-white dark:text-[black] "
          placeholder="Recherche client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card extra="w-full p-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun client trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-navy-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">ICE / Identifiants</th>
                  <th className="px-4 py-3">Ville</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-navy-700 dark:border-navy-700">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50">
                    <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">
                      {client.client_type === "company" ? (
                        <div className="flex items-center gap-2">
                          <MdBusiness className="h-5 w-5 text-brand-500" />
                          <span>{client.company_name}</span>
                        </div>
                      ) : (
                        <span>{client.first_name} {client.last_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        client.client_type === "company" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {client.client_type === "company" ? "Société" : "Particulier"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs gap-0.5">
                        <span className="flex items-center gap-1"><MdEmail className="text-gray-400" /> {client.email}</span>
                        <span className="flex items-center gap-1"><MdPhone className="text-gray-400" /> {client.phone || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {client.ice ? <div>ICE: {client.ice}</div> : null}
                      {client.tax_identifier ? <div>IF: {client.tax_identifier}</div> : null}
                    </td>
                    <td className="px-4 py-3">{client.city || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-navy-600"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        {!isSecretary && (
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-navy-600"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                        )}
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editingId ? "Modifier le Client" : "Nouveau Client"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Type Client</label>
                  <select
                    value={form.client_type}
                    onChange={(e) => setForm({ ...form, client_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="individual">Particulier</option>
                    <option value="company">Société / Entreprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Ville</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              {form.client_type === "company" ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Raison Sociale</label>
                  <input
                    type="text"
                    required
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Prénom</label>
                    <input
                      type="text"
                      required
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Nom</label>
                    <input
                      type="text"
                      required
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              {form.client_type === "company" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">ICE</label>
                    <input
                      type="text"
                      value={form.ice}
                      onChange={(e) => setForm({ ...form, ice: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Identifiant Fiscal</label>
                    <input
                      type="text"
                      value={form.tax_identifier}
                      onChange={(e) => setForm({ ...form, tax_identifier: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Registre Commerce</label>
                    <input
                      type="text"
                      value={form.trade_register}
                      onChange={(e) => setForm({ ...form, trade_register: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

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
                  {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
