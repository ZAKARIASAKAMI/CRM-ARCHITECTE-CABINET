import React, { useEffect, useState } from "react";
import { dashboardService } from "services/api";
import Widget from "components/widget/Widget";
import Card from "components/card";
import { getStoredUser } from "services/auth";
import {
  MdBusinessCenter,
  MdArchitecture,
  MdAssignment,
  MdPeople,
  MdFolder,
  MdCalendarToday,
  MdTrendingUp,
  MdPersonAdd,
} from "react-icons/md";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();
  const userRole = user?.roles?.[0]?.name;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="mt-5 p-8 text-center text-gray-500">Chargement du tableau de bord...</div>;
  }

  const showClients = userRole !== "Collaborator";
  const showProspects = ["Administrator", "Secretary"].includes(userRole);
  const showEvents = ["Administrator", "Architect", "Secretary"].includes(userRole);
  const showDocs = true;
  const isSecretary = userRole === "Secretary";

  return (
    <div>
      {/* Metric Widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6">
        {showClients && (
          <Widget
            icon={<MdBusinessCenter className="h-7 w-7 text-blue-500" />}
            title={"Clients"}
            subtitle={stats?.clients_count?.toString() || "0"}
          />
        )}
        {showProspects && (
          <Widget
            icon={<MdPersonAdd className="h-7 w-7 text-green-500" />}
            title={"Prospects"}
            subtitle={stats?.prospects?.total?.toString() || "0"}
          />
        )}
        {!isSecretary && (
        <Widget
          icon={<MdArchitecture className="h-7 w-7 text-purple-500" />}
          title={"Projets Actifs"}
          subtitle={stats?.projects?.active?.toString() || "0"}
        />
        )}
        {!isSecretary && (
        <Widget
          icon={<MdAssignment className="h-7 w-7 text-amber-500" />}
          title={"Tâches en cours"}
          subtitle={stats?.tasks?.pending?.toString() || "0"}
        />
        )}
        {showEvents && (
          <Widget
            icon={<MdCalendarToday className="h-7 w-7 text-red-500" />}
            title={"Événements à venir"}
            subtitle={stats?.upcoming_events?.length?.toString() || "0"}
          />
        )}
        {showDocs && (
          <Widget
            icon={<MdFolder className="h-7 w-7 text-teal-500" />}
            title={"Documents"}
            subtitle={stats?.documents_count?.toString() || "0"}
          />
        )}
      </div>

      {/* Second Row: Conversion Rate (prospects) + Projects in Progress */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Prospect Conversion */}
        {showProspects && (
          <Card extra="p-5">
            <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
              <MdTrendingUp className="h-5 w-5 text-green-500" />
              Pipeline Prospects
            </h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-navy-700">
                <p className="text-2xl font-bold text-green-600">{stats?.prospects?.won || 0}</p>
                <p className="text-xs text-gray-500">Gagnés</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-navy-700">
                <p className="text-2xl font-bold text-red-600">{stats?.prospects?.lost || 0}</p>
                <p className="text-xs text-gray-500">Perdus</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-navy-700">
                <p className="text-2xl font-bold text-blue-600">{stats?.prospects?.conversion_rate || 0}%</p>
                <p className="text-xs text-gray-500">Taux conversion</p>
              </div>
            </div>
            {stats?.recent_prospects?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-navy-800 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                    {stats.recent_prospects.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50">
                        <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">
                          {p.company_name || `${p.first_name || ""} ${p.last_name || ""}`.trim()}
                        </td>
                        <td className="px-4 py-3">{p.status?.name || "-"}</td>
                        <td className="px-4 py-3">{p.source?.name || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Projects in Progress */}
        {!isSecretary && (
        <Card extra="p-5">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <MdArchitecture className="h-5 w-5 text-purple-500" />
            Projets en Cours
          </h4>
          {stats?.projects_in_progress?.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun projet en cours.</p>
          ) : (
            <div className="space-y-3">
              {stats?.projects_in_progress?.slice(0, 5).map((p) => (
                <div key={p.id} className="rounded-xl border border-gray-100 p-3 dark:border-navy-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-navy-700 dark:text-green-400">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-white">
                        {p.client || "-"} • {p.manager || "-"}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-purple-600 dark:text-white">
                      {p.progress || 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-navy-600 dark:text-white">
                    <div
                      className="h-2 rounded-full bg-purple-500 transition-all"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        )}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Upcoming Events */}
        {showEvents && (
          <Card extra="p-5">
            <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
              <MdCalendarToday className="h-5 w-5 text-red-500" />
              Prochains Événements
            </h4>
            {stats?.upcoming_events?.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun événement à venir.</p>
            ) : (
              <div className="space-y-3">
                {stats?.upcoming_events?.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-navy-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-navy-700">
                      <MdCalendarToday className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-navy-700 dark:text-white">{ev.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ev.start_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {ev.location ? ` • ${ev.location}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                      {ev.event_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Recent Projects */}
        {!isSecretary && (
        <Card extra="p-5">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <MdArchitecture className="h-5 w-5 text-purple-500" />
            Projets Récents
          </h4>
          {stats?.projects?.recent?.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun projet pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-white">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-navy-800 text-white">
                  <tr>
                    <th className="px-4 py-3 dark:text-white">Réf / Nom</th>
                    <th className="px-4 py-3 dark:text-white">Client</th>
                    <th className="px-4 py-3 dark:text-white">Statut</th>
                    <th className="px-4 py-3 dark:text-white">Ville</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {stats?.projects?.recent?.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50">
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">
                        {p.name} <span className="text-xs text-brand-500">({p.reference})</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.client?.company_name || `${p.client?.first_name || ""} ${p.client?.last_name || ""}`}
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600">
                        {p.status?.name || "-"}
                      </td>
                      <td className="px-4 py-3">{p.city || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        )}
      </div>

      {/* Tasks Summary */}
      {!isSecretary && (
      <div className="mt-5 grid grid-cols-1 gap-5">
        <Card extra="p-5">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <MdAssignment className="h-5 w-5 text-amber-500" />
            Résumé des Tâches
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-amber-50 p-4 text-center dark:bg-navy-700">
              <p className="text-2xl font-bold text-amber-600">{stats?.tasks?.total || 0}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-navy-700">
              <p className="text-2xl font-bold text-blue-600">{stats?.tasks?.pending || 0}</p>
              <p className="text-xs text-gray-500">En cours</p>
            </div>
            <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-navy-700">
              <p className="text-2xl font-bold text-green-600">{stats?.tasks?.completed || 0}</p>
              <p className="text-xs text-gray-500">Terminées</p>
            </div>
          </div>
        </Card>
      </div>
      )}
    </div>
  );
};

export default Dashboard;
