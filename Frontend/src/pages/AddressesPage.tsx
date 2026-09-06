import React, { useState, useEffect } from 'react';
import { addressApi, CreateAddressDto } from '../api/address.api';
import { Address } from '../types';
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Home, Building2, AlertCircle, X } from 'lucide-react';

export const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [label, setLabel] = useState('Maison');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Douala');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressApi.getAll();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setLabel('Maison');
    setStreet('');
    setCity('Douala');
    setIsDefault(addresses.length === 0);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setLabel(addr.label);
    setStreet(addr.street);
    setCity(addr.city);
    setIsDefault(addr.isDefault);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editingId) {
        await addressApi.update(editingId, {
          label,
          street,
          city,
          isDefault,
        });
      } else {
        await addressApi.create({
          label,
          street,
          city,
          isDefault,
        });
      }
      setShowModal(false);
      loadAddresses();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette adresse ?')) return;
    try {
      await addressApi.delete(id);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Mes Adresses de Livraison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez vos lieux de livraison à Douala (Akwa, Bonapriso, Bonamoussadi, etc.)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 transition active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une adresse</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-28" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            Aucune adresse enregistrée
          </h3>
          <p className="text-xs text-slate-500">
            Ajoutez votre domicile ou votre bureau pour faciliter vos commandes de repas.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Ajouter ma première adresse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      {addr.label.toLowerCase().includes('bureau') ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <Home className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-display font-bold text-slate-900 text-base">
                      {addr.label}
                    </span>
                  </div>

                  {addr.isDefault && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Par défaut
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {addr.street}
                </p>
                <p className="text-xs font-semibold text-blue-600 mt-1">
                  {addr.city}, Cameroun
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(addr)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {editingId ? 'Modifier l’adresse' : 'Ajouter une adresse de livraison'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom du lieu / Libellé
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['Maison', 'Bureau', 'Autre'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLabel(type)}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        label === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: Maison Bonapriso"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quartier & Rue / Repères à Douala
                </label>
                <textarea
                  required
                  rows={3}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Bonapriso, Rue des Palmiers, Immeuble Horizon 3e étage, en face de la pharmacie"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefaultCheck" className="text-xs font-medium text-slate-700">
                  Définir comme adresse de livraison par défaut
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  {editingId ? 'Enregistrer les modifications' : 'Ajouter cette adresse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
