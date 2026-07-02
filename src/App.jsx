/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Watch, Plus, TrendingUp, Trash2, Edit2, Camera, X, Search, AlertCircle, Package, DollarSign, FileText, Box, Loader2,
  ChevronLeft, ChevronsLeft, ChevronsRight, ClipboardList, WifiOff, Ruler, Calendar, LogIn, LogOut, User, AlertTriangle, MapPin, Droplets, ShieldCheck, Layers, Wrench, Activity, Heart, Download, ExternalLink, Settings, Grid, ArrowUpDown, Shuffle, Save, Palette, RefreshCw, Users, UserPlus, Share2, Filter, Eye, EyeOff, Bell, Check, Zap, Gem, Image as ImageIcon, ZoomIn, Battery, ShoppingCart, BookOpen, Gift, Star, Scale, Lock, ChevronRight, BarChart2, Coins, Moon, Sun, Globe, Clock, PieChart, Briefcase, Printer, Link as LinkIcon, History, Receipt, Tag, Euro, ChevronDown
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, getDocs, where, addDoc } from 'firebase/firestore';

// ==========================================================================
// CONFIGURATION & DICTIONNAIRE
// ==========================================================================
const TRANSLATIONS = {
  fr: { box: "Coffre", list: "Liste", wishlist: "Souhaits", finance: "Finance", stats: "Stats", gallery: "Galerie", myWatches: "Mes Montres", pieces: "pièces", piece: "pièce", search: "Rechercher...", collection: "Ma Collection", forsale: "En Vente", sold: "Vendues", bracelets: "Bracelets", settings: "Paramètres", language: "Langue", theme: "Thème", light: "Clair", dark: "Sombre", total_value: "Valeur Totale", profit: "Plus-value", brand: "Marque", model: "Modèle", reference: "Référence", year: "Année", model_year: "Année du modèle", price: "Prix", add_new: "Ajouter", edit: "Modifier", delete: "Supprimer", save: "Sauvegarder", cancel: "Annuler", notes: "Notes", history: "Histoire", history_brand: "Histoire Marque", history_model: "Histoire Modèle", specs: "Caractéristiques", unknown: "Inconnu", total_displayed: "montres affichées", login_google: "Connexion Google", logout: "Déconnexion", config_cloud: "Config Cloud", export_csv: "Exporter CSV", filter_all: "Tout", all: "Tout", inventory: "Inventaire", friends: "Amis", requests: "Demandes", limited_edition: "EDITION LIMITÉE", movement: "Mouvement", movement_model: "Calibre/Modèle", manual: "Manuel", automatic: "Automatique", quartz: "Quartz", diameter: "Diamètre", thickness: "Épaisseur", lug_width: "Entre-corne", water_res: "Étanchéité", glass: "Verre", dial: "Cadran", country: "Pays", box_included: "Boîte", warranty: "Garantie", revision: "Révision", battery: "Pile", weight: "Poids", visibility_friends: "Visible par les amis", private_note: "Si décoché, cette montre restera privée.", move_collection: "J'ai obtenu cette montre !", set_main_image: "Définir principale", add_photo: "Ajouter", link_web: "Lien Web", visit_site: "Visiter le site marchand", purchase_price: "Prix Achat", selling_price: "Prix Vente / Estimation", min_price: "Prix Min (Privé)", clock_style: "Style Horloge", box_style: "Style Coffre", color_digital: "Heure Digitale", color_h_hand: "Aig. Heures", color_m_hand: "Aig. Minutes", color_s_hand: "Aig. Secondes", color_index_main: "Gros Index", color_index_small: "Petits Index", color_leather: "Cuir Extérieur", color_interior: "Intérieur", color_cushion: "Cushions", top_worn: "Top Portées", calendar: "Calendrier", month: "Mois", all_time: "Tout", fav_brands: "Marques Favorites", fav_dials: "Couleurs Cadran", finance_timeline: "Chronologie Financière", spent: "Dépenses", gained: "Gains", balance: "Bilan", identity: "Identité", origin_maintenance: "Origine & Entretien", technical: "Technique", financial_status: "Finances & Status", date_release: "Date de Sortie", date_purchase: "Date d'Achat", date_sold: "Date de Vente", market_value: "Estimation du Marché", find_used: "Trouver d'Occasion", export_sheet: "Fiches & Documents", sheet_insurance: "Fiche Assurance", sheet_sale: "Fiche de Vente", print: "Imprimer", condition_rating: "État (1-10)", condition_comment: "Commentaire sur l'état", show_history: "Voir tout l'historique", show_less: "Réduire", year_summary: "Bilan Année", stats_usage: "Statistiques d'Usage", worn_this_month: "Ce mois", worn_this_year: "Cette année", worn_last_year: "Année dernière", invoice: "Facture", add_invoice: "Ajouter Facture", view_invoice: "Voir Facture", sort_date_desc: "Purchase Date (Newest)", sort_date_asc: "Purchase Date (Oldest)", sort_alpha: "A-Z", sort_price_asc: "Prix (Croissant)", sort_price_desc: "Prix (Décroissant)", purchases: "Achats", sales: "Ventes", show_all: "Voir tout" },
  en: { box: "Box", list: "List", wishlist: "Wishlist", finance: "Finances", stats: "Statistics", gallery: "Gallery", myWatches: "My Watches", pieces: "pieces", piece: "piece", search: "Search...", collection: "Collection", forsale: "For Sale", sold: "Sold", bracelets: "Straps", settings: "Settings", language: "Language", theme: "Theme", light: "Light", dark: "Dark", total_value: "Total Value", profit: "Profit", brand: "Brand", model: "Model", reference: "Reference", year: "Year", model_year: "Model Year", price: "Price", add_new: "Add New", edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel", notes: "Notes", history: "History", history_brand: "Brand History", history_model: "Model History", specs: "Specifications", unknown: "Unknown", total_displayed: "watches displayed", login_google: "Google Login", logout: "Logout", config_cloud: "Cloud Config", export_csv: "Export CSV", filter_all: "All", all: "All", inventory: "Inventory", friends: "Friends", requests: "Requests", limited_edition: "LIMITED EDITION", movement: "Movement", movement_model: "Caliber/Model", manual: "Manual", automatic: "Automatic", quartz: "Quartz", diameter: "Diameter", thickness: "Thickness", lug_width: "Lug Width", water_res: "Water Res.", glass: "Glass", dial: "Dial", country: "Country", box_included: "Box", warranty: "Warranty", revision: "Service", battery: "Battery", weight: "Weight", visibility_friends: "Visible to friends", private_note: "If unchecked, stays private.", move_collection: "I got this watch!", set_main_image: "Set as main", add_photo: "Add", link_web: "Web Link", visit_site: "Visit Website", purchase_price: "Purchase Price", selling_price: "Selling / Estim Price", min_price: "Min Price (Private)", clock_style: "Clock Style", box_style: "Box Style", color_digital: "Digital Time", color_h_hand: "Hour Hand", color_m_hand: "Minute Hand", color_s_hand: "Second Hand", color_index_main: "Large Indexes", color_index_small: "Small Indexes", color_leather: "Outer Leather", color_interior: "Interior", color_cushion: "Cushions", top_worn: "Top Worn", calendar: "Calendar", month: "Month", all_time: "All Time", fav_brands: "Favorite Brands", fav_dials: "Dial Colors", finance_timeline: "Financial Timeline", spent: "Spent", gained: "Gained", balance: "Balance", identity: "Identity", origin_maintenance: "Origin & Maintenance", technical: "Technical", financial_status: "Finances & Status", date_release: "Release Date", date_purchase: "Purchase Date", date_sold: "Sold Date", market_value: "Market Estimation", find_used: "Find Used", export_sheet: "Sheets & Docs", sheet_insurance: "Insurance Sheet", sheet_sale: "Sale Sheet", print: "Print", condition_rating: "Condition (1-10)", condition_comment: "Condition Details", show_history: "Show Full History", show_less: "Show Less", year_summary: "Year Summary", stats_usage: "Usage Statistics", worn_this_month: "This Month", worn_this_year: "This Year", worn_last_year: "Last Year", invoice: "Invoice", add_invoice: "Add Invoice", view_invoice: "View Invoice", sort_date_desc: "Purchase Date (Newest)", sort_date_asc: "Purchase Date (Oldest)", sort_alpha: "A-Z", sort_price_asc: "Price (Asc)", sort_price_desc: "Price (Desc)", purchases: "Purchases", sales: "Sales", show_all: "Show All" }
};

const productionConfig = { apiKey: "AIzaSyCOk85wxq6mTKj3mfzjJTQN64dcg6N_4-o", authDomain: "chronomanagerfinal.firebaseapp.com", projectId: "chronomanagerfinal", storageBucket: "chronomanagerfinal.firebasestorage.app", messagingSenderId: "913764049964", appId: "1:913764049964:web:542604509381001b801d89" };

let app, auth, db;
let firebaseReady = false;
let globalInitError = null; 

const LOCAL_STORAGE_KEY = 'chrono_manager_universal_db';
const LOCAL_STORAGE_BRACELETS_KEY = 'chrono_manager_bracelets_db';
const LOCAL_STORAGE_CALENDAR_KEY = 'chrono_manager_calendar_db';
const LOCAL_CONFIG_KEY = 'chrono_firebase_config'; 
const LOCAL_SETTINGS_KEY = 'chrono_user_settings_v3'; 
const APP_ID_STABLE = typeof __app_id !== 'undefined' ? __app_id : 'chrono-manager-universal'; 

const DEFAULT_WATCH_STATE = { brand: '', model: '', reference: '', diameter: '', year: '', movement: '', movementModel: '', powerReserve: '', jewels: '', country: '', waterResistance: '', glass: '', strapWidth: '', thickness: '', weight: '', dialColor: '', batteryModel: '', isLimitedEdition: false, limitedNumber: '', limitedTotal: '', publicVisible: true, box: '', warrantyDate: '', revision: '', purchasePrice: '', sellingPrice: '', minPrice: '', purchaseDate: '', soldDate: '', status: 'collection', conditionNotes: '', link: '', historyBrand: '', historyModel: '', conditionRating: '', conditionComment: '', image: null, images: [], invoice: null };
const DEFAULT_BRACELET_STATE = { width: '', type: 'Standard', material: '', color: '', brand: '', quickRelease: false, image: null, notes: '' };

const tryInitFirebase = (config) => {
    try {
        if (!config || !config.apiKey || config.apiKey.length < 5) return false;
        if (getApps().length === 0) app = initializeApp(config); else app = getApp();
        auth = getAuth(app); db = getFirestore(app); firebaseReady = true; globalInitError = null; return true;
    } catch (e) {
        console.error("Erreur init Firebase:", e); globalInitError = e.message || String(e); return false;
    }
};

if (typeof __firebase_config !== 'undefined') { try { tryInitFirebase(JSON.parse(__firebase_config)); } catch(e) {} }
if (!firebaseReady) tryInitFirebase(productionConfig);
if (!firebaseReady) { try { const savedConfig = localStorage.getItem(LOCAL_CONFIG_KEY); if (savedConfig) tryInitFirebase(JSON.parse(savedConfig)); } catch(e) {} }

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
      const img = new Image(); img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; 
        let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height = (height * MAX_WIDTH) / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    };
  });
};

const MovementIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="M12 12 L12 2" /><path d="M12 12 L4 16" /><path d="M12 12 L20 16" /><path d="M12 7 C14.76 7 17 9.24 17 12 C17 14.76 14.76 17 12 17 C9.24 17 7 14.76 7 12" />
  </svg>
);

const WatchBoxLogo = ({ isOpen, isDark, settings }) => {
  const leatherColor = settings.boxLeather || (isDark ? "#3E2723" : "#5D4037");
  const interiorColor = settings.boxInterior || (isDark ? "#424242" : "#f5f5f0");
  const cushionColor = settings.boxCushion || (isDark ? "#616161" : "#fdfbf7");
  return (
  <div style={{ perspective: '1000px', width: '220px', height: '180px' }}>
    <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={leatherColor} /><stop offset="100%" stopColor={leatherColor} stopOpacity="0.8" /></linearGradient>
        <linearGradient id="interior" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={interiorColor} /><stop offset="100%" stopColor={interiorColor} stopOpacity="0.8" /></linearGradient>
        <linearGradient id="cushionGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={cushionColor} /><stop offset="100%" stopColor={cushionColor} stopOpacity="0.8" /></linearGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(220, 240, 255, 0.4)" /><stop offset="50%" stopColor="rgba(200, 230, 255, 0.2)" /><stop offset="100%" stopColor="rgba(220, 240, 255, 0.5)" /></linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFECB3" /><stop offset="50%" stopColor="#FFC107" /><stop offset="100%" stopColor="#FFB300" /></linearGradient>
      </defs>
      <path d="M30,60 L170,60 L180,100 L20,100 Z" fill="url(#interior)" stroke="#8D6E63" strokeWidth="0.5" />
      <g transform="translate(0, 0)">{[32, 66, 100, 134].map((x, i) => (<rect key={i} x={x} y={65} width="28" height="30" rx="4" fill="url(#cushionGrad)" stroke="#D7CCC8" strokeWidth="0.5" />))}</g>
      <path d="M20,100 L180,100 L180,140 L20,140 Z" fill="url(#leatherGrad)" stroke="#271c19" strokeWidth="0.5"/>
      <g transform="translate(94, 102)"><rect x="0" y="0" width="12" height="10" rx="1" fill="url(#goldGrad)" stroke="#B7880B" strokeWidth="0.5" /><circle cx="6" cy="5" r="1.5" fill="#3E2723" /></g>
      <g className="transition-all duration-1000 ease-in-out" style={{ transformOrigin: '100px 60px', transform: isOpen ? 'rotateX(-110deg)' : 'rotateX(0deg)' }}>
          <path d="M20,100 L180,100 L170,60 L30,60 Z" fill="url(#leatherGrad)" stroke="#3E2723" strokeWidth="1" />
          <path d="M35,92 L165,92 L158,68 L42,68 Z" fill="url(#windowGrad)" stroke="#8D6E63" strokeWidth="0.5" />
          <path d="M35,92 L80,92 L75,68 L42,68 Z" fill="rgba(255,255,255,0.1)" />
          <path d="M20,100 L180,100 L180,108 L20,108 Z" fill="#3E2723" />
          <g transform="translate(94, 100)"><path d="M0,0 H12 V6 C12,8 0,8 0,6 Z" fill="url(#goldGrad)" stroke="#B7880B" strokeWidth="0.5" /></g>
      </g>
    </svg>
  </div>
  );
};

const AnalogClock = ({ isDark, settings }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  const secondsRatio = time.getSeconds() / 60; const minutesRatio = (secondsRatio + time.getMinutes()) / 60; const hoursRatio = (minutesRatio + time.getHours()) / 12;
  const borderColor = isDark ? 'border-slate-600' : 'border-slate-800'; const bgColor = isDark ? 'bg-slate-800' : 'bg-white';
  const tickColor = settings.indexColorSmall || (isDark ? '#64748b' : '#94a3b8'); const thickColor = settings.indexColorMain || (isDark ? '#cbd5e1' : '#1e293b'); 
  const hHandColor = settings.handHour || (isDark ? '#cbd5e1' : '#0f172a'); const mHandColor = settings.handMinute || (isDark ? '#94a3b8' : '#475569'); const sHandColor = settings.handSecond || '#ef4444'; 
  return (
    <div className="w-32 h-32 relative mx-auto mb-2">
       <div className={`w-full h-full rounded-full border-4 ${borderColor} ${bgColor} shadow-inner flex items-center justify-center relative`}>
         {[...Array(12)].map((_, i) => (<div key={i} className="absolute w-1 h-2 left-1/2 origin-bottom" style={{ bottom: '50%', transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-36px)`, backgroundColor: tickColor }}></div>))}
         {[0, 3, 6, 9].map((i) => (<div key={i} className="absolute w-1.5 h-3 left-1/2 origin-bottom" style={{ bottom: '50%', transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-36px)`, backgroundColor: thickColor }}></div>))}
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
      <svg className={`absolute -right-20 -top-20 w-96 h-96 opacity-40 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" /><circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" /></svg>
    </div>
);

const Card = ({ children, className = "", onClick, theme }) => (
  <div onClick={onClick} className={`${theme.card} rounded-xl shadow-sm border ${theme.border} overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>{children}</div>
);

const DetailItem = ({ icon: Icon, label, value, theme }) => (
    <div className={`${theme.bgSecondary} p-3 rounded-lg border ${theme.border} flex items-center`}>
        <div className={`${theme.bg} p-2 rounded-full border ${theme.border} mr-3 ${theme.textSub} flex-shrink-0`}>{Icon && <Icon size={16} />}</div>
        <div className="min-w-0"><span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textSub} block opacity-70`}>{label}</span><span className={`font-serif text-sm ${theme.text} truncate block`}>{value || '-'}</span></div>
    </div>
);

const FullScreenImageViewer = ({ src, onClose }) => {
    const [scale, setScale] = useState(1); const [position, setPosition] = useState({ x: 0, y: 0 }); const [isDragging, setIsDragging] = useState(false); const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); const [pinchDist, setPinchDist] = useState(null); const [lastScale, setLastScale] = useState(1);
    const handleWheel = (e) => { const zoomSpeed = 0.1; let newScale = e.deltaY < 0 ? scale + zoomSpeed : scale - zoomSpeed; newScale = Math.min(Math.max(1, newScale), 5); if (newScale === 1) setPosition({ x: 0, y: 0 }); setScale(newScale); };
    const handlePointerDown = (e) => { if (scale > 1 && e.pointerType === 'mouse') { setIsDragging(true); setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y }); } };
    const handlePointerMove = (e) => { if (isDragging && scale > 1 && e.pointerType === 'mouse') { setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); } };
    const handlePointerUp = (e) => { if (e.pointerType === 'mouse') setIsDragging(false); };
    const handleTouchStart = (e) => { if (e.touches.length === 2) { const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); setPinchDist(dist); setLastScale(scale); } else if (e.touches.length === 1 && scale > 1) { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y }); } };
    const handleTouchMove = (e) => { if (e.touches.length === 2 && pinchDist) { const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); let newScale = lastScale * (dist / pinchDist); newScale = Math.min(Math.max(1, newScale), 5); if (newScale === 1) setPosition({ x: 0, y: 0 }); setScale(newScale); } else if (e.touches.length === 1 && isDragging && scale > 1) { setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); } };
    const handleTouchEnd = (e) => { if (e.touches.length < 2) setPinchDist(null); if (e.touches.length === 0) setIsDragging(false); };
    const handleDoubleClick = () => { if (scale > 1) { setScale(1); setPosition({ x: 0, y: 0 }); } else { setScale(2.5); } };
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center overflow-hidden touch-none animate-in fade-in duration-200" onClick={onClose} onWheel={handleWheel} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
            <button className="absolute top-4 right-4 z-[110] text-white/80 hover:text-white bg-black/50 rounded-full p-2" onClick={onClose}><X size={32} /></button>
            <div className="w-full h-full flex items-center justify-center relative touch-none" onClick={(e) => e.stopPropagation()} onDoubleClick={handleDoubleClick} onPointerDown={handlePointerDown} onTouchStart={handleTouchStart}><img src={src} draggable={false} className="max-w-full max-h-[90vh] object-contain shadow-2xl" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging || pinchDist ? 'none' : 'transform 0.2s ease-out', cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }} alt="Vue agrandie" /></div>
        </div>
    );
};

const ExportView = ({ watch, type, onClose, theme, t }) => {
    const isSale = type === 'sale';
    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-auto text-black">
            <div className="print:hidden p-4 border-b flex justify-between items-center bg-slate-100 sticky top-0 z-50"><h2 className="font-bold text-lg">{isSale ? t('sheet_sale') : t('sheet_insurance')}</h2><div className="flex gap-2"><button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700"><Printer size={16}/> {t('print')}</button><button onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold hover:bg-slate-300"><X size={16}/></button></div></div>
            <div className="p-8 max-w-3xl mx-auto w-full space-y-8 print:p-0 print:space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-4"><div><h1 className="text-4xl font-serif font-bold uppercase tracking-widest">{watch.brand}</h1><h2 className="text-xl text-slate-600 font-medium">{watch.model}</h2>{watch.reference && <p className="font-mono text-sm mt-1">REF: {watch.reference}</p>}</div><div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center"><Watch size={32} /></div></div>
                <div className="grid grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                    <div>
                        {watch.images && watch.images[0] && (<div className="aspect-square rounded-xl overflow-hidden border border-slate-200 mb-4"><img src={watch.images[0]} className="w-full h-full object-cover" alt="Montre"/></div>)}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:border-black print:bg-white"><div className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">{isSale ? t('selling_price') : t('purchase_price')}</div><div className="text-3xl font-bold font-serif">{formatPrice(isSale ? (watch.sellingPrice || watch.purchasePrice) : watch.purchasePrice)}</div>{isSale && <div className="mt-2 text-xs text-slate-500 italic">*Prix non contractuel, sujet à négociation</div>}</div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase border-b border-slate-200 pb-1">{t('specs')}</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm"><div className="text-slate-500">{t('year')}:</div><div>{watch.year || '-'}</div><div className="text-slate-500">{t('diameter')}:</div><div>{watch.diameter ? watch.diameter + ' mm' : '-'}</div><div className="text-slate-500">{t('thickness')}:</div><div>{watch.thickness ? watch.thickness + ' mm' : '-'}</div><div className="text-slate-500">{t('lug_width')}:</div><div>{watch.strapWidth ? watch.strapWidth + ' mm' : '-'}</div><div className="text-slate-500">{t('movement')}:</div><div>{watch.movement || '-'}</div><div className="text-slate-500">{t('dial')}:</div><div>{watch.dialColor || '-'}</div><div className="text-slate-500">{t('box_included')}:</div><div>{watch.box || '-'}</div><div className="text-slate-500">{t('warranty')}:</div><div>{watch.warrantyDate || '-'}</div><div className="text-slate-500">{t('country')}:</div><div>{watch.country || '-'}</div><div className="text-slate-500">{t('weight')}:</div><div>{watch.weight ? watch.weight + ' g' : '-'}</div>{watch.batteryModel && <><div className="text-slate-500">{t('battery')}:</div><div>{watch.batteryModel}</div></>}</div>
                        {watch.conditionNotes && (<div className="mt-6"><h3 className="font-bold uppercase border-b border-slate-200 pb-1 mb-2">{t('notes')}</h3><p className="text-sm text-justify leading-relaxed whitespace-pre-wrap">{watch.conditionNotes}</p></div>)}
                    </div>
                </div>
                {isSale && (watch.historyBrand || watch.historyModel) && (<div className="space-y-4">{watch.historyBrand && (<div><h3 className="font-bold uppercase border-b border-slate-200 pb-1 mb-2">{t('history_brand')}</h3><p className="text-sm text-justify leading-relaxed whitespace-pre-wrap">{watch.historyBrand}</p></div>)}{watch.historyModel && (<div><h3 className="font-bold uppercase border-b border-slate-200 pb-1 mb-2">{t('history_model')}</h3><p className="text-sm text-justify leading-relaxed whitespace-pre-wrap">{watch.historyModel}</p></div>)}</div>)}
                {isSale && (<div className="border-t-2 border-black pt-4 mt-8 text-center text-sm text-slate-500"><p>Contactez le vendeur pour plus d'informations.</p><div className="mt-4 border border-dashed border-slate-300 p-4 rounded-lg inline-block">QR Code / Contact Info Placeholder</div></div>)}
                
                {/* Facture d'achat pour l'assurance */}
                {!isSale && watch.invoice && (
                    <div className="mt-8 border-t-2 border-black pt-8 print:break-before-page">
                       <h3 className="font-bold uppercase mb-4 text-center">Facture d'achat / Justificatif</h3>
                       {watch.invoice.startsWith('data:application/pdf') ? (
                          <iframe src={watch.invoice} className="w-full h-[800px] border border-slate-200 print:h-[1000px]" title="Facture"/>
                       ) : (
                          <img src={watch.invoice} className="w-full max-w-full h-auto mx-auto object-contain" alt="Facture"/>
                       )}
                    </div>
                )}
                <div className="print:fixed print:bottom-4 print:left-0 print:w-full text-center text-[10px] text-slate-400">Généré par ChronoManager - {new Date().toLocaleDateString()}</div>
            </div>
        </div>
    );
};

const FinanceDetailList = ({ title, items, onClose, theme, onSelectWatch }) => {
    const [localSort, setLocalSort] = useState('alpha'); 
    const sortedItems = useMemo(() => {
        let sorted = [...items];
        const getTime = (w) => { if (w.purchaseDate) { const t = new Date(w.purchaseDate).getTime(); return isNaN(t) ? null : t; } return null; };
        if (localSort === 'alpha') { sorted.sort((a, b) => (a.brand || '').localeCompare(b.brand || '') || (a.model || '').localeCompare(b.model || '')); } else { sorted.sort((a, b) => { const ta = getTime(a), tb = getTime(b); if (ta === null && tb !== null) return 1; if (tb === null && ta !== null) return -1; if (ta === null && tb === null) return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime(); return tb - ta; }); }
        return sorted;
    }, [items, localSort]);
    return (
        <div className={`fixed inset-0 z-[60] ${theme.card} flex flex-col animate-in slide-in-from-bottom-10`}>
          <div className={`p-4 border-b ${theme.border} flex items-center justify-between ${theme.bgSecondary}`}><h2 className={`font-serif font-bold text-lg ${theme.text} tracking-wide`}>{title}</h2><div className="flex gap-2"><button onClick={() => setLocalSort(localSort === 'date' ? 'alpha' : 'date')} className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-medium ${theme.textSub} ${theme.bg}`}><ArrowUpDown size={14} /> {localSort === 'date' ? 'Date' : 'A-Z'}</button><button onClick={onClose} className={`p-2 rounded-full shadow-sm border ${theme.border} ${theme.bg} ${theme.text}`}><X size={20}/></button></div></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {sortedItems.map(w => {
               const thumb = w.images && w.images.length > 0 ? w.images[0] : w.image; const profit = (w.sellingPrice || 0) - (w.purchasePrice || 0);
               return (<div key={w.id} onClick={() => { onClose(); onSelectWatch && onSelectWatch(w); }} className={`flex items-center p-3 border rounded-lg shadow-sm ${theme.bg} ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}><div className={`w-12 h-12 rounded overflow-hidden flex-shrink-0 mr-3 border ${theme.border} ${theme.bgSecondary}`}>{thumb && <img src={thumb} className="w-full h-full object-cover" alt="Thumb"/>}</div><div className="flex-1 min-w-0"><div className={`font-bold text-sm truncate ${theme.text}`}>{w.brand} {w.model}</div><div className={`text-xs ${theme.textSub}`}>Achat: {formatPrice(w.purchasePrice)}</div></div><div className="text-right"><div className={`font-bold text-sm ${theme.text}`}>{formatPrice(w.sellingPrice || w.purchasePrice)}</div><div className={`text-xs font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{profit > 0 ? '+' : ''}{formatPrice(profit)}</div></div></div>)
             })}
             {sortedItems.length === 0 && <div className={`text-center ${theme.textSub} py-10 text-sm`}>Aucune montre.</div>}
          </div>
        </div>
    );
};

const FinanceCardFull = ({ title, icon: Icon, stats, type, onClick, bgColor, theme }) => {
    const isWhite = type === 'total'; const cardBg = isWhite ? (theme.bg === 'bg-slate-950' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200') : bgColor; const txtMain = isWhite ? theme.text : 'text-white'; const txtSub = isWhite ? theme.textSub : 'text-white/70'; const borderClass = isWhite ? `border ${theme.border}` : 'border border-transparent'; const bgIcon = isWhite ? (theme.bg === 'bg-slate-950' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600') : 'bg-white/20 text-white';
    return (
        <div onClick={onClick} className={`${cardBg} ${borderClass} p-4 rounded-xl shadow-md mb-3 cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] overflow-hidden relative`}>
            <div className="flex justify-between items-center mb-4 relative z-10"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${bgIcon}`}><Icon size={18} /></div><span className={`font-serif font-bold text-lg tracking-wide ${txtMain}`}>{title}</span></div>{type !== 'total' && <div className={`bg-white/20 p-1 rounded-full ${txtMain}`}><ChevronLeft className="rotate-180" size={16}/></div>}</div>
            <div className="grid grid-cols-3 gap-2 text-center relative z-10"><div><div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>Achat</div><div className={`font-bold text-base ${txtMain}`}>{formatPrice(stats.buy)}</div></div><div><div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>{type === 'sold' ? 'Vendu' : 'Estim.'}</div><div className={`font-bold text-base ${txtMain}`}>{formatPrice(stats.val)}</div></div><div><div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>Bénéfice</div><div className={`font-bold text-base ${isWhite ? (stats.profit >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-white'}`}>{stats.profit > 0 ? '+' : ''}{formatPrice(stats.profit)}</div></div></div>
            {!isWhite && <Icon size={120} className="absolute -bottom-4 -right-4 opacity-10 text-white transform rotate-12 pointer-events-none" />}
        </div>
    );
};

const ConfigModal = ({ onClose, currentError, t }) => {
    const [jsonConfig, setJsonConfig] = useState(''); const [parseError, setParseError] = useState(null);
    const handleSave = () => { try { let cleanJson = jsonConfig; if (cleanJson.includes('=')) cleanJson = cleanJson.substring(cleanJson.indexOf('=') + 1); if (cleanJson.trim().endsWith(';')) cleanJson = cleanJson.trim().slice(0, -1); const parsed = new Function('return ' + cleanJson)(); if (!parsed.apiKey) throw new Error("apiKey manquante"); localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(parsed)); window.location.reload(); } catch (e) { setParseError("Format invalide."); } };
    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"><div className="p-4 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings size={18}/> {t('config_cloud')}</h3><button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button></div><div className="p-6 space-y-4">{currentError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-4">{String(currentError)}</div>}<textarea className="w-full h-40 p-3 border rounded-lg font-mono text-xs bg-slate-50" placeholder={`{ apiKey: "...", ... }`} value={jsonConfig} onChange={(e) => setJsonConfig(e.target.value)} />{parseError && <div className="text-xs text-red-500">{parseError}</div>}<button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Save size={18}/> {t('save')}</button></div></div></div>
    );
};

const SettingsModal = ({ onClose, settings, setSettings, t, theme }) => (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border ${theme.border} max-h-[90vh] flex flex-col`}><div className={`p-4 border-b ${theme.border} ${theme.bgSecondary} flex justify-between items-center flex-shrink-0`}><h3 className={`font-bold ${theme.text} flex items-center gap-2`}><Settings size={18}/> {t('settings')}</h3><button onClick={onClose}><X size={20} className={theme.textSub}/></button></div><div className="p-6 space-y-6 overflow-y-auto"><div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSub}`}>{t('language')}</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setSettings(s => ({...s, lang: 'fr'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.lang === 'fr' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : `${theme.bg} ${theme.text} ${theme.border}`}`}><span className="text-lg">🇫🇷</span> Français</button><button onClick={() => setSettings(s => ({...s, lang: 'en'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.lang === 'en' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : `${theme.bg} ${theme.text} ${theme.border}`}`}><span className="text-lg">🇬🇧</span> English</button></div></div><div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSub}`}>{t('theme')}</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setSettings(s => ({...s, theme: 'light'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.theme === 'light' ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm' : `${theme.bg} ${theme.text} ${theme.border}`}`}><Sun size={18}/> {t('light')}</button><button onClick={() => setSettings(s => ({...s, theme: 'dark'}))} className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.theme === 'dark' ? 'bg-slate-800 text-white border-slate-700 shadow-md' : `${theme.bg} ${theme.text} ${theme.border}`}`}><Moon size={18}/> {t('dark')}</button></div></div></div></div>
    </div>
);

const RulesHelpModal = ({ onClose, theme }) => (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"><div className={`${theme.card} rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden`}><div className={`${theme.bgSecondary} p-4 border-b ${theme.border} flex justify-between items-center`}><h3 className={`font-bold ${theme.text} flex items-center gap-2`}><ShieldCheck className="text-emerald-600"/> Permissions Cloud</h3><button onClick={onClose}><X size={20} className={theme.textSub}/></button></div><div className="p-6 space-y-4"><p className={`text-sm ${theme.text}`}>Le système de partage requiert des permissions spécifiques pour que vos amis puissent voir votre collection.</p><button onClick={onClose} className={`w-full py-3 ${theme.bg} border ${theme.border} ${theme.text} rounded-xl font-bold`}>J'ai compris</button></div></div></div>
);

export default function App() {
  const [useLocalStorage, setUseLocalStorage] = useState(!firebaseReady);
  const [user, setUser] = useState(useLocalStorage ? { uid: 'local-user' } : null);
  
  const [settings, setSettings] = useState(() => {
      try { const saved = localStorage.getItem(LOCAL_SETTINGS_KEY); return saved ? JSON.parse(saved) : { lang: 'fr', theme: 'light' }; } catch(e) { return { lang: 'fr', theme: 'light' }; }
  });
  useEffect(() => { localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  const t = (key) => TRANSLATIONS[settings.lang][key] || key;
  const isDark = settings.theme === 'dark';
  const theme = { bg: isDark ? 'bg-slate-950' : 'bg-slate-50', bgSecondary: isDark ? 'bg-slate-900' : 'bg-white', text: isDark ? 'text-slate-100' : 'text-slate-900', textSub: isDark ? 'text-slate-400' : 'text-slate-500', border: isDark ? 'border-slate-800' : 'border-slate-200', card: isDark ? 'bg-slate-900' : 'bg-white', input: isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-slate-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500', nav: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200' };

  const [watches, setWatches] = useState([]);
  const [bracelets, setBracelets] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [friends, setFriends] = useState([]); 
  const [friendRequests, setFriendRequests] = useState([]); 
  const [viewingFriend, setViewingFriend] = useState(null); 
  const [friendWatches, setFriendWatches] = useState([]); 
  const [addFriendId, setAddFriendId] = useState(''); 
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [friendFilter, setFriendFilter] = useState('collection');
  const [selectedFriendWatch, setSelectedFriendWatch] = useState(null);

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
  const [gallerySearchTerm, setGallerySearchTerm] = useState(''); 
  const [isGallerySearchOpen, setIsGallerySearchOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedCalendarWatches, setSelectedCalendarWatches] = useState([]);
  const [statsTimeframe, setStatsTimeframe] = useState('month'); 
  const [isTopWornExpanded, setIsTopWornExpanded] = useState(false);
  const [showOtherStats, setShowOtherStats] = useState(false);
  const [calendarSearchTerm, setCalendarSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('dateDesc');
  const [error, setError] = useState(null); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBoxOpening, setIsBoxOpening] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false); 
  const [showSettingsModal, setShowSettingsModal] = useState(false); 
  const [showRulesHelp, setShowRulesHelp] = useState(false); 
  const [isAuthLoading, setIsAuthLoading] = useState(false); 
  const [exportType, setExportType] = useState(null); 
  const [timelineFilter, setTimelineFilter] = useState('default'); 
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [watchForm, setWatchForm] = useState(DEFAULT_WATCH_STATE);
  const [braceletForm, setBraceletForm] = useState(DEFAULT_BRACELET_STATE);

  const [viewBeforeDetail, setViewBeforeDetail] = useState('list');

  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [view, viewingFriend, financeDetail]);

  useEffect(() => { if (!firebaseReady && productionConfig.apiKey) { tryInitFirebase(productionConfig); if (firebaseReady) { setUseLocalStorage(false); setLoading(true); } } }, []);

  useEffect(() => {
     if (useLocalStorage || !user?.uid) return;
     const savedFriends = localStorage.getItem(`friends_${user.uid}`);
     if (savedFriends) setFriends(JSON.parse(savedFriends));
     if (firebaseReady && !useLocalStorage) {
         if (user.isAnonymous) return;
         try { const requestsRef = collection(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests'); const q = query(requestsRef, where('toUser', '==', user.uid)); const unsubRequests = onSnapshot(q, (snap) => { setFriendRequests(snap.docs.map(d => ({id: d.id, ...d.data()}))); }); return () => unsubRequests(); } catch (e) {}
     }
  }, [user, useLocalStorage]);

  const sendFriendRequest = async () => {
      if (!addFriendId || addFriendId.length < 5) return alert("Code invalide"); if (addFriendId === user.uid) return alert("Impossible de s'ajouter soi-même");
      try { await addDoc(collection(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests'), { fromUser: user.uid, fromEmail: user.email, toUser: addFriendId, status: 'pending', createdAt: new Date().toISOString() }); alert("Demande envoyée !"); setAddFriendId(''); } catch (e) { if (e.code === 'permission-denied') setShowRulesHelp(true); else alert("Erreur: " + e.message); }
  };
  const acceptRequest = async (req) => { const newFriend = { id: req.fromUser, name: req.fromEmail || 'Ami' }; const updatedFriends = [...friends, newFriend]; setFriends(updatedFriends); localStorage.setItem(`friends_${user.uid}`, JSON.stringify(updatedFriends)); try { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests', req.id)); } catch (e) {} };
  const rejectRequest = async (reqId) => { try { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests', reqId)); } catch (e) {} };
  const removeFriend = (friendId) => { const updatedFriends = friends.filter(f => f.id !== friendId); setFriends(updatedFriends); localStorage.setItem(`friends_${user.uid}`, JSON.stringify(updatedFriends)); };
  
  const handlePreviewOwnProfile = () => { setFriendWatches(watches.filter(w => w.publicVisible !== false)); setViewingFriend({ id: user.uid, name: 'Mon Profil Public' }); setFriendFilter('collection'); setSelectedFriendWatch(null); if(scrollRef.current) scrollRef.current.scrollTop = 0; };
  
  const loadFriendCollection = async (friend) => {
      if (!firebaseReady) return; setIsFriendsLoading(true); setViewingFriend(friend); setFriendFilter('collection'); setSelectedFriendWatch(null);
      try { const q = query(collection(db, 'artifacts', APP_ID_STABLE, 'users', friend.id, 'watches')); const snap = await getDocs(q); setFriendWatches(snap.docs.map(d => ({id: d.id, ...d.data()})).filter(w => w.publicVisible !== false)); } catch (err) { setViewingFriend(null); } finally { setIsFriendsLoading(false); }
  };

  const toggleVisibility = async (watch) => { const newVal = !watch.publicVisible; setWatches(prev => prev.map(w => w.id === watch.id ? { ...w, publicVisible: newVal } : w)); if (!useLocalStorage) { try { await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches', watch.id), { ...watch, publicVisible: newVal }, { merge: true }); } catch (e) { setWatches(prev => prev.map(w => w.id === watch.id ? { ...w, publicVisible: !newVal } : w)); } } };
  const handleMoveToCollection = async (watch) => { if (!confirm(t('move_collection') + " ?")) return; const updatedWatch = { ...watch, status: 'collection', dateAdded: new Date().toISOString() }; setWatches(prev => prev.map(w => w.id === watch.id ? updatedWatch : w)); setSelectedWatch(updatedWatch); if (!useLocalStorage) { try { await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches', watch.id), updatedWatch, { merge: true }); } catch (e) {} } };
  
  const handleCalendarDayClick = (dateStr) => { setSelectedCalendarDate(dateStr); setCalendarSearchTerm(''); const existing = calendarEvents.find(e => e.id === dateStr || e.date === dateStr); setSelectedCalendarWatches(existing ? (existing.watches || []) : []); };
  const handleCalendarSave = async () => { if (!selectedCalendarDate) return; let updatedEvents = [...calendarEvents]; const existingIdx = updatedEvents.findIndex(e => e.id === selectedCalendarDate || e.date === selectedCalendarDate); const eventData = { date: selectedCalendarDate, watches: selectedCalendarWatches }; if (selectedCalendarWatches.length === 0) { if (existingIdx >= 0) updatedEvents.splice(existingIdx, 1); } else { if (existingIdx >= 0) updatedEvents[existingIdx] = { ...updatedEvents[existingIdx], ...eventData }; else updatedEvents.push({ id: selectedCalendarDate, ...eventData }); } setCalendarEvents(updatedEvents); setSelectedCalendarDate(null); if (!useLocalStorage) { try { const docRef = doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'calendar', selectedCalendarDate); if (selectedCalendarWatches.length === 0) await deleteDoc(docRef); else await setDoc(docRef, eventData); } catch(e) {} } };

  const handleGoogleLogin = async () => { if (!firebaseReady) { setShowConfigModal(true); return; } setUseLocalStorage(false); setIsAuthLoading(true); const provider = new GoogleAuthProvider(); try { await signInWithPopup(auth, provider); } catch (error) { if (error.code === 'auth/unauthorized-domain') { setError("Domaine non autorisé"); } else { setError("Erreur: " + error.message); } } finally { setIsAuthLoading(false); } };
  const handleLogout = async () => { if (!firebaseReady) { setShowProfileMenu(false); return; } setIsAuthLoading(true); try { await signOut(auth); setShowProfileMenu(false); } finally { setIsAuthLoading(false); } };

  useEffect(() => {
    if (useLocalStorage && !isAuthLoading) { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); setError(null); setLoading(false); if (useLocalStorage) setUseLocalStorage(false); } 
      else { const timer = setTimeout(() => { if (!isAuthLoading) { signInAnonymously(auth).catch(() => { setUseLocalStorage(true); setUser({ uid: 'local-user' }); }).finally(() => setLoading(false)); } }, 1000); return () => clearTimeout(timer); }
    });
    return () => unsubscribe();
  }, [useLocalStorage, isAuthLoading]);

  useEffect(() => {
    if (!user && !useLocalStorage) return;
    if (useLocalStorage) {
      try { const lw = localStorage.getItem(LOCAL_STORAGE_KEY); if (lw) setWatches(JSON.parse(lw)); const lb = localStorage.getItem(LOCAL_STORAGE_BRACELETS_KEY); if (lb) setBracelets(JSON.parse(lb)); const lc = localStorage.getItem(LOCAL_STORAGE_CALENDAR_KEY); if (lc) setCalendarEvents(JSON.parse(lc)); } catch(e){}
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

  useEffect(() => { if (useLocalStorage) { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watches)); localStorage.setItem(LOCAL_STORAGE_BRACELETS_KEY, JSON.stringify(bracelets)); localStorage.setItem(LOCAL_STORAGE_CALENDAR_KEY, JSON.stringify(calendarEvents)); } }, [watches, bracelets, calendarEvents, useLocalStorage]);

  const handleImageUpload = async (e, type) => {
    const files = Array.from(e.target.files); if (!files || files.length === 0) return;
    try { 
      if (type === 'watch') { 
          const base64Images = await Promise.all(files.map(file => compressImage(file))); 
          setWatchForm(prev => { const currentImages = prev.images || (prev.image ? [prev.image] : []); const combined = [...currentImages, ...base64Images]; if (combined.length > 3) { alert("Max 3 photos"); combined.splice(3); } return { ...prev, images: combined, image: combined[0] || null }; }); 
      } 
      else if (type === 'invoice') { 
          const file = files[0];
          if (file.type === 'application/pdf') {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = (e) => setWatchForm(prev => ({...prev, invoice: e.target.result}));
          } else {
              const base64 = await compressImage(file); 
              setWatchForm(prev => ({...prev, invoice: base64})); 
          }
      } 
      else { 
          const base64 = await compressImage(files[0]); 
          setBraceletForm(prev => ({ ...prev, image: base64 })); 
      }
    } catch (err) {}
  };
  
  const removeImage = (index) => { setWatchForm(prev => { const currentImages = [...(prev.images || [])]; currentImages.splice(index, 1); return { ...prev, images: currentImages, image: currentImages[0] || null }; }); };

  const closeForm = (data) => { 
      if (editingType === 'watch') { 
          if(selectedWatch) { 
              setSelectedWatch(data); setViewedImageIndex(0); setView('detail'); 
          } else {
              setView(data.status === 'wishlist' ? 'wishlist' : 'list'); 
          }
      } else { 
          setView('list'); 
      } 
      setEditingId(null); setWatchForm(DEFAULT_WATCH_STATE); setBraceletForm(DEFAULT_BRACELET_STATE); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    const id = editingId || Date.now().toString(); 
    const isWatch = editingType === 'watch'; 
    let data;
    
    if (isWatch) { 
        const images = watchForm.images && watchForm.images.length > 0 ? watchForm.images : (watchForm.image ? [watchForm.image] : []); 
        data = { ...watchForm, id, purchasePrice: Number(watchForm.purchasePrice || 0), sellingPrice: Number(watchForm.sellingPrice || 0), minPrice: Number(watchForm.minPrice || 0), dateAdded: watchForm.dateAdded || new Date().toISOString(), images: images, image: images[0] || null }; 
    } else { 
        data = { ...braceletForm, id, dateAdded: braceletForm.dateAdded || new Date().toISOString() }; 
    }
    
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

    if (useLocalStorage) { 
        if (isWatch) setWatches(prev => editingId ? prev.map(w => w.id === id ? cleanData : w) : [cleanData, ...prev]); 
        else setBracelets(prev => editingId ? prev.map(b => b.id === id ? cleanData : b) : [cleanData, ...prev]); 
        closeForm(cleanData); 
    } else { 
        try { 
            await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, isWatch ? 'watches' : 'bracelets', id), cleanData); 
            closeForm(cleanData); 
        } catch(e) { 
            alert("Erreur lors de la sauvegarde : " + e.message); 
            console.error("Firebase Erreur:", e);
        } 
    }
  };

  const exportCSV = () => {
    const sep = ";"; let csvContent = "\uFEFF"; csvContent += "sep=;\n"; const headers = [ "Statut", "Marque", "Modele", "Prix Achat", "Prix Vente/Estim", "Prix Min", "Plus-Value", "Diametre", "Annee", "Reference", "Mouvement", "Notes" ]; csvContent += headers.join(sep) + "\n";
    watches.forEach(w => { const row = [ w.status, w.brand, w.model, w.purchasePrice, w.sellingPrice, w.minPrice, (w.sellingPrice||0)-w.purchasePrice, w.diameter, w.year, w.reference, w.movement, (w.conditionNotes||"").replace(/(\r\n|\n|\r|;)/gm, " ") ].map(e => `"${(e || '').toString().replace(/"/g, '""')}"`); csvContent += row.join(sep) + "\n"; });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", "collection.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  
  const openAdd = () => { setEditingId(null); setSelectedWatch(null); setWatchForm({ ...DEFAULT_WATCH_STATE, status: view === 'wishlist' ? 'wishlist' : 'collection' }); setBraceletForm(DEFAULT_BRACELET_STATE); setEditingType((filter === 'bracelets' && view !== 'wishlist') ? 'bracelet' : 'watch'); setView('add'); };
  
  const handleEdit = (item, type) => { if (type === 'watch') { const safeImages = item.images || (item.image ? [item.image] : []); setWatchForm({ ...DEFAULT_WATCH_STATE, ...item, images: safeImages }); } else setBraceletForm({ ...DEFAULT_BRACELET_STATE, ...item }); setEditingType(type); setEditingId(item.id); setView('add'); };
  
  const handleCancelForm = () => { setEditingId(null); setWatchForm(DEFAULT_WATCH_STATE); setBraceletForm(DEFAULT_BRACELET_STATE); if (selectedWatch) { setView('detail'); } else { setView(viewBeforeDetail); } };
  
  const handleDelete = async (id, type) => { if(!confirm(t('delete') + " ?")) return; if(useLocalStorage) { if (type === 'watch') setWatches(prev => prev.filter(w => w.id !== id)); else setBracelets(prev => prev.filter(b => b.id !== id)); setView('list'); } else { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, type === 'watch' ? 'watches' : 'bracelets', id)); setView('list'); } };

  const openWatchDetail = (watch) => { setViewBeforeDetail(view); setSelectedWatch(watch); setView('detail'); };

  const activeWatchesCount = watches.filter(w => w.status === 'collection').length;

  const filteredWatches = useMemo(() => {
    let filtered = watches;
    if (searchTerm) { const lower = searchTerm.toLowerCase(); filtered = filtered.filter(w => { const fullSearchString = `${w.brand || ''} ${w.model || ''}`.toLowerCase(); return fullSearchString.includes(lower); }); }
    let sorted = [...filtered];
    const getTime = (w) => { if (w.purchaseDate) { const time = new Date(w.purchaseDate).getTime(); return isNaN(time) ? null : time; } return null; };
    if (sortOrder === 'priceAsc') sorted.sort((a, b) => (Number(a.purchasePrice) || 0) - (Number(b.purchasePrice) || 0));
    else if (sortOrder === 'priceDesc') sorted.sort((a, b) => (Number(b.purchasePrice) || 0) - (Number(a.purchasePrice) || 0));
    else if (sortOrder === 'alpha') sorted.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
    else if (sortOrder === 'dateAsc') { sorted.sort((a, b) => { const ta = getTime(a), tb = getTime(b); if (ta === null && tb !== null) return 1; if (tb === null && ta !== null) return -1; if (ta === null && tb === null) return new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime(); return ta - tb; }); } 
    else { sorted.sort((a, b) => { const ta = getTime(a), tb = getTime(b); if (ta === null && tb !== null) return 1; if (tb === null && ta !== null) return -1; if (ta === null && tb === null) return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime(); return tb - ta; }); }
    return sorted;
  }, [watches, searchTerm, sortOrder]);

  function renderForm() {
    const isWatch = editingType === 'watch';
    const form = isWatch ? watchForm : braceletForm;
    const setForm = isWatch ? setWatchForm : setBraceletForm;
    const handleInput = (field, val) => setForm(prev => ({...prev, [field]: val}));

    const isAuto = /auto|manuel|mecanique/i.test(form.movement || '');
    const isQuartz = /quartz|pile/i.test(form.movement || '');

    return (
      <div className={`pb-24 p-4 min-h-screen ${theme.bgSecondary}`}>
        <div className={`flex justify-between items-center mb-6 sticky top-0 py-3 z-10 ${theme.bgSecondary}`}>
            <h1 className={`text-2xl font-bold font-serif ${theme.text}`}>{editingId ? t('edit') : t('add_new')}</h1>
            <button type="button" onClick={handleCancelForm} className={`p-2 rounded-full border ${theme.border} ${theme.bg} ${theme.textSub}`}><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isWatch && (
            <div className={`flex p-1 rounded-xl border ${theme.border} ${theme.bg} overflow-x-auto no-scrollbar`}>
                {['collection', 'forsale', 'sold', 'wishlist'].map(s => (
                    <button key={s} type="button" onClick={() => handleInput('status', s)} className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${form.status === s ? `bg-white dark:bg-slate-700 shadow-sm ${theme.text}` : theme.textSub}`}>{t(s)}</button>
                ))}
            </div>
          )}
          
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider flex items-center gap-2`}><Camera size={14}/> Photos</h3>
            <div className="grid grid-cols-4 gap-2">
              {(form.images || []).map((img, idx) => (
                  <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border ${theme.border}`}><img src={img} className="w-full h-full object-cover" alt="Preview"/><button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 shadow-sm"><X size={12}/></button></div>
              ))}
              {(form.images || []).length < 3 && (
                  <label className={`aspect-square rounded-xl border-2 border-dashed ${theme.border} flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}><Plus className={theme.textSub} size={20}/><span className={`text-[10px] ${theme.textSub} font-medium mt-1`}>Ajouter</span><input type="file" className="hidden" multiple onChange={(e) => handleImageUpload(e, isWatch ? 'watch' : 'bracelet')} accept="image/*"/></label>
              )}
            </div>
          </div>

          {isWatch ? (
            <>
              <div className="space-y-3">
                <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider flex items-center gap-2`}><Settings size={14}/> Identité</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('brand')}</label>
                      <input className={`w-full p-3 rounded-xl border ${theme.input}`} placeholder="Ex: Seiko" value={form.brand} onChange={e => handleInput('brand', e.target.value)} required />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('model')}</label>
                      <input className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Ex: Alpinist" value={form.model} onChange={e => handleInput('model', e.target.value)} required />
                  </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('reference')} (Optionnel)</label>
                    <input className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Ex: SPB117" value={form.reference || ''} onChange={e => handleInput('reference', e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider flex items-center gap-2`}><Euro size={14}/> Finances & Dates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('purchase_price')}</label>
                     <input type="number" className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Ex: 5000" value={form.purchasePrice || ''} onChange={e => handleInput('purchasePrice', e.target.value)} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{form.status === 'collection' ? "Estimation Actuelle" : t('selling_price')}</label>
                     <input type="number" className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Ex: 5500" value={form.sellingPrice || ''} onChange={e => handleInput('sellingPrice', e.target.value)} />
                  </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('min_price')}</label>
                    <input type="number" className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Ex: 4800 (Prix plancher privé)" value={form.minPrice || ''} onChange={e => handleInput('minPrice', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] uppercase font-bold text-slate-500 ml-1">{t('date_purchase')}</label><input type="date" className={`w-full p-2.5 rounded-lg border ${theme.input} text-sm`} value={form.purchaseDate || ''} onChange={e => handleInput('purchaseDate', e.target.value)} /></div>
                  {form.status === 'sold' && <div><label className="text-[10px] uppercase font-bold text-slate-500 ml-1">{t('date_sold')}</label><input type="date" className={`w-full p-2.5 rounded-lg border ${theme.input} text-sm`} value={form.soldDate || ''} onChange={e => handleInput('soldDate', e.target.value)} /></div>}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider flex items-center gap-2`}><Layers size={14}/> Technique</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('diameter')} (mm)</label>
                      <input type="number" className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: 40" value={form.diameter || ''} onChange={e => handleInput('diameter', e.target.value)} />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('thickness')} (mm)</label>
                      <input type="number" className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: 12" value={form.thickness || ''} onChange={e => handleInput('thickness', e.target.value)} />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('lug_width')} (mm)</label>
                      <input type="number" className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: 20" value={form.strapWidth || ''} onChange={e => handleInput('strapWidth', e.target.value)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('movement')} (Type)</label>
                      <input className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: Automatique" value={form.movement || ''} onChange={e => handleInput('movement', e.target.value)} />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('movement_model')}</label>
                      <input className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: ETA 2824" value={form.movementModel || ''} onChange={e => handleInput('movementModel', e.target.value)} />
                  </div>
                </div>

                {isAuto && (
                   <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Réserve de marche (h)</label>
                          <input type="number" className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: 42" value={form.powerReserve || ''} onChange={e => handleInput('powerReserve', e.target.value)} />
                      </div>
                      <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Nombre de rubis</label>
                          <input type="number" className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: 21" value={form.jewels || ''} onChange={e => handleInput('jewels', e.target.value)} />
                      </div>
                   </div>
                )}
                {isQuartz && (
                   <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Modèle de la pile</label>
                      <input className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: SR920SW / 371" value={form.batteryModel || ''} onChange={e => handleInput('batteryModel', e.target.value)} />
                   </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('dial')} (Couleur)</label>
                      <input className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: Bleu" value={form.dialColor || ''} onChange={e => handleInput('dialColor', e.target.value)} />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('glass')} (Type)</label>
                      <input className={`w-full p-3 rounded-lg border ${theme.input} text-sm`} placeholder="Ex: Saphir" value={form.glass || ''} onChange={e => handleInput('glass', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                  <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider flex items-center gap-2`}><BookOpen size={14}/> Histoire & Notes</h3>
                  <textarea className={`w-full p-3 rounded-lg border ${theme.input} h-24 text-sm`} placeholder={t('notes')} value={form.conditionNotes || ''} onChange={e => handleInput('conditionNotes', e.target.value)}></textarea>
                  <textarea className={`w-full p-3 rounded-lg border ${theme.input} h-20 text-sm`} placeholder={t('history_brand')} value={form.historyBrand || ''} onChange={e => handleInput('historyBrand', e.target.value)}></textarea>
                  <textarea className={`w-full p-3 rounded-lg border ${theme.input} h-20 text-sm`} placeholder={t('history_model')} value={form.historyModel || ''} onChange={e => handleInput('historyModel', e.target.value)}></textarea>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider flex items-center gap-2`}><Receipt size={14}/> Facture / Justificatif</h3>
                  {form.invoice ? (
                      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                          {form.invoice.startsWith('data:application/pdf') ? (
                              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                  <FileText size={48} className="mb-2"/>
                                  <span className="text-xs font-bold uppercase">Document PDF</span>
                              </div>
                          ) : (
                              <img src={form.invoice} className="w-full h-full object-cover" alt="Facture" />
                          )}
                          <button type="button" onClick={() => setWatchForm(prev => ({...prev, invoice: null}))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md"><X size={14}/></button>
                      </div>
                  ) : (
                      <label className={`w-full py-6 border-2 border-dashed ${theme.border} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}>
                          <Plus className={theme.textSub} size={24}/>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textSub} mt-2`}>Ajouter (Image ou PDF)</span>
                          <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'invoice')} accept="image/*,application/pdf"/>
                      </label>
                  )}
              </div>
            </>
          ) : (
              <div className="space-y-3">
                  <input className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Marque (Optionnel)" value={form.brand || ''} onChange={e => handleInput('brand', e.target.value)} />
                  <input className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Type (Ex: Cuir, Acier)" value={form.type || ''} onChange={e => handleInput('type', e.target.value)} required />
                  <input className={`w-full p-3 rounded-lg border ${theme.input}`} placeholder="Largeur (mm)" value={form.width || ''} onChange={e => handleInput('width', e.target.value)} required />
              </div>
          )}

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-4"><Save size={20}/> {t('save')}</button>
        </form>
      </div>
    );
  }

  function renderBox() {
      const handleBoxClick = () => { setIsBoxOpening(true); setTimeout(() => { setFilter('collection'); setView('list'); setIsBoxOpening(false); }, 800); };
      return (
        <div className={`flex flex-col items-center justify-start h-full min-h-[80vh] px-8 relative overflow-hidden pt-28 ${theme.text}`}>
          <GraphicBackground isDark={isDark} />
          
          <div className="absolute top-4 left-4 z-20">
            <button onClick={() => setView('friends')} className={`h-10 px-3 ${theme.bgSecondary} ${theme.text} rounded-full flex items-center justify-center gap-2 border ${theme.border} shadow-sm hover:opacity-80 transition-colors relative`}>
                <Users size={16} />
                <span className="text-xs font-bold">{t('friends')}</span>
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
                 {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="Avatar"/> : <div className="w-full h-full bg-indigo-800 flex items-center justify-center text-white"><span className="text-xs font-bold">{user.email ? user.email[0].toUpperCase() : 'U'}</span></div>}
              </button>
            )}
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
          
          <div onClick={handleBoxClick} className="flex items-center justify-center w-72 h-64 cursor-pointer transform transition-transform active:scale-95 hover:scale-105 duration-300 z-10 -mt-12">
            <WatchBoxLogo isOpen={isBoxOpening} isDark={isDark} settings={settings} />
          </div>
          <div className="-mt-6 flex flex-col items-center z-10 pb-20">
            <p className={`${theme.text} font-mono font-bold text-sm mb-2 tracking-widest shadow-sm uppercase opacity-70`}>{activeWatchesCount} {activeWatchesCount > 1 ? t('pieces') : t('piece')}</p>
            {error ? <div className="mt-3 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs">{String(error)}</div> : null}
          </div>
        </div>
      );
  }

  function renderHeader(title, withFilters = false) {
    return (
        <div className={`sticky top-0 ${theme.bgSecondary} z-10 pt-2 pb-2 px-1 shadow-sm border-b ${theme.border}`}>
          <div className="flex justify-between items-center px-2 mb-2">
            <h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide`}>{title}</h1>
            <div className="flex items-center gap-2">
                {(title === t('collection') || title === t('wishlist') || title === t('bracelets') || title === t('inventory')) && (
                    <div className="relative">
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={`appearance-none bg-transparent border ${theme.border} ${theme.textSub} text-xs font-medium py-1.5 pl-2 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer`}>
                            <option value="dateDesc">{t('sort_date_desc')}</option><option value="dateAsc">{t('sort_date_asc')}</option><option value="alpha">{t('sort_alpha')}</option><option value="priceAsc">{t('sort_price_asc')}</option><option value="priceDesc">{t('sort_price_desc')}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"><ArrowUpDown size={10} /></div>
                    </div>
                )}
                <button onClick={() => { setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchTerm(''); }} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-slate-900 text-white' : `${theme.textSub} hover:opacity-80`}`}><Search size={18} /></button>
            </div>
          </div>
          {isSearchOpen && (<div className="px-2 mb-3"><input autoFocus type="text" placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full p-2 pl-3 ${theme.input} rounded-lg text-sm focus:outline-none focus:ring-2`}/></div>)}
          {withFilters && !isSearchOpen && (
            <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar px-2 pb-1">
                {['all', 'collection', 'forsale', 'sold', 'bracelets'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter===f ? 'bg-slate-800 text-white shadow-md' : `${theme.bgSecondary} border ${theme.border} ${theme.textSub}`}`}>
                        {t(f)} {f !== 'bracelets' && `(${f === 'all' ? watches.filter(w => w.status !== 'wishlist').length : (f==='collection' ? watches.filter(w=>w.status==='collection').length : f==='forsale' ? watches.filter(w=>w.status==='forsale').length : watches.filter(w=>w.status==='sold').length)})`}
                    </button>
                ))}
            </div>
          )}
        </div>
    );
  }

  function renderList() {
    const displayWatches = filteredWatches.filter(w => { if (w.status === 'wishlist') return false; if (filter === 'all') return true; if (filter === 'bracelets') return false; return w.status === filter; });
    if (filter === 'bracelets') {
        return (
            <div className="pb-24">
                {renderHeader(t('bracelets'), true)}
                <div className="grid grid-cols-2 gap-3 px-3 mt-3">
                    {bracelets.map(b => (
                        <Card key={b.id} onClick={() => handleEdit(b, 'bracelet')} theme={theme}>
                            <div className={`aspect-square ${theme.bg} relative flex items-center justify-center`}>{b.image ? <img src={b.image} className="w-full h-full object-cover" alt="bracelet"/> : <Activity className={theme.textSub}/>}<div className="absolute bottom-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 shadow-sm">{b.width}mm</div></div>
                            <div className="p-3">{b.brand && <div className="text-[10px] uppercase font-bold text-indigo-600 truncate">{b.brand}</div>}<div className={`font-bold text-sm truncate ${theme.text}`}>{b.type}</div></div>
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
            <Card key={w.id} onClick={() => { setViewedImageIndex(0); openWatchDetail(w); }} theme={theme}>
              <div className={`aspect-square ${theme.bg} relative`}>
                {displayImage ? <img src={displayImage} className="w-full h-full object-cover" alt="montre"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera/></div>}
                {(w.purchasePrice) && (<div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{formatPrice(w.purchasePrice)}</div>)}
                <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 shadow-sm flex flex-col items-end">{w.status === 'sold' ? (<><span className="text-emerald-600 font-extrabold uppercase">{t('sold')}</span><span className="text-emerald-500 font-bold text-[9px]">{formatPrice(w.sellingPrice)}</span></>) : (formatPrice(w.sellingPrice || w.purchasePrice))}</div>
                <div className="absolute bottom-1 right-1 p-1.5 bg-white/90 rounded-full shadow-sm cursor-pointer z-10" onClick={(e) => { e.stopPropagation(); toggleVisibility(w); }}>{w.publicVisible ? <Eye size={14} className="text-emerald-600"/> : <EyeOff size={14} className="text-slate-400"/>}</div>
              </div>
              <div className="p-3"><div className={`font-bold font-serif text-sm truncate ${theme.text}`}>{w.brand}</div><div className={`text-xs ${theme.textSub} truncate`}>{w.model}</div></div>
            </Card>
          )})}
        </div>
      </div>
    );
  }

  function renderWishlist() {
    const wishes = filteredWatches.filter(w => w.status === 'wishlist');
    return (
      <div className="pb-24">
        {renderHeader(t('wishlist'))}
        <div className="space-y-3 px-3 mt-3">
          <button onClick={() => openAdd()} className={`w-full py-4 border-2 border-dashed ${theme.border} rounded-xl flex items-center justify-center ${theme.textSub} font-medium hover:border-rose-400 hover:text-rose-500 transition-colors`}><Plus className="mr-2" size={20}/> {t('add_new')}</button>
          {wishes.map(w => {
            const displayImage = w.images?.[0] || w.image;
            return (
            <Card key={w.id} className="flex p-3 gap-3 relative" onClick={() => { openWatchDetail(w); }} theme={theme}>
                <div className={`w-20 h-20 ${theme.bg} rounded-lg flex-shrink-0 overflow-hidden`}>{displayImage ? <img src={displayImage} className="w-full h-full object-cover" alt="montre"/> : <div className="flex h-full items-center justify-center text-slate-300"><Heart size={20}/></div>}</div>
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div><h3 className={`font-bold font-serif ${theme.text} tracking-wide`}>{w.brand}</h3><p className={`text-xs ${theme.textSub}`}>{w.model}</p></div>
                    <div className="flex justify-between items-end"><div className="font-semibold text-emerald-600">{formatPrice(w.purchasePrice)}</div>{w.link && (<a href={w.link} target="_blank" rel="noreferrer" className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 z-10" onClick={(e) => { e.stopPropagation(); }}><ExternalLink size={14} /></a>)}</div>
                </div>
            </Card>
          )})}
        </div>
      </div>
    );
  }

  function renderDetail() {
    if(!selectedWatch) return null;
    const w = selectedWatch;
    const displayImages = w.images && w.images.length > 0 ? w.images : (w.image ? [w.image] : []);
    const searchQuery = `${w.brand} ${w.model}`.replace(/\s+/g, '+');
    const marketLinks = [{ name: "Chrono24", url: `https://www.chrono24.fr/search/index.htm?query=${searchQuery}`, icon: Clock }, { name: "eBay", url: `https://www.ebay.fr/sch/i.html?_nkw=${searchQuery}`, icon: ShoppingCart }, { name: "Vinted", url: `https://www.vinted.fr/vetements?search_text=${searchQuery}`, icon: Gem }, { name: "LeBonCoin", url: `https://www.leboncoin.fr/recherche?text=${searchQuery}`, icon: MapPin }];
    const getWatchStats = (watchId) => { const now = new Date(); const currentMonth = now.getMonth(); const currentYear = now.getFullYear(); let monthCount = 0; let yearCount = 0; let lastYearCount = 0; calendarEvents.forEach(evt => { if (evt.watches && evt.watches.includes(watchId)) { const d = new Date(evt.date); const dy = d.getFullYear(); const dm = d.getMonth(); if (dy === currentYear) { yearCount++; if (dm === currentMonth) monthCount++; } else if (dy === currentYear - 1) { lastYearCount++; } } }); return { monthCount, yearCount, lastYearCount }; };
    const stats = getWatchStats(w.id);

    return (
      <div className={`pb-24 ${theme.bgSecondary} min-h-screen`}>
        <div className={`sticky top-0 ${theme.bgSecondary}/90 backdrop-blur p-4 flex items-center justify-between border-b ${theme.border} z-10`}>
            <button onClick={() => { setSelectedWatch(null); setView(viewBeforeDetail); }} className={theme.text}><ChevronLeft/></button>
            <span className={`font-bold font-serif ${theme.text} tracking-wide`}>Détails</span>
            <div className="flex gap-2"><button onClick={() => handleEdit(w, 'watch')} className={`p-2 ${theme.bg} ${theme.textSub} rounded-full`}><Edit2 size={18}/></button><button onClick={() => handleDelete(w.id, 'watch')} className="p-2 bg-red-50 text-red-500 rounded-full"><Trash2 size={18}/></button></div>
        </div>
        <div className="p-4 space-y-6">
          <div className="space-y-4">
              <div className={`aspect-square ${theme.bg} rounded-2xl overflow-hidden shadow-sm border ${theme.border} relative group`} onClick={() => setFullScreenImage(displayImages[viewedImageIndex])}>
                {displayImages[viewedImageIndex] ? <img src={displayImages[viewedImageIndex]} className="w-full h-full object-cover" alt="montre"/> : <div className="flex h-full items-center justify-center"><Camera size={48} className={theme.textSub}/></div>}
                {displayImages.length > 1 && (<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">{displayImages.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all shadow-sm ${i === viewedImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}></div>)}</div>)}
              </div>
              {displayImages.length > 1 && (<div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{displayImages.map((img, i) => (<div key={i} onClick={() => setViewedImageIndex(i)} className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 border-2 ${i === viewedImageIndex ? 'border-indigo-500' : 'border-transparent'}`}><img src={img} className="w-full h-full object-cover" alt="thumb" /></div>))}</div>)}
              <div>
                <h1 className={`text-3xl font-serif font-bold ${theme.text} leading-tight`}>{w.brand}</h1><p className={`text-xl ${theme.textSub} font-medium font-serif`}>{w.model}</p>
                {w.reference && <span className={`text-xs ${theme.bg} px-2 py-1 rounded mt-2 inline-block border ${theme.border} font-mono ${theme.textSub}`}>REF: {w.reference}</span>}
                {w.isLimitedEdition && (<div className={`mt-2 inline-flex items-center px-3 py-1 ${theme.text} bg-indigo-500/10 text-xs font-bold rounded-full border border-indigo-500/30`}>{t('limited_edition')} {w.limitedNumber && w.limitedTotal ? `${w.limitedNumber} / ${w.limitedTotal}` : ''}</div>)}
              </div>
          </div>
          <div className="flex gap-2">
                {w.status !== 'wishlist' && <button onClick={() => setExportType('insurance')} className={`flex-1 py-3 ${theme.bg} border ${theme.border} rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${theme.text} hover:opacity-80`}><ShieldCheck size={16}/> {t('sheet_insurance')}</button>}
                {w.status !== 'wishlist' && <button onClick={() => setExportType('sale')} className={`flex-1 py-3 ${theme.bg} border ${theme.border} rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${theme.text} hover:opacity-80`}><Tag size={16}/> {t('sheet_sale')}</button>}
          </div>
          <div className={`${theme.card} border ${theme.border} rounded-xl p-4 shadow-sm`}><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{w.status === 'wishlist' ? t('find_used') : t('market_value')}</h3><div className="grid grid-cols-2 gap-2">{marketLinks.map((link) => { const LinkIconComponent = link.icon; return (<a key={link.name} href={link.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${theme.bg} border ${theme.border} hover:bg-indigo-50 hover:border-indigo-200 transition-colors`}><LinkIconComponent size={14} className="text-indigo-600"/><span className={`text-xs font-bold ${theme.text}`}>{link.name}</span><ExternalLink size={10} className="ml-auto text-slate-400"/></a>)})}</div></div>
          {w.status === 'wishlist' && (<>{w.link && (<a href={w.link} target="_blank" rel="noreferrer" className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors mb-4 border border-indigo-100"><LinkIcon size={20} /> {t('visit_site')}</a>)}<button onClick={() => handleMoveToCollection(w)} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-transform active:scale-95 mb-4"><Gift size={20} /> {t('move_collection')}</button></>)}
          {w.status === 'collection' && (<div className={`${theme.card} border ${theme.border} rounded-xl p-4 shadow-sm`}><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider flex items-center gap-2`}><BarChart2 size={14}/> {t('stats_usage')}</h3><div className="grid grid-cols-3 gap-2 text-center"><div className={`p-2 rounded-lg ${theme.bg}`}><div className={`text-lg font-bold ${theme.text}`}>{stats.monthCount}</div><div className={`text-[9px] uppercase ${theme.textSub}`}>{t('worn_this_month')}</div></div><div className={`p-2 rounded-lg ${theme.bg}`}><div className={`text-lg font-bold ${theme.text}`}>{stats.yearCount}</div><div className={`text-[9px] uppercase ${theme.textSub}`}>{t('worn_this_year')}</div></div><div className={`p-2 rounded-lg ${theme.bg}`}><div className={`text-lg font-bold ${theme.text}`}>{stats.lastYearCount}</div><div className={`text-[9px] uppercase ${theme.textSub}`}>{t('worn_last_year')}</div></div></div></div>)}
          <div><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('specs')}</h3><div className="grid grid-cols-2 gap-3"><DetailItem icon={Ruler} label={t('diameter')} value={w.diameter ? w.diameter + ' mm' : ''} theme={theme} /><DetailItem icon={Layers} label={t('thickness')} value={w.thickness ? w.thickness + ' mm' : ''} theme={theme} /><DetailItem icon={Activity} label={t('lug_width')} value={w.strapWidth ? w.strapWidth + ' mm' : ''} theme={theme} /><DetailItem icon={Scale} label={t('weight')} value={w.weight ? w.weight + ' g' : ''} theme={theme} /><DetailItem icon={Droplets} label={t('water_res')} value={w.waterResistance ? w.waterResistance + ' ATM' : ''} theme={theme} /></div></div>
          <div><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('movement')} & {t('dial')}</h3>
             <div className="grid grid-cols-2 gap-3">
                 <DetailItem icon={MovementIcon} label={t('movement')} value={w.movement} theme={theme} />
                 <DetailItem icon={Settings} label={t('movement_model')} value={w.movementModel} theme={theme} />
                 {w.powerReserve && <DetailItem icon={Battery} label="Réserve de marche" value={w.powerReserve + 'h'} theme={theme} />}
                 {w.jewels && <DetailItem icon={Gem} label="Rubis" value={w.jewels} theme={theme} />}
                 {w.batteryModel && <DetailItem icon={Battery} label={t('battery')} value={w.batteryModel} theme={theme} />}
                 <DetailItem icon={Palette} label={t('dial')} value={w.dialColor} theme={theme} />
                 <DetailItem icon={Search} label={t('glass')} value={w.glass} theme={theme} />
             </div>
          </div>
          <div><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('origin_maintenance')}</h3><div className="grid grid-cols-2 gap-3"><DetailItem icon={MapPin} label={t('country')} value={w.country} theme={theme} /><DetailItem icon={Calendar} label={t('date_release')} value={w.releaseDate} theme={theme} /><DetailItem icon={Calendar} label={t('year')} value={w.year} theme={theme} /><DetailItem icon={Package} label={t('box_included')} value={w.box} theme={theme} /><DetailItem icon={ShieldCheck} label={t('warranty')} value={w.warrantyDate} theme={theme} /><DetailItem icon={Wrench} label={t('revision')} value={w.revision} theme={theme} /></div></div>
          {(w.conditionRating || w.conditionComment) && (<div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>État & Condition</h3>{w.conditionRating && (<div className="flex items-center gap-2 mb-2"><div className={`text-lg font-bold ${theme.text} bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg`}>{w.conditionRating}/10</div><div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${w.conditionRating * 10}%` }}></div></div></div>)}{w.conditionComment && (<p className={`text-sm ${theme.text} italic`}>"{w.conditionComment}"</p>)}</div>)}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800"><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>Documents & Facture</h3>{w.invoice ? (<div className={`aspect-video rounded-xl overflow-hidden border ${theme.border} relative group cursor-pointer bg-slate-100 dark:bg-slate-800`} onClick={() => setFullScreenImage(w.invoice)}>{w.invoice.startsWith('data:application/pdf') ? <div className="flex flex-col items-center justify-center h-full text-slate-500"><FileText size={48} className="mb-2"/><span className="text-xs font-bold uppercase">Document PDF</span></div> : <img src={w.invoice} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="facture" />}<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2"><Receipt size={14}/> {t('view_invoice')}</div></div></div>) : (<div className={`p-4 text-center text-sm ${theme.textSub} italic border border-dashed ${theme.border} rounded-xl`}>Aucune facture enregistrée</div>)}</div>
          <div><h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}><Euro size={14} className="inline mr-1"/>{t('finance')} & Dates</h3><div className="grid grid-cols-2 gap-3 mb-3">{w.purchaseDate && <DetailItem icon={Calendar} label={t('date_purchase')} value={w.purchaseDate} theme={theme} />}{w.soldDate && w.status === 'sold' && <DetailItem icon={Calendar} label={t('date_sold')} value={w.soldDate} theme={theme} />}</div><div className={`grid grid-cols-2 gap-4 pt-4 border-t ${theme.border}`}><div className={`p-3 ${theme.bg} rounded-lg border ${theme.border}`}><div className={`text-xs ${theme.textSub} uppercase`}>{t('purchase_price')}</div><div className={`text-lg font-bold ${theme.text}`}>{formatPrice(w.purchasePrice)}</div></div>{w.status !== 'wishlist' && (<div className={`p-3 ${theme.bg} rounded-lg border ${theme.border}`}><div className={`text-xs ${theme.textSub} uppercase`}>{t('selling_price')}</div><div className="text-lg font-bold text-emerald-600">{formatPrice(w.sellingPrice || w.purchasePrice)}</div></div>)}</div></div>
          {w.conditionNotes && (<div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-800 border border-amber-100 mt-4"><div className="flex items-center font-bold text-amber-800 mb-2 text-xs uppercase"><FileText size={12} className="mr-1"/> {t('notes')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{w.conditionNotes}</div></div>)}
          {w.historyBrand && (<div className="bg-indigo-50 p-4 rounded-lg text-sm text-slate-800 border border-indigo-100 mt-4"><div className="flex items-center font-bold text-indigo-800 mb-2 text-xs uppercase"><BookOpen size={12} className="mr-1"/> {t('history_brand')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{w.historyBrand}</div></div>)}
          {w.historyModel && (<div className="bg-indigo-50 p-4 rounded-lg text-sm text-slate-800 border border-indigo-100 mt-4"><div className="flex items-center font-bold text-indigo-800 mb-2 text-xs uppercase"><BookOpen size={12} className="mr-1"/> {t('history_model')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{w.historyModel}</div></div>)}
        </div>
      </div>
    );
  }

  function renderProfile() {
    const displayWatches = watches.filter(w => { 
        if (!w.image && (!w.images || w.images.length === 0)) return false; 
        let matchSearch = true;
        if (gallerySearchTerm) {
            const lower = gallerySearchTerm.toLowerCase();
            const fullSearchString = `${w.brand || ''} ${w.model || ''}`.toLowerCase();
            matchSearch = fullSearchString.includes(lower);
        }
        if (!matchSearch) return false;
        if (w.status === 'collection' && showGalleryCollection) return true; 
        if (w.status === 'forsale' && showGalleryForsale) return true; 
        if (w.status === 'sold' && showGallerySold) return true; 
        if (w.status === 'wishlist' && showGalleryWishlist) return true;
        return false; 
    });

    const getTime = (w) => { if (w.purchaseDate) { const t = new Date(w.purchaseDate).getTime(); return isNaN(t) ? null : t; } return null; };
    if (sortOrder === 'priceAsc') { displayWatches.sort((a, b) => (Number(a.purchasePrice) || 0) - (Number(b.purchasePrice) || 0)); } else if (sortOrder === 'priceDesc') { displayWatches.sort((a, b) => (Number(b.purchasePrice) || 0) - (Number(a.purchasePrice) || 0)); } else if (sortOrder === 'alpha') { displayWatches.sort((a, b) => (a.brand || '').localeCompare(b.brand || '')); } else if (sortOrder === 'dateAsc') { displayWatches.sort((a, b) => { const ta = getTime(a), tb = getTime(b); if (ta === null && tb !== null) return 1; if (tb === null && ta !== null) return -1; if (ta === null && tb === null) return new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime(); return ta - tb; }); } else { displayWatches.sort((a, b) => { const ta = getTime(a), tb = getTime(b); if (ta === null && tb !== null) return 1; if (tb === null && ta !== null) return -1; if (ta === null && tb === null) return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime(); return tb - ta; }); }

    return (
        <div className="pb-24 px-2">
          <div className={`sticky top-0 ${theme.bgSecondary} z-10 pt-2 pb-2 px-1 shadow-sm border-b ${theme.border} mb-2`}>
             <div className="flex justify-between items-center px-2 mb-2"><h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide`}>{t('gallery')}</h1><div className="flex items-center gap-2"><div className="relative"><select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={`appearance-none bg-transparent border ${theme.border} ${theme.textSub} text-xs font-medium py-1.5 pl-2 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer`}><option value="dateDesc">{t('sort_date_desc')}</option><option value="dateAsc">{t('sort_date_asc')}</option><option value="alpha">{t('sort_alpha')}</option><option value="priceAsc">{t('sort_price_asc')}</option><option value="priceDesc">{t('sort_price_desc')}</option></select><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"><ArrowUpDown size={10} /></div></div><button onClick={() => { setIsGallerySearchOpen(!isGallerySearchOpen); if(isGallerySearchOpen) setGallerySearchTerm(''); }} className={`p-2 rounded-full transition-colors ${isGallerySearchOpen ? 'bg-slate-900 text-white' : `${theme.textSub} hover:opacity-80`}`}><Search size={18} /></button></div></div>
             {isGallerySearchOpen && (<div className="px-2 mb-3"><input autoFocus type="text" placeholder={t('search')} value={gallerySearchTerm} onChange={(e) => setGallerySearchTerm(e.target.value)} className={`w-full p-2 pl-3 ${theme.input} rounded-lg text-sm focus:outline-none focus:ring-2`}/></div>)}
             <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar pb-1"><button onClick={() => setShowGalleryCollection(!showGalleryCollection)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryCollection ? 'bg-blue-50 border-blue-200 text-blue-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('collection')}</button><button onClick={() => setShowGalleryForsale(!showGalleryForsale)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryForsale ? 'bg-amber-50 border-amber-200 text-amber-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('forsale')}</button><button onClick={() => setShowGallerySold(!showGallerySold)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGallerySold ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('sold')}</button><button onClick={() => setShowGalleryWishlist(!showGalleryWishlist)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryWishlist ? 'bg-rose-50 border-rose-200 text-rose-600' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>{t('wishlist')}</button></div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2 px-1">{displayWatches.map(w => (<div key={w.id} className={`aspect-square ${theme.bg} rounded overflow-hidden relative cursor-pointer`} onClick={() => { openWatchDetail(w); }}><img src={w.images?.[0] || w.image} className="w-full h-full object-cover" alt="Galerie" /></div>))}{displayWatches.length === 0 && (<div className={`col-span-3 text-center ${theme.textSub} py-10 text-sm`}>Aucune photo disponible.</div>)}</div>
        </div>
    );
  }

  function renderStats() {
      const getTopWatches = () => {
        const periodCounts = {};
        calendarEvents.forEach(evt => {
            const evtDate = new Date(evt.date); let inPeriod = false;
            if (statsTimeframe === 'all') inPeriod = true;
            else if (statsTimeframe === 'year') inPeriod = evtDate.getFullYear() === currentMonth.getFullYear();
            else inPeriod = evtDate.getMonth() === currentMonth.getMonth() && evtDate.getFullYear() === currentMonth.getFullYear();
            if (inPeriod && evt.watches) evt.watches.forEach(wId => { periodCounts[wId] = (periodCounts[wId] || 0) + 1; });
        });
        return Object.entries(periodCounts).sort(([,a], [,b]) => b - a).map(([wId, count]) => { const w = watches.find(watch => watch.id === wId); return w ? { ...w, count } : null; }).filter(Boolean);
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

            const firstWatchId = event?.watches?.[0];
            const firstWatch = firstWatchId ? watches.find(wa => wa.id === firstWatchId) : null;
            const watchImg = firstWatch ? (firstWatch.images?.[0] || firstWatch.image) : null;

            let bubbleBg = 'bg-transparent';
            let bubbleText = `${theme.textSub} font-medium`;
            
            if (isToday) {
                bubbleBg = 'bg-emerald-500/90 shadow-sm';
                bubbleText = 'text-white font-bold';
            } else if (watchImg) {
                bubbleBg = 'bg-black/30 backdrop-blur-sm shadow-sm';
                bubbleText = 'text-white font-medium';
            }

            days.push(
                <div key={d} onClick={() => handleCalendarDayClick(dateStr)} className={`aspect-square border rounded-lg relative overflow-hidden cursor-pointer ${theme.border} ${isToday && !watchImg ? 'border-emerald-500 bg-emerald-500/10' : theme.bg}`}>
                    {watchImg ? (<img src={watchImg} className="absolute inset-0 w-full h-full object-cover opacity-95" alt="Montre portée" />) : null}
                    <div className={`absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] z-10 ${bubbleBg} ${bubbleText}`}>{d}</div>
                    {event?.watches?.length > 1 && (<div className="absolute bottom-1 right-1 px-1.5 h-4 bg-black/60 text-white rounded-full flex items-center justify-center text-[9px] font-bold z-10 backdrop-blur-sm">+{event.watches.length - 1}</div>)}
                </div>
            );
        }
        return days;
      };

      const getTopBrands = () => { const brands = watches.filter(w => w.status === 'collection').reduce((acc, w) => { if(w.brand) acc[w.brand] = (acc[w.brand] || 0) + 1; return acc; }, {}); return Object.entries(brands).sort((a,b) => b[1] - a[1]).slice(0, 5); };
      const getTopDials = () => { const dials = watches.filter(w => w.status === 'collection').reduce((acc, w) => { if(w.dialColor) acc[w.dialColor] = (acc[w.dialColor] || 0) + 1; return acc; }, {}); return Object.entries(dials).sort((a,b) => b[1] - a[1]).slice(0, 5); };

      const topBrands = getTopBrands(); const topDials = getTopDials();
      const allTopWatches = getTopWatches(); const displayedTopWatches = isTopWornExpanded ? allTopWatches : allTopWatches.slice(0, 5);

      return (
        <div className="pb-24 px-3">
            <div className={`sticky top-0 ${theme.bgSecondary} z-10 py-3 border-b ${theme.border} mb-4 flex justify-between items-center`}><h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide px-1`}>{t('stats')}</h1></div>
            <div className="space-y-6">
                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} shadow-sm`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold text-sm ${theme.text} flex items-center gap-2`}><Calendar className="text-indigo-600" size={16} /> {t('calendar')}</h3>
                        <div className="flex gap-1 items-center">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))} className={`p-1 hover:${theme.bg} rounded ${theme.text}`}><ChevronsLeft size={16}/></button>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className={`p-1 hover:${theme.bg} rounded ${theme.text}`}><ChevronLeft size={16}/></button>
                            <span className={`text-xs font-bold capitalize w-24 text-center ${theme.text}`}>{currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className={`p-1 hover:${theme.bg} rounded ${theme.text}`}><ChevronRight size={16}/></button>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))} className={`p-1 hover:${theme.bg} rounded ${theme.text}`}><ChevronsRight size={16}/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">{renderCalendarGrid()}</div>
                </div>

                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} shadow-sm`}>
                    <div className="flex justify-between items-center mb-4"><h3 className={`font-bold text-sm ${theme.text} flex items-center gap-2`}><TrendingUp className="text-emerald-500" size={16} /> {t('top_worn')}</h3><div className={`flex ${theme.bg} rounded-lg p-0.5`}>{[{id: 'month', label: t('month')}, {id: 'year', label: t('year')}, {id: 'all', label: t('all_time')}].map(tObj => (<button key={tObj.id} onClick={() => setStatsTimeframe(tObj.id)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${statsTimeframe === tObj.id ? `${theme.bgSecondary} shadow ${theme.text}` : theme.textSub}`}>{tObj.label}</button>))}</div></div>
                    <div className="space-y-3">{displayedTopWatches.map((w, i) => (<div key={w.id} onClick={() => openWatchDetail(w)} className={`flex items-center gap-3 ${theme.bg} p-2 rounded-lg border ${theme.border} cursor-pointer`}><div className={`font-black ${theme.textSub} text-xl w-6 text-center`}>#{i+1}</div><div className={`w-10 h-10 ${theme.bgSecondary} rounded-lg overflow-hidden flex-shrink-0`}><img src={w.images?.[0] || w.image} className="w-full h-full object-cover" alt="Montre" /></div><div className="flex-1 min-w-0"><div className={`font-bold text-sm ${theme.text} truncate`}>{w.brand}</div><div className={`text-xs ${theme.textSub} truncate`}>{w.model}</div></div><div className="font-bold text-indigo-600 text-sm">{w.count}</div></div>))}</div>
                    {allTopWatches.length > 5 && (<button onClick={() => setIsTopWornExpanded(!isTopWornExpanded)} className={`w-full mt-3 py-2 text-xs font-bold rounded-lg border border-dashed transition-colors ${theme.textSub} ${theme.border} hover:bg-slate-50 dark:hover:bg-slate-800`}>{isTopWornExpanded ? t('show_less') : `${t('show_all')} (${allTopWatches.length})`}</button>)}
                </div>

                <div className={`${theme.card} p-4 rounded-xl border ${theme.border} shadow-sm`}>
                    <button onClick={() => setShowOtherStats(!showOtherStats)} className={`w-full flex justify-between items-center font-bold text-sm ${theme.text}`}>
                        <span className="flex items-center gap-2"><PieChart className="text-purple-500" size={16} /> Autres statistiques</span>
                        <ChevronDown className={`transition-transform ${showOtherStats ? 'rotate-180' : ''}`} size={16} />
                    </button>
                    {showOtherStats && (
                        <div className="mt-4 space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                            <div>
                                <h3 className={`font-bold text-xs ${theme.textSub} mb-3 uppercase tracking-wider`}>{t('fav_brands')}</h3>
                                <div className="space-y-3">{topBrands.map(([brand, count], i) => (<div key={brand} className="flex items-center justify-between"><div className="flex items-center gap-2 w-full"><span className={`text-xs font-bold w-6 text-center ${theme.textSub}`}>#{i+1}</span><div className="flex-1"><div className={`flex justify-between text-xs mb-1 ${theme.text}`}><span>{brand}</span><span className="font-bold">{count}</span></div><div className={`h-1.5 rounded-full ${theme.bg} overflow-hidden`}><div className="h-full bg-blue-500 rounded-full" style={{width: `${(count / (topBrands[0]?.[1] || 1)) * 100}%`}}></div></div></div></div></div>))}</div>
                            </div>
                            <div>
                                <h3 className={`font-bold text-xs ${theme.textSub} mb-3 uppercase tracking-wider`}>{t('fav_dials')}</h3>
                                <div className="space-y-3">{topDials.map(([color, count], i) => (<div key={color} className="flex items-center justify-between"><div className="flex items-center gap-2 w-full"><span className={`text-xs font-bold w-6 text-center ${theme.textSub}`}>#{i+1}</span><div className="flex-1"><div className={`flex justify-between text-xs mb-1 ${theme.text}`}><span>{color}</span><span className="font-bold">{count}</span></div><div className={`h-1.5 rounded-full ${theme.bg} overflow-hidden`}><div className="h-full bg-purple-500 rounded-full" style={{width: `${(count / (topDials[0]?.[1] || 1)) * 100}%`}}></div></div></div></div></div>))}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Calendar Modal */}
            {selectedCalendarDate && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className={`${theme.card} rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]`}>
                        <div className={`p-4 border-b ${theme.border} ${theme.bgSecondary}`}>
                            <div className="flex justify-between items-center mb-3"><h3 className={`font-bold ${theme.text}`}>Porté le {new Date(selectedCalendarDate).toLocaleDateString()}</h3><button onClick={() => setSelectedCalendarDate(null)}><X size={20} className={theme.textSub}/></button></div>
                            <input autoFocus type="text" placeholder={t('search')} className={`w-full p-2 ${theme.input} rounded-lg text-sm`} value={calendarSearchTerm} onChange={(e) => setCalendarSearchTerm(e.target.value)}/>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {watches.filter(w => w.status === 'collection')
                             .filter(w => !calendarSearchTerm || `${w.brand || ''} ${w.model || ''}`.toLowerCase().includes(calendarSearchTerm.toLowerCase()))
                             .sort((a, b) => {
                                 const aSel = selectedCalendarWatches.includes(a.id);
                                 const bSel = selectedCalendarWatches.includes(b.id);
                                 if (aSel && !bSel) return -1;
                                 if (!aSel && bSel) return 1;
                                 return (a.brand || '').localeCompare(b.brand || '');
                             })
                             .map(w => {
                                const isSelected = selectedCalendarWatches.includes(w.id);
                                return (
                                <div key={w.id} onClick={() => setSelectedCalendarWatches(prev => isSelected ? prev.filter(id => id !== w.id) : [...prev, w.id])} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : `${theme.border} hover:${theme.bg}`}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : `${theme.bgSecondary} ${theme.border}`}`}>{isSelected && <Check size={12} className="text-white" />}</div>
                                    <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-200 shrink-0">
                                        {w.images?.[0] || w.image ? <img src={w.images?.[0] || w.image} className="w-full h-full object-cover" alt="Miniature" /> : <Watch size={20} className="m-auto mt-2.5 text-slate-400"/>}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className={`font-bold text-sm ${theme.text} truncate`}>{w.brand}</div>
                                        <div className={`text-xs ${theme.textSub} truncate`}>{w.model}</div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        <div className={`p-4 border-t ${theme.border} ${theme.bgSecondary}`}><button onClick={handleCalendarSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">{t('save')}</button></div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  function renderFinance() {
    const sCol = { buy: watches.filter(w=>w.status==='collection').reduce((a,w)=>a+(w.purchasePrice||0),0), val: watches.filter(w=>w.status==='collection').reduce((a,w)=>a+(w.sellingPrice||w.purchasePrice||0),0), profit: 0 }; sCol.profit = sCol.val - sCol.buy;
    const sSale = { buy: watches.filter(w=>w.status==='forsale').reduce((a,w)=>a+(w.purchasePrice||0),0), val: watches.filter(w=>w.status==='forsale').reduce((a,w)=>a+(w.sellingPrice||w.purchasePrice||0),0), profit: 0 }; sSale.profit = sSale.val - sSale.buy;
    const sSold = { buy: watches.filter(w=>w.status==='sold').reduce((a,w)=>a+(w.purchasePrice||0),0), val: watches.filter(w=>w.status==='sold').reduce((a,w)=>a+(w.sellingPrice||w.purchasePrice||0),0), profit: 0 }; sSold.profit = sSold.val - sSold.buy;
    const sTotal = { buy: sCol.buy+sSale.buy+sSold.buy, val: sCol.val+sSale.val+sSold.val, profit: sCol.profit+sSale.profit+sSold.profit };
    const timelineMap = watches.reduce((acc, w) => { if (w.purchaseDate && w.purchasePrice) { const d = new Date(w.purchaseDate); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if (!acc[key]) acc[key] = { date: key, year: d.getFullYear(), month: d.getMonth()+1, spent: 0, gained: 0, count: 0, boughtWatches: [], soldWatches: [] }; acc[key].spent += Number(w.purchasePrice); acc[key].count += 1; acc[key].boughtWatches.push(w); } if (w.status === 'sold' && w.soldDate && w.sellingPrice) { const d = new Date(w.soldDate); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if (!acc[key]) acc[key] = { date: key, year: d.getFullYear(), month: d.getMonth()+1, spent: 0, gained: 0, count: 0, boughtWatches: [], soldWatches: [] }; acc[key].gained += Number(w.sellingPrice); acc[key].soldWatches.push(w); } return acc; }, {});
    const sortedTimeline = Object.values(timelineMap).sort((a,b) => b.date.localeCompare(a.date));
    const timelineByYear = sortedTimeline.reduce((acc, curr) => { if (!acc[curr.year]) acc[curr.year] = { year: curr.year, months: [], spent: 0, gained: 0 }; acc[curr.year].months.push(curr); acc[curr.year].spent += curr.spent; acc[curr.year].gained += curr.gained; return acc; }, {});
    const sortedYears = Object.values(timelineByYear).sort((a,b) => b.year - a.year);
    const formatMonthName = (dateStr) => { const [y, m] = dateStr.split('-'); const d = new Date(y, parseInt(m)-1, 1); return d.toLocaleString(settings.lang, { month: 'long' }); };
    const now = new Date(); const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth()+1).padStart(2,'0')}`;

    const getMostSoldBrands = () => {
        const soldWatches = watches.filter(w => w.status === 'sold');
        const brandStats = {};
        soldWatches.forEach(w => {
            const brand = w.brand || 'Inconnu';
            if (!brandStats[brand]) brandStats[brand] = { count: 0, profit: 0, loss: 0 };
            brandStats[brand].count += 1;
            const p = (Number(w.sellingPrice) || 0) - (Number(w.purchasePrice) || 0);
            if (p >= 0) brandStats[brand].profit += p;
            else brandStats[brand].loss += Math.abs(p);
        });
        return Object.entries(brandStats)
                     .map(([brand, stats]) => ({ brand, ...stats, total: stats.profit - stats.loss }))
                     .sort((a, b) => b.count - a.count);
    };
    const mostSoldBrands = getMostSoldBrands();

    return (
      <div className="pb-24 px-3 space-y-2">
        <div className={`sticky top-0 ${theme.bgSecondary} z-10 py-2 border-b ${theme.border} mb-2`}><h1 className={`text-xl font-serif font-bold ${theme.text} tracking-wide px-1`}>{t('finance')}</h1></div>
        {financeDetail === 'collection' && <FinanceDetailList title={t('collection')} items={watches.filter(w=>w.status==='collection')} onClose={() => setFinanceDetail(null)} onSelectWatch={(w) => openWatchDetail(w)} theme={theme} />}{financeDetail === 'forsale' && <FinanceDetailList title={t('forsale')} items={watches.filter(w=>w.status==='forsale')} onClose={() => setFinanceDetail(null)} onSelectWatch={(w) => openWatchDetail(w)} theme={theme} />}{financeDetail === 'sold' && <FinanceDetailList title={t('sold')} items={watches.filter(w=>w.status==='sold')} onClose={() => setFinanceDetail(null)} onSelectWatch={(w) => openWatchDetail(w)} theme={theme} />}
        <FinanceCardFull title={t('collection')} icon={Watch} stats={sCol} type="collection" bgColor="bg-emerald-500" onClick={() => setFinanceDetail('collection')} theme={theme} />
        <FinanceCardFull title={t('forsale')} icon={TrendingUp} stats={sSale} type="forsale" bgColor="bg-amber-500" onClick={() => setFinanceDetail('forsale')} theme={theme} />
        <FinanceCardFull title={t('sold')} icon={Euro} stats={sSold} type="sold" bgColor="bg-blue-600" onClick={() => setFinanceDetail('sold')} theme={theme} />
        <div className="mt-4 pt-2"><FinanceCardFull title={t('total_value')} icon={Activity} stats={sTotal} type="total" bgColor="bg-white" onClick={() => {}} theme={theme} /></div>
        
        <div className="mt-6">
            <h3 className={`font-bold text-sm ${theme.text} uppercase tracking-wider flex items-center gap-2 mb-3`}><Activity size={16}/> Marques les plus vendues</h3>
            <div className={`${theme.card} border ${theme.border} rounded-xl overflow-hidden shadow-sm`}>
                <table className="w-full text-left text-xs">
                    <thead className={`bg-slate-50 dark:bg-slate-800/50 border-b ${theme.border}`}>
                        <tr>
                            <th className={`p-3 font-bold ${theme.textSub}`}>Marque</th>
                            <th className={`p-3 font-bold text-center ${theme.textSub}`}>Modèles</th>
                            <th className={`p-3 font-bold text-right ${theme.textSub}`}>Bilan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mostSoldBrands.map(b => (
                            <tr key={b.brand} className={`border-b ${theme.border} last:border-0`}>
                                <td className={`p-3 font-bold ${theme.text}`}>{b.brand}</td>
                                <td className={`p-3 text-center ${theme.text}`}>{b.count}</td>
                                <td className={`p-3 text-right font-bold ${b.total >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{b.total >= 0 ? '+' : '-'}{formatPrice(Math.abs(b.total))}</td>
                            </tr>
                        ))}
                        {mostSoldBrands.length === 0 && <tr><td colSpan="3" className={`p-4 text-center ${theme.textSub}`}>Aucune vente.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="mt-6">
            <div className="flex justify-between items-center mb-3"><h3 className={`font-bold text-sm ${theme.text} uppercase tracking-wider flex items-center gap-2`}><Briefcase size={16}/> {t('finance_timeline')}</h3><button onClick={() => setTimelineFilter(prev => prev === 'default' ? 'all' : 'default')} className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${timelineFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : `${theme.bgSecondary} ${theme.text} ${theme.border}`}`}>{timelineFilter === 'default' ? t('show_history') : t('show_less')}</button></div>
            {sortedYears.map(yearData => {
                if (timelineFilter === 'default' && yearData.year !== now.getFullYear()) return null;
                const monthsToDisplay = timelineFilter === 'default' ? yearData.months.filter(m => m.date === currentMonthKey || m.date === prevMonthKey) : yearData.months;
                if (timelineFilter === 'default' && monthsToDisplay.length === 0) { return <div key={yearData.year} className={`text-center text-xs ${theme.textSub} py-4 italic`}>Aucune activité récente.</div>; }
                return (
                    <div key={yearData.year} className="mb-6">
                        <div className={`mb-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-800`}><div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase mb-2 text-center">{t('year_summary')} {yearData.year}</div><div className="flex justify-between text-sm"><div className="text-red-500 font-bold">- {formatPrice(yearData.spent)}</div><div className="font-mono font-bold text-slate-400">= {formatPrice(yearData.gained - yearData.spent)}</div><div className="text-emerald-600 font-bold">+ {formatPrice(yearData.gained)}</div></div></div>
                        <div className="space-y-3">
                            {monthsToDisplay.map((tItem) => (
                                <div key={tItem.date} className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden mb-3`}>
                                    <div onClick={() => setExpandedMonth(expandedMonth === tItem.date ? null : tItem.date)} className={`p-3 flex items-center justify-between cursor-pointer hover:${theme.bgSecondary} transition-colors`}><div className="flex items-center gap-3"><div className={`px-2 py-1 rounded-lg ${theme.bgSecondary} text-xs font-bold ${theme.textSub} capitalize w-16 text-center border ${theme.border}`}>{formatMonthName(tItem.date)}</div><div className="flex flex-col"><span className={`text-xs ${theme.textSub}`}>{tItem.count} {t('pieces')}</span><span className={`font-bold text-sm ${tItem.gained - tItem.spent > 0 ? 'text-emerald-500' : (tItem.gained - tItem.spent < 0 ? 'text-red-500' : 'text-slate-500')}`}>{formatPrice(tItem.gained - tItem.spent)}</span></div></div><div className="text-right text-xs flex items-center gap-2"><div>{tItem.spent > 0 && <div className="text-red-500 font-medium">- {formatPrice(tItem.spent)}</div>}{tItem.gained > 0 && <div className="text-emerald-500 font-medium">+ {formatPrice(tItem.gained)}</div>}</div><ChevronLeft size={16} className={`text-slate-400 transition-transform ${expandedMonth === tItem.date ? '-rotate-90' : 'rotate-180'}`} /></div></div>
                                    {expandedMonth === tItem.date && (
                                        <div className={`border-t ${theme.border} bg-slate-50/50 dark:bg-slate-900/50 p-3 space-y-3`}>
                                            {tItem.boughtWatches.length > 0 && (<div><div className="text-[10px] font-bold uppercase text-red-500 mb-2">{t('purchases')}</div><div className="space-y-2">{tItem.boughtWatches.map((w) => (<div key={`buy-${w.id}`} onClick={() => openWatchDetail(w)} className={`flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-800 border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}><div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 shrink-0">{w.images?.[0] || w.image ? <img src={w.images?.[0] || w.image} className="w-full h-full object-cover" alt="Montre" /> : <Watch size={16} className="m-auto mt-2 text-slate-400"/>}</div><div className="flex-1 min-w-0"><div className={`font-bold text-xs ${theme.text} truncate`}>{w.brand}</div><div className={`text-[10px] ${theme.textSub} truncate`}>{w.model}</div></div><div className="text-xs font-bold text-red-500">- {formatPrice(w.purchasePrice)}</div></div>))}</div></div>)}
                                            {tItem.soldWatches.length > 0 && (<div><div className="text-[10px] font-bold uppercase text-emerald-500 mb-2">{t('sales')}</div><div className="space-y-2">{tItem.soldWatches.map((w) => (<div key={`sell-${w.id}`} onClick={() => openWatchDetail(w)} className={`flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-800 border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}><div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 shrink-0">{w.images?.[0] || w.image ? <img src={w.images?.[0] || w.image} className="w-full h-full object-cover" alt="Montre" /> : <Watch size={16} className="m-auto mt-2 text-slate-400"/>}</div><div className="flex-1 min-w-0"><div className={`font-bold text-xs ${theme.text} truncate`}>{w.brand}</div><div className={`text-[10px] ${theme.textSub} truncate`}>{w.model}</div></div><div className="text-xs font-bold text-emerald-500">+ {formatPrice(w.sellingPrice)}</div></div>))}</div></div>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  const renderFriends = () => {
      const displayFriendWatches = friendWatches.filter(w => w.status === friendFilter);

      return (
          <div className="pb-24 px-4">
              {renderHeader(t('friends'))}
              <div className="space-y-4 mt-4">
                  {!viewingFriend && (
                      <>
                          <div className={`p-4 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800`}>
                              <h3 className={`font-bold text-sm mb-2 text-indigo-900 dark:text-indigo-300 flex items-center gap-2`}><Share2 size={16} /> Mon Code Ami</h3>
                              <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 mb-3">Partagez ce code pour que vos amis puissent vous ajouter.</p>
                              <div className="flex gap-2">
                                  <code className="flex-1 p-2 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg text-xs font-bold text-center border border-indigo-200 dark:border-indigo-800 font-mono overflow-hidden text-ellipsis">{user?.uid || 'Non connecté'}</code>
                                  <button onClick={() => { navigator.clipboard.writeText(user?.uid || ''); alert('Code copié !'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors"><ClipboardList size={14}/> Copier</button>
                              </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
                              <h3 className={`font-bold text-sm mb-2 ${theme.text}`}>Ajouter un ami</h3>
                              <div className="flex gap-2">
                                  <input value={addFriendId} onChange={e => setAddFriendId(e.target.value)} placeholder="Code secret de l'ami" className={`flex-1 p-2 rounded-lg ${theme.input}`} />
                                  <button onClick={sendFriendRequest} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Ajouter</button>
                              </div>
                          </div>
                          
                          {friendRequests.length > 0 && (
                              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgSecondary}`}>
                                  <h3 className={`font-bold text-sm mb-2 text-rose-500`}>{t('requests')}</h3>
                                  {friendRequests.map(req => (
                                      <div key={req.id} className={`flex justify-between items-center p-2 border-b ${theme.border} last:border-0`}>
                                          <span className={`text-sm ${theme.text}`}>{req.fromEmail}</span>
                                          <div className="flex gap-2">
                                              <button onClick={() => acceptRequest(req)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded"><Check size={16}/></button>
                                              <button onClick={() => rejectRequest(req.id)} className="p-1.5 bg-rose-100 text-rose-600 rounded"><X size={16}/></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                          
                          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgSecondary}`}>
                              <h3 className={`font-bold text-sm mb-2 ${theme.text}`}>{t('friends')}</h3>
                              {friends.length === 0 && <p className={`text-xs ${theme.textSub}`}>Aucun ami pour le moment.</p>}
                              {friends.map(f => (
                                  <div key={f.id} className={`flex justify-between items-center p-3 border rounded-lg mb-2 cursor-pointer hover:border-indigo-300 ${theme.border} ${theme.bg}`} onClick={() => loadFriendCollection(f)}>
                                      <span className={`font-medium ${theme.text}`}>{f.name}</span>
                                      <button onClick={(e) => { e.stopPropagation(); removeFriend(f.id); }} className="text-red-500 p-1"><Trash2 size={16}/></button>
                                  </div>
                              ))}
                          </div>

                          <button onClick={handlePreviewOwnProfile} className={`w-full py-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text} font-bold text-sm`}>
                              Voir mon profil public (Test)
                          </button>
                      </>
                  )}
                  
                  {isFriendsLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500" /></div>}
                  
                  {viewingFriend && !isFriendsLoading && (
                      <div className="mt-2 animate-in slide-in-from-bottom-4">
                          {selectedFriendWatch ? (
                              <div className="space-y-6">
                                  <div className="flex items-center gap-3 mb-2">
                                      <button onClick={() => setSelectedFriendWatch(null)} className={`p-2 rounded-full ${theme.bgSecondary} border ${theme.border} shadow-sm`}><ChevronLeft size={20}/></button>
                                      <h3 className={`font-bold text-lg ${theme.text}`}>Retour</h3>
                                  </div>
                                  
                                  <div className={`aspect-square ${theme.bg} rounded-2xl overflow-hidden shadow-sm border ${theme.border} relative`}>
                                      {selectedFriendWatch.images?.[0] || selectedFriendWatch.image ? (
                                          <img src={selectedFriendWatch.images?.[0] || selectedFriendWatch.image} className="w-full h-full object-cover" alt="Montre"/>
                                      ) : (
                                          <Watch size={48} className="m-auto mt-24 text-slate-400"/>
                                      )}
                                  </div>
                                  
                                  <div>
                                      <h1 className={`text-3xl font-serif font-bold ${theme.text} leading-tight`}>{selectedFriendWatch.brand}</h1>
                                      <p className={`text-xl ${theme.textSub} font-medium font-serif`}>{selectedFriendWatch.model}</p>
                                      {selectedFriendWatch.reference && <span className={`text-xs ${theme.bg} px-2 py-1 rounded mt-2 inline-block border ${theme.border} font-mono ${theme.textSub}`}>REF: {selectedFriendWatch.reference}</span>}
                                  </div>

                                  {selectedFriendWatch.status === 'forsale' && selectedFriendWatch.sellingPrice && (
                                      <div className={`p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 flex items-center justify-between`}>
                                          <div className="text-amber-800 dark:text-amber-400 font-bold uppercase text-xs">Prix demandé</div>
                                          <div className="text-2xl font-bold text-amber-600">{formatPrice(selectedFriendWatch.sellingPrice)}</div>
                                      </div>
                                  )}

                                  <div>
                                      <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('specs')}</h3>
                                      <div className="grid grid-cols-2 gap-3">
                                          <DetailItem icon={Ruler} label={t('diameter')} value={selectedFriendWatch.diameter ? selectedFriendWatch.diameter + ' mm' : ''} theme={theme} />
                                          <DetailItem icon={Layers} label={t('thickness')} value={selectedFriendWatch.thickness ? selectedFriendWatch.thickness + ' mm' : ''} theme={theme} />
                                          <DetailItem icon={Activity} label={t('lug_width')} value={selectedFriendWatch.strapWidth ? selectedFriendWatch.strapWidth + ' mm' : ''} theme={theme} />
                                          <DetailItem icon={Droplets} label={t('water_res')} value={selectedFriendWatch.waterResistance ? selectedFriendWatch.waterResistance + ' ATM' : ''} theme={theme} />
                                      </div>
                                  </div>

                                  <div>
                                      <h3 className={`text-xs font-bold uppercase ${theme.textSub} mb-3 tracking-wider`}>{t('movement')} & {t('dial')}</h3>
                                      <div className="grid grid-cols-2 gap-3">
                                          <DetailItem icon={MovementIcon} label={t('movement')} value={selectedFriendWatch.movement} theme={theme} />
                                          <DetailItem icon={Settings} label={t('movement_model')} value={selectedFriendWatch.movementModel} theme={theme} />
                                          <DetailItem icon={Palette} label={t('dial')} value={selectedFriendWatch.dialColor} theme={theme} />
                                          <DetailItem icon={Search} label={t('glass')} value={selectedFriendWatch.glass} theme={theme} />
                                      </div>
                                  </div>

                                  {(selectedFriendWatch.historyBrand || selectedFriendWatch.historyModel) && (
                                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                          <h3 className={`text-xs font-bold uppercase ${theme.textSub} tracking-wider`}>{t('history')}</h3>
                                          {selectedFriendWatch.historyBrand && (<div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-sm text-slate-800 dark:text-slate-200 border border-indigo-100 dark:border-indigo-800"><div className="flex items-center font-bold text-indigo-800 dark:text-indigo-400 mb-2 text-xs uppercase"><BookOpen size={12} className="mr-1"/> {t('history_brand')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{selectedFriendWatch.historyBrand}</div></div>)}
                                          {selectedFriendWatch.historyModel && (<div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-sm text-slate-800 dark:text-slate-200 border border-indigo-100 dark:border-indigo-800"><div className="flex items-center font-bold text-indigo-800 dark:text-indigo-400 mb-2 text-xs uppercase"><BookOpen size={12} className="mr-1"/> {t('history_model')}</div><div className="whitespace-pre-wrap text-justify leading-relaxed">{selectedFriendWatch.historyModel}</div></div>)}
                                      </div>
                                  )}
                              </div>
                          ) : (
                              <>
                                  <div className="flex justify-between items-center mb-4">
                                      <h3 className={`font-bold text-lg ${theme.text}`}>Profil de {viewingFriend.name}</h3>
                                      <button onClick={() => setViewingFriend(null)} className={`text-xs ${theme.textSub} underline`}>Fermer</button>
                                  </div>

                                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
                                      {['collection', 'forsale', 'sold', 'wishlist'].map(f => {
                                          const count = friendWatches.filter(w => w.status === f).length;
                                          return (
                                              <button key={f} onClick={() => setFriendFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors flex-shrink-0 whitespace-nowrap ${friendFilter === f ? 'bg-slate-800 text-white border-slate-800' : `${theme.bg} ${theme.border} ${theme.textSub}`}`}>
                                                  {t(f)} ({count})
                                              </button>
                                          )
                                      })}
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                      {displayFriendWatches.length === 0 ? (
                                          <div className={`col-span-2 text-center text-sm py-8 ${theme.textSub}`}>Aucune montre dans cette catégorie.</div>
                                      ) : (
                                          displayFriendWatches.map(w => (
                                              <div key={w.id} onClick={() => setSelectedFriendWatch(w)} className={`${theme.card} rounded-xl overflow-hidden border ${theme.border} p-2 shadow-sm cursor-pointer hover:border-indigo-400 transition-colors ${w.status === 'sold' ? 'opacity-70' : ''}`}>
                                                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden mb-2 relative">
                                                      {w.images?.[0] || w.image ? <img src={w.images?.[0] || w.image} alt="Montre" className="w-full h-full object-cover"/> : <Watch size={24} className="m-auto mt-8 text-slate-400"/>}
                                                      {w.status === 'forsale' && (
                                                          <div className="absolute top-1 right-1 bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                                                              {formatPrice(w.sellingPrice || w.purchasePrice)}
                                                          </div>
                                                      )}
                                                      {w.status === 'sold' && (
                                                          <div className="absolute top-1 right-1 bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                                                              VENDUE
                                                          </div>
                                                      )}
                                                  </div>
                                                  <div className="font-bold text-sm truncate text-black dark:text-white">{w.brand}</div>
                                                  <div className="text-xs truncate text-slate-800 dark:text-slate-300">{w.model}</div>
                                              </div>
                                          ))
                                      )}
                                  </div>
                              </>
                          )}
                      </div>
                  )}
              </div>
          </div>
      );
  };

  function renderSummary() {
      return (
          <div className="pb-24 px-4">
              {renderHeader(t('inventory'))}
              <div className={`mt-6 p-6 rounded-2xl border ${theme.border} ${theme.bgSecondary} text-center space-y-4`}>
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><Download size={32} /></div>
                  <h2 className={`text-xl font-bold ${theme.text}`}>Exporter les données</h2>
                  <p className={`text-sm ${theme.textSub}`}>Téléchargez l'intégralité de votre collection au format CSV pour l'ouvrir dans Excel ou Google Sheets.</p>
                  <button onClick={exportCSV} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"><FileText size={18} /> {t('export_csv')}</button>
              </div>
          </div>
      );
  }

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
        {exportType && selectedWatch && <ExportView watch={selectedWatch} type={exportType} onClose={() => setExportType(null)} theme={theme} t={t} />}
        {fullScreenImage && <FullScreenImageViewer src={fullScreenImage} onClose={() => setFullScreenImage(null)} />}
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
