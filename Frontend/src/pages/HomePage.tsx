import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Search,
  Flame,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Check,
  X,
  Minus,
  UtensilsCrossed,
  Eye,
  LayoutDashboard,
  Truck,
  Fish,
  Soup,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { categoryApi } from '../api/category.api';
import { dishApi } from '../api/dish.api';
import { Category, Dish } from '../types';
import { DishCard } from '../components/common/DishCard';
import { formatFCFA } from '../utils/format';
import { getDishImageUrl, getCategoryImageUrl } from '../utils/image';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { useAuthNoticeStore } from '../store/authNotice.store';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const isDelivery = isAuthenticated && user?.role === 'DELIVERY_AGENT';
  const isStaffReadOnly = isAdmin || isDelivery;

  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickViewDish, setQuickViewDish] = useState<Dish | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { addItem, isLoading: cartLoading } = useCartStore();
  const { triggerAuthNotice } = useAuthNoticeStore();

  useEffect(() => {
    loadData();
  }, [selectedCategoryId]);

  // Reset page to 1 whenever category or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const catsPromise =
        categories.length === 0
          ? categoryApi.getAll()
          : Promise.resolve(categories);

      const dishesPromise = dishApi.getAll(
        selectedCategoryId
          ? { categoryId: selectedCategoryId }
          : { limit: 100 }
      );

      const [catsRes, dishesRes] = await Promise.all([
        catsPromise,
        dishesPromise,
      ]);

      if (categories.length === 0) {
        setCategories(Array.isArray(catsRes) ? catsRes : (catsRes as any)?.data || []);
      }

      // L'API GET /dishes renvoie { data: Dish[], meta: any }
      let dishesArray: Dish[] = [];
      if (
        dishesRes &&
        typeof dishesRes === 'object' &&
        'data' in dishesRes &&
        Array.isArray((dishesRes as any).data)
      ) {
        dishesArray = (dishesRes as any).data;
      } else if (Array.isArray(dishesRes)) {
        dishesArray = dishesRes;
      } else if (
        dishesRes &&
        typeof dishesRes === 'object' &&
        Array.isArray((dishesRes as any)?.data?.data)
      ) {
        dishesArray = (dishesRes as any).data.data;
      }
      setDishes(dishesArray);
    } catch (err) {
      console.error('Erreur chargement catalogue', err);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const safeDishes = Array.isArray(dishes) ? dishes : [];

  const filteredDishes = safeDishes.filter((dish) => {
    if (!dish) return false;
    if (selectedCategoryId) {
      const dishCatId = dish.categoryId || dish.category?.id;
      if (dishCatId !== selectedCategoryId) return false;
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      (dish.name || '').toLowerCase().includes(query) ||
      (dish.description || '').toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredDishes.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDishes = filteredDishes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    const element = document.getElementById('dishes-catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleModalAddToCart = async () => {
    if (isStaffReadOnly || !quickViewDish) return;
    try {
      await addItem(quickViewDish.id, modalQty, quickViewDish);
      setQuickViewDish(null);
      setModalQty(1);
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryFallbackIcon = (name: string) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('poisson') || lower.includes('mer') || lower.includes('capitaine') || lower.includes('bar') || lower.includes('crevette')) {
      return <Fish className="w-5 h-5" />;
    }
    if (lower.includes('grill') || lower.includes('brais') || lower.includes('viande') || lower.includes('poulet') || lower.includes('boeuf')) {
      return <Flame className="w-5 h-5" />;
    }
    if (lower.includes('boisson') || lower.includes('jus') || lower.includes('cocktail') || lower.includes('vin') || lower.includes('biere') || lower.includes('bière')) {
      return <Coffee className="w-5 h-5" />;
    }
    if (lower.includes('tradition') || lower.includes('local') || lower.includes('sauce') || lower.includes('ndole') || lower.includes('taro') || lower.includes('eru')) {
      return <Soup className="w-5 h-5" />;
    }
    if (lower.includes('dessert') || lower.includes('douceur') || lower.includes('gateau') || lower.includes('gâteau')) {
      return <Sparkles className="w-5 h-5" />;
    }
    return <UtensilsCrossed className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      {/* Staff Consultation Banner for Admin and Delivery Agent */}
      {isStaffReadOnly && (
        <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-20 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Mode Consultation {isAdmin ? 'Administrateur' : 'Livreur'}
                </span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-slate-300">
                  Vous consultez la carte en lecture seule. Les ajouts au panier et commandes sont réservés aux clients.
                </span>
              </div>
            </div>

            <Link
              to={isAdmin ? '/admin' : '/delivery'}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              {isAdmin ? <LayoutDashboard className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
              <span>{isAdmin ? 'Retour au Dashboard' : 'Retour à mes Livraisons'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/60">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-amber-300 text-xs font-bold backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="tracking-wide">L'Excellence Culinaire de Douala</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Bienvenue chez Julien's Food, la toute nouvelle reference culinaire du coin.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                vous allez decouvrir un menu varies avec de la cuisine camerounaise,europeene et bien d'autres
              </p>

              {/* Douala Trust Badges */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Livraison rapide 30-45 min</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">Tout Douala (Akwa, Bonapriso...)</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Paiement 100% sécurisé</span>
                </div>
              </div>

              {/* Search Box with Suggestions */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0 space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un plat (Ndolè, Poulet DG, Poisson braisé...)"
                    className="w-full pl-12 pr-10 py-4 bg-white/95 text-slate-950 rounded-2xl shadow-xl text-sm font-medium focus:outline-none focus:ring-3 focus:ring-blue-500 focus:bg-white placeholder:text-slate-400 border border-white/20 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick suggestions pills */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 justify-center lg:justify-start">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Populaire :</span>
                  {['Ndolè', 'Eru', 'napolitaine', 'Koki', 'Poulet DG'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setSearchQuery(keyword)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors text-[11px] font-semibold cursor-pointer"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Visual Card (Specialty of the day) */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative group bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-4 ring-1 ring-white/10">
                <div className="relative rounded-2xl overflow-hidden aspect-16/10 shadow-lg">
                  <img
                    src="https://res.cloudinary.com/tbygpchx/image/upload/v1788391631/camerounais.jpg"
                    alt="Spécialité du chef"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
        {/* Modern Aesthetic Categories Showcase */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-200/50 border border-slate-200/80 mb-10 ring-1 ring-black/[0.02]">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="font-display text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">
                Nos Univers Culinaires
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                {categories.length + 1} univers
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedCategoryId && (
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-100"
                >
                  <span className="hidden sm:inline">Afficher toute la carte</span>
                  <span className="sm:hidden">Tous</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Navigation arrows for categories */}
              <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 sm:p-1 rounded-xl border border-slate-200/70">
                <button
                  type="button"
                  id="cat-scroll-left-btn"
                  onClick={() => scrollCategories('left')}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-white transition cursor-pointer shadow-none hover:shadow-xs active:scale-95"
                  title="Défiler vers la gauche"
                  aria-label="Défiler vers la gauche"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="cat-scroll-right-btn"
                  onClick={() => scrollCategories('right')}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-white transition cursor-pointer shadow-none hover:shadow-xs active:scale-95"
                  title="Défiler vers la droite"
                  aria-label="Défiler vers la droite"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Carousel Strip */}
          <div
            ref={categoryScrollRef}
            className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
          >
            {/* Master card: Toute la carte */}
            <button
              id="filter-category-all"
              onClick={() => setSelectedCategoryId(null)}
              className={`shrink-0 min-w-[140px] sm:min-w-[160px] p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer group select-none ${
                selectedCategoryId === null
                  ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-950/20 ring-2 ring-blue-500/40 -translate-y-0.5'
                  : 'bg-slate-50/80 hover:bg-white text-slate-800 border-slate-200/80 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    selectedCategoryId === null
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 shadow-xs border border-slate-200/70 group-hover:text-blue-600 group-hover:border-blue-200'
                  }`}
                >
                  <Utensils className="w-5 h-5 text-amber-400" />
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    selectedCategoryId === null
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                  }`}
                >
                  {safeDishes.length}
                </span>
              </div>
              <div>
                <span className="font-display font-black text-xs sm:text-sm block tracking-tight leading-snug">
                  Toute la carte
                </span>
                <span
                  className={`text-[10px] font-medium block mt-0.5 ${
                    selectedCategoryId === null ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  Tous les délices
                </span>
              </div>
            </button>

            {/* Individual Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const catImageResolved = getCategoryImageUrl(cat.image);
              const countInCat = safeDishes.filter(
                (d) => d.categoryId === cat.id || d.category?.id === cat.id
              ).length;

              return (
                <button
                  key={cat.id}
                  id={`filter-category-${cat.id}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`shrink-0 min-w-[140px] sm:min-w-[160px] p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer group select-none ${
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-950/20 ring-2 ring-blue-500/40 -translate-y-0.5'
                      : 'bg-slate-50/80 hover:bg-white text-slate-800 border-slate-200/80 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 shadow-xs border border-slate-200/70 group-hover:text-blue-600 group-hover:border-blue-200'
                      }`}
                    >
                      {catImageResolved ? (
                        <img
                          src={catImageResolved}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getCategoryFallbackIcon(cat.name)
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                      }`}
                    >
                      {countInCat}
                    </span>
                  </div>
                  <div>
                    <span className="font-display font-black text-xs sm:text-sm block tracking-tight leading-snug line-clamp-1">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[10px] font-medium block mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {countInCat > 1 ? `${countInCat} spécialités` : `${countInCat} spécialité`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Header */}
        <div id="dishes-catalog-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 scroll-mt-24">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {selectedCategoryId
                  ? categories.find((c) => c.id === selectedCategoryId)?.name
                  : 'Nos Plats & Spécialités'}
              </h2>
              <span className="text-xs font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                {filteredDishes.length} {filteredDishes.length > 1 ? 'plats' : 'plat'}
              </span>
              {totalPages > 1 && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60 hidden sm:inline-block">
                  Page {currentPage} sur {totalPages}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Préparés frais à la commande avec les meilleurs ingrédients des marchés de Douala
            </p>
          </div>

          {(selectedCategoryId || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSearchQuery('');
              }}
              className="self-start sm:self-auto text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-slate-200/70 p-4 space-y-4 animate-pulse shadow-xs"
              >
                <div className="aspect-4/3 bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3.5 bg-slate-100 rounded-md w-full" />
                <div className="h-3.5 bg-slate-100 rounded-md w-2/3" />
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="h-6 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-9 bg-slate-200 rounded-xl w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDishes.length === 0 ? (
          /* Empty Search or Filter */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-1.5">
              Aucun plat trouvé
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Nous n'avons pas trouvé de plat correspondant à votre recherche. Essayez un autre terme ou explorez toute la carte de nos spécialités.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
              }}
              className="px-5 py-2.5 bg-slate-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Afficher toute la carte
            </button>
          </div>
        ) : (
          <div>
            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onQuickView={(d) => {
                    setQuickViewDish(d);
                    setModalQty(1);
                  }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-slate-200/80 flex items-center justify-center">
                <div className="flex items-center gap-1.5">
                  {/* Previous Button */}
                  <button
                    id="pagination-prev-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-950 text-slate-700 active:scale-95"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Précédent</span>
                  </button>

                  {/* Page Number Buttons */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold text-xs select-none">
                            ...
                          </span>
                        );
                      }
                      const pageNum = p as number;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          id={`pagination-page-${pageNum}-btn`}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-9 h-9 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20'
                              : 'text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:text-slate-950'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    id="pagination-next-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-950 text-slate-700 active:scale-95"
                    aria-label="Page suivante"
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dish Quick View Modal */}
      {quickViewDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200">
            {/* Modal Image */}
            <div className="relative aspect-16/10 bg-slate-100">
              {getDishImageUrl(quickViewDish.imageUrl || quickViewDish.image) ? (
                <img
                  src={getDishImageUrl(quickViewDish.imageUrl || quickViewDish.image)!}
                  alt={quickViewDish.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-slate-800 p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-2.5 shadow-xs">
                    <UtensilsCrossed className="w-7 h-7" />
                  </div>
                  <span className="font-display font-bold text-xl text-slate-900">
                    {quickViewDish.name}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

              <button
                onClick={() => setQuickViewDish(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition cursor-pointer backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              {quickViewDish.category && (
                <div className="absolute top-4 left-4 bg-white/95 text-slate-900 text-xs font-black px-3 py-1 rounded-xl backdrop-blur-md shadow-xs">
                  {quickViewDish.category.name}
                </div>
              )}
            </div>

            {/* Modal Info */}
            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-black text-slate-950 tracking-tight leading-tight">
                    {quickViewDish.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-slate-500 font-medium">
                      Restaurant Julien's Food
                    </span>
                    <span className="text-xs text-blue-600 font-bold">
                      • Douala (Cameroun)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Prix
                  </span>
                  <span className="font-display text-2xl font-black text-slate-950 whitespace-nowrap">
                    {formatFCFA(quickViewDish.price)}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-3.5">
                {quickViewDish.description ||
                  'Préparé avec des ingrédients frais du terroir camerounais, assaisonné aux épices traditionnelles pour une dégustation gourmande et mémorable.'}
              </p>

              {/* Quantity and Add to Cart */}
              {isStaffReadOnly ? (
                <div className="pt-2">
                  <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-medium flex items-center gap-3">
                    <Eye className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-bold">Mode consultation {isAdmin ? 'administrateur' : 'livreur'} :</strong> Vous visualisez la fiche plat en lecture seule. Les ajouts au panier et commandes sont réservés aux clients.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                    <button
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="p-2.5 hover:bg-white text-slate-700 rounded-xl transition cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-black text-sm text-slate-900">
                      {modalQty}
                    </span>
                    <button
                      onClick={() => setModalQty(modalQty + 1)}
                      className="p-2.5 hover:bg-white text-slate-700 rounded-xl transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleModalAddToCart}
                    disabled={!quickViewDish.isAvailable || cartLoading}
                    className="flex-1 py-4 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition active:scale-98 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      Ajouter au Panier • {formatFCFA(quickViewDish.price * modalQty)}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
