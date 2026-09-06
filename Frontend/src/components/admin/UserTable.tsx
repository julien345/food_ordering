import React from 'react';
import { User } from '../../types';
import { AdminAssignableRole } from '../../api/admin.api';
import { Truck, Shield, UserCheck, Plus } from 'lucide-react';

interface UserTableProps {
  users: User[];
  roleType: 'CLIENT' | 'DELIVERY_AGENT' | 'ADMIN';
  onUpdateRole?: (userId: string, newRole: AdminAssignableRole) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  onCreateClick?: () => void;
  createButtonLabel?: string;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  roleType,
  onUpdateRole,
  emptyTitle,
  emptyMessage,
  onCreateClick,
  createButtonLabel,
}) => {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
            roleType === 'CLIENT'
              ? 'bg-blue-50 text-blue-600'
              : roleType === 'DELIVERY_AGENT'
              ? 'bg-sky-50 text-sky-600'
              : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          {roleType === 'CLIENT' && <UserCheck className="w-6 h-6" />}
          {roleType === 'DELIVERY_AGENT' && <Truck className="w-6 h-6" />}
          {roleType === 'ADMIN' && <Shield className="w-6 h-6" />}
        </div>
        <h3 className="font-bold text-base text-slate-900">
          {emptyTitle ||
            (roleType === 'CLIENT'
              ? 'Aucun client trouvé'
              : roleType === 'DELIVERY_AGENT'
              ? 'Aucun livreur trouvé'
              : 'Aucun administrateur trouvé')}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {emptyMessage ||
            (roleType === 'CLIENT'
              ? 'Aucun client ne correspond à votre filtre de recherche.'
              : roleType === 'DELIVERY_AGENT'
              ? 'Aucun livreur enregistré dans la base de données.'
              : 'Aucun administrateur enregistré dans la base de données.')}
        </p>
        {onCreateClick && createButtonLabel && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{createButtonLabel}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">
                {roleType === 'CLIENT'
                  ? 'Client (Nom & Prénom)'
                  : roleType === 'DELIVERY_AGENT'
                  ? 'Livreur'
                  : 'Administrateur'}
              </th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Téléphone</th>
              {roleType !== 'CLIENT' && (
                <th className="px-6 py-3.5">Rôle</th>
              )}
              {onUpdateRole && roleType !== 'CLIENT' && (
                <th className="px-6 py-3.5 text-right">Modifier le Rôle</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition">
                {/* Utilisateur */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${
                        roleType === 'CLIENT'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : roleType === 'DELIVERY_AGENT'
                          ? 'bg-sky-100 text-sky-700 border-sky-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {roleType === 'DELIVERY_AGENT' ? (
                        <Truck className="w-4 h-4" />
                      ) : roleType === 'ADMIN' ? (
                        <Shield className="w-4 h-4" />
                      ) : user.firstName ? (
                        user.firstName.charAt(0).toUpperCase()
                      ) : (
                        'C'
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{user.id}</p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 text-slate-600">{user.email}</td>

                {/* Téléphone : strictement user.phone brut */}
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {user.phone}
                </td>

                {/* Rôle (uniquement pour Livreurs et Administrateurs) */}
                {roleType !== 'CLIENT' && (
                  <td className="px-6 py-4">
                    {roleType === 'DELIVERY_AGENT' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        DELIVERY_AGENT
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        ADMIN
                      </span>
                    )}
                  </td>
                )}

                {/* Actions de modification de rôle réservées au personnel (Livreurs et Administrateurs) */}
                {onUpdateRole && roleType !== 'CLIENT' && (
                  <td className="px-6 py-4 text-right">
                    <select
                      value={user.role === 'ADMIN' ? 'ADMIN' : 'DELIVERY_AGENT'}
                      onChange={(e) =>
                        onUpdateRole(user.id, e.target.value as AdminAssignableRole)
                      }
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="DELIVERY_AGENT">DELIVERY_AGENT (Livreur)</option>
                      <option value="ADMIN">ADMIN (Administrateur)</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
