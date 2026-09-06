import React, { useState, useEffect, useMemo } from 'react';
import { orderApi } from '../api/order.api';
import { dishApi, CreateDishDto, UpdateDishDto } from '../api/dish.api';
import { categoryApi, CreateCategoryDto, UpdateCategoryDto } from '../api/category.api';
import { userApi, CreateUserDto } from '../api/user.api';
import { adminApi, AdminAssignableRole, normalizeUser } from '../api/admin.api';
import { deliveryApi } from '../api/delivery.api';
import { uploadApi, fileToDataUrl } from '../api/upload.api';
import { statsApi } from '../api/stats.api';
import { AdminAnalyticsView } from '../components/admin/AdminAnalyticsView';
import { UserTable } from '../components/admin/UserTable';
import {
  Order,
  Dish,
  Category,
  User,
  OrderStatus,
  UserRole,
  DashboardStats,
} from '../types';
import { formatFCFA, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../utils/format';
import { cleanPhoneNumber } from '../utils/phone.utils';
import { getDishImageUrl, getCategoryImageUrl } from '../utils/image';
import { extractApiErrorMessage } from '../utils/error';
import {
  Shield,
  ShoppingBag,
  Utensils,
  Layers,
  Users,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  EyeOff,
  UtensilsCrossed,
  Search,
  Check,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  UploadCloud,
  Loader2,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Filter,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'dishes' | 'categories' | 'users'
  >('overview');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [deliveryAgentsList, setDeliveryAgentsList] = useState<User[]>([]);
  const [adminsList, setAdminsList] = useState<User[]>([]);
  const [userSubTab, setUserSubTab] = useState<'clients' | 'delivery' | 'admins'>('clients');
  const [userSearch, setUserSearch] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [serverStats, setServerStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  // Status progression feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [assignDeliveryModal, setAssignDeliveryModal] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Dish Modal
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(5000);
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [dishImagePreview, setDishImagePreview] = useState('');
  const [dishCategoryId, setDishCategoryId] = useState('');
  const [dishIsAvailable, setDishIsAvailable] = useState(true);
  const [isUploadingDishImg, setIsUploadingDishImg] = useState(false);
  const [dishLocalError, setDishLocalError] = useState<string | null>(null);

  // Dish Category & Search Filters in Admin
  const [dishCategoryFilter, setDishCategoryFilter] = useState<string>('ALL');
  const [dishSearchQuery, setDishSearchQuery] = useState<string>('');

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [catImagePreview, setCatImagePreview] = useState('');
  const [isUploadingCatImg, setIsUploadingCatImg] = useState(false);
  const [categoryLocalError, setCategoryLocalError] = useState<string | null>(null);

  // User Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('+237');
  const [newPassword, setNewPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [newRole, setNewRole] = useState<AdminAssignableRole>('DELIVERY_AGENT');
  const [userLocalError, setUserLocalError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadUsersData = async () => {
    setUserLoading(true);
    try {
      const [clientsRes, deliveryRes, adminsRes] = await Promise.allSettled([
        adminApi.getClients(),
        adminApi.getDeliveryAgents(),
        adminApi.getAdmins(),
      ]);

      if (clientsRes.status === 'fulfilled') {
        const val = clientsRes.value;
        const list = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        setClients(list.map(normalizeUser));
      }
      if (deliveryRes.status === 'fulfilled') {
        const val = deliveryRes.value;
        const list = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        setDeliveryAgentsList(list.map(normalizeUser));
      }
      if (adminsRes.status === 'fulfilled') {
        const val = adminsRes.value;
        const list = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        setAdminsList(list.map(normalizeUser));
      }
    } catch (err) {
      console.warn('Erreur chargement utilisateurs:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [ordersRes, dishesRes, catsRes, clientsRes, deliveryRes, adminsRes, statsRes] = await Promise.allSettled([
        orderApi.getAll({ limit: 100 }),
        dishApi.getAll({ limit: 100 }),
        categoryApi.getAll(),
        adminApi.getClients(),
        adminApi.getDeliveryAgents(),
        adminApi.getAdmins(),
        statsApi.getStats(),
      ]);

      if (ordersRes.status === 'fulfilled') {
        const val = ordersRes.value;
        const ords = Array.isArray(val) ? val : (val as any)?.data || [];
        setOrders(Array.isArray(ords) ? ords : []);
      } else {
        console.warn('Orders fetch error:', ordersRes.reason);
      }

      if (dishesRes.status === 'fulfilled') {
        const val = dishesRes.value;
        const dshs = Array.isArray(val) ? val : (val as any)?.data || [];
        setDishes(Array.isArray(dshs) ? dshs : []);
      } else {
        console.warn('Dishes fetch error:', dishesRes.reason);
      }

      if (catsRes.status === 'fulfilled') {
        const val = catsRes.value;
        const cts = Array.isArray(val) ? val : (val as any)?.data || [];
        setCategories(Array.isArray(cts) ? cts : []);
      } else {
        console.warn('Categories fetch error:', catsRes.reason);
      }

      if (clientsRes.status === 'fulfilled') {
        const val = clientsRes.value;
        const clts = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        setClients(Array.isArray(clts) ? clts.map(normalizeUser) : []);
      } else {
        console.warn('Clients fetch error:', clientsRes.reason);
      }

      if (deliveryRes.status === 'fulfilled') {
        const val = deliveryRes.value;
        const dlvs = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        setDeliveryAgentsList(Array.isArray(dlvs) ? dlvs.map(normalizeUser) : []);
      } else {
        console.warn('Delivery fetch error:', deliveryRes.reason);
      }

      if (adminsRes.status === 'fulfilled') {
        const val = adminsRes.value;
        const adms = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        setAdminsList(Array.isArray(adms) ? adms.map(normalizeUser) : []);
      } else {
        console.warn('Admins fetch error:', adminsRes.reason);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setServerStats(statsRes.value);
      }
    } catch (err: any) {
      console.error('Erreur globale dashboard:', err);
      setFetchError(err.message || 'Impossible de charger les données du dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Order status progression
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      showNotification('success', `Statut mis à jour : ${ORDER_STATUS_LABELS[newStatus]}`);
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.response?.data?.error || 'Erreur mise à jour statut');
    }
  };

  // Assign delivery agent
  const handleAssignDelivery = async () => {
    if (!assignDeliveryModal || !selectedAgentId) return;
    try {
      try {
        await orderApi.assignDeliveryAgent(assignDeliveryModal.id, selectedAgentId);
      } catch (assignErr) {
        // Fallback to /deliveries endpoint if /orders/:id/assign is structured as POST /deliveries
        await deliveryApi.assign({
          orderId: assignDeliveryModal.id,
          agentId: selectedAgentId,
        });
      }
      showNotification('success', 'Livreur assigné avec succès ! Commande en route.');
      setAssignDeliveryModal(null);
      setSelectedAgentId('');
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.response?.data?.error || "Erreur lors de l'assignation");
    }
  };

  const handleUploadDishImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDishImg(true);
    setDishLocalError(null);
    try {
      const res = await uploadApi.uploadImage(file);
      // Lit directement le champ image (et non uniquement imageUrl)
      const uploadedImg = res.image || res.url;
      setDishImageUrl(uploadedImg);
      showNotification('success', 'Image uploadée avec succès !');
    } catch (err: any) {
      setDishLocalError(err.response?.data?.message || err.response?.data?.error || err.message || "Erreur lors de l'upload de l'image");
    } finally {
      setIsUploadingDishImg(false);
    }
  };

  const handleUploadCategoryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCatImg(true);
    setCategoryLocalError(null);
    try {
      const res = await uploadApi.uploadImage(file);
      const uploadedImg = res.image || res.url;
      setCategoryImageUrl(uploadedImg);
      showNotification('success', 'Image uploadée avec succès !');
    } catch (err: any) {
      setCategoryLocalError(err.response?.data?.message || err.response?.data?.error || err.message || "Erreur lors de l'upload de l'image");
    } finally {
      setIsUploadingCatImg(false);
    }
  };

  // Dish Handlers
  const openCreateDishModal = () => {
    setEditingDish(null);
    setDishName('');
    setDishDescription('');
    setDishPrice(5000);
    setDishImageUrl('');
    setDishCategoryId(categories[0]?.id || '');
    setDishIsAvailable(true);
    setDishLocalError(null);
    setDishModalOpen(true);
  };

  const openEditDishModal = (dish: Dish) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishDescription(dish.description || '');
    setDishPrice(dish.price);
    // Lit le champ image (et fallback imageUrl)
    setDishImageUrl(dish.image || dish.imageUrl || '');
    setDishCategoryId(dish.categoryId);
    setDishIsAvailable(dish.isAvailable);
    setDishLocalError(null);
    setDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setDishLocalError(null);
    try {
      if (editingDish) {
        await dishApi.update(editingDish.id, {
          name: dishName,
          description: dishDescription,
          price: Number(dishPrice),
          image: dishImageUrl,
          imageUrl: dishImageUrl,
          categoryId: dishCategoryId,
          isAvailable: dishIsAvailable,
        });
        showNotification('success', 'Plat modifié avec succès');
      } else {
        const createdDish = await dishApi.create({
          name: dishName,
          description: dishDescription,
          price: Number(dishPrice),
          image: dishImageUrl, // Envoi direct du champ image issu de l'upload
          imageUrl: dishImageUrl,
          categoryId: dishCategoryId,
          isAvailable: dishIsAvailable,
        });
        // Lecture correcte du champ image (et non imageUrl) renvoyé par l'API
        const savedImage = createdDish?.image;
        showNotification('success', 'Nouveau plat ajouté au menu');
      }
      setDishModalOpen(false);
      setDishLocalError(null);
      loadAllData();
    } catch (err: any) {
      const errorMsg = extractApiErrorMessage(err, "Erreur lors de l'enregistrement du plat");
      setDishLocalError(errorMsg);
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!window.confirm('Voulez-vous supprimer ce plat du menu ?')) return;
    try {
      await dishApi.delete(id);
      showNotification('success', 'Plat supprimé');
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDishAvailability = async (dish: Dish) => {
    try {
      await dishApi.update(dish.id, { isAvailable: !dish.isAvailable });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Category Handlers
  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryImageUrl('');
    setCategoryLocalError(null);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryImageUrl(cat.image || (cat as any).imageUrl || '');
    setCategoryLocalError(null);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryLocalError(null);
    try {
      const payload: CreateCategoryDto = {
        name: categoryName.trim(),
        image: categoryImageUrl.trim() || undefined,
      };

      if (editingCategory) {
        await categoryApi.update(editingCategory.id, payload);
        showNotification('success', 'Catégorie mise à jour');
      } else {
        await categoryApi.create(payload);
        showNotification('success', 'Catégorie créée');
      }
      setCategoryModalOpen(false);
      setCategoryLocalError(null);
      loadAllData();
    } catch (err: any) {
      const errorMsg = extractApiErrorMessage(err, 'Erreur enregistrement de la catégorie');
      setCategoryLocalError(errorMsg);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Voulez-vous supprimer cette catégorie ?')) return;
    try {
      await categoryApi.delete(id);
      showNotification('success', 'Catégorie supprimée');
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // User Handlers
  const openCreateUserModal = (defaultRole: AdminAssignableRole = 'DELIVERY_AGENT') => {
    setNewRole(defaultRole);
    setNewPassword('');
    setShowUserPassword(false);
    setUserLocalError(null);
    setUserModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLocalError(null);
    if ((newRole as string) === 'CLIENT') {
      setUserLocalError("Règle métier stricte : l'administrateur ne peut pas créer d'utilisateur avec le rôle CLIENT.");
      return;
    }
    // Validation stricte : le téléphone est désormais obligatoire
    const rawTrimmedPhone = newPhone.trim();
    if (!rawTrimmedPhone || rawTrimmedPhone === '+237' || rawTrimmedPhone === '+' || rawTrimmedPhone === '237') {
      setUserLocalError('Le numéro de téléphone est obligatoire.');
      return;
    }

    try {
      // Nettoyage strict au format international E.164 (ex: +237690000000)
      const cleanedPhone = cleanPhoneNumber(rawTrimmedPhone);
      if (!cleanedPhone || !/^\+?[1-9]\d{1,14}$/.test(cleanedPhone)) {
        setUserLocalError('Veuillez saisir un numéro de téléphone valide au format international (ex: +237690000000).');
        return;
      }

      // Contrairement à la route d'inscription publique, la route admin POST /api/users
      // renvoie uniquement l'objet User brut sans token { id, email, firstName, lastName, phone, role }.
      // On lit directement cet objet sans chercher de propriété accessToken.
      const createdUser = await adminApi.createUser({
        email: newEmail.trim(),
        firstName: newFirstName.trim(),
        lastName: newLastName.trim() || undefined,
        phone: cleanedPhone,
        role: newRole,
        password: newPassword.trim() || undefined,
      });

      showNotification('success', `Compte ${createdUser.role || newRole} (${createdUser.firstName}) créé avec succès !`);
      setUserModalOpen(false);
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      setNewPhone('+237');
      setNewPassword('');
      setShowUserPassword(false);
      setNewRole('DELIVERY_AGENT');
      setUserLocalError(null);
      loadUsersData();
    } catch (err: any) {
      const errorMsg = extractApiErrorMessage(err, "Erreur lors de la création de l'utilisateur");
      setUserLocalError(errorMsg);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: AdminAssignableRole) => {
    if ((role as string) === 'CLIENT') {
      showNotification('error', "Règle métier stricte : l'administrateur ne peut pas attribuer le rôle CLIENT.");
      return;
    }
    try {
      await adminApi.updateUserRole(userId, role);
      showNotification('success', `Rôle mis à jour vers ${role} avec succès`);
      loadUsersData();
    } catch (err: any) {
      showNotification('error', extractApiErrorMessage(err, 'Erreur modification rôle'));
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeDishes = Array.isArray(dishes) ? dishes : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeDeliveryAgents = Array.isArray(deliveryAgentsList) ? deliveryAgentsList : [];
  const safeAdmins = Array.isArray(adminsList) ? adminsList : [];

  const safeUsers = useMemo(() => {
    return [...safeClients, ...safeDeliveryAgents, ...safeAdmins];
  }, [safeClients, safeDeliveryAgents, safeAdmins]);

  const deliveryAgents = safeDeliveryAgents;

  const filteredClients = useMemo(() => {
    if (!userSearch.trim()) return safeClients;
    const q = userSearch.toLowerCase();
    return safeClients.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [safeClients, userSearch]);

  const filteredDeliveryAgents = useMemo(() => {
    if (!userSearch.trim()) return safeDeliveryAgents;
    const q = userSearch.toLowerCase();
    return safeDeliveryAgents.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [safeDeliveryAgents, userSearch]);

  const filteredAdmins = useMemo(() => {
    if (!userSearch.trim()) return safeAdmins;
    const q = userSearch.toLowerCase();
    return safeAdmins.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [safeAdmins, userSearch]);

  // Compute live real-time statistics
  const computedStats: DashboardStats = useMemo(() => {
    if (serverStats) return serverStats;
    return statsApi.computeFromLocalData(safeOrders, safeDishes, safeUsers);
  }, [serverStats, safeOrders, safeDishes, safeUsers]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'ALL') return safeOrders;
    if (orderStatusFilter === 'READY_FOR_DELIVERY') {
      return safeOrders.filter(
        (o) => o.status === 'READY_FOR_DELIVERY' || (o.status as string) === 'READY'
      );
    }
    return safeOrders.filter((o) => o.status === orderStatusFilter);
  }, [safeOrders, orderStatusFilter]);

  // Filtered dishes list for admin dishes tab
  const filteredDishes = useMemo(() => {
    return safeDishes.filter((dish) => {
      const matchesCategory =
        dishCategoryFilter === 'ALL' ||
        dish.categoryId === dishCategoryFilter ||
        dish.category?.id === dishCategoryFilter;
      const matchesSearch =
        !dishSearchQuery.trim() ||
        dish.name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(dishSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [safeDishes, dishCategoryFilter, dishSearchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Julien's Food
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          {/* Quick Stats overview pill */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700">
              {safeOrders.length} Commandes
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
              {safeDishes.length} Plats
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
              {safeUsers.length} Comptes
            </span>
          </div>
        </div>
      </div>

      {/* Global Error Banner if any */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadAllData}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shrink-0"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Global Toast / Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Vue d'Ensemble & KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Commandes ({safeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dishes')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'dishes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Plats ({safeDishes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catégories ({safeCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Utilisateurs & Livreurs ({safeUsers.length})</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-600">Chargement des données du tableau de bord...</p>
        </div>
      )}

      {/* TAB 0: VUE D'ENSEMBLE & KPIS */}
      {!loading && activeTab === 'overview' && (
        <AdminAnalyticsView
          stats={computedStats}
          totalOrdersCount={safeOrders.length}
          onFilterStatusSelect={(st) => {
            setOrderStatusFilter(st);
            setActiveTab('orders');
          }}
        />
      )}

      {/* TAB 1: COMMANDES */}
      {!loading && activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Flux des Commandes
              </h2>
              <p className="text-xs text-slate-500">
                Avancez le statut de chaque commande ou assignez un livreur disponible.
              </p>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setOrderStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tous ({safeOrders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                En attente ({computedStats.orderCountsByStatus.PENDING || 0})
              </button>
              <button
                onClick={() => setOrderStatusFilter('CONFIRMED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'CONFIRMED'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                Confirmées ({computedStats.orderCountsByStatus.CONFIRMED || 0})
              </button>
              <button
                onClick={() => setOrderStatusFilter('PREPARING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'PREPARING'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                En cuisine ({computedStats.orderCountsByStatus.PREPARING || 0})
              </button>
              <button
                onClick={() => setOrderStatusFilter('READY_FOR_DELIVERY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'READY_FOR_DELIVERY'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                }`}
              >
                Prêtes ({computedStats.orderCountsByStatus.READY_FOR_DELIVERY ?? computedStats.orderCountsByStatus.READY ?? 0})
              </button>
              <button
                onClick={() => setOrderStatusFilter('OUT_FOR_DELIVERY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'OUT_FOR_DELIVERY'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                En cours ({computedStats.orderCountsByStatus.OUT_FOR_DELIVERY || 0})
              </button>
              <button
                onClick={() => setOrderStatusFilter('DELIVERED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'DELIVERED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Livrées ({computedStats.orderCountsByStatus.DELIVERED || 0})
              </button>
              <button
                onClick={() => setOrderStatusFilter('CANCELLED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderStatusFilter === 'CANCELLED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Annulées ({computedStats.orderCountsByStatus.CANCELLED || 0})
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Aucune commande trouvée</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {orderStatusFilter === 'ALL'
                  ? "Les nouvelles commandes passées par vos clients à Douala apparaîtront automatiquement ici en temps réel."
                  : "Aucune commande ne correspond au filtre de statut sélectionné."}
              </p>
              {orderStatusFilter !== 'ALL' && (
                <button
                  onClick={() => setOrderStatusFilter('ALL')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Afficher toutes les commandes
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
              const statusStyle = ORDER_STATUS_STYLES[order.status];
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-extrabold text-blue-900">
                        Commande #{order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>

                      <span className="font-display text-base font-extrabold text-blue-700">
                        {formatFCFA(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 space-y-1 text-xs">
                      <p className="font-bold text-slate-700">Lieu de livraison :</p>
                      <p className="text-slate-600">{order.deliveryAddressSnapshot}</p>

                      {order.delivery?.agent && (
                        <div className="pt-2 flex items-center gap-2 text-blue-700 font-semibold">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Livreur assigné : {order.delivery.agent.firstName} {order.delivery.agent.lastName} ({order.delivery.agent.phone})</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-2 pt-2 md:pt-0">
                      {/* State Machine Transition Actions */}
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            Confirmer la commande
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition"
                          >
                            Annuler
                          </button>
                        </>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <span>Lancer la préparation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_DELIVERY')}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <span>Plats prêts pour livraison</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {order.status === 'READY_FOR_DELIVERY' && (
                        <button
                          onClick={() => {
                            setAssignDeliveryModal(order);
                            setSelectedAgentId(deliveryAgents[0]?.id || '');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition animate-pulse"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Assigner un Livreur</span>
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marquer comme livrée</span>
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Commande terminée
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* TAB 2: PLATS */}
      {!loading && activeTab === 'dishes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Gestion des Plats & Menu
              </h2>
              <p className="text-xs text-slate-500">
                Ajoutez, modifiez ou activez/désactivez la disponibilité des plats.
              </p>
            </div>

            <button
              onClick={openCreateDishModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Plat</span>
            </button>
          </div>

          {/* Filtre par Catégorie et Recherche */}
          {safeDishes.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Sélecteur de Catégorie */}
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    Filtrer par catégorie :
                  </span>
                  <select
                    id="admin-dish-category-filter-select"
                    value={dishCategoryFilter}
                    onChange={(e) => setDishCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                  >
                    <option value="ALL">Toutes les catégories ({safeDishes.length})</option>
                    {safeCategories.map((cat) => {
                      const count = safeDishes.filter(
                        (d) => d.categoryId === cat.id || d.category?.id === cat.id
                      ).length;
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({count})
                        </option>
                      );
                    })}
                  </select>

                  {(dishCategoryFilter !== 'ALL' || dishSearchQuery) && (
                    <button
                      onClick={() => {
                        setDishCategoryFilter('ALL');
                        setDishSearchQuery('');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Réinitialiser
                    </button>
                  )}
                </div>

                {/* Recherche textuelle rapide */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dishSearchQuery}
                    onChange={(e) => setDishSearchQuery(e.target.value)}
                    placeholder="Rechercher un plat..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Boutons Pills de Catégories pour accès rapide */}
              {safeCategories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1 scrollbar-none">
                  <button
                    onClick={() => setDishCategoryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      dishCategoryFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Toutes</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        dishCategoryFilter === 'ALL'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {safeDishes.length}
                    </span>
                  </button>
                  {safeCategories.map((cat) => {
                    const count = safeDishes.filter(
                      (d) => d.categoryId === cat.id || d.category?.id === cat.id
                    ).length;
                    const isSelected = dishCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setDishCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {safeDishes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Utensils className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Aucun plat dans le menu</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Créez vos premiers plats gastronomiques camerounais pour enrichir la carte.
                </p>
              </div>
              <button
                onClick={openCreateDishModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un premier plat</span>
              </button>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Aucun plat trouvé
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Aucun plat ne correspond à la catégorie sélectionnée ou à votre recherche.
                </p>
              </div>
              <button
                onClick={() => {
                  setDishCategoryFilter('ALL');
                  setDishSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <span>Afficher tous les plats</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/9 bg-slate-100">
                      {getDishImageUrl(dish.imageUrl) ? (
                        <img
                          src={getDishImageUrl(dish.imageUrl)!}
                          alt={dish.name}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover ${!dish.isAvailable ? 'grayscale opacity-60' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-slate-800 p-4 text-center">
                          <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-1.5 shadow-xs">
                            <UtensilsCrossed className="w-5 h-5" />
                          </div>
                          <span className="font-display font-bold text-xs text-slate-900 line-clamp-1">
                            {dish.name}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleToggleDishAvailability(dish)}
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center gap-1 shadow-xs transition ${
                          dish.isAvailable
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-slate-900/90 text-white'
                        }`}
                      >
                        {dish.isAvailable ? (
                          <>
                            <Eye className="w-3 h-3" /> Disponible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Épuisé
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-bold text-sm text-slate-900 line-clamp-1">
                          {dish.name}
                        </h3>
                        <span className="font-display font-extrabold text-blue-700 text-sm shrink-0">
                          {formatFCFA(dish.price)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {dish.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {safeCategories.find((c) => c.id === dish.categoryId)?.name || 'Catégorie'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditDishModal(dish)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {!loading && activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Gestion des Catégories
              </h2>
              <p className="text-xs text-slate-500">
                Organisez la carte de votre restaurant à Douala.
              </p>
            </div>

            <button
              onClick={openCreateCategoryModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Catégorie</span>
            </button>
          </div>

          {safeCategories.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Aucune catégorie créée</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Structurez vos plats par famille (ex: Grillades, Plats Traditionnels, Boissons).
                </p>
              </div>
              <button
                onClick={openCreateCategoryModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Créer une catégorie</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      {getCategoryImageUrl(cat.image) ? (
                        <img
                          src={getCategoryImageUrl(cat.image)!}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-900">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {safeDishes.filter((d) => d.categoryId === cat.id).length} plats associés
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCategoryModal(cat)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS & LIVREURS (3 ONGLETS SÉPARÉS) */}
      {!loading && activeTab === 'users' && (
        <div className="space-y-6">
          {/* Entête de section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Gestion des Utilisateurs
              </h2>
              <p className="text-xs text-slate-500">
                Organisation segmentée par endpoints dédiés : Clients, Livreurs et Administrateurs.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={loadUsersData}
                disabled={userLoading}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Actualiser les listes d'utilisateurs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${userLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span>Actualiser</span>
              </button>

              <button
                onClick={() => openCreateUserModal('DELIVERY_AGENT')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer un compte Staff</span>
              </button>
            </div>
          </div>


          {/* 3 Onglets sémantiques distincts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
              <button
                onClick={() => setUserSubTab('clients')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  userSubTab === 'clients'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Clients</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    userSubTab === 'clients'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {safeClients.length}
                </span>
              </button>

              <button
                onClick={() => setUserSubTab('delivery')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  userSubTab === 'delivery'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Livreurs</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    userSubTab === 'delivery'
                      ? 'bg-sky-50 text-sky-600 border border-sky-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {safeDeliveryAgents.length}
                </span>
              </button>

              <button
                onClick={() => setUserSubTab('admins')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  userSubTab === 'admins'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Administrateurs</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    userSubTab === 'admins'
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {safeAdmins.length}
                </span>
              </button>
            </div>

            {/* Champ de recherche pour l'onglet actif */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  userSubTab === 'clients'
                    ? 'Filtrer clients...'
                    : userSubTab === 'delivery'
                    ? 'Filtrer livreurs...'
                    : 'Filtrer administrateurs...'
                }
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
              />
            </div>
          </div>

          {/* VUE 1 : CLIENTS */}
          {userSubTab === 'clients' && (
            <UserTable
              users={filteredClients}
              roleType="CLIENT"
              emptyTitle="Aucun client trouvé"
              emptyMessage={
                userSearch
                  ? 'Aucun client ne correspond à votre filtre de recherche.'
                  : 'La route GET /api/users/clients ne contient aucun client actuellement.'
              }
            />
          )}

          {/* VUE 2 : LIVREURS */}
          {userSubTab === 'delivery' && (
            <UserTable
              users={filteredDeliveryAgents}
              roleType="DELIVERY_AGENT"
              onUpdateRole={handleUpdateUserRole}
              emptyTitle="Aucun livreur enregistré"
              emptyMessage={
                userSearch
                  ? 'Aucun livreur ne correspond à votre filtre de recherche.'
                  : "Créez un compte livreur pour assigner des commandes Julien's Food."
              }
              onCreateClick={() => openCreateUserModal('DELIVERY_AGENT')}
              createButtonLabel="Créer un compte livreur"
            />
          )}

          {/* VUE 3 : ADMINISTRATEURS */}
          {userSubTab === 'admins' && (
            <UserTable
              users={filteredAdmins}
              roleType="ADMIN"
              onUpdateRole={handleUpdateUserRole}
              emptyTitle="Aucun administrateur trouvé"
              emptyMessage={
                userSearch
                  ? 'Aucun administrateur ne correspond à votre filtre de recherche.'
                  : 'Créez un compte administrateur pour la gestion du restaurant.'
              }
              onCreateClick={() => openCreateUserModal('ADMIN')}
              createButtonLabel="Créer un administrateur"
            />
          )}
        </div>
      )}

      {/* MODAL: ASSIGN DELIVERY AGENT */}
      {assignDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Assigner un Livreur (Commande #{assignDeliveryModal.orderNumber})
              </h3>
              <button
                onClick={() => setAssignDeliveryModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Sélectionnez le coursier Julien's Food pour acheminer cette commande à :
              </p>
              <div className="p-3 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800">
                {assignDeliveryModal.deliveryAddressSnapshot}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Livreur disponible
                </label>
                <div className="space-y-2">
                  {deliveryAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        selectedAgentId === agent.id
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {agent.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {agent.firstName} {agent.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500">{agent.phone}</p>
                        </div>
                      </div>

                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setAssignDeliveryModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignDelivery}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Valider et envoyer le coursier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT DISH */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {editingDish ? 'Modifier le plat' : 'Ajouter un nouveau plat'}
              </h3>
              <button
                onClick={() => setDishModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom du plat
                </label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Ex: Ndolè Royal aux Crevettes"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prix (en FCFA)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={100}
                    value={dishPrice}
                    onChange={(e) => setDishPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Catégorie
                  </label>
                  <select
                    value={dishCategoryId}
                    onChange={(e) => setDishCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Détaillez les ingrédients et accompagnements..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image du plat
                </label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={dishImageUrl}
                      onChange={(e) => setDishImageUrl(e.target.value)}
                      placeholder="https://... ou téléversez un fichier"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <label className={`px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition flex items-center gap-1.5 shrink-0 ${isUploadingDishImg ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploadingDishImg ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{isUploadingDishImg ? 'Upload...' : 'Fichier'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadDishImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {dishImageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <img
                        src={dishImageUrl}
                        alt="Aperçu"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                      />
                      <span className="text-[11px] text-slate-500 truncate flex-1">{dishImageUrl}</span>
                      <button
                        type="button"
                        onClick={() => setDishImageUrl('')}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dishAvailCheck"
                  checked={dishIsAvailable}
                  onChange={(e) => setDishIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="dishAvailCheck" className="text-xs font-medium text-slate-700">
                  Plat disponible à la commande
                </label>
              </div>

              {/* Bandeau d'alerte rouge d'erreur isolé dans le formulaire */}
              {dishLocalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed whitespace-pre-line">{dishLocalError}</div>
                  <button
                    type="button"
                    onClick={() => setDishLocalError(null)}
                    className="text-rose-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                    title="Fermer l'alerte"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingDish ? 'Enregistrer les modifications' : 'Ajouter le plat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT CATEGORY */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Poissons Braisés"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image de la catégorie (optionnel)
                </label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={categoryImageUrl}
                      onChange={(e) => setCategoryImageUrl(e.target.value)}
                      placeholder="https://... ou téléversez un fichier"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <label className={`px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition flex items-center gap-1.5 shrink-0 ${isUploadingCatImg ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploadingCatImg ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{isUploadingCatImg ? 'Upload...' : 'Fichier'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCategoryImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {(catImagePreview || categoryImageUrl) && (
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="relative w-12 h-12 shrink-0">
                        <img
                          src={catImagePreview || getCategoryImageUrl(categoryImageUrl) || categoryImageUrl}
                          alt="Aperçu"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white"
                        />
                        {isUploadingCatImg && (
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-slate-700 font-medium truncate block">
                          {categoryImageUrl ? (categoryImageUrl.startsWith('data:') ? 'Image chargée (local)' : categoryImageUrl) : 'Téléversement en cours...'}
                        </span>
                        {isUploadingCatImg ? (
                          <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                            Envoi au serveur en cours...
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Prêt pour l'enregistrement
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryImageUrl('');
                          setCatImagePreview('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Retirer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bandeau d'alerte rouge d'erreur isolé dans le formulaire */}
              {categoryLocalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed whitespace-pre-line">{categoryLocalError}</div>
                  <button
                    type="button"
                    onClick={() => setCategoryLocalError(null)}
                    className="text-rose-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                    title="Fermer l'alerte"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingCategory ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE USER WITH ROLE */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in overflow-hidden">
            {/* En-tête fixe */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Créer un compte utilisateur
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ajout d'un compte Administrateur ou Livreur
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col flex-1 min-h-0">
              {/* Corps avec barre de défilement verticale */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      required
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="Paul"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      required
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="Biya"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="livreur.paul@juliensfood.cm"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Téléphone (Douala / Cameroun)
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+237 690 00 00 00 ou 06..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nettoyé automatiquement en format strict E.164 (+237...). Les numéros locaux commençant par 0 (ex: 06...) sont automatiquement convertis.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mot de passe (optionnel / selon votre API)
                  </label>
                  <div className="relative">
                    <input
                      type={showUserPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ex: MotDePasse123! (si exigé par votre serveur)"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      title={showUserPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Si votre API requiert un mot de passe initial pour créer un compte, renseignez-le ici.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Rôle attribué
                    </label>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      CLIENT non autorisé
                    </span>
                  </div>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminAssignableRole)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DELIVERY_AGENT">DELIVERY_AGENT (Livreur Julien's Food)</option>
                    <option value="ADMIN">ADMIN (Administrateur Restaurant)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Conformément aux règles de sécurité, les clients s'inscrivent uniquement en autonomie.
                  </p>
                </div>

                {/* Bandeau d'alerte rouge d'erreur isolé dans le formulaire */}
                {userLocalError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in shadow-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium leading-relaxed whitespace-pre-line">
                      {userLocalError}
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserLocalError(null)}
                      className="text-rose-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                      title="Fermer l'alerte"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Pied de page d'action fixe */}
              <div className="p-4 px-6 flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
