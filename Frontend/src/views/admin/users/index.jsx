import React, { useCallback, useEffect, useState } from "react";
import { usersService } from "services/api";
import Card from "components/card";
import {
  MdPersonAdd,
  MdEdit,
  MdDelete,
  MdEmail,
  MdPhone,
  MdShield,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";

const ROLES = [
  "Administrateur",
  "Architecte responsable",
  "Collaborateur",
  "Assistante / Secrétaire",
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "Architecte responsable",
    status: "active",
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.getList();
      setUsers(res.data || []);
    } catch (e) {
      console.error("Error loading users", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editingId) {
        if (!payload.password) delete payload.password;
        await usersService.update(editingId, payload);
      } else {
        await usersService.create(payload);
      }
      setModalOpen(false);
      setEditingId(null);
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        role: "Architecte responsable",
        status: "active",
      });
      loadUsers();
    } catch (e) {
      console.error("Error saving user", e);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    const userRole = user.roles?.[0]?.name || "Architecte responsable";
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: userRole,
      status: user.is_active ? "active" : "inactive",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await usersService.delete(id);
        loadUsers();
      } catch (e) {
        console.error("Error deleting user", e);
      }
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case "Administrateur":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "Architecte responsable":
        return "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300";
      case "Collaborateur":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "Assistante / Secrétaire":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-navy-700 dark:text-white";
    }
  };

  return (
    <div className="mt-3 flex h-full flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Gestion des Utilisateurs et Rôles
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Administration des comptes du cabinet, privilèges et permissions
            d'accès.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
              password: "",
              role: "Architecte responsable",
              status: "active",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdPersonAdd className="h-5 w-5" /> Ajouter un Utilisateur
        </button>
      </div>

      <Card extra="w-full p-4">
        {loading ? (
          <p className="p-4 text-gray-500">Chargement des utilisateurs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500 dark:border-white/10 dark:text-gray-400">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Rôle / Privilèges</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 text-sm transition-all hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-navy-700/50"
                  >
                    <td className="px-4 py-3 font-bold text-navy-700 dark:text-white">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <MdEmail className="text-gray-400" /> {u.email}
                      </div>
                      {u.phone && (
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                          <MdPhone /> {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getRoleBadge(
                          u.roles?.[0]?.name
                        )}`}
                      >
                        <MdShield /> {u.roles?.[0]?.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                          <MdCheckCircle /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                          <MdCancel /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-navy-700 dark:hover:text-white"
                          title="Modifier"
                        >
                          <MdEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-navy-700 dark:hover:text-red-400"
                          title="Supprimer"
                        >
                          <MdDelete className="h-4 w-4" />
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

      {modalOpen && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800 dark:text-white">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editingId
                ? "Modifier l'utilisateur"
                : "Nouveau Compte Utilisateur"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  Email professionnel
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {editingId ? "Nouveau mot de passe (laisser vide pour garder)" : "Mot de passe"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  Rôle & Privilèges
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                >
                  <option value="Administrateur">
                    Administrateur (Accès complet & Audit)
                  </option>
                  <option value="Architecte responsable">
                    Architecte responsable (Projets, Équipes, Clients)
                  </option>
                  <option value="Collaborateur">
                    Collaborateur (Consultation & Tâches affectées)
                  </option>
                  <option value="Assistante / Secrétaire">
                    Assistante / Secrétaire (Prospects, RDV & Administrative)
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="userStatus"
                  checked={form.status === "active"}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.checked ? "active" : "inactive" })
                  }
                  className="h-4 w-4 rounded accent-brand-500"
                />
                <label htmlFor="userStatus" className="text-sm font-semibold">
                  Compte actif
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
