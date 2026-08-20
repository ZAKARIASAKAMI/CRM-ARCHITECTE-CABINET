import React, { useEffect, useState } from "react";
import { dashboardService } from "services/api";
import Widget from "components/widget/Widget";
import Card from "components/card";
import { getStoredUser } from "services/auth";

import {
  MdBusinessCenter,
  MdArchitecture,
  MdAssignment,
} from "react-icons/md";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();
  const isCollaborator = user?.roles?.[0]?.name === "Collaborator";

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

  return (
    <div>
      {/* Metric Widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3">
        {!isCollaborator && (
        <Widget
          icon={<MdBusinessCenter className="h-7 w-7 text-blue-500" />}
          title={"Total Clients"}
          subtitle={stats?.clients_count?.toString() || "0"}
        />
        )}
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
      </div>

      {/* Main Content Grid */}
      <div className="mt-5 grid grid-cols-1 gap-5">
        {/* Recent Projects */}
        <Card extra="p-5">
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
      </div>
    </div>
  );
};

export default Dashboard;
