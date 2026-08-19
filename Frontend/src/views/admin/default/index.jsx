import React, { useEffect, useState } from "react";
import { dashboardService } from "services/api";
import Widget from "components/widget/Widget";
import Card from "components/card";
import MiniCalendar from "components/calendar/MiniCalendar";

import {
  MdPeople,
  MdBusinessCenter,
  MdArchitecture,
  MdAssignment,
  MdTrendingUp,
  MdEvent,
  MdCheckCircle,
  MdHourglassEmpty,
  MdFolderOpen,
} from "react-icons/md";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const taskCompletionRate = stats?.tasks?.total > 0
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const projectCompletionRate = stats?.projects?.total > 0
    ? Math.round((stats.projects.completed / stats.projects.total) * 100)
    : 0;

  return (
    <div>
      {/* Metric Widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdPeople className="h-7 w-7 text-brand-500" />}
          title={"Total Prospects"}
          subtitle={stats?.prospects?.total?.toString() || "0"}
        />
        <Widget
          icon={<MdTrendingUp className="h-6 w-6 text-green-500" />}
          title={"Taux Conversion"}
          subtitle={`${stats?.prospects?.conversion_rate || 0}%`}
        />
        <Widget
          icon={<MdBusinessCenter className="h-7 w-7 text-blue-500" />}
          title={"Total Clients"}
          subtitle={stats?.clients_count?.toString() || "0"}
        />
        <Widget
          icon={<MdArchitecture className="h-6 w-6 text-purple-500" />}
          title={"Projets Actifs"}
          subtitle={stats?.projects?.active?.toString() || "0"}
        />
        <Widget
          icon={<MdAssignment className="h-7 w-7 text-amber-500" />}
          title={"Tâches en cours"}
          subtitle={stats?.tasks?.pending?.toString() || "0"}
        />
        <Widget
          icon={<MdEvent className="h-6 w-6 text-red-500" />}
          title={"Événements à venir"}
          subtitle={stats?.upcoming_events?.length?.toString() || "0"}
        />
      </div>

      {/* État d'Avancement */}
      <div className="mt-5">
        <Card extra="p-5">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <MdFolderOpen className="h-6 w-6 text-brand-500" />
            État d'Avancement
          </h4>

          {/* Summary Row */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-800">
              <p className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Projets</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-navy-700 dark:text-white">{stats?.projects?.active || 0}</span>
                <span className="text-xs text-gray-400">actifs / {stats?.projects?.total || 0} total</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${projectCompletionRate}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{projectCompletionRate}% complétés</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-800">
              <p className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Tâches</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-navy-700 dark:text-white">{stats?.tasks?.pending || 0}</span>
                <span className="text-xs text-gray-400">en cours / {stats?.tasks?.total || 0} total</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${taskCompletionRate}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{taskCompletionRate}% complétées</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-800">
              <p className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Prospects</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-navy-700 dark:text-white">{stats?.prospects?.won || 0}</span>
                <span className="text-xs text-gray-400">gagnés / {stats?.prospects?.total || 0} total</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${stats?.prospects?.conversion_rate || 0}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{stats?.prospects?.conversion_rate || 0}% taux de conversion</p>
            </div>
          </div>

          {/* Per-project Progress */}
          {!stats?.projects_in_progress?.length ? (
            <p className="text-sm text-gray-500">Aucun projet en cours.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-navy-800 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Projet</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Architecte</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Tâches</th>
                    <th className="px-4 py-3">Avancement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {stats.projects_in_progress.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-navy-700 dark:text-white">{p.name}</div>
                        <div className="text-xs text-brand-500 font-mono">{p.reference}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{p.client || "-"}</td>
                      <td className="px-4 py-3 text-xs">{p.manager || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block w-max rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {p.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="flex items-center gap-1">
                          <MdCheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {p.tasks_completed}/{p.tasks_total}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                            <div
                              className={`h-full rounded-full transition-all ${
                                p.progress >= 80 ? "bg-green-500" : p.progress >= 40 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-navy-700 dark:text-white">{p.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent Projects */}
        <Card extra="xl:col-span-2 p-5">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
            Projets Récents
          </h4>
          {stats?.projects?.recent?.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun projet pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-navy-800 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Réf / Nom</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Surface</th>
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
                      <td className="px-4 py-3">
                        {p.estimated_built_surface ? `${p.estimated_built_surface} m²` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Mini Calendar & Events */}
        <div className="flex flex-col gap-5">
          <Card extra="p-4">
            <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
              Prochains Rendez-vous
            </h4>
            {stats?.upcoming_events?.length === 0 ? (
              <p className="text-xs text-gray-500">Aucun rendez-vous à venir.</p>
            ) : (
              <div className="space-y-3">
                {stats?.upcoming_events?.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-navy-700 dark:bg-navy-800">
                    <h5 className="font-bold text-sm text-navy-700 dark:text-white">{ev.title}</h5>
                    <p className="text-xs text-brand-500 mt-0.5">{new Date(ev.start_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <MiniCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
