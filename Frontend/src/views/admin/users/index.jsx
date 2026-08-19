import React, { useCallback, useEffect, useState } from "react";
import { usersService, rolesService } from "services/api";
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
  MdAdd,
  MdGroup,
  MdVpnKey,
} from "react-icons/md";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("users");

  // --- Users State ---
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "Architecte responsable",
    status: "active",
  });

  const ROLES = [
    "Administrateur",
    "Architecte responsable",
    "Collaborateur",
    "Assistante / Secrétaire",
  ];

  // --- Roles State ---
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  // --- Users Functions ---
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await usersService.getAll();
      setUsers(res.data || []);
    } catch (e) {
      console.error("Error loading users", e);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...userForm };
      if (editingUserId) {
        if (!payload.password) delete payload.password;
        await usersService.update(editingUserId, payload);
      } else {
        await usersService.create(payload);
      }
      setUserModalOpen(false);
      setEditingUserId(null);
      setUserForm({
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

  const handleUserEdit = (user) => {
    setEditingUserId(user.id);
    const userRole = user.roles?.[0]?.name || "Architecte responsable";
    setUserForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: userRole,
      status: user.is_active ? "active" : "inactive",
    });
    setUserModalOpen(true);
  };

  const handleUserDelete = async (id) => {
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

  // --- Roles Functions ---
  const loadRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await rolesService.getAll();
      setRoles(res.data || []);
    } catch (e) {
      console.error("Error loading roles", e);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const res = await rolesService.getPermissions();
      setPermissions(res.data || []);
    } catch (e) {
      console.error("Error loading permissions", e);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "roles") {
      loadRoles();
      loadPermissions();
    }
  }, [activeTab, loadRoles, loadPermissions]);

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoleId) {
        await rolesService.update(editingRoleId, roleForm);
      } else {
        await rolesService.create(roleForm);
      }
      setRoleModalOpen(false);
      setEditingRoleId(null);
      setRoleForm({ name: "", description: "", permissions: [] });
      loadRoles();
    } catch (e) {
      console.error("Error saving role", e);
      const msg = e.response?.data?.message || "Erreur lors de l'enregistrement";
      alert(msg);
    }
  };

  const handleRoleEdit = async (role) => {
    try {
      const res = await rolesService.getOne(role.id);
      const fullRole = res.data;
      setEditingRoleId(role.id);
      setRoleForm({
        name: fullRole.name || "",
        description: fullRole.description || "",
        permissions: fullRole.permissions?.map((p) => p.id) || [],
      });
      setRoleModalOpen(true);
    } catch (e) {
      console.error("Error loading role", e);
    }
  };

  const handleRoleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) {
      try {
        await rolesService.delete(id);
        loadRoles();
      } catch (e) {
        console.error("Error deleting role", e);
        const msg = e.response?.data?.message || "Erreur lors de la suppression";
        alert(msg);
      }
    }
  };

  const togglePermission = (permId) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  const tabs = [
    { id: "users", label: "Utilisateurs", icon: MdGroup },
    { id: "roles", label: "Rôles & Permissions", icon: MdShield },
  ];

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
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================== USERS TAB ======================== */}
      {activeTab === "users" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingUserId(null);
                setUserForm({
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  password: "",
                  role: "Architecte responsable",
                  status: "active",
                });
                setUserModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
            >
              <MdPersonAdd className="h-5 w-5" /> Ajouter un Utilisateur
            </button>
          </div>

          <Card extra="w-full p-4">
            {loadingUsers ? (
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
                              onClick={() => handleUserEdit(u)}
                              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-navy-700 dark:hover:text-white"
                              title="Modifier"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUserDelete(u.id)}
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

          {/* User Modal */}
          {userModalOpen && (
            <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800 dark:text-white">
                <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
                  {editingUserId
                    ? "Modifier l'utilisateur"
                    : "Nouveau Compte Utilisateur"}
                </h3>
                <form onSubmit={handleUserSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        Prénom
                      </label>
                      <input
                        type="text"
                        required
                        value={userForm.first_name}
                        onChange={(e) =>
                          setUserForm({ ...userForm, first_name: e.target.value })
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
                        value={userForm.last_name}
                        onChange={(e) =>
                          setUserForm({ ...userForm, last_name: e.target.value })
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
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {editingUserId ? "Nouveau mot de passe (laisser vide pour garder)" : "Mot de passe"}
                    </label>
                    <input
                      type="password"
                      required={!editingUserId}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        Rôle & Privilèges
                      </label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                      >
                        <option value="Administrateur">
                          Administrateur
                        </option>
                        <option value="Architecte responsable">
                          Architecte responsable
                        </option>
                        <option value="Collaborateur">
                          Collaborateur
                        </option>
                        <option value="Assistante / Secrétaire">
                          Assistante / Secrétaire
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        Statut
                      </label>
                      <select
                        value={userForm.status}
                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                        className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setUserModalOpen(false)}
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
        </>
      )}

      {/* ======================== ROLES TAB ======================== */}
      {activeTab === "roles" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingRoleId(null);
                setRoleForm({ name: "", description: "", permissions: [] });
                setRoleModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
            >
              <MdAdd className="h-5 w-5" /> Nouveau Rôle
            </button>
          </div>

          <Card extra="w-full p-4">
            {loadingRoles ? (
              <p className="p-4 text-gray-500">Chargement des rôles...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500 dark:border-white/10 dark:text-gray-400">
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Utilisateurs</th>
                      <th className="px-4 py-3">Permissions</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr
                        key={role.id}
                        className="border-b border-gray-100 text-sm transition-all hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-navy-700/50"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getRoleBadge(
                              role.name
                            )}`}
                          >
                            <MdShield /> {role.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {role.description || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                            <MdGroup className="h-3.5 w-3.5" />
                            {role.users_count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                            <MdVpnKey className="h-3.5 w-3.5" />
                            {role.permissions_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRoleEdit(role)}
                              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-navy-700 dark:hover:text-white"
                              title="Modifier"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRoleDelete(role.id)}
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

          {/* Role Modal */}
          {roleModalOpen && (
            <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800 dark:text-white">
                <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
                  {editingRoleId ? "Modifier le Rôle" : "Nouveau Rôle"}
                </h3>
                <form onSubmit={handleRoleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Nom du rôle
                    </label>
                    <input
                      type="text"
                      required
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                      placeholder="Ex: Chef de projet"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      className="mt-1 w-full rounded-xl border p-2.5 text-sm dark:border-white/10 dark:bg-navy-900"
                      placeholder="Description du rôle (optionnel)"
                    />
                  </div>

                  {Object.keys(groupedPermissions).length > 0 && (
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                        Permissions
                      </label>
                      <div className="space-y-3 rounded-xl border border-gray-200 p-3 dark:border-white/10">
                        {Object.entries(groupedPermissions).map(([module, perms]) => (
                          <div key={module}>
                            <p className="mb-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                              {module}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {perms.map((perm) => (
                                <label
                                  key={perm.id}
                                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                    roleForm.permissions.includes(perm.id)
                                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-navy-900 dark:text-gray-400"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={roleForm.permissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                  />
                                  {perm.name}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRoleModalOpen(false)}
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
        </>
      )}
    </div>
  );
}
