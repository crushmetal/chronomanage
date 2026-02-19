import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Watch, Plus, TrendingUp, Trash2, Edit2, Camera, X,
  Search, AlertCircle,
  Package, DollarSign, FileText, Box, Loader2,
  ChevronLeft, ClipboardList, WifiOff, Ruler, Calendar, LogIn, LogOut, User, AlertTriangle, MapPin, Droplets, ShieldCheck, Layers, Wrench, Activity, Heart, Download, ExternalLink, Settings, Grid, ArrowUpDown, Shuffle, Save, Copy, Palette, RefreshCw, Users, UserPlus, Share2, Filter, Eye, EyeOff, Bell, Check, Zap, Gem, Image as ImageIcon, ZoomIn, Battery, ShoppingCart, BookOpen, Gift, Star, Scale, Lock, ChevronRight, BarChart2, Coins, Moon, Sun, Globe, Clock, PieChart, Briefcase, Printer, Link as LinkIcon, History, Receipt
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, getDocs, where, addDoc, updateDoc } from 'firebase/firestore';

// ==========================================================================
// CONFIGURATION & DICTIONNAIRE
// ==========================================================================

const TRANSLATIONS = {
  fr: {
    box: "Coffre",
    list: "Liste",
    wishlist: "Souhaits",
    finance: "Finance",
    stats: "Stats",
    gallery: "Galerie",
    myWatches: "Mes Montres",
    pieces: "pièces",
    piece: "pièce",
    search: "Rechercher...",
    collection: "Ma Collection",
    forsale: "En Vente",
    sold: "Vendues",
    bracelets: "Bracelets",
    settings: "Paramètres",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    total_value: "Valeur Totale",
    profit: "Plus-value",
    brand: "Marque",
    model: "Modèle",
    reference: "Référence",
    year: "Année Modèle", // Changed
    price: "Prix",
    add_new: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Sauvegarder",
    cancel: "Annuler",
    notes: "Notes",
    history: "Histoire",
    history_brand: "Histoire Marque",
    history_model: "Histoire Modèle",
    specs: "Caractéristiques",
    unknown: "Inconnu",
    total_displayed: "montres affichées",
    login_google: "Connexion Google",
    logout: "Déconnexion",
    config_cloud: "Config Cloud",
    export_csv: "Exporter CSV",
    filter_all: "Tout",
    all: "Tout", 
    inventory: "Inventaire",
    friends: "Amis",
    requests: "Demandes",
    limited_edition: "EDITION LIMITÉE",
    movement: "Mouvement",
    movement_model: "Calibre/Modèle",
    manual: "Manuel",
    automatic: "Automatique",
    quartz: "Quartz",
    diameter: "Diamètre",
    thickness: "Épaisseur",
    lug_width: "Entre-corne",
    water_res: "Étanchéité",
    glass: "Verre",
    dial: "Cadran",
    country: "Pays",
    box_included: "Boîte",
    warranty: "Garantie",
    revision: "Révision",
    battery: "Pile",
    weight: "Poids",
    visibility_friends: "Visible par les amis",
    private_note: "Si décoché, cette montre restera privée.",
    move_collection: "J'ai obtenu cette montre !",
    set_main_image: "Définir principale",
    add_photo: "Ajouter",
    link_web: "Lien Web",
    visit_site: "Visiter le site marchand",
    purchase_price: "Prix Achat",
    selling_price: "Prix Vente/Estim",
    min_price: "Prix Min (Privé)",
    clock_style: "Style Horloge",
    box_style: "Style Coffre",
    color_digital: "Heure Digitale",
    color_h_hand: "Aig. Heures",
    color_m_hand: "Aig. Minutes",
    color_s_hand: "Aig. Secondes",
    color_index: "Index",
    color_leather: "Cuir Extérieur",
    color_interior: "Intérieur",
    color_cushion: "Cushions",
    top_worn: "Top Portées",
    calendar: "Calendrier",
    month: "Mois",
    all_time: "Tout",
    fav_brands: "Marques Favorites",
    fav_dials: "Couleurs Cadran",
    finance_timeline: "Chronologie Financière",
    spent: "Dépenses",
    gained: "Gains",
    balance: "Bilan",
    identity: "Identité",
    origin_maintenance: "Origine & Entretien",
    technical: "Technique",
    financial_status: "Finances & Statut",
    date_purchase: "Date d'Achat",
    date_sold: "Date de Vente",
    market_value: "Estimation du Marché",
    find_used: "Trouver d'Occasion",
    export_sheet: "Fiches & Documents",
    sheet_insurance: "Fiche Assurance",
    sheet_sale: "Fiche de Vente",
    print: "Imprimer",
    condition_rating: "État (1-10)",
    condition_comment: "Commentaire sur l'état",
    show_history: "Voir tout l'historique",
    show_less: "Réduire",
    year_summary: "Bilan Année",
    stats_usage: "Statistiques d'Usage",
    worn_this_month: "Ce mois",
    worn_this_year: "Cette année",
    worn_last_year: "Année dernière",
    invoice: "Facture",
    add_invoice: "Ajouter Facture",
    view_invoice: "Voir Facture"
  },
  en: {
    box: "Box",
    list: "List",
    wishlist: "Wishlist",
    finance: "Finances",
    stats: "Statistics",
    gallery: "Gallery",
    myWatches: "My Watches",
    pieces: "pieces",
    piece: "piece",
    search: "Search...",
    collection: "Collection",
    forsale: "For Sale",
    sold: "Sold",
    bracelets: "Straps",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    total_value: "Total Value",
    profit: "Profit",
    brand: "Brand",
    model: "Model",
    reference: "Reference",
    year: "Model Year", // Changed
    price: "Price",
    add_new: "Add New",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    notes: "Notes",
    history: "History",
    history_brand: "Brand History",
    history_model: "Model History",
    specs: "Specifications",
    unknown: "Unknown",
    total_displayed: "watches displayed",
    login_google: "Google Login",
    logout: "Logout",
    config_cloud: "Cloud Config",
    export_csv: "Export CSV",
    filter_all: "All",
    all: "All",
    inventory: "Inventory",
    friends: "Friends",
    requests: "Requests",
    limited_edition: "LIMITED EDITION",
    movement: "Movement",
    movement_model: "Caliber/Model",
    manual: "Manual",
    automatic: "Automatic",
    quartz: "Quartz",
    diameter: "Diameter",
    thickness: "Thickness",
    lug_width: "Lug Width",
    water_res: "Water Res.",
    glass: "Glass",
    dial: "Dial",
    country: "Country",
    box_included: "Box",
    warranty: "Warranty",
    revision: "Service",
    battery: "Battery",
    weight: "Weight",
    visibility_friends: "Visible to friends",
    private_note: "If unchecked, stays private.",
    move_collection: "I got this watch!",
    set_main_image: "Set as main",
    add_photo: "Add",
    link_web: "Web Link",
    visit_site: "Visit Website",
    purchase_price: "Purchase Price",
    selling_price: "Selling/Estim Price",
    min_price: "Min Price (Private)",
    clock_style: "Clock Style",
    box_style: "Box Style",
    color_digital: "Digital Time",
    color_h_hand: "Hour Hand",
    color_m_hand: "Minute Hand",
    color_s_hand: "Second Hand",
    color_index: "Indexes",
    color_leather: "Outer Leather",
    color_interior: "Interior",
    color_cushion: "Cushions",
    top_worn: "Top Worn",
    calendar: "Calendar",
    month: "Month",
    all_time: "All Time",
    fav_brands: "Favorite Brands",
    fav_dials: "Dial Colors",
    finance_timeline: "Financial Timeline",
    spent: "Spent",
    gained: "Gained",
    balance: "Balance",
    identity: "Identity",
    origin_maintenance: "Origin & Maintenance",
    technical: "Technical",
    financial_status: "Finances & Status",
    date_purchase: "Purchase Date",
    date_sold: "Sold Date",
    market_value: "Market Estimation",
    find_used: "Find Used",
    export_sheet: "Sheets & Docs",
    sheet_insurance: "Insurance Sheet",
    sheet_sale: "Sale Sheet",
    print: "Print",
    condition_rating: "Condition (1-10)",
    condition_comment: "Condition Details",
    show_history: "Show Full History",
    show_less: "Show Less",
    year_summary: "Year Summary",
    stats_usage: "Usage Statistics",
    worn_this_month: "This Month",
    worn_this_year: "This Year",
    worn_last_year: "Last Year",
    invoice: "Invoice",
    add_invoice: "Add Invoice",
    view_invoice: "View Invoice"
  }
};

const productionConfig = {
  apiKey: "AIzaSyCOk85wxq6mTKj3mfzjJTQN64dcg6N_4-o",
  authDomain: "chronomanagerfinal.firebaseapp.com",
  projectId: "chronomanagerfinal",
  storageBucket: "chronomanagerfinal.firebasestorage.app",
  messagingSenderId: "913764049964",
  appId: "1:913764049964:web:542604509381001b801d89"
};

// ==========================================================================
// GESTIONNAIRE FIREBASE
// ==========================================================================
let app, auth, db;
let firebaseReady = false;
let globalInitError = null; 

const LOCAL_STORAGE_KEY = 'chrono_manager_universal_db';
const LOCAL_STORAGE_BRACELETS_KEY = 'chrono_manager_bracelets_db';
const LOCAL_STORAGE_CALENDAR_KEY = 'chrono_manager_calendar_db';
const LOCAL_CONFIG_KEY = 'chrono_firebase_config'; 
const LOCAL_SETTINGS_KEY = 'chrono_user_settings_v3'; 
const APP_ID_STABLE = typeof __app_id !== 'undefined' ? __app_id : 'chrono-manager-universal'; 
const APP_VERSION = "v54.0";

const DEFAULT_WATCH_STATE = {
    brand: '', model: '', reference: '', 
    diameter: '', year: '', // Now Model Year
    movement: '', movementModel: '', 
    country: '', waterResistance: '', glass: '', strapWidth: '', thickness: '', weight: '',
    dialColor: '', 
    batteryModel: '', 
    isLimitedEdition: false, limitedNumber: '', limitedTotal: '',
    publicVisible: true, 
    box: '', warrantyDate: '', revision: '',
    purchasePrice: '', sellingPrice: '', minPrice: '', 
    purchaseDate: '', soldDate: '',
    status: 'collection', conditionNotes: '', link: '', 
    historyBrand: '', historyModel: '', 
    conditionRating: '', conditionComment: '',
    image: null, 
    images: [],
    invoice: null // NEW: Invoice Image
};

const DEFAULT_BRACELET_STATE = {
    width: '', type: 'Standard', material: '', color: '', brand: '', quickRelease: false, image: null, notes: '' 
};

// Fonction pour tenter d'initialiser Firebase
const tryInitFirebase = (config) => {
    try {
        if (!config || !config.apiKey || config.apiKey.length < 5) return false;
        if (getApps().length === 0) {
            app = initializeApp(config);
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        db = getFirestore(app);
        firebaseReady = true;
        globalInitError = null;
        return true;
    } catch (e) {
        console.error("Erreur init Firebase:", e);
        globalInitError = e.message || String(e); 
        return false;
    }
};

if (typeof __firebase_config !== 'undefined') {
    try { tryInitFirebase(JSON.parse(__firebase_config)); } catch(e) {}
}
if (!firebaseReady) {
    tryInitFirebase(productionConfig);
}
if (!firebaseReady) {
    try {
        const savedConfig = localStorage.getItem(LOCAL_CONFIG_KEY);
        if (savedConfig) { tryInitFirebase(JSON.parse(savedConfig)); }
    } catch(e) {}
}

// --- UTILS UI ---
const formatPrice = (price) => {
  if (price === undefined || price === null || price === '') return '0 €';
  const numPrice = Number(price);
  if (isNaN(numPrice)) return '0 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(numPrice);
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    };
  });
};

const MovementIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 12 L12 2" />
    <path d="M12 12 L4 16" />
    <path d="M12 12 L20 16" />
    <path d="M12 7 C14.76 7 17 9.24 17 12 C17 14.76 14.76 17 12 17 C9.24 17 7 14.76 7 12" />
  </svg>
);

// --- ANIMATION COFFRE ---
const WatchBoxLogo = ({ isOpen, isDark, settings }) => {
  const leatherColor = settings.boxLeather || (isDark ? "#3E2723" : "#5D4037");
  const interiorColor = settings.boxInterior || (isDark ? "#424242" : "#f5f5f0");
  const cushionColor = settings.boxCushion || (isDark ? "#616161" : "#fdfbf7");

  return (
  <div style={{ perspective: '1000px', width: '220px', height: '180px' }}>
    <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={leatherColor} />
          <stop offset="100%" stopColor={leatherColor} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="interior" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={interiorColor} />
          <stop offset="100%" stopColor={interiorColor} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="cushionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor={cushionColor} />
           <stop offset="100%" stopColor={cushionColor} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor="rgba(220, 240, 255, 0.4)" />
           <stop offset="50%" stopColor="rgba(200, 230, 255, 0.2)" />
           <stop offset="100%" stopColor="rgba(220, 240, 255, 0.5)" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor="#FFECB3" />
           <stop offset="50%" stopColor="#FFC107" />
           <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
      </defs>
      <path d="M30,60 L170,60 L180,100 L20,100 Z" fill="url(#interior)" stroke="#8D6E63" strokeWidth="0.5" />
      <g transform="translate(0, 0)">
        {[32, 66, 100, 134].map((x, i) => (
             <rect key={i} x={x} y={65} width="28" height="30" rx="4" fill="url(#cushionGrad)" stroke="#D7CCC8" strokeWidth="0.5" />
        ))}
      </g>
      <path d="M20,100 L180,100 L180,140 L20,140 Z" fill="url(#leatherGrad)" stroke="#271c19" strokeWidth="0.5"/>
      <g transform="translate(94, 102)">
         <rect x="0" y="0" width="12" height="10" rx="1" fill="url(#goldGrad)" stroke="#B7880B" strokeWidth="0.5" />
         <circle cx="6" cy="5" r="1.5" fill="#3E2723" />
      </g>
      <g className="transition-all duration-1000 ease-in-out" style={{ transformOrigin: '100px 60px', transform: isOpen ? 'rotateX(-110deg)' : 'rotateX(0deg)' }}>
          <path d="M20,100 L180,100 L170,60 L30,60 Z" fill="url(#leatherGrad)" stroke="#3E2723" strokeWidth="1" />
          <path d="M35,92 L165,92 L158,68 L42,68 Z" fill="url(#windowGrad)" stroke="#8D6E63" strokeWidth="0.5" />
          <path d="M35,92 L80,92 L75,68 L42,68 Z" fill="rgba(255,255,255,0.1)" />
          <path d="M20,100 L180,100 L180,108 L20,108 Z" fill="#3E2723" />
          <g transform="translate(94, 100)">
             <path d="M0,0 H12 V6 C12,8 0,8 0,6 Z" fill="url(#goldGrad)" stroke="#B7880B" strokeWidth="0.5" />
          </g>
      </g>
    </svg>
  </div>
  );
};

const AnalogClock = ({ isDark, settings }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  const secondsRatio = time.getSeconds() / 60;
  const minutesRatio = (secondsRatio + time.getMinutes()) / 60;
  const hoursRatio = (minutesRatio + time.getHours()) / 12;
  const borderColor = isDark ? 'border-slate-600' : 'border-slate-800';
  const bgColor = isDark ? 'bg-slate-800' : 'bg-white';
  
  const tickColor = settings.indexColor || (isDark ? '#94a3b8' : '#1e293b'); 
  const hHandColor = settings.handHour || (isDark ? '#cbd5e1' : '#0f172a'); 
  const mHandColor = settings.handMinute || (isDark ? '#94a3b8' : '#475569'); 
  const sHandColor = settings.handSecond || '#ef4444'; 

  return (
    <div className="w-32 h-32 relative mx-auto mb-2">
       <div className={`w-full h-full rounded-full border-4 ${borderColor} ${bgColor} shadow-inner flex items-center justify-center relative`}>
          {[...Array(12)].map((_, i) => (<div key={i} className="absolute w-1 h-2 left-1/2 origin-bottom" style={{ bottom: '50%', transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-36px)`, backgroundColor: tickColor }}></div>))}
          {[0, 3, 6, 9].map((i) => (<div key={i} className="absolute w-1.5 h-3 left-1/2 origin-bottom" style={{ bottom: '50%', transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-36px)`, backgroundColor: tickColor }}></div>))}
          <div className="absolute w-1.5 h-8 rounded-full origin-bottom left-1/2 bottom-1/2" style={{ transform: `translateX(-50%) rotate(${hoursRatio * 360}deg)`, backgroundColor: hHandColor }}></div>
          <div className="absolute w-1 h-12 rounded-full origin-bottom left-1/2 bottom-1/2" style={{ transform: `translateX(-50%) rotate(${minutesRatio * 360}deg)`, backgroundColor: mHandColor }}></div>
          <div className="absolute w-0.5 h-14 rounded-full origin-bottom left-1/2 bottom-1/2" style={{ transform: `translateX(-50%) rotate(${secondsRatio * 360}deg)`, backgroundColor: sHandColor }}></div>
          <div className={`absolute w-3 h-3 ${isDark ? 'bg-slate-200' : 'bg-slate-900'} rounded-full border-2 border-white z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}></div>
       </div>
    </div>
  );
};

const LiveClock = ({ isDark, settings }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return <div className={`font-mono text-4xl sm:text-5xl font-medium tracking-widest mb-2 opacity-90`} style={{ color: settings.digitalColor || (isDark ? '#e2e8f0' : '#1e293b') }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>;
};

const GraphicBackground = ({ isDark }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(${isDark ? '#475569' : '#cbd5e1'} 1px, transparent 1px)`, backgroundSize: '30px 30px', opacity: 0.5 }}></div>
      <svg className={`absolute -right-20 -top-20 w-96 h-96 opacity-40 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
);

// --- COMPOSANTS EXTERNALISÉS ---

const Card = ({ children, className = "", onClick, theme }) => (
  <div onClick={onClick} className={`${theme.card} rounded-xl shadow-sm border ${theme.border} overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>{children}</div>
);

const DetailItem = ({ icon: Icon, label, value, theme }) => (
    <div className={`${theme.bgSecondary} p-3 rounded-lg border ${theme.border} flex items-center`}>
        <div className={`${theme.bg} p-2 rounded-full border ${theme.border} mr-3 ${theme.textSub} flex-shrink-0`}>{Icon && <Icon size={16} />}</div>
        <div className="min-w-0"><span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textSub} block opacity-70`}>{label}</span><span className={`font-serif text-sm ${theme.text} truncate block`}>{value || '-'}</span></div>
    </div>
);

// NEW: Export / Print View Component
const ExportView = ({ watch, type, onClose, theme, t }) => {
    const isSale = type === 'sale';
    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-auto text-black">
            {/* Header Toolbar (Hidden when printing) */}
            <div className="print:hidden p-4 border-b flex justify-between items-center bg-slate-100 sticky top-0 z-50">
                <h2 className="font-bold text-lg">{isSale ? t('sheet_sale') : t('sheet_insurance')}</h2>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700"><Printer size={16}/> {t('print')}</button>
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold hover:bg-slate-300"><X size={16}/></button>
                </div>
            </div>
            
            {/* Content (Printable) */}
            <div className="p-8 max-w-3xl mx-auto w-full space-y-8 print:p-0 print:space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                    <div>
                        <h1 className="text-4xl font-serif font-bold uppercase tracking-widest">{watch.brand}</h1>
                        <h2 className="text-xl text-slate-600 font-medium">{watch.model}</h2>
                        {watch.reference && <p className="font-mono text-sm mt-1">REF: {watch.reference}</p>}
                    </div>
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center">
                        <Watch size={32} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                    <div>
                        {watch.images && watch.images[0] && (
                            <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 mb-4">
                                <img src={watch.images[0]} className="w-full h-full object-cover"/>
                            </div>
                        )}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:border-black print:bg-white">
                             <div className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">{isSale ? t('selling_price') : t('purchase_price')}</div>
                             <div className="text-3xl font-bold font-serif">{formatPrice(isSale ? (watch.sellingPrice || watch.purchasePrice) : watch.purchasePrice)}</div>
                             {isSale && <div className="mt-2 text-xs text-slate-500 italic">*Prix non contractuel, sujet à négociation</div>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase border-b border-slate-200 pb-1">{t('specs')}</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-slate-500">{t('year')}:</div><div>{watch.year || '-'}</div>
                            <div className="text-slate-500">{t('diameter')}:</div><div>{watch.diameter ? watch.diameter + ' mm' : '-'}</div>
                            <div className="text-slate-500">{t('thickness')}:</div><div>{watch.thickness ? watch.thickness + ' mm' : '-'}</div>
                            <div className="text-slate-500">{t('lug_width')}:</div><div>{watch.strapWidth ? watch.strapWidth + ' mm' : '-'}</div>
                            <div className="text-slate-500">{t('movement')}:</div><div>{watch.movement || '-'}</div>
                            <div className="text-slate-500">{t('dial')}:</div><div>{watch.dialColor || '-'}</div>
                            <div className="text-slate-500">{t('box_included')}:</div><div>{watch.box || '-'}</div>
                            <div className="text-slate-500">{t('warranty')}:</div><div>{watch.warrantyDate || '-'}</div>
                            <div className="text-slate-500">{t('country')}:</div><div>{watch.country || '-'}</div>
                            <div className="text-slate-500">{t('weight')}:</div><div>{watch.weight ? watch.weight + ' g' : '-'}</div>
                            {watch.batteryModel && <><div className="text-slate-500">{t('battery')}:</div><div>{watch.batteryModel}</div></>}
                        </div>
                        
                        {watch.conditionNotes && (
                            <div className="mt-6">
                                <h3 className="font-bold uppercase border-b border-slate-200 pb-1 mb-2">{t('notes')}</h3>
                                <p className="text-sm text-justify leading-relaxed whitespace-pre-wrap">{watch.conditionNotes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* NEW: History in Sale Sheet */}
                {isSale && (watch.historyBrand || watch.historyModel) && (
                    <div className="space-y-4">
                        {watch.historyBrand && (
                            <div>
                                <h3 className="font-bold uppercase border-b border-slate-200 pb-1 mb-2">{t('history_brand')}</h3>
                                <p className="text-sm text-justify leading-relaxed whitespace-pre-wrap">{watch.historyBrand}</p>
                            </div>
                        )}
                        {watch.historyModel && (
                            <div>
                                <h3 className="font-bold uppercase border-b border-slate-200 pb-1 mb-2">{t('history_model')}</h3>
                                <p className="text-sm text-justify leading-relaxed whitespace-pre-wrap">{watch.historyModel}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {isSale && (
                   <div className="border-t-2 border-black pt-4 mt-8 text-center text-sm text-slate-500">
                       <p>Contactez le vendeur pour plus d'informations.</p>
                       <div className="mt-4 border border-dashed border-slate-300 p-4 rounded-lg inline-block">
                           QR Code / Contact Info Placeholder
                       </div>
                   </div>
                )}
                
                <div className="print:fixed print:bottom-4 print:left-0 print:w-full text-center text-[10px] text-slate-400">
                    Généré par ChronoManager - {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

const FinanceDetailList = ({ title, items, onClose, theme }) => {
    const [localSort, setLocalSort] = useState('alpha'); 
    const sortedItems = useMemo(() => {
        let sorted = [...items];
        if (localSort === 'alpha') sorted.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
        else sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        return sorted;
    }, [items, localSort]);
    return (
        <div className={`fixed inset-0 z-[60] ${theme.card} flex flex-col animate-in slide-in-from-bottom-10`}>
          <div className={`p-4 border-b ${theme.border} flex items-center justify-between ${theme.bgSecondary}`}>
            <h2 className={`font-serif font-bold text-lg ${theme.text} tracking-wide`}>{title}</h2>
            <div className="flex gap-2">
                <button onClick={() => setLocalSort(localSort === 'date' ? 'alpha' : 'date')} className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-medium ${theme.textSub} ${theme.bg}`}>
                    <ArrowUpDown size={14} /> {localSort === 'date' ? 'Date' : 'A-Z'}
                </button>
                <button onClick={onClose} className={`p-2 rounded-full shadow-sm border ${theme.border} ${theme.bg} ${theme.text}`}><X size={20}/></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {sortedItems.map(w => {
               const thumb = w.images && w.images.length > 0 ? w.images[0] : w.image;
               const profit = (w.sellingPrice || 0) - (w.purchasePrice || 0);
               return (
                 <div key={w.id} className={`flex items-center p-3 border rounded-lg shadow-sm ${theme.bg} ${theme.border}`}>
                     <div className={`w-12 h-12 rounded overflow-hidden flex-shrink-0 mr-3 border ${theme.border} ${theme.bgSecondary}`}>{thumb && <img src={thumb} className="w-full h-full object-cover"/>}</div>
                     <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate ${theme.text}`}>{w.brand} {w.model}</div>
                        <div className={`text-xs ${theme.textSub}`}>Achat: {formatPrice(w.purchasePrice)}</div>
                     </div>
                     <div className="text-right">
                        <div className={`font-bold text-sm ${theme.text}`}>{formatPrice(w.sellingPrice || w.purchasePrice)}</div>
                        <div className={`text-xs font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{profit > 0 ? '+' : ''}{formatPrice(profit)}</div>
                     </div>
                 </div>
               )
             })}
             {sortedItems.length === 0 && <div className={`text-center ${theme.textSub} py-10 text-sm`}>Aucune montre.</div>}
          </div>
        </div>
    );
};

const FinanceCardFull = ({ title, icon: Icon, stats, type, onClick, bgColor, theme }) => {
    const isWhite = type === 'total';
    const cardBg = isWhite ? (theme.bg === 'bg-slate-950' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200') : bgColor;
    const txtMain = isWhite ? theme.text : 'text-white';
    const txtSub = isWhite ? theme.textSub : 'text-white/70';
    const borderClass = isWhite ? `border ${theme.border}` : 'border border-transparent';
    const bgIcon = isWhite ? (theme.bg === 'bg-slate-950' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600') : 'bg-white/20 text-white';

    return (
        <div onClick={onClick} className={`${cardBg} ${borderClass} p-4 rounded-xl shadow-md mb-3 cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] overflow-hidden relative`}>
            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgIcon}`}><Icon size={18} /></div>
                    <span className={`font-serif font-bold text-lg tracking-wide ${txtMain}`}>{title}</span>
                </div>
                {type !== 'total' && <div className={`bg-white/20 p-1 rounded-full ${txtMain}`}><ChevronLeft className="rotate-180" size={16}/></div>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                <div><div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>Achat</div><div className={`font-bold text-base ${txtMain}`}>{formatPrice(stats.buy)}</div></div>
                <div><div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>{type === 'sold' ? 'Vendu' : 'Estim.'}</div><div className={`font-bold text-base ${txtMain}`}>{formatPrice(stats.val)}</div></div>
                <div><div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>Bénéfice</div><div className={`font-bold text-base ${isWhite ? (stats.profit >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-white'}`}>{stats.profit > 0 ? '+' : ''}{formatPrice(stats.profit)}</div></div>
            </div>
            {!isWhite && <Icon size={120} className="absolute -bottom-4 -right-4 opacity-10 text-white transform rotate-12 pointer-events-none" />}
        </div>
    );
};

const ConfigModal = ({ onClose, currentError, t }) => {
    const [jsonConfig, setJsonConfig] = useState('');
    const [parseError, setParseError] = useState(null);
    const handleSave = () => {
        try {
            let cleanJson = jsonConfig;
            if (cleanJson.includes('=')) cleanJson = cleanJson.substring(cleanJson.indexOf('=') + 1);
            if (cleanJson.trim().endsWith(';')) cleanJson = cleanJson.trim().slice(0, -1);
            const parsed = new Function('return ' + cleanJson)();
            if (!parsed.apiKey) throw new Error("apiKey manquante");
            localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(parsed));
            window.location.reload();
        } catch (e) { setParseError("Format invalide."); }
    };
    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings size={18}/> {t('config_cloud')}</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="p-6 space-y-4">
                    {currentError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-4">{String(currentError)}</div>}
                    <textarea className="w-full h-40 p-3 border rounded-lg font-mono text-xs bg-slate-50" placeholder={`{ apiKey: "...", ... }`} value={jsonConfig} onChange={(e) => setJsonConfig(e.target.value)} />
                    {parseError && <div className="text-xs text-red-500">{parseError}</div>}
                    <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Save size={18}/> {t('save')}</button>
                </div>
            </div>
        </div>
    );
};

const SettingsModal = ({ onClose, settings, setSettings, t, theme }) => (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border ${theme.border} max-h-[90vh] flex flex-col`}>
            <div className={`p-4 border-b ${theme.border} ${theme.bgSecondary} flex justify-between items-center flex-shrink-0`}>
                <h3 className={`font-bold ${theme.text} flex items-center gap-2`}><Settings size={18}/> {t('settings')}</h3>
                <button onClick={onClose}><X size={20} className={theme.textSub}/></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSub}`}>{t('language')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSettings(s => ({...s, lang: 'fr'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.lang === 'fr' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : `${theme.bg} ${theme.text} ${theme.border}`}`}><span className="text-lg">🇫🇷</span> Français</button>
                        <button onClick={() => setSettings(s => ({...s, lang: 'en'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.lang === 'en' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : `${theme.bg} ${theme.text} ${theme.border}`}`}><span className="text-lg">🇬🇧</span> English</button>
                    </div>
                </div>
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSub}`}>{t('theme')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSettings(s => ({...s, theme: 'light'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.theme === 'light' ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm' : `${theme.bg} ${theme.text} ${theme.border}`}`}><Sun size={18}/> {t('light')}</button>
                        <button onClick={() => setSettings(s => ({...s, theme: 'dark'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.theme === 'dark' ? 'bg-slate-800 text-white border-slate-700 shadow-md' : `${theme.bg} ${theme.text} ${theme.border}`}`}><Moon size={18}/> {t('dark')}</button>
                    </div>
                </div>
                
                {/* CLOCK CUSTOMIZATION */}
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${theme.textSub} flex items-center gap-2`}><Clock size={14}/> {t('clock_style')}</label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_digital')}</span><div className="flex items-center gap-2"><input type="color" value={settings.digitalColor || '#000000'} onChange={(e) => setSettings(s => ({...s, digitalColor: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, digitalColor: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_h_hand')}</span><div className="flex items-center gap-2"><input type="color" value={settings.handHour || '#000000'} onChange={(e) => setSettings(s => ({...s, handHour: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, handHour: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_m_hand')}</span><div className="flex items-center gap-2"><input type="color" value={settings.handMinute || '#000000'} onChange={(e) => setSettings(s => ({...s, handMinute: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, handMinute: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_s_hand')}</span><div className="flex items-center gap-2"><input type="color" value={settings.handSecond || '#FF0000'} onChange={(e) => setSettings(s => ({...s, handSecond: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, handSecond: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_index')}</span><div className="flex items-center gap-2"><input type="color" value={settings.indexColor || '#000000'} onChange={(e) => setSettings(s => ({...s, indexColor: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, indexColor: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                    </div>
                </div>

                {/* BOX CUSTOMIZATION */}
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${theme.textSub} flex items-center gap-2`}><Box size={14}/> {t('box_style')}</label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_leather')}</span><div className="flex items-center gap-2"><input type="color" value={settings.boxLeather || '#5D4037'} onChange={(e) => setSettings(s => ({...s, boxLeather: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, boxLeather: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_interior')}</span><div className="flex items-center gap-2"><input type="color" value={settings.boxInterior || '#f5f5f0'} onChange={(e) => setSettings(s => ({...s, boxInterior: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, boxInterior: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                        <div className="flex items-center justify-between"><span className={`text-sm ${theme.text}`}>{t('color_cushion')}</span><div className="flex items-center gap-2"><input type="color" value={settings.boxCushion || '#fdfbf7'} onChange={(e) => setSettings(s => ({...s, boxCushion: e.target.value}))} className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"/><button onClick={() => setSettings(s => ({...s, boxCushion: null}))} className={`text-[10px] ${theme.textSub} underline`}>Reset</button></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const RulesHelpModal = ({ onClose, theme }) => (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
        <div className={`${theme.card} rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden`}>
            <div className={`${theme.bgSecondary} p-4 border-b ${theme.border} flex justify-between items-center`}>
                <h3 className={`font-bold ${theme.text} flex items-center gap-2`}><ShieldCheck className="text-emerald-600"/> Permissions Cloud</h3>
                <button onClick={onClose}><X size={20} className={theme.textSub}/></button>
            </div>
            <div className="p-6 space-y-4">
                <p className={`text-sm ${theme.text}`}>Le système de partage requiert des permissions spécifiques pour que vos amis puissent voir votre collection.</p>
                <button onClick={onClose} className={`w-full py-3 ${theme.bg} border ${theme.border} ${theme.text} rounded-xl font-bold`}>J'ai compris</button>
            </div>
        </div>
    </div>
);

// --- APPLICATION ---

export default function App() {
  const [useLocalStorage, setUseLocalStorage] = useState(!firebaseReady);
  const [user, setUser] = useState(useLocalStorage ? { uid: 'local-user' } : null);
  
  const [settings, setSettings] = useState(() => {
      try { const saved = localStorage.getItem(LOCAL_SETTINGS_KEY); return saved ? JSON.parse(saved) : { lang: 'fr', theme: 'light' }; } catch(e) { return { lang: 'fr', theme: 'light' }; }
  });
  useEffect(() => { localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  const t = (key) => TRANSLATIONS[settings.lang][key] || key;
  const isDark = settings.theme === 'dark';
  const theme = {
      bg: isDark ? 'bg-slate-950' : 'bg-slate-50',
      bgSecondary: isDark ? 'bg-slate-900' : 'bg-white',
      text: isDark ? 'text-slate-100' : 'text-slate-900',
      textSub: isDark ? 'text-slate-400' : 'text-slate-500',
      border: isDark ? 'border-slate-800' : 'border-slate-200',
      card: isDark ? 'bg-slate-900' : 'bg-white',
      input: isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-slate-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500',
      nav: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  };

  const [watches, setWatches] = useState([]);
  const [bracelets, setBracelets] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  
  const [friends, setFriends] = useState([]); 
  const [friendRequests, setFriendRequests] = useState([]); 
  const [viewingFriend, setViewingFriend] = useState(null); 
  const [friendWatches, setFriendWatches] = useState([]); 
  const [addFriendId, setAddFriendId] = useState(''); 
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  
  const [showGalleryCollection, setShowGalleryCollection] = useState(true);
  const [showGalleryForsale, setShowGalleryForsale] = useState(true);
  const [showGallerySold, setShowGallerySold] = useState(false);
  const [showGalleryWishlist, setShowGalleryWishlist] = useState(false);

  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('box'); 
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState('watch');

  const [selectedWatch, setSelectedWatch] = useState(null);
  const [viewedImageIndex, setViewedImageIndex] = useState(0); 

  const [financeDetail, setFinanceDetail] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedCalendarWatches, setSelectedCalendarWatches] = useState([]);
  const [statsTimeframe, setStatsTimeframe] = useState('month'); 
  const [calendarSearchTerm, setCalendarSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('alpha');
  const [error, setError] = useState(null); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBoxOpening, setIsBoxOpening] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false); 
  const [showSettingsModal, setShowSettingsModal] = useState(false); 
  const [authDomainError, setAuthDomainError] = useState(null); 
  const [showRulesHelp, setShowRulesHelp] = useState(false); 
  const [isAuthLoading, setIsAuthLoading] = useState(false); 
  const [exportType, setExportType] = useState(null); 

  // NEW: Timeline filter state
  const [timelineFilter, setTimelineFilter] = useState('default'); // 'default' | 'all'

  const [watchForm, setWatchForm] = useState(DEFAULT_WATCH_STATE);
  const [braceletForm, setBraceletForm] = useState(DEFAULT_BRACELET_STATE);

  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [view, viewingFriend, financeDetail]);

  useEffect(() => {
      if (!firebaseReady && productionConfig.apiKey) {
          tryInitFirebase(productionConfig);
          if (firebaseReady) { setUseLocalStorage(false); setLoading(true); }
      }
  }, []);

  useEffect(() => {
     if (useLocalStorage || !user?.uid) return;
     const savedFriends = localStorage.getItem(`friends_${user.uid}`);
     if (savedFriends) setFriends(JSON.parse(savedFriends));
     if (firebaseReady && !useLocalStorage) {
         if (user.isAnonymous) return;
         try {
             const requestsRef = collection(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests');
             const q = query(requestsRef, where('toUser', '==', user.uid));
             const unsubRequests = onSnapshot(q, (snap) => { setFriendRequests(snap.docs.map(d => ({id: d.id, ...d.data()}))); }); 
             return () => unsubRequests();
         } catch (e) {}
     }
  }, [user, useLocalStorage]);

  const sendFriendRequest = async () => {
      if (!addFriendId || addFriendId.length < 5) return alert("Code invalide");
      if (addFriendId === user.uid) return alert("Impossible de s'ajouter soi-même");
      try {
          await addDoc(collection(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests'), { fromUser: user.uid, fromEmail: user.email, toUser: addFriendId, status: 'pending', createdAt: new Date().toISOString() });
          alert("Demande envoyée !"); setAddFriendId('');
      } catch (e) { if (e.code === 'permission-denied') setShowRulesHelp(true); else alert("Erreur: " + e.message); }
  };
  const acceptRequest = async (req) => {
      const newFriend = { id: req.fromUser, name: req.fromEmail || 'Ami' };
      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);
      localStorage.setItem(`friends_${user.uid}`, JSON.stringify(updatedFriends));
      try { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests', req.id)); } catch (e) {}
  };
  const rejectRequest = async (reqId) => { try { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests', reqId)); } catch (e) {} };
  const removeFriend = (friendId) => {
      const updatedFriends = friends.filter(f => f.id !== friendId);
      setFriends(updatedFriends);
      localStorage.setItem(`friends_${user.uid}`, JSON.stringify(updatedFriends));
  };
  const handlePreviewOwnProfile = () => {
      setFriendWatches(watches.filter(w => w.publicVisible !== false));
      setViewingFriend({ id: user.uid, name: 'Mon Profil Public' });
      if(scrollRef.current) scrollRef.current.scrollTop = 0;
  };
  const loadFriendCollection = async (friend) => {
      if (!firebaseReady) return;
      setIsFriendsLoading(true); setViewingFriend(friend);
      try {
          const q = query(collection(db, 'artifacts', APP_ID_STABLE, 'users', friend.id, 'watches'));
          const snap = await getDocs(q);
          setFriendWatches(snap.docs.map(d => ({id: d.id, ...d.data()})).filter(w => w.publicVisible !== false));
      } catch (err) { setViewingFriend(null); } finally { setIsFriendsLoading(false); }
  };

  const toggleVisibility = async (watch) => {
      const newVal = !watch.publicVisible;
      setWatches(prev => prev.map(w => w.id === watch.id ? { ...w, publicVisible: newVal } : w));
      if (!useLocalStorage) {
          try { await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches', watch.id), { ...watch, publicVisible: newVal }, { merge: true }); } 
          catch (e) { setWatches(prev => prev.map(w => w.id === watch.id ? { ...w, publicVisible: !newVal } : w)); }
      }
  };

  const handleMoveToCollection = async (watch) => {
      if (!confirm(t('move_collection') + " ?")) return;
      const updatedWatch = { ...watch, status: 'collection', dateAdded: new Date().toISOString() };
      setWatches(prev => prev.map(w => w.id === watch.id ? updatedWatch : w));
      setSelectedWatch(updatedWatch);
      if (!useLocalStorage) { try { await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches', watch.id), updatedWatch, { merge: true }); } catch (e) {} }
  };
  
  const setAsMainImage = (index) => {
      setWatchForm(prev => {
          const currentImages = [...(prev.images || [])];
          if (index >= currentImages.length) return prev;
          const temp = currentImages[0];
          currentImages[0] = currentImages[index];
          currentImages[index] = temp;
          return { ...prev, images: currentImages, image: currentImages[0] };
      });
  };

  const handleCalendarDayClick = (dateStr) => {
      setSelectedCalendarDate(dateStr); setCalendarSearchTerm(''); 
      const existing = calendarEvents.find(e => e.id === dateStr || e.date === dateStr);
      setSelectedCalendarWatches(existing ? (existing.watches || []) : []);
  };

  const handleCalendarSave = async () => {
      if (!selectedCalendarDate) return;
      let updatedEvents = [...calendarEvents];
      const existingIdx = updatedEvents.findIndex(e => e.id === selectedCalendarDate || e.date === selectedCalendarDate);
      const eventData = { date: selectedCalendarDate, watches: selectedCalendarWatches };
      if (selectedCalendarWatches.length === 0) { if (existingIdx >= 0) updatedEvents.splice(existingIdx, 1); } 
      else { if (existingIdx >= 0) updatedEvents[existingIdx] = { ...updatedEvents[existingIdx], ...eventData }; else updatedEvents.push({ id: selectedCalendarDate, ...eventData }); }
      setCalendarEvents(updatedEvents); setSelectedCalendarDate(null);
      if (!useLocalStorage) {
          try {
              const docRef = doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'calendar', selectedCalendarDate);
              if (selectedCalendarWatches.length === 0) await deleteDoc(docRef); else await setDoc(docRef, eventData);
          } catch(e) {}
      }
  };

  const handleGoogleLogin = async () => {
    if (!firebaseReady) { setShowConfigModal(true); return; }
    setUseLocalStorage(false); setIsAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (error) { if (error.code === 'auth/unauthorized-domain') setAuthDomainError(window.location.hostname); } finally { setIsAuthLoading(false); }
  };

  const handleLogout = async () => {
    if (!firebaseReady) { setShowProfileMenu(false); return; }
    setIsAuthLoading(true);
    try { await signOut(auth); setShowProfileMenu(false); } finally { setIsAuthLoading(false); }
  };

  useEffect(() => {
    if (useLocalStorage && !isAuthLoading) { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); setError(null); setLoading(false); if (useLocalStorage) setUseLocalStorage(false); } 
      else {
          const timer = setTimeout(() => { if (!isAuthLoading) { signInAnonymously(auth).catch((err) => { setUseLocalStorage(true); setUser({ uid: 'local-user' }); }).finally(() => setLoading(false)); } }, 1000);
          return () => clearTimeout(timer);
      }
    });
    return () => unsubscribe();
  }, [useLocalStorage, isAuthLoading]);

  useEffect(() => {
    if (!user && !useLocalStorage) return;
    if (useLocalStorage) {
      try {
        const lw = localStorage.getItem(LOCAL_STORAGE_KEY); if (lw) setWatches(JSON.parse(lw));
        const lb = localStorage.getItem(LOCAL_STORAGE_BRACELETS_KEY); if (lb) setBracelets(JSON.parse(lb));
        const lc = localStorage.getItem(LOCAL_STORAGE_CALENDAR_KEY); if (lc) setCalendarEvents(JSON.parse(lc));
      } catch(e){}
      setLoading(false);
    } else {
      if (!user?.uid) return;
      try {
        const unsubW = onSnapshot(query(collection(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches')), (snap) => { setWatches(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded))); setLoading(false); if(error) setError(null); }, (err) => { if (user?.isAnonymous) setUseLocalStorage(true); else setError("Erreur synchro: " + (err.code || err.message)); setLoading(false); });
        const unsubB = onSnapshot(query(collection(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'bracelets')), (snap) => setBracelets(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded))));
        const unsubC = onSnapshot(query(collection(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'calendar')), (snap) => setCalendarEvents(snap.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => { unsubW(); unsubB(); unsubC(); };
      } catch(e) { setLoading(false); }
    }
  }, [user, useLocalStorage]);

  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watches));
      localStorage.setItem(LOCAL_STORAGE_BRACELETS_KEY, JSON.stringify(bracelets));
      localStorage.setItem(LOCAL_STORAGE_CALENDAR_KEY, JSON.stringify(calendarEvents));
    }
  }, [watches, bracelets, calendarEvents, useLocalStorage]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try { 
      const base64 = await compressImage(file); 
      if (type === 'watch') {
          setWatchForm(prev => {
              const currentImages = prev.images || (prev.image ? [prev.image] : []);
              if (currentImages.length >= 3) { alert("Max 3 photos"); return prev; }
              const newImages = [...currentImages, base64];
              return { ...prev, images: newImages, image: newImages[0] };
          });
      } else if (type === 'invoice') { // NEW: Invoice
          setWatchForm(prev => ({...prev, invoice: base64}));
      } else { setBraceletForm(prev => ({ ...prev, image: base64 })); }
    } catch (err) {}
  };

  const removeImage = (index) => {
      setWatchForm(prev => {
          const currentImages = [...(prev.images || [])];
          currentImages.splice(index, 1);
          return { ...prev, images: currentImages, image: currentImages[0] || null };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = editingId || Date.now().toString();
    const isWatch = editingType === 'watch';
    
    let data;
    if (isWatch) {
        const images = watchForm.images && watchForm.images.length > 0 ? watchForm.images : (watchForm.image ? [watchForm.image] : []);
        data = { ...watchForm, id, purchasePrice: Number(watchForm.purchasePrice), sellingPrice: Number(watchForm.sellingPrice), minPrice: Number(watchForm.minPrice), dateAdded: new Date().toISOString(), images: images, image: images[0] || null };
    } else { data = { ...braceletForm, id, dateAdded: new Date().toISOString() }; }

    if (useLocalStorage) {
      if (isWatch) setWatches(prev => editingId ? prev.map(w => w.id === id ? data : w) : [data, ...prev]);
      else setBracelets(prev => editingId ? prev.map(b => b.id === id ? data : b) : [data, ...prev]);
      closeForm(data);
    } else {
      try { await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, isWatch ? 'watches' : 'bracelets', id), data); closeForm(data); } catch(e) {}
    }
  };

  const exportCSV = () => {
    const sep = ";"; let csvContent = "\uFEFF"; csvContent += "sep=;\n"; 
    const headers = [ "Statut", "Marque", "Modele", "Prix Achat", "Prix Vente/Estim", "Prix Min", "Plus-Value", "Diametre", "Annee", "Reference", "Mouvement", "Notes" ];
    csvContent += headers.join(sep) + "\n";
    watches.forEach(w => {
      const row = [ w.status, w.brand, w.model, w.purchasePrice, w.sellingPrice, w.minPrice, (w.sellingPrice||0)-w.purchasePrice, w.diameter, w.year, w.reference, w.movement, (w.conditionNotes||"").replace(/(\r\n|\n|\r|;)/gm, " ") ].map(e => `"${(e || '').toString().replace(/"/g, '""')}"`); 
      csvContent += row.join(sep) + "\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", "collection.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const closeForm = (data) => { 
    if (editingType === 'watch') {
        if(selectedWatch) { setSelectedWatch(data); setViewedImageIndex(0); }
        setView(data.status === 'wishlist' ? 'wishlist' : 'list');
    } else { setView('list'); }
    setEditingId(null); setWatchForm(DEFAULT_WATCH_STATE); setBraceletForm(DEFAULT_BRACELET_STATE); 
  };

  const openAdd = () => {
      setEditingId(null);
      // CLEAR SELECTED WATCH TO ENSURE CANCEL GOES TO LIST
      setSelectedWatch(null);
      setWatchForm({ ...DEFAULT_WATCH_STATE, status: view === 'wishlist' ? 'wishlist' : 'collection' });
      setBraceletForm(DEFAULT_BRACELET_STATE);
      setEditingType((filter === 'bracelets' && view !== 'wishlist') ? 'bracelet' : 'watch');
      setView('add');
  };

  const handleEdit = (item, type) => { 
      if (type === 'watch') { const safeImages = item.images || (item.image ? [item.image] : []); setWatchForm({ ...DEFAULT_WATCH_STATE, ...item, images: safeImages }); } 
      else setBraceletForm({ ...DEFAULT_BRACELET_STATE, ...item });
      setEditingType(type); setEditingId(item.id); setView('add'); 
  };
  
  const handleCancelForm = () => {
      setEditingId(null);
      setWatchForm(DEFAULT_WATCH_STATE);
      setBraceletForm(DEFAULT_BRACELET_STATE);
      if (selectedWatch) { setView('detail'); } else { setView('list'); }
  };

  const handleDelete = async (id, type) => {
    if(!confirm(t('delete') + " ?")) return;
    if(useLocalStorage) { 
        if (type === 'watch') setWatches(prev => prev.filter(w => w.id !== id)); else setBracelets(prev => prev.filter(b => b.id !== id));
        setView('list'); 
    } else { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, type === 'watch' ? 'watches' : 'bracelets', id)); setView('list'); }
  };

  const handleBoxClick = () => { setIsBoxOpening(true); setTimeout(() => { setFilter('collection'); setView('list'); setIsBoxOpening(false); }, 800); };
  
  const activeWatchesCount = watches.filter(w => w.status === 'collection').length;

  const filteredWatches = useMemo(() => {
    let filtered = watches;
    if (searchTerm) { const lower = searchTerm.toLowerCase(); filtered = filtered.filter(w => (w.brand && w.brand.toLowerCase().includes(lower)) || (w.model && w.model.toLowerCase().includes(lower))); }
    let sorted = [...filtered];
    if (sortOrder === 'priceAsc') sorted.sort((a, b) => (a.purchasePrice || 0) - (b.purchasePrice || 0));
    else if (sortOrder === 'priceDesc') sorted.sort((a, b) => (b.purchasePrice || 0) - (a.purchasePrice || 0));
    else if (sortOrder === 'alpha') sorted.sort((a, b) => a.brand.localeCompare(b.brand));
    else sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    return sorted;
  }, [watches, searchTerm, sortOrder]);

  const renderFullScreenImage = () => {
    if (!fullScreenImage) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
            <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2"><X size={32}/></button>
            <img src={fullScreenImage} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
    );
  };

  const renderBox = () => (
    <div className={`flex flex-col items-center justify-start h-full min-h-[80vh] px-8 relative overflow-hidden pt-28 ${theme.text}`}>
      <GraphicBackground isDark={isDark} />
      {/* BOUTON AMIS - GAUCHE */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => setView('friends')} className={`w-10 h-10 ${theme.bgSecondary} ${theme.text} rounded-full flex items-center justify-center border ${theme.border} shadow-sm hover:opacity-80 transition-colors relative`}>
            <Users size={18} />
            {friendRequests.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-3">
        {(!user || user?.isAnonymous) ? (
          <button onClick={handleGoogleLogin} className={`flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-full shadow-sm border text-xs font-medium transition-all ${theme.bgSecondary} ${theme.text} ${theme.border}`}>
            {isAuthLoading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />} {t('login_google')}
          </button>
        ) : (
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
             {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-800 flex items-center justify-center text-white"><span className="text-xs font-bold">{user.email ? user.email[0].toUpperCase() : 'U'}</span></div>}
          </button>
        )}
        
        {/* BOUTON SETTINGS - SOUS LE LOGIN */}
        <button onClick={() => setShowSettingsModal(true)} className={`w-10 h-10 ${theme.bgSecondary} ${theme.text} rounded-full flex items-center justify-center border ${theme.border} shadow-sm hover:opacity-80 transition-colors z-20`}><Settings size={18} /></button>
      </div>
      
      {showProfileMenu && (
          <div className={`absolute top-16 right-16 w-64 ${theme.card} rounded-xl shadow-xl border ${theme.border} py-1 z-30`}>
              <div className={`px-4 py-3 border-b ${theme.border}`}><p className={`text-sm font-medium ${theme.text}`}>{user.email}</p></div>
              <button onClick={() => { setView('summary'); setShowProfileMenu(false); }} className={`w-full text-left px-4 py-3 text-sm ${theme.text} hover:opacity-80 flex items-center gap-2`}><ClipboardList size={16} /> {t('inventory')}</button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={16} /> {t('logout')}</button>
          </div>
      )}

      <div className="z-10 mt-12 mb-1 text-center">
          <h1 className={`font-serif text-3xl sm:text-4xl ${theme.text} tracking-[0.3em] uppercase font-light`}>{t('myWatches')}</h1>
          <div className={`w-16 h-0.5 ${isDark ? 'bg-slate-200' : 'bg-slate-900'} mx-auto mt-2 opacity-20`}></div>
      </div>
      <div className="mb-8 text-center z-10 scale-90 opacity-90"><LiveClock isDark={isDark} settings={settings} /></div>
      <div className="z-10 mb-4"><AnalogClock isDark={isDark} settings={settings} /></div>
      
      {/* COFFRE AVEC MARGE NEGATIVE POUR REMONTER LE COMPTEUR */}
      <div onClick={handleBoxClick} className="flex items-center justify-center w-72 h-64 cursor-pointer transform transition-transform active:scale-95 hover:scale-105 duration-300 z-10 -mt-12">
        <WatchBoxLogo isOpen={isBoxOpening} isDark={isDark} settings={settings} />
      </div>
      <div className="-mt-6 flex flex-col items-center z-10 pb-20">
        <p className={`${theme.text} font-mono font-bold text-sm mb-2 tracking-widest shadow-sm uppercase opacity-70`}>{activeWatchesCount} {activeWatchesCount > 1 ? t('pieces') : t('piece')}</p>
        {error && <div className="mt-3 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs">{String(error)}</div>}
      </div>
    </div>
  );

  const renderHeader = (title, withFilters = false) => (
    <div className={`sticky top-0 ${theme.bgSecondary} z-10 pt-2 pb-2 px-1 shadow-sm border-b ${theme.border}`}>
      <div className="flex justify-between items-center px-2 mb-2">
        <h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide`}>{title}</h1>
        <div className="flex items-center gap-2">
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchTerm(''); }} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-slate-900 text-white' : `${theme.textSub} hover:opacity-80`}`}><Search size={18} /></button>
        </div>
      </div>
      {isSearchOpen && (<div className="px-2 mb-3"><input autoFocus type="text" placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full p-2 pl-3 ${theme.input} rounded-lg text-sm focus:outline-none focus:ring-2`}/></div>)}
      {withFilters && !isSearchOpen && (
        <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar px-2 pb-1">
            {['all', 'collection', 'forsale', 'sold', 'bracelets'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter===f ? 'bg-slate-800 text-white shadow-md' : `${theme.bgSecondary} border ${theme.border} ${theme.textSub}`}`}>
                    {t(f)} {f !== 'bracelets' && `(${f === 'all' ? watches.length : (f==='collection' ? watches.filter(w=>w.status==='collection').length : f==='forsale' ? watches.filter(w=>w.status==='forsale').length : watches.filter(w=>w.status==='sold').length)})`}
                </button>
            ))}
        </div>
      )}
    </div>
  );

  const renderList = () => {
    const displayWatches = filteredWatches.filter(w => { if (w.status === 'wishlist') return false; if (filter === 'all') return true; if (filter === 'bracelets') return false; return w.status === filter; });
    if (filter === 'bracelets') {
        return (
            <div className="pb-24">
                {renderHeader(t('bracelets'), true)}
                <div className="grid grid-cols-2 gap-3 px-3 mt-3">
                    {bracelets.map(b => (
                        <Card key={b.id} onClick={() => handleEdit(b, 'bracelet')} theme={theme}>
                            <div className={`aspect-square ${theme.bg} relative flex items-center justify-center`}>
                                {b.image ? <img src={b.image} className="w-full h-full object-cover"/> : <Activity className={theme.textSub}/>}
                                <div className="absolute bottom-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 shadow-sm">{b.width}mm</div>
                            </div>
                            <div className="p-3">
                                {b.brand && <div className="text-[10px] uppercase font-bold text-indigo-600 truncate">{b.brand}</div>}
                                <div className={`font-bold text-sm truncate ${theme.text}`}>{b.type}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    return (
      <div className="pb-24">
        {renderHeader(t('collection'), true)}
        <div className={`text-center text-xs ${theme.textSub} py-2 bg-opacity-50`}>{displayWatches.length} {t('total_displayed')}</div>
        <div className="grid grid-cols-2 gap-3 px-3 mt-1">
          {displayWatches.map(w => {
            const displayImage = w.images && w.images.length > 0 ? w.images[0] : w.image;
            return (
            <Card key={w.id} onClick={() => { setSelectedWatch(w); setViewedImageIndex(0); setView('detail'); }} theme={theme}>
              <div className={`aspect-square ${theme.bg} relative`}>
                {displayImage ? <img src={displayImage} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera/></div>}
                {(w.purchasePrice) && (<div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{formatPrice(w.purchasePrice)}</div>)}
                <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 shadow-sm flex flex-col items-end">{w.status === 'sold' ? <span className="text-emerald-600 font-extrabold">{t('sold')}</span> : formatPrice(w.sellingPrice || w.purchasePrice)}</div>
                <div className="absolute bottom-1 right-1 p-1.5 bg-white/90 rounded-full shadow-sm cursor-pointer z-10" onClick={(e) => { e.stopPropagation(); toggleVisibility(w); }}>{w.publicVisible ? <Eye size={14} className="text-emerald-600"/> : <EyeOff size={14} className="text-slate-400"/>}</div>
              </div>
              <div className="p-3"><div className={`font-bold font-serif text-sm truncate ${theme.text}`}>{w.brand}</div><div className={`text-xs ${theme.textSub} truncate`}>{w.model}</div></div>
            </Card>
          )})}
        </div>
      </div>
    );
  };

  const renderWishlist = () => {
    const wishes = filteredWatches.filter(w => w.status === 'wishlist');
    return (
      <div className="pb-24">
        {renderHeader(t('wishlist'))}
        <div className="space-y-3 px-3 mt-3">
          <button onClick={() => openAdd()} className={`w-full py-4 border-2 border-dashed ${theme.border} rounded-xl flex items-center justify-center ${theme.textSub} font-medium hover:border-rose-400 hover:text-rose-500 transition-colors`}><Plus className="mr-2" size={20}/> {t('add_new')}</button>
          {wishes.map(w => {
            const displayImage = w.images?.[0] || w.image;
            return (
            <Card key={w.id} className="flex p-3 gap-3 relative" onClick={() => { setSelectedWatch(w); setView('detail'); }} theme={theme}>
                <div className={`w-20 h-20 ${theme.bg} rounded-lg flex-shrink-0 overflow-hidden`}>{displayImage ? <img src={displayImage} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Heart size={20}/></div>}</div>
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div><h3 className={`font-bold font-serif ${theme.text} tracking-wide`}>{w.brand}</h3><p className={`text-xs ${theme.textSub}`}>{w.model}</p></div>
                    <div className="flex justify-between items-end"><div className="font-semibold text-emerald-600">{formatPrice(w.purchasePrice)}</div>{w.link && (<a href={w.link} target="_blank" rel="noreferrer" className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 z-10" onClick={(e) => { e.stopPropagation(); }}><ExternalLink size={14} /></a>)}</div>
                </div>
            </Card>
          )})}
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if(!selectedWatch) return null;
    const w = selectedWatch;
    const displayImages = w.images && w.images.length > 0 ? w.images : (w.image ? [w.image] : []);
    
    // Helpers for Market Search Links
    const searchQuery = `${w.brand} ${w.model}`.replace(/\s+/g, '+');
    const marketLinks = [
        { name: "Chrono24", url: `https://www.chrono24.fr/search/index.htm?query=${searchQuery}`, icon: Clock },
        { name: "eBay", url: `https://www.ebay.fr/sch/i.html?_nkw=${searchQuery}`, icon: ShoppingCart },
        { name: "Vinted", url: `https://www.vinted.fr/vetements?search_text=${searchQuery}`, icon: Gem }, // Approximate icon
        { name: "LeBonCoin", url: `https://www.leboncoin.fr/recherche?text=${searchQuery}`, icon: MapPin },
    ];

    // Helper for Watch Usage Stats
    const getWatchStats = (watchId) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let monthCount = 0;
        let yearCount = 0;
        let lastYearCount = 0;

        calendarEvents.forEach(evt => {
            if (evt.watches && evt.watches.includes(watchId)) {
                const d = new Date(evt.date);
                const dy = d.getFullYear();
                const dm = d.getMonth();
                
                if (dy === currentYear) {
                    yearCount++;
                    if (dm === currentMonth) monthCount++;
                } else if (dy === currentYear - 1) {
                    lastYearCount++;
                }
            }
        });
        return { monthCount, yearCount, lastYearCount };
    };

    const stats = getWatchStats(w.id);

    return (
      <div className={`pb-24 ${theme.bgSecondary} min-h-screen`}>
        <div className={`sticky top-0 ${theme.bgSecondary}/90 backdrop-blur p-4 flex items-center justify-between border-b ${theme.border} z-10`}>
          <button onClick={() => { setSelectedWatch(null); setView(w.status === 'wishlist' ? 'wishlist' : 'list'); }} className={theme.text}><ChevronLeft/></button>
          <span className={`font-bold font-serif ${theme.text} tracking-wide`}>Détails</span>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(w, 'watch')} className={`p-2 ${theme.bg} ${theme.textSub} rounded-full`}><Edit2 size={18}/></button>
            <button onClick={() => handleDelete(w.id, 'watch')} className="p-2 bg-red-50 text-red-500 rounded-full"><Trash2 size={18}/></button>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="space-y-4">
              <div className={`aspect-square ${theme.bg} rounded-2xl overflow-hidden shadow-sm border ${theme.border} relative group`} onClick={() => setFullScreenImage(displayImages[viewedImageIndex])}>
                {displayImages[viewedImageIndex] ? <img src={displayImages[viewedImageIndex]} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center"><Camera size={48} className={theme.textSub}/></div>}
                {displayImages.length > 1 && (<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">{displayImages.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all shadow-sm ${i === viewedImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}></div>)}</div>)}
              </div>
              {displayImages.length > 1 && (<div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{displayImages.map((img, i) => (<div key={i} onClick={() => setViewedImageIndex(i)} className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 border-2 ${i === viewedImageIndex ? 'border-indigo-500' : 'border-transparent'}`}><img src={img} className="w-full h-full object-cover" /></div>))}</div>)}
              <div>
                <h1 className={`text-3xl font-serif font-bold ${theme.text} leading-tight`}>{w.brand}</h1>
                <p className={`text-xl ${theme.textSub} font-medium font-serif`}>{w.model}</p>
                {w.reference && <span className={`text-xs ${theme.bg} px-2 py-1 rounded mt-2 inline-block border ${theme.border} font-mono ${theme.textSub}`}>REF: {w.reference}</span>}
                {w.isLimitedEdition && (<div className={`mt-2 inline-flex items-center px-3 py-1 ${theme.text} bg-indigo-500/10 text-xs font-bold rounded-full border border-indigo-500/30`}>{t('limited_edition')} {w.limitedNumber && w.limitedTotal ? `${w.limitedNumber} / ${w.limitedTotal}` : ''}</div>)}
              </div>
          </div>

          {/* EXPORT BUTTONS */}
          <div className="flex gap-2">
               {w.status !== 'wishlist' && <button onClick={() => setExportType('insurance')} className={`flex-1 py-3 ${theme.bg} border ${theme.border} rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${theme.text} hover:opacity-80`}><ShieldCheck size={16}/> {t('sheet_insurance')}</button>}
               {w.status !== 'wishlist' && <button onClick={() => setExportType('sale')} className={`flex-1 py-3 ${theme.bg} border ${theme.border} rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${theme.text} hover:opacity-80`}><DollarSign size={16}/> {t('sheet_sale')}</button>}
          </div>

          {/* MARKET SEARCH LINKS */}
          <div className={`${theme.card} border ${theme.border} rounded-xl p-4 shadow-sm`}>
               <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{w.status === 'wishlist' ? t('find_used') : t('market_value')}</h3>
               <div className="grid grid-cols-2 gap-2">
                   {marketLinks.map((link) => {
                       const LinkIconComponent = link.icon;
                       return (
                       <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${theme.bg} border ${theme.border} hover:bg-indigo-50 hover:border-indigo-200 transition-colors`}>
                           <LinkIconComponent size={14} className="text-indigo-600"/>
                           <span className={`text-xs font-bold ${theme.text}`}>{link.name}</span>
                           <ExternalLink size={10} className="ml-auto text-slate-400"/>
                       </a>
                   )})}
               </div>
          </div>

          {w.status === 'wishlist' && (
              <>
                  {w.link && (
                      <a href={w.link} target="_blank" rel="noreferrer" className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors mb-4 border border-indigo-100">
                          <LinkIcon size={20} /> {t('visit_site')}
                      </a>
                  )}
                  <button onClick={() => handleMoveToCollection(w)} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-transform active:scale-95 mb-4">
                      <Gift size={20} /> {t('move_collection')}
                  </button>
              </>
          )}

          {/* USAGE STATS */}
          {w.status === 'collection' && (
              <div className={`${theme.card} border ${theme.border} rounded-xl p-4 shadow-sm`}>
                  <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider flex items-center gap-2`}>
                      <BarChart2 size={14}/> {t('stats_usage')}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                      <div className={`p-2 rounded-lg ${theme.bg}`}>
                          <div className={`text-lg font-bold ${theme.text}`}>{stats.monthCount}</div>
                          <div className={`text-[9px] uppercase ${theme.textSub}`}>{t('worn_this_month')}</div>
                      </div>
                      <div className={`p-2 rounded-lg ${theme.bg}`}>
                          <div className={`text-lg font-bold ${theme.text}`}>{stats.yearCount}</div>
                          <div className={`text-[9px] uppercase ${theme.textSub}`}>{t('worn_this_year')}</div>
                      </div>
                      <div className={`p-2 rounded-lg ${theme.bg}`}>
                          <div className={`text-lg font-bold ${theme.text}`}>{stats.lastYearCount}</div>
                          <div className={`text-[9px] uppercase ${theme.textSub}`}>{t('worn_last_year')}</div>
                      </div>
                  </div>
              </div>
          )}
          
          {/* TECHNICAL SPECS */}
          <div>
              <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('specs')}</h3>
              <div className="grid grid-cols-2 gap-3">
                  <DetailItem icon={Ruler} label={t('diameter')} value={w.diameter ? w.diameter + ' mm' : ''} theme={theme} />
                  <DetailItem icon={Layers} label={t('thickness')} value={w.thickness ? w.thickness + ' mm' : ''} theme={theme} />
                  <DetailItem icon={Activity} label={t('lug_width')} value={w.strapWidth ? w.strapWidth + ' mm' : ''} theme={theme} />
                  <DetailItem icon={Scale} label={t('weight')} value={w.weight ? w.weight + ' g' : ''} theme={theme} />
                  <DetailItem icon={Droplets} label={t('water_res')} value={w.waterResistance ? w.waterResistance + ' ATM' : ''} theme={theme} />
              </div>
          </div>

          {/* MOVEMENT & DIAL */}
          <div>
               <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('movement')} & {t('dial')}</h3>
               <div className="grid grid-cols-2 gap-3">
                  <DetailItem icon={MovementIcon} label={t('movement')} value={w.movement} theme={theme} />
                  <DetailItem icon={Settings} label={t('movement_model')} value={w.movementModel} theme={theme} />
                  {w.batteryModel && <DetailItem icon={Battery} label={t('battery')} value={w.batteryModel} theme={theme} />}
                  <DetailItem icon={Palette} label={t('dial')} value={w.dialColor} theme={theme} />
                  <DetailItem icon={Search} label={t('glass')} value={w.glass} theme={theme} />
               </div>
          </div>

          {/* ORIGIN & MAINTENANCE */}
          <div>
               <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('origin_maintenance')}</h3>
               <div className="grid grid-cols-2 gap-3">
                  <DetailItem icon={MapPin} label={t('country')} value={w.country} theme={theme} />
                  <DetailItem icon={Calendar} label={t('year')} value={w.year} theme={theme} />
                  <DetailItem icon={Package} label={t('box_included')} value={w.box} theme={theme} />
                  <DetailItem icon={ShieldCheck} label={t('warranty')} value={w.warrantyDate} theme={theme} />
                  <DetailItem icon={Wrench} label={t('revision')} value={w.revision} theme={theme} />
               </div>
          </div>
          
          {/* CONDITION & RATING (NEW) */}
          {(w.conditionRating || w.conditionComment) && (
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
                  <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>État & Condition</h3>
                  {w.conditionRating && (
                      <div className="flex items-center gap-2 mb-2">
                          <div className={`text-lg font-bold ${theme.text} bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg`}>{w.conditionRating}/10</div>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${w.conditionRating * 10}%` }}></div>
                          </div>
                      </div>
                  )}
                  {w.conditionComment && (
                      <p className={`text-sm ${theme.text} italic`}>"{w.conditionComment}"</p>
                  )}
              </div>
          )}

          {/* DOCUMENTS & INVOICE */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>Documents</h3>
              {w.invoice ? (
                  <div className={`aspect-video rounded-xl overflow-hidden border ${theme.border} relative group cursor-pointer`} onClick={() => setFullScreenImage(w.invoice)}>
                      <img src={w.invoice} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                              <Receipt size={14}/> {t('view_invoice')}
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className={`p-4 text-center text-sm ${theme.textSub} italic border border-dashed ${theme.border} rounded-xl`}>Aucune facture enregistrée</div>
              )}
          </div>

          {/* FINANCE & DATES */}
          <div>
              <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('finance')} & Dates</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                  {w.purchaseDate && <DetailItem icon={Calendar} label={t('date_purchase')} value={w.purchaseDate} theme={theme} />}
                  {w.soldDate && w.status === 'sold' && <DetailItem icon={Calendar} label={t('date_sold')} value={w.soldDate} theme={theme} />}
              </div>
              <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${theme.border}`}>
                <div className={`p-3 ${theme.bg} rounded-lg border ${theme.border}`}><div className={`text-xs ${theme.textSub} uppercase`}>{t('purchase_price')}</div><div className={`text-lg font-bold ${theme.text}`}>{formatPrice(w.purchasePrice)}</div></div>
                {w.status !== 'wishlist' && (<div className={`p-3 ${theme.bg} rounded-lg border ${theme.border}`}><div className={`text-xs ${theme.textSub} uppercase`}>{t('selling_price')}</div><div className="text-lg font-bold text-emerald-600">{formatPrice(w.sellingPrice || w.purchasePrice)}</div></div>)}
              </div>
          </div>
          
          {/* HISTORY & NOTES */}
          {w.conditionNotes && (<div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-800 border border-amber-100 mt-4"><div className="flex items-center font-bold text-amber-800 mb-2 text-xs uppercase"><FileText size={12} className="mr-1"/> {t('notes')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{w.conditionNotes}</div></div>)}
          {w.historyBrand && (<div className="bg-indigo-50 p-4 rounded-lg text-sm text-slate-800 border border-indigo-100 mt-4"><div className="flex items-center font-bold text-indigo-800 mb-2 text-xs uppercase"><BookOpen size={12} className="mr-1"/> {t('history_brand')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{w.historyBrand}</div></div>)}
          {w.historyModel && (<div className="bg-indigo-50 p-4 rounded-lg text-sm text-slate-800 border border-indigo-100 mt-4"><div className="flex items-center font-bold text-indigo-800 mb-2 text-xs uppercase"><BookOpen size={12} className="mr-1"/> {t('history_model')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{w.historyModel}</div></div>)}
        </div>
      </div>
    );
  };
  
  // Re-added renderProfile function which was missing
  const renderProfile = () => (
    <div className="pb-24 px-2">
      <div className={`sticky top-0 ${theme.bgSecondary} z-10 pt-2 pb-2 px-1 shadow-sm border-b ${theme.border} mb-2`}>
         <div className="flex justify-between items-center px-2 mb-2">
            <h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide`}>{t('gallery')}</h1>
         </div>
         <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar pb-1">
               <button onClick={() => setShowGalleryCollection(!showGalleryCollection)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryCollection ? 'bg-blue-50 border-blue-200 text-blue-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('collection')}</button>
               <button onClick={() => setShowGalleryForsale(!showGalleryForsale)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryForsale ? 'bg-amber-50 border-amber-200 text-amber-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('forsale')}</button>
               <button onClick={() => setShowGallerySold(!showGallerySold)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGallerySold ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('sold')}</button>
               <button onClick={() => setShowGalleryWishlist(!showGalleryWishlist)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryWishlist ? 'bg-rose-50 border-rose-200 text-rose-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('wishlist')}</button>
         </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-2 px-1">
          {filteredWatches.filter(w => { 
             if (!w.image && (!w.images || w.images.length === 0)) return false; 
             if (w.status === 'collection' && showGalleryCollection) return true; 
             if (w.status === 'forsale' && showGalleryForsale) return true; 
             if (w.status === 'sold' && showGallerySold) return true; 
             if (w.status === 'wishlist' && showGalleryWishlist) return true;
             return false; 
          }).map(w => (
              <div key={w.id} className={`aspect-square ${theme.bg} rounded overflow-hidden relative cursor-pointer`} onClick={() => { setSelectedWatch(w); setView('detail'); }}>
                  <img src={w.images?.[0] || w.image} className="w-full h-full object-cover" />
              </div>
          ))}
          {filteredWatches.filter(w => { if (!w.image && (!w.images || w.images.length === 0)) return false; if (w.status === 'collection' && showGalleryCollection) return true; if (w.status === 'forsale' && showGalleryForsale) return true; if (w.status === 'sold' && showGallerySold) return true; if (w.status === 'wishlist' && showGalleryWishlist) return true; return false; }).length === 0 && (
              <div className={`col-span-3 text-center ${theme.textSub} py-10 text-sm`}>Aucune photo disponible.</div>
          )}
      </div>
    </div>
  );

  const renderStats = () => {
      // Logic for Calendar & Top Worn (unchanged)
      const getTopWatches = () => {
        const periodCounts = {};
        calendarEvents.forEach(evt => {
            const evtDate = new Date(evt.date);
            let inPeriod = false;
            if (statsTimeframe === 'all') inPeriod = true;
            else if (statsTimeframe === 'year') inPeriod = evtDate.getFullYear() === currentMonth.getFullYear();
            else inPeriod = evtDate.getMonth() === currentMonth.getMonth() && evtDate.getFullYear() === currentMonth.getFullYear();
            if (inPeriod && evt.watches) evt.watches.forEach(wId => { periodCounts[wId] = (periodCounts[wId] || 0) + 1; });
        });
        return Object.entries(periodCounts).sort(([,a], [,b]) => b - a).slice(0, 5).map(([wId, count]) => { const w = watches.find(watch => watch.id === wId); return w ? { ...w, count } : null; }).filter(Boolean);
      };
      const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate(); const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(<div key={`pad-${i}`}></div>);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const event = calendarEvents.find(e => e.id === dateStr || e.date === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            days.push(
                <div key={d} onClick={() => handleCalendarDayClick(dateStr)} className={`aspect-square border rounded-lg p-1 relative cursor-pointer ${theme.border} ${isToday ? 'border-indigo-500 bg-indigo-500/10' : theme.bg}`}>
                    <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-500' : theme.textSub}`}>{d}</span>
                    <div className="flex flex-wrap gap-0.5 mt-1">{event?.watches?.slice(0, 4).map((wId, idx) => { const w = watches.find(wa => wa.id === wId); if (!w) return null; const img = w.images?.[0] || w.image; return (<div key={idx} className="w-1.5 h-1.5 rounded-full bg-slate-300 overflow-hidden">{img && <img src={img} className="w-full h-full object-cover" />}</div>); })}</div>
                </div>
            );
        }
        return days;
      };

      // NEW STATS LOGIC
      const getTopBrands = () => {
          const brands = watches.filter(w => w.status === 'collection').reduce((acc, w) => { if(w.brand) acc[w.brand] = (acc[w.brand] || 0) + 1; return acc; }, {});
          return Object.entries(brands).sort((a,b) => b[1] - a[1]).slice(0, 5);
      };
      const getTopDials = () => {
          const dials = watches.filter(w => w.status === 'collection').reduce((acc, w) => { if(w.dialColor) acc[w.dialColor] = (acc[w.dialColor] || 0) + 1; return acc; }, {});
          return Object.entries(dials).sort((a,b) => b[1] - a[1]).slice(0, 5);
      };

      const topBrands = getTopBrands();
      const topDials = getTopDials();
      
      return (
        <div className="pb-24 px-3">
            <div className={`sticky top-0 ${theme.bgSecondary} z-10 py-3 border-b ${theme.border} mb-4 flex justify-between items-center`}>
                <h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide px-1`}>{t('stats')}</h1>
            </div>
            <div className="space-y-6">
                {/* CALENDAR */}
                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} shadow-sm`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold text-sm ${theme.text} flex items-center gap-2`}><Calendar className="text-indigo-600" size={16} /> {t('calendar')}</h3>
                        <div className="flex gap-2"><button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className={`p-1 hover:${theme.bg} rounded ${theme.text}`}><ChevronLeft size={16}/></button><span className={`text-xs font-bold capitalize w-24 text-center ${theme.text}`}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className={`p-1 hover:${theme.bg} rounded ${theme.text}`}><ChevronRight size={16}/></button></div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">{renderCalendarGrid()}</div>
                </div>

                {/* TOP WORN */}
                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} shadow-sm`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold text-sm ${theme.text} flex items-center gap-2`}><TrendingUp className="text-emerald-500" size={16} /> {t('top_worn')}</h3>
                        <div className={`flex ${theme.bg} rounded-lg p-0.5`}>
                            {[{id: 'month', label: t('month')}, {id: 'year', label: t('year')}, {id: 'all', label: t('all_time')}].map(t => (<button key={t.id} onClick={() => setStatsTimeframe(t.id)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${statsTimeframe === t.id ? `${theme.bgSecondary} shadow ${theme.text}` : theme.textSub}`}>{t.label}</button>))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {getTopWatches().map((w, i) => (<div key={w.id} className={`flex items-center gap-3 ${theme.bg} p-2 rounded-lg border ${theme.border}`}><div className={`font-black ${theme.textSub} text-xl w-6 text-center`}>#{i+1}</div><div className={`w-10 h-10 ${theme.bgSecondary} rounded-lg overflow-hidden flex-shrink-0`}><img src={w.images?.[0] || w.image} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><div className={`font-bold text-sm ${theme.text} truncate`}>{w.brand}</div><div className={`text-xs ${theme.textSub} truncate`}>{w.model}</div></div><div className="font-bold text-indigo-600 text-sm">{w.count}</div></div>))}
                    </div>
                </div>

                {/* NEW: TOP BRANDS */}
                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} shadow-sm`}>
                    <h3 className={`font-bold text-sm ${theme.text} flex items-center gap-2 mb-4`}><PieChart className="text-blue-500" size={16} /> {t('fav_brands')}</h3>
                    <div className="space-y-3">
                        {topBrands.map(([brand, count], i) => (
                            <div key={brand} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 w-full">
                                    <span className={`text-xs font-bold w-6 text-center ${theme.textSub}`}>#{i+1}</span>
                                    <div className="flex-1">
                                        <div className={`flex justify-between text-xs mb-1 ${theme.text}`}><span>{brand}</span><span className="font-bold">{count}</span></div>
                                        <div className={`h-1.5 rounded-full ${theme.bg} overflow-hidden`}><div className="h-full bg-blue-500 rounded-full" style={{width: `${(count / topBrands[0][1]) * 100}%`}}></div></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* NEW: TOP DIALS */}
                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} shadow-sm`}>
                    <h3 className={`font-bold text-sm ${theme.text} flex items-center gap-2 mb-4`}><Palette className="text-purple-500" size={16} /> {t('fav_dials')}</h3>
                    <div className="space-y-3">
                        {topDials.map(([color, count], i) => (
                            <div key={color} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 w-full">
                                    <span className={`text-xs font-bold w-6 text-center ${theme.textSub}`}>#{i+1}</span>
                                    <div className="flex-1">
                                        <div className={`flex justify-between text-xs mb-1 ${theme.text}`}><span>{color}</span><span className="font-bold">{count}</span></div>
                                        <div className={`h-1.5 rounded-full ${theme.bg} overflow-hidden`}><div className="h-full bg-purple-500 rounded-full" style={{width: `${(count / topDials[0][1]) * 100}%`}}></div></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Calendar Modal Code (Unchanged) */}
            {selectedCalendarDate && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className={`${theme.card} rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]`}>
                        <div className={`p-4 border-b ${theme.border} ${theme.bgSecondary}`}>
                            <div className="flex justify-between items-center mb-3"><h3 className={`font-bold ${theme.text}`}>Porté le {new Date(selectedCalendarDate).toLocaleDateString()}</h3><button onClick={() => setSelectedCalendarDate(null)}><X size={20} className={theme.textSub}/></button></div>
                            <input autoFocus type="text" placeholder="Rechercher..." className={`w-full p-2 ${theme.input} rounded-lg text-sm`} value={calendarSearchTerm} onChange={(e) => setCalendarSearchTerm(e.target.value)}/>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {watches.filter(w => w.status === 'collection').filter(w => !calendarSearchTerm || w.brand.toLowerCase().includes(calendarSearchTerm.toLowerCase())).map(w => {
                                const isSelected = selectedCalendarWatches.includes(w.id);
                                return (<div key={w.id} onClick={() => setSelectedCalendarWatches(prev => isSelected ? prev.filter(id => id !== w.id) : [...prev, w.id])} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : `${theme.border} hover:${theme.bg}`}`}><div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : `${theme.bgSecondary} ${theme.border}`}`}>{isSelected && <Check size={12} className="text-white" />}</div><div className={`font-bold text-sm ${theme.text}`}>{w.brand}</div></div>);
                            })}
                        </div>
                        <div className={`p-4 border-t ${theme.border} ${theme.bgSecondary}`}><button onClick={handleCalendarSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Enregistrer</button></div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  const renderFinance = () => {
    // Basic Stats
    const sCol = { buy: watches.filter(w=>w.status==='collection').reduce((a,w)=>a+(w.purchasePrice||0),0), val: watches.filter(w=>w.status==='collection').reduce((a,w)=>a+(w.sellingPrice||w.purchasePrice||0),0), profit: 0 }; sCol.profit = sCol.val - sCol.buy;
    const sSale = { buy: watches.filter(w=>w.status==='forsale').reduce((a,w)=>a+(w.purchasePrice||0),0), val: watches.filter(w=>w.status==='forsale').reduce((a,w)=>a+(w.sellingPrice||w.purchasePrice||0),0), profit: 0 }; sSale.profit = sSale.val - sSale.buy;
    const sSold = { buy: watches.filter(w=>w.status==='sold').reduce((a,w)=>a+(w.purchasePrice||0),0), val: watches.filter(w=>w.status==='sold').reduce((a,w)=>a+(w.sellingPrice||w.purchasePrice||0),0), profit: 0 }; sSold.profit = sSold.val - sSold.buy;
    const sTotal = { buy: sCol.buy+sSale.buy+sSold.buy, val: sCol.val+sSale.val+sSold.val, profit: sCol.profit+sSale.profit+sSold.profit };

    // TIMELINE LOGIC (Revised: Group by Month, Filter by state)
    // Create map of all months with activity
    const timelineMap = watches.reduce((acc, w) => {
        // Handle purchases
        if (w.purchaseDate && w.purchasePrice) {
            const d = new Date(w.purchaseDate);
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            if (!acc[key]) acc[key] = { date: key, spent: 0, gained: 0, count: 0 };
            acc[key].spent += Number(w.purchasePrice);
            acc[key].count += 1; // Count activity
        }
        // Handle sales
        if (w.status === 'sold' && w.soldDate && w.sellingPrice) {
            const d = new Date(w.soldDate);
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            if (!acc[key]) acc[key] = { date: key, spent: 0, gained: 0, count: 0 };
            acc[key].gained += Number(w.sellingPrice);
            // Don't double count if purchased and sold same month? keep simple count of transactions.
        }
        return acc;
    }, {});
    
    let sortedTimeline = Object.values(timelineMap).sort((a,b) => b.date.localeCompare(a.date));

    // FILTER LOGIC
    // Default: Current Month, Previous Month, Current Year Summary (Separate block)
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth()+1).padStart(2,'0')}`;
    const currentYearKey = String(now.getFullYear());

    // Calculate Current Year Summary
    const currentYearStats = sortedTimeline.filter(t => t.date.startsWith(currentYearKey)).reduce((acc, curr) => {
        acc.spent += curr.spent;
        acc.gained += curr.gained;
        return acc;
    }, { spent: 0, gained: 0 });

    const displayedTimeline = timelineFilter === 'default' 
        ? sortedTimeline.filter(t => t.date === currentMonthKey || t.date === prevMonthKey)
        : sortedTimeline;

    return (
      <div className="pb-24 px-3 space-y-2">
        <div className={`sticky top-0 ${theme.bgSecondary} z-10 py-2 border-b ${theme.border} mb-2`}><h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide px-1`}>{t('finance')}</h1></div>
        
        {/* Modals */}
        {financeDetail === 'collection' && <FinanceDetailList title={t('collection')} items={watches.filter(w=>w.status==='collection')} onClose={() => setFinanceDetail(null)} theme={theme} />}
        {financeDetail === 'forsale' && <FinanceDetailList title={t('forsale')} items={watches.filter(w=>w.status==='forsale')} onClose={() => setFinanceDetail(null)} theme={theme} />}
        {financeDetail === 'sold' && <FinanceDetailList title={t('sold')} items={watches.filter(w=>w.status==='sold')} onClose={() => setFinanceDetail(null)} theme={theme} />}
        
        {/* Cards */}
        <FinanceCardFull title={t('collection')} icon={Watch} stats={sCol} type="collection" bgColor="bg-emerald-500" onClick={() => setFinanceDetail('collection')} theme={theme} />
        <FinanceCardFull title={t('forsale')} icon={TrendingUp} stats={sSale} type="forsale" bgColor="bg-amber-500" onClick={() => setFinanceDetail('forsale')} theme={theme} />
        <FinanceCardFull title={t('sold')} icon={DollarSign} stats={sSold} type="sold" bgColor="bg-blue-600" onClick={() => setFinanceDetail('sold')} theme={theme} />
        <div className="mt-4 pt-2"><FinanceCardFull title={t('total_value')} icon={Activity} stats={sTotal} type="total" bgColor="bg-white" onClick={() => {}} theme={theme} /></div>

        {/* TIMELINE */}
        <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-sm ${theme.text} uppercase tracking-wider flex items-center gap-2`}><Briefcase size={16}/> {t('finance_timeline')}</h3>
                <button 
                    onClick={() => setTimelineFilter(prev => prev === 'default' ? 'all' : 'default')}
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${timelineFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : `${theme.bgSecondary} ${theme.text} ${theme.border}`}`}
                >
                    {timelineFilter === 'default' ? t('show_history') : t('show_less')}
                </button>
            </div>

            {/* Current Year Summary (Always visible in Default mode, or stick to top?) Let's put it at top in default mode */}
            {timelineFilter === 'default' && (
                <div className={`mb-4 p-3 rounded-xl border-2 border-indigo-100 bg-indigo-50/50`}>
                    <div className="text-xs font-bold text-indigo-900 uppercase mb-2 text-center">{t('year_summary')} {currentYearKey}</div>
                    <div className="flex justify-between text-sm">
                        <div className="text-red-500 font-bold">- {formatPrice(currentYearStats.spent)}</div>
                        <div className="font-mono font-bold text-slate-400">= {formatPrice(currentYearStats.gained - currentYearStats.spent)}</div>
                        <div className="text-emerald-600 font-bold">+ {formatPrice(currentYearStats.gained)}</div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {displayedTimeline.length === 0 && timelineFilter === 'default' && <div className={`text-center text-xs ${theme.textSub} py-4 italic`}>Aucune activité récente.</div>}
                
                {displayedTimeline.map((tItem) => (
                    <div key={tItem.date} className={`${theme.card} p-3 rounded-xl border ${theme.border} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme.bgSecondary} font-mono text-xs font-bold ${theme.textSub}`}>
                                {tItem.date}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-xs ${theme.textSub}`}>{tItem.count} {t('pieces')}</span>
                                <span className={`font-bold text-sm ${theme.text} ${tItem.gained - tItem.spent > 0 ? 'text-emerald-500' : (tItem.gained - tItem.spent < 0 ? 'text-red-500' : 'text-slate-500')}`}>
                                    {formatPrice(tItem.gained - tItem.spent)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right text-xs">
                            {tItem.spent > 0 && <div className="text-red-500 font-medium">- {formatPrice(tItem.spent)}</div>}
                            {tItem.gained > 0 && <div className="text-emerald-500 font-medium">+ {formatPrice(tItem.gained)}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };

  // --- RENDER FORM ---
  const renderForm = () => {
      const isWatch = editingType === 'watch';
      const currentImages = isWatch ? (watchForm.images || (watchForm.image ? [watchForm.image] : [])) : [];
      return (
        <div className={`pb-24 p-4 ${theme.bgSecondary} min-h-screen`}>
          <div className="flex justify-between items-center mb-6 mt-2">
              <h1 className={`text-2xl font-bold font-serif ${theme.text}`}>{editingId ? t('edit') : t('add_new')}</h1>
              <button onClick={() => handleCancelForm()} className={theme.text}><X/></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... (Image Grid - Unchanged) ... */}
            <div className="grid grid-cols-3 gap-3">
                {currentImages.map((img, idx) => (
                    <div key={idx} className={`aspect-square rounded-xl overflow-hidden relative border ${theme.border}`}>
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                        {idx === 0 ? <div className="absolute bottom-0 w-full bg-emerald-500 text-white text-[8px] text-center">MAIN</div> : <button type="button" onClick={() => setAsMainImage(idx)} className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] px-1 rounded">Set Main</button>}
                    </div>
                ))}
                {currentImages.length < 3 && (
                    <label className={`aspect-square ${theme.bg} rounded-xl flex flex-col items-center justify-center border-2 border-dashed ${theme.border} cursor-pointer`}>
                        <Camera className={theme.textSub} size={24}/>
                        <input type="file" onChange={(e) => handleImageUpload(e, 'watch')} className="hidden" accept="image/*"/>
                    </label>
                )}
            </div>
            
            {/* IDENTITY */}
            <div className="space-y-3">
                 <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider`}>{t('identity')}</h3>
                 <input className={`w-full p-3 rounded-lg ${theme.input}`} placeholder={t('brand')} value={watchForm.brand} onChange={e => setWatchForm({...watchForm, brand: e.target.value})} required />
                 <input className={`w-full p-3 rounded-lg ${theme.input}`} placeholder={t('model')} value={watchForm.model} onChange={e => setWatchForm({...watchForm, model: e.target.value})} required />
                 <input className={`w-full p-3 rounded-lg ${theme.input}`} placeholder={t('reference')} value={watchForm.reference} onChange={e => setWatchForm({...watchForm, reference: e.target.value})} />
                 <div className="relative">
                     <input className={`w-full p-3 pl-10 rounded-lg ${theme.input}`} placeholder={t('dial')} value={watchForm.dialColor || ''} onChange={e => setWatchForm({...watchForm, dialColor: e.target.value})} />
                     <Palette className={`absolute left-3 top-3.5 ${theme.textSub}`} size={18} />
                 </div>
                 <div className={`p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                     <div className="flex items-center mb-2">
                        <input type="checkbox" id="isLimited" checked={watchForm.isLimitedEdition} onChange={e => setWatchForm({...watchForm, isLimitedEdition: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded mr-2" />
                        <label htmlFor="isLimited" className={`text-sm font-bold ${theme.text}`}>{t('limited_edition')}</label>
                     </div>
                     {watchForm.isLimitedEdition && (
                        <div className="flex gap-2 pl-6 animate-in slide-in-from-top-1">
                            <input className={`w-full p-2 border rounded text-sm ${theme.input}`} placeholder="N°" value={watchForm.limitedNumber} onChange={e => setWatchForm({...watchForm, limitedNumber: e.target.value})} />
                            <span className={`py-2 ${theme.textSub}`}>/</span>
                            <input className={`w-full p-2 border rounded text-sm ${theme.input}`} placeholder="Total" value={watchForm.limitedTotal} onChange={e => setWatchForm({...watchForm, limitedTotal: e.target.value})} />
                        </div>
                     )}
                 </div>
            </div>

            {/* TECHNICAL */}
            <div className="space-y-3">
                 <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider`}>{t('technical')}</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <input type="number" className={`p-3 rounded-lg ${theme.input}`} placeholder={`${t('diameter')} (mm)`} value={watchForm.diameter} onChange={e => setWatchForm({...watchForm, diameter: e.target.value})} />
                    <input type="number" className={`p-3 rounded-lg ${theme.input}`} placeholder={`${t('thickness')} (mm)`} value={watchForm.thickness} onChange={e => setWatchForm({...watchForm, thickness: e.target.value})} />
                    <input type="number" className={`p-3 rounded-lg ${theme.input}`} placeholder={`${t('lug_width')} (mm)`} value={watchForm.strapWidth} onChange={e => setWatchForm({...watchForm, strapWidth: e.target.value})} />
                    <input type="number" className={`p-3 rounded-lg ${theme.input}`} placeholder={`${t('water_res')} (ATM)`} value={watchForm.waterResistance} onChange={e => setWatchForm({...watchForm, waterResistance: e.target.value})} />
                    <input type="number" className={`p-3 rounded-lg ${theme.input}`} placeholder={`${t('weight')} (g)`} value={watchForm.weight || ''} onChange={e => setWatchForm({...watchForm, weight: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <input className={`p-3 rounded-lg ${theme.input}`} placeholder={t('movement')} value={watchForm.movement} onChange={e => setWatchForm({...watchForm, movement: e.target.value})} />
                    <input className={`p-3 rounded-lg ${theme.input}`} placeholder={t('movement_model')} value={watchForm.movementModel || ''} onChange={e => setWatchForm({...watchForm, movementModel: e.target.value})} />
                 </div>
                 {['quartz', 'pile', 'battery'].some(k => (watchForm.movement || '').toLowerCase().includes(k)) && (
                     <div className={`p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                        <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${theme.textSub}`}><Battery size={14}/> {t('battery')}</div>
                        <input className={`w-full p-3 rounded-lg ${theme.input}`} placeholder="Ref Pile (ex: 377)" value={watchForm.batteryModel || ''} onChange={e => setWatchForm({...watchForm, batteryModel: e.target.value})} />
                     </div>
                 )}
                 <input className={`w-full p-3 rounded-lg ${theme.input}`} placeholder={t('glass')} value={watchForm.glass} onChange={e => setWatchForm({...watchForm, glass: e.target.value})} />
            </div>

            {/* ORIGIN & DATES */}
            <div className="space-y-3">
                 <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider`}>{t('origin_maintenance')}</h3>
                 <div className="grid grid-cols-3 gap-3">
                    <input className={`p-3 rounded-lg ${theme.input}`} placeholder={t('country')} value={watchForm.country} onChange={e => setWatchForm({...watchForm, country: e.target.value})} />
                    <input type="number" className={`p-3 rounded-lg ${theme.input}`} placeholder={t('year')} value={watchForm.year} onChange={e => setWatchForm({...watchForm, year: e.target.value})} />
                    <input className={`p-3 rounded-lg ${theme.input}`} placeholder={t('box_included')} value={watchForm.box} onChange={e => setWatchForm({...watchForm, box: e.target.value})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                     <div>
                         <label className={`text-[10px] uppercase font-bold ${theme.textSub} mb-1 block`}>{t('date_purchase')}</label>
                         <input type="date" className={`w-full p-3 rounded-lg ${theme.input}`} value={watchForm.purchaseDate || ''} onChange={e => setWatchForm({...watchForm, purchaseDate: e.target.value})} />
                     </div>
                     {watchForm.status === 'sold' && (
                         <div>
                             <label className={`text-[10px] uppercase font-bold ${theme.textSub} mb-1 block`}>{t('date_sold')}</label>
                             <input type="date" className={`w-full p-3 rounded-lg ${theme.input}`} value={watchForm.soldDate || ''} onChange={e => setWatchForm({...watchForm, soldDate: e.target.value})} />
                         </div>
                     )}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <input className={`p-3 rounded-lg ${theme.input}`} placeholder={t('warranty')} value={watchForm.warrantyDate} onChange={e => setWatchForm({...watchForm, warrantyDate: e.target.value})} />
                    <input className={`p-3 rounded-lg ${theme.input}`} placeholder={t('revision')} value={watchForm.revision} onChange={e => setWatchForm({...watchForm, revision: e.target.value})} />
                 </div>
            </div>
            
            {/* INVOICE UPLOAD */}
            <div className={`p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${theme.textSub}`}><Receipt size={14}/> {t('invoice')}</div>
                {watchForm.invoice ? (
                     <div className="flex items-center gap-2">
                         <div className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check size={12}/> Facture ajoutée</div>
                         <button type="button" onClick={() => setWatchForm({...watchForm, invoice: null})} className="text-xs text-red-500 underline">Supprimer</button>
                     </div>
                ) : (
                    <label className={`flex items-center gap-2 cursor-pointer text-xs font-bold ${theme.text}`}>
                        <Plus size={14}/> {t('add_invoice')}
                        <input type="file" onChange={(e) => handleImageUpload(e, 'invoice')} className="hidden" accept="image/*"/>
                    </label>
                )}
            </div>

            {/* NEW: Condition Scale */}
            <div className="space-y-3">
                 <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider`}>État & Condition</h3>
                 <div>
                     <label className={`block text-xs ${theme.textSub} mb-1`}>{t('condition_rating')}: <span className="font-bold text-lg">{watchForm.conditionRating || '-'}</span>/10</label>
                     <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1" 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        value={watchForm.conditionRating || 0}
                        onChange={e => setWatchForm({...watchForm, conditionRating: parseInt(e.target.value)})}
                     />
                 </div>
                 <textarea className={`w-full p-3 rounded-lg min-h-[60px] ${theme.input}`} placeholder={t('condition_comment')} value={watchForm.conditionComment || ''} onChange={e => setWatchForm({...watchForm, conditionComment: e.target.value})} />
            </div>

            {/* FINANCE & STATUS */}
            <div className="space-y-3">
                <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider`}>{t('financial_status')}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" className={`w-full p-3 rounded-lg ${theme.input}`} placeholder={t('purchase_price')} value={watchForm.purchasePrice} onChange={e => setWatchForm({...watchForm, purchasePrice: e.target.value})} />
                    <input type="number" className={`w-full p-3 rounded-lg ${theme.input}`} placeholder={t('selling_price')} value={watchForm.sellingPrice} onChange={e => setWatchForm({...watchForm, sellingPrice: e.target.value})} />
                </div>
                {watchForm.status !== 'wishlist' && (
                    <div className={`p-2 rounded-lg border ${theme.border} ${theme.bg} flex items-center gap-2`}>
                        <Lock size={16} className="text-amber-600" />
                        <input type="number" className={`w-full p-2 bg-transparent border-none focus:ring-0 text-sm ${theme.text}`} placeholder={t('min_price')} value={watchForm.minPrice || ''} onChange={e => setWatchForm({...watchForm, minPrice: e.target.value})} />
                    </div>
                )}
                
                {/* STATUS SELECTOR */}
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                    {[{id: 'collection', label: t('collection')}, {id: 'forsale', label: t('forsale')}, {id: 'sold', label: t('sold')}, {id: 'wishlist', label: t('wishlist')}].map(s => (
                        <button key={s.id} type="button" onClick={() => setWatchForm({...watchForm, status: s.id})} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border whitespace-nowrap ${watchForm.status === s.id ? 'bg-slate-800 text-white' : `${theme.bg} ${theme.border} ${theme.text}`}`}>{s.label}</button>
                    ))}
                </div>

                {/* NEW: LINK INPUT (Always Visible, Emphasized for Wishlist) */}
                <div className={`relative ${watchForm.status === 'wishlist' ? 'animate-pulse-slow' : ''}`}>
                    <LinkIcon className={`absolute left-3 top-3.5 ${theme.textSub}`} size={18}/>
                    <input className={`w-full p-3 pl-10 rounded-lg ${theme.input} ${watchForm.status === 'wishlist' ? 'border-indigo-300 ring-1 ring-indigo-100' : ''}`} placeholder={t('link_web')} value={watchForm.link || ''} onChange={e => setWatchForm({...watchForm, link: e.target.value})} />
                </div>

                <div className={`p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {watchForm.publicVisible ? <Eye className="text-indigo-600 mr-2" size={20}/> : <EyeOff className="text-slate-400 mr-2" size={20}/>}
                            <span className={`text-sm font-bold ${theme.text}`}>{t('visibility_friends')}</span>
                        </div>
                        <input type="checkbox" checked={watchForm.publicVisible !== false} onChange={e => setWatchForm({...watchForm, publicVisible: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
                    </div>
                    <p className={`text-[10px] ${theme.textSub} mt-1 pl-8`}>{t('private_note')}</p>
                </div>
            </div>

            {/* NOTES & HISTORY */}
            <div className="space-y-3">
                 <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider`}>{t('notes')} & {t('history')}</h3>
                 <textarea className={`w-full p-3 rounded-lg min-h-[80px] ${theme.input}`} placeholder={t('notes')} value={watchForm.conditionNotes} onChange={e => setWatchForm({...watchForm, conditionNotes: e.target.value})} />
                 <textarea className={`w-full p-3 rounded-lg min-h-[80px] ${theme.input}`} placeholder={t('history_brand')} value={watchForm.historyBrand || ''} onChange={e => setWatchForm({...watchForm, historyBrand: e.target.value})} />
                 <textarea className={`w-full p-3 rounded-lg min-h-[80px] ${theme.input}`} placeholder={t('history_model')} value={watchForm.historyModel || ''} onChange={e => setWatchForm({...watchForm, historyModel: e.target.value})} />
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg">{t('save')}</button>
          </form>
        </div>
      );
  };

  if (loading) return <div className={`flex h-screen items-center justify-center ${theme.bgSecondary}`}><Loader2 className={`animate-spin ${theme.text}`}/></div>;

  return (
    <div className={`${theme.bg} min-h-screen font-sans ${theme.text}`}>
      <div className={`max-w-md mx-auto ${theme.bgSecondary} min-h-screen shadow-2xl relative`}>
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 scrollbar-hide">
            {view === 'box' && renderBox()}
            {view === 'list' && renderList()}
            {view === 'wishlist' && renderWishlist()}
            {view === 'finance' && renderFinance()}
            {view === 'stats' && renderStats()}
            {view === 'profile' && renderProfile()}
            {view === 'friends' && renderFriends()}
            {view === 'summary' && renderSummary()}
            {view === 'detail' && renderDetail()}
            {view === 'add' && renderForm()}
        </div>
        {/* NEW: Export View Overlay */}
        {exportType && selectedWatch && <ExportView watch={selectedWatch} type={exportType} onClose={() => setExportType(null)} theme={theme} t={t} />}
        
        {renderFullScreenImage()}
        {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} settings={settings} setSettings={setSettings} t={t} theme={theme} />}
        {showConfigModal && <ConfigModal onClose={() => setShowConfigModal(false)} currentError={globalInitError} t={t} />}
        {showRulesHelp && <RulesHelpModal onClose={() => setShowRulesHelp(false)} theme={theme} />}

        {view !== 'add' && (
          <nav className={`fixed bottom-0 w-full max-w-md ${theme.nav} border-t flex justify-between px-4 py-2 z-50 text-[10px] font-medium ${theme.textSub}`}>
            <button onClick={() => setView('box')} className={`flex flex-col items-center w-1/6 ${view === 'box' ? 'text-amber-600' : ''}`}><Box size={20}/><span className="mt-1">{t('box')}</span></button>
            <button onClick={() => { setFilter('all'); setView('list'); }} className={`flex flex-col items-center w-1/6 ${view === 'list' ? 'text-indigo-600' : ''}`}><Watch size={20}/><span className="mt-1">{t('list')}</span></button>
            <button onClick={() => setView('wishlist')} className={`flex flex-col items-center w-1/6 ${view === 'wishlist' ? 'text-rose-600' : ''}`}><Heart size={20}/><span className="mt-1">{t('wishlist')}</span></button>
            <button onClick={() => openAdd()} className="flex-none flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg -mt-4 border-2 border-slate-50"><Plus size={24}/></button>
            <button onClick={() => setView('finance')} className={`flex flex-col items-center w-1/6 ${view === 'finance' ? 'text-emerald-600' : ''}`}><TrendingUp size={20}/><span className="mt-1">{t('finance')}</span></button>
            <button onClick={() => setView('stats')} className={`flex flex-col items-center w-1/6 ${view === 'stats' ? 'text-blue-600' : ''}`}><BarChart2 size={20}/><span className="mt-1">{t('stats')}</span></button>
            <button onClick={() => setView('profile')} className={`flex flex-col items-center w-1/6 ${view === 'profile' ? 'text-slate-900' : ''}`}><Grid size={20}/><span className="mt-1">{t('gallery')}</span></button>
          </nav>
        )}
      </div>
    </div>
  );
}
