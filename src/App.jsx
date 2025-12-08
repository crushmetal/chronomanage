import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Watch, Plus, TrendingUp, Trash2, Edit2, Camera, X,
  Search, AlertCircle,
  Package, DollarSign, FileText, Box, Loader2,
  ChevronLeft, ClipboardList, WifiOff, Ruler, Calendar, LogIn, LogOut, User, AlertTriangle, MapPin, Droplets, ShieldCheck, Layers, Wrench, Activity, Heart, Download, ExternalLink, Settings, Grid, ArrowUpDown, Shuffle, Save, Copy, Palette, RefreshCw, Users, UserPlus, Share2, Filter, Eye, EyeOff, Bell, Check, Zap, Gem, Image as ImageIcon, ZoomIn, Battery, ShoppingCart
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, getDocs, where, addDoc, updateDoc } from 'firebase/firestore';

// ==========================================================================
// CONFIGURATION INITIALE
// ==========================================================================
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
const LOCAL_CONFIG_KEY = 'chrono_firebase_config'; 
const APP_ID_STABLE = typeof __app_id !== 'undefined' ? __app_id : 'chrono-manager-universal'; 
const APP_VERSION = "v42.3"; // Ajout gestion Piles

const DEFAULT_WATCH_STATE = {
    brand: '', model: '', reference: '', 
    diameter: '', year: '', movement: '',
    country: '', waterResistance: '', glass: '', strapWidth: '', thickness: '', 
    dialColor: '', 
    batteryModel: '', // NOUVEAU CHAMP
    isLimitedEdition: false, limitedNumber: '', limitedTotal: '',
    publicVisible: true, 
    box: '', warrantyDate: '', revision: '',
    purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', link: '', 
    image: null, 
    images: []   
};

const DEFAULT_BRACELET_STATE = {
    width: '', type: 'Standard', material: '', color: '', quickRelease: false, image: null, notes: ''
};

// Fonction pour tenter d'initialiser Firebase avec une config donnée
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
        console.log("Firebase initialized successfully");
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
        if (savedConfig) {
            tryInitFirebase(JSON.parse(savedConfig));
        }
    } catch(e) {}
}

// --- UTILS ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>{children}</div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center">
        <div className="bg-white p-2 rounded-full border border-slate-100 mr-3 text-slate-400 flex-shrink-0">
            {Icon && <Icon size={16} />}
        </div>
        <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">{label}</span>
            <span className="font-serif text-sm text-slate-800 truncate block">{value || '-'}</span>
        </div>
    </div>
);

const formatPrice = (price) => {
  if (!price) return '0 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
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
const WatchBoxLogo = ({ isOpen }) => (
  <div style={{ perspective: '1000px', width: '220px', height: '180px' }}>
    <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5D4037" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>
        <linearGradient id="interior" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f0" />
          <stop offset="100%" stopColor="#e0e0d1" />
        </linearGradient>
        <linearGradient id="cushionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor="#fdfbf7" />
           <stop offset="100%" stopColor="#dcd5cc" />
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
      
      {/* --- BAS DE LA BOITE (Fixe) --- */}
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

      {/* --- COUVERCLE (Mobile) --- */}
      <g 
        className="transition-all duration-1000 ease-in-out"
        style={{ 
          transformOrigin: '100px 60px', 
          transform: isOpen ? 'rotateX(-110deg)' : 'rotateX(0deg)' 
        }}
      >
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

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="font-serif text-3xl font-light text-slate-500 tracking-widest mb-2 opacity-80">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

// --- BACKGROUND GRAPHIQUE ---
const GraphicBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.5 }}></div>
      <svg className="absolute -right-20 -top-20 text-slate-200 w-96 h-96 opacity-40" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
);

// --- COMPOSANTS EXTERNALISÉS (FINANCE) ---

const FinanceDetailList = ({ title, items, onClose }) => {
    const [localSort, setLocalSort] = useState('date'); 

    const sortedItems = useMemo(() => {
        let sorted = [...items];
        if (localSort === 'alpha') {
            sorted.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
        } else {
            sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        }
        return sorted;
    }, [items, localSort]);

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom-10">
          <div className="p-4 border-b flex items-center justify-between bg-slate-50">
            <h2 className="font-serif font-bold text-lg text-slate-800 tracking-wide">{title}</h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => setLocalSort(localSort === 'date' ? 'alpha' : 'date')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                    <ArrowUpDown size={14} />
                    {localSort === 'date' ? 'Date' : 'A-Z'}
                </button>
                <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm border border-slate-200"><X size={20}/></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {sortedItems.map(w => {
               const thumb = w.images && w.images.length > 0 ? w.images[0] : w.image;
               const profit = (w.sellingPrice || 0) - (w.purchasePrice || 0);
               return (
                 <div key={w.id} className="flex items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                     <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0 mr-3 border border-slate-200">{thumb && <img src={thumb} className="w-full h-full object-cover"/>}</div>
                     <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate text-slate-800">{w.brand} {w.model}</div>
                        <div className="text-xs text-slate-500">Achat: {formatPrice(w.purchasePrice)}</div>
                     </div>
                     <div className="text-right">
                        <div className="font-bold text-sm text-slate-800">{formatPrice(w.sellingPrice || w.purchasePrice)}</div>
                        <div className={`text-xs font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{profit > 0 ? '+' : ''}{formatPrice(profit)}</div>
                     </div>
                 </div>
               )
             })}
             {sortedItems.length === 0 && <div className="text-center text-slate-400 py-10 text-sm">Aucune montre dans cette catégorie.</div>}
          </div>
        </div>
    );
};

const FinanceCardFull = ({ title, icon: Icon, stats, type, onClick, bgColor }) => {
    const isWhite = type === 'total';
    const txtMain = isWhite ? 'text-slate-800' : 'text-white';
    const txtSub = isWhite ? 'text-slate-400' : 'text-white/70';
    const borderClass = isWhite ? 'border border-slate-200' : 'border border-transparent';
    const bgIcon = isWhite ? 'bg-slate-100 text-slate-600' : 'bg-white/20 text-white';

    return (
        <div onClick={onClick} className={`${bgColor} ${borderClass} p-4 rounded-xl shadow-md mb-3 cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] overflow-hidden relative`}>
            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgIcon}`}>
                        <Icon size={18} />
                    </div>
                    <span className={`font-serif font-bold text-lg tracking-wide ${txtMain}`}>{title}</span>
                </div>
                {type !== 'total' && <div className={`bg-white/20 p-1 rounded-full ${txtMain}`}><ChevronLeft className="rotate-180" size={16}/></div>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                <div>
                    <div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>Achat</div>
                    <div className={`font-bold text-base ${txtMain}`}>{formatPrice(stats.buy)}</div>
                </div>
                <div>
                    <div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>{type === 'sold' ? 'Vendu' : 'Estim.'}</div>
                    <div className={`font-bold text-base ${txtMain}`}>{formatPrice(stats.val)}</div>
                </div>
                <div>
                    <div className={`text-[10px] uppercase tracking-wider font-semibold ${txtSub}`}>Bénéfice</div>
                    <div className={`font-bold text-base ${isWhite ? (stats.profit >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-white'}`}>
                        {stats.profit > 0 ? '+' : ''}{formatPrice(stats.profit)}
                    </div>
                </div>
            </div>
            {!isWhite && <Icon size={120} className="absolute -bottom-4 -right-4 opacity-10 text-white transform rotate-12 pointer-events-none" />}
        </div>
    );
};

// --- COMPOSANTS MODALES AIDE / CONFIG ---

const RulesHelpModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="text-emerald-600"/> Permissions Cloud</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="text-sm text-slate-600">
                        <p className="mb-2">Le système de partage requiert des permissions spécifiques pour que vos amis puissent voir votre collection.</p>
                        <p className="text-xs text-slate-500">Assurez-vous que l'application utilise bien le bon App ID pour la base de données.</p>
                    </div>
                    <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">J'ai compris</button>
                </div>
            </div>
        </div>
    );
};

const ConfigModal = ({ onClose, currentError }) => {
    const [jsonConfig, setJsonConfig] = useState('');
    const [parseError, setParseError] = useState(null);

    const handleSave = () => {
        try {
            let cleanJson = jsonConfig;
            if (cleanJson.includes('=')) {
                cleanJson = cleanJson.substring(cleanJson.indexOf('=') + 1);
            }
            if (cleanJson.trim().endsWith(';')) {
                cleanJson = cleanJson.trim().slice(0, -1);
            }
            const parsed = new Function('return ' + cleanJson)();
            if (!parsed.apiKey) throw new Error("apiKey manquante");

            localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(parsed));
            alert("Configuration sauvegardée ! L'application va redémarrer.");
            window.location.reload();
        } catch (e) {
            setParseError("Format invalide. Collez l'objet { ... } complet.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings size={18}/> Configuration Cloud</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="p-6 space-y-4">
                    {currentError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-4 border border-red-100">
                            <strong>Erreur de connexion détectée :</strong><br/>
                            {String(currentError)}
                            <div className="mt-2 text-[10px] text-red-500">Vérifiez vos clés ou les restrictions de domaine dans la console Firebase.</div>
                        </div>
                    )}
                    <p className="text-sm text-slate-600">
                        Si les clés intégrées ne fonctionnent pas, vous pouvez forcer une nouvelle configuration ici.
                    </p>
                    <textarea 
                        className="w-full h-40 p-3 border rounded-lg font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={`{ apiKey: "...", ... }`}
                        value={jsonConfig}
                        onChange={(e) => setJsonConfig(e.target.value)}
                    />
                    {parseError && <div className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">{parseError}</div>}
                    <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Save size={18}/> Sauvegarder & Redémarrer
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- APPLICATION ---

export default function App() {
  const [useLocalStorage, setUseLocalStorage] = useState(!firebaseReady);
  const [user, setUser] = useState(useLocalStorage ? { uid: 'local-user' } : null);
  
  const [watches, setWatches] = useState([]);
  const [bracelets, setBracelets] = useState([]);
  
  // ÉTAT AMIS
  const [friends, setFriends] = useState([]); 
  const [friendRequests, setFriendRequests] = useState([]); 
  const [viewingFriend, setViewingFriend] = useState(null); 
  const [friendWatches, setFriendWatches] = useState([]); 
  const [addFriendId, setAddFriendId] = useState(''); 
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  
  // GALERIE FILTRES
  const [showGalleryCollection, setShowGalleryCollection] = useState(true);
  const [showGalleryForsale, setShowGalleryForsale] = useState(true);
  const [showGallerySold, setShowGallerySold] = useState(false);
  const [showGalleryWishlist, setShowGalleryWishlist] = useState(false);

  // NOUVEAU ETAT LIGHTBOX (PLEIN ECRAN)
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
  const [sortOrder, setSortOrder] = useState('date');
  const [error, setError] = useState(null); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBoxOpening, setIsBoxOpening] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false); 
  const [authDomainError, setAuthDomainError] = useState(null); 
  const [showRulesHelp, setShowRulesHelp] = useState(false); 
  
  const [isAuthLoading, setIsAuthLoading] = useState(false); 

  const [watchForm, setWatchForm] = useState(DEFAULT_WATCH_STATE);
  const [braceletForm, setBraceletForm] = useState(DEFAULT_BRACELET_STATE);

  // SCROLL REF
  const scrollRef = useRef(null);

  // --- AUTO SCROLL TOP ON VIEW CHANGE ---
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
    }
  }, [view, viewingFriend, financeDetail]);

  // --- RE-TENTATIVE INIT AU MONTAGE ---
  useEffect(() => {
      if (!firebaseReady && productionConfig.apiKey) {
          tryInitFirebase(productionConfig);
          if (firebaseReady) {
              setUseLocalStorage(false);
              setLoading(true);
          }
      }
  }, []);

  // --- CHARGEMENT DES AMIS ---
  useEffect(() => {
     if (useLocalStorage || !user?.uid) return;
     const savedFriends = localStorage.getItem(`friends_${user.uid}`);
     if (savedFriends) {
         setFriends(JSON.parse(savedFriends));
     }

     if (firebaseReady && !useLocalStorage) {
         if (user.isAnonymous) {
             console.log("Mode anonyme: écoute demandes amis désactivée");
             return;
         }

         try {
             const requestsRef = collection(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests');
             const q = query(requestsRef, where('toUser', '==', user.uid));

             const unsubRequests = onSnapshot(q, (snap) => {
                 const reqs = snap.docs.map(d => ({id: d.id, ...d.data()}));
                 setFriendRequests(reqs);
             }, (err) => {
                 if (err.code === 'permission-denied') {
                     console.warn("Accès aux demandes d'amis refusé.");
                 } else {
                     console.error("Erreur écoute demandes:", err);
                 }
             }); 
             return () => unsubRequests();
         } catch (e) {
             console.error("Erreur init listener requests", e);
         }
     }
  }, [user, useLocalStorage]);

  // --- LOGIQUE AMIS ---

  const sendFriendRequest = async () => {
      if (!addFriendId || addFriendId.length < 5) return alert("Code invalide");
      if (addFriendId === user.uid) return alert("Vous ne pouvez pas vous ajouter vous-même");
      if (friends.some(f => f.id === addFriendId)) return alert("Déjà dans vos amis");

      try {
          await addDoc(collection(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests'), {
              fromUser: user.uid,
              fromEmail: user.email,
              toUser: addFriendId,
              status: 'pending',
              createdAt: new Date().toISOString()
          });
          alert("Demande envoyée !");
          setAddFriendId('');
      } catch (e) {
          console.error(e);
          if (e.code === 'permission-denied') {
              setShowRulesHelp(true);
          } else {
              alert("Erreur envoi demande: " + e.message);
          }
      }
  };

  const acceptRequest = async (req) => {
      const newFriend = { id: req.fromUser, name: req.fromEmail || 'Ami' };
      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);
      localStorage.setItem(`friends_${user.uid}`, JSON.stringify(updatedFriends));
      
      try {
        await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests', req.id));
      } catch (e) {
          console.error("Erreur suppression demande acceptée", e);
      }
  };

  const rejectRequest = async (reqId) => {
      try {
        await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'public', 'data', 'requests', reqId));
      } catch (e) {
          console.error("Erreur suppression demande refusée", e);
      }
  };

  const removeFriend = (friendId) => {
      const updatedFriends = friends.filter(f => f.id !== friendId);
      setFriends(updatedFriends);
      localStorage.setItem(`friends_${user.uid}`, JSON.stringify(updatedFriends));
  };

  const renameFriend = (friendId, currentName) => {
      const newName = prompt("Nouveau nom pour cet ami :", currentName);
      if (newName && newName.trim() !== "") {
          const updatedFriends = friends.map(f => f.id === friendId ? {...f, name: newName} : f);
          setFriends(updatedFriends);
          localStorage.setItem(`friends_${user.uid}`, JSON.stringify(updatedFriends));
      }
  };

  const handlePreviewOwnProfile = () => {
      const myPublicWatches = watches.filter(w => w.publicVisible !== false);
      setFriendWatches(myPublicWatches);
      setViewingFriend({ id: user.uid, name: 'Mon Profil Public' });
      // FORCE SCROLL UP
      if(scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const loadFriendCollection = async (friend) => {
      if (!firebaseReady) return;
      setIsFriendsLoading(true);
      setViewingFriend(friend);
      try {
          const q = query(collection(db, 'artifacts', APP_ID_STABLE, 'users', friend.id, 'watches'));
          const snap = await getDocs(q);
          const fWatches = snap.docs.map(d => ({id: d.id, ...d.data()})).filter(w => w.publicVisible !== false);
          setFriendWatches(fWatches);
      } catch (err) {
          console.error("Erreur chargement ami", err);
          alert("Impossible de charger la collection. Vérifiez que votre ami a créé un compte et que les règles de sécurité permettent la lecture.");
          setViewingFriend(null);
      } finally {
          setIsFriendsLoading(false);
      }
  };

  const toggleVisibility = async (watch) => {
      const newVal = !watch.publicVisible;
      
      setWatches(prev => prev.map(w => w.id === watch.id ? { ...w, publicVisible: newVal } : w));
      
      if (useLocalStorage) {
          // Local storage updated by effect
      } else {
          try {
              const watchRef = doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches', watch.id);
              await setDoc(watchRef, { ...watch, publicVisible: newVal }, { merge: true });
          } catch (e) {
              console.error("Erreur toggle visibility", e);
              setWatches(prev => prev.map(w => w.id === watch.id ? { ...w, publicVisible: !newVal } : w));
              alert("Erreur de sauvegarde");
          }
      }
  };

  useEffect(() => {
    document.title = "Mes Montres"; 
    const link = document.createElement('link');
    link.rel = 'icon';
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="100" fill="#1e293b"/><circle cx="256" cy="256" r="180" fill="#f8fafc"/><rect x="246" y="80" width="20" height="40" rx="5" fill="#ef4444"/><rect x="240" y="100" width="32" height="160" rx="16" fill="#334155" transform="rotate(45 256 256)"/><rect x="240" y="100" width="32" height="120" rx="16" fill="#334155" transform="rotate(-60 256 256)"/><circle cx="256" cy="256" r="24" fill="#ef4444"/></svg>`;
    link.href = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    document.head.appendChild(link);
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = link.href;
    document.head.appendChild(appleLink);
  }, []);

  const handleGoogleLogin = async () => {
    if (!firebaseReady) {
        setShowConfigModal(true);
        return;
    }
    setUseLocalStorage(false); 
    setIsAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (error) { 
        if (error.code === 'auth/unauthorized-domain') {
            setAuthDomainError(window.location.hostname);
        } else if (error.code !== 'auth/popup-closed-by-user') {
            alert("Erreur : " + error.message); 
        }
    } finally {
        setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!firebaseReady) {
        setShowProfileMenu(false);
        return;
    }
    setIsAuthLoading(true);
    try { await signOut(auth); setShowProfileMenu(false); } 
    catch (error) { console.error(error); }
    finally { setIsAuthLoading(false); }
  };

  useEffect(() => {
    if (useLocalStorage && !isAuthLoading) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
          setUser(currentUser);
          setError(null);
          setLoading(false);
          if (useLocalStorage) setUseLocalStorage(false);
      } else {
          const timer = setTimeout(() => {
              if (!isAuthLoading) {
                  signInAnonymously(auth)
                    .catch((err) => {
                        console.warn("Auth anonyme failed", err);
                        setUseLocalStorage(true); 
                        setUser({ uid: 'local-user' }); 
                    })
                    .finally(() => setLoading(false));
              }
          }, 1000);
          return () => clearTimeout(timer);
      }
    });
    return () => unsubscribe();
  }, [useLocalStorage, isAuthLoading]);

  useEffect(() => {
    if (!user && !useLocalStorage) return;
    if (useLocalStorage) {
      try {
        let localWatches = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localWatches) setWatches(JSON.parse(localWatches));
        let localBracelets = localStorage.getItem(LOCAL_STORAGE_BRACELETS_KEY);
        if (localBracelets) setBracelets(JSON.parse(localBracelets));
      } catch(e){}
      setLoading(false);
    } else {
      if (!user?.uid) return;
      try {
        const qW = query(collection(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches'));
        const unsubW = onSnapshot(qW, (snap) => {
          setWatches(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded)));
          setLoading(false);
          if(error) setError(null);
        }, (err) => { 
            console.error("Erreur lecture DB:", err);
            if (user?.isAnonymous) {
                setUseLocalStorage(true); 
            } else {
                setError("Erreur synchro: " + (err.code || err.message || String(err))); 
            }
            setLoading(false); 
        });

        const qB = query(collection(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'bracelets'));
        const unsubB = onSnapshot(qB, (snap) => setBracelets(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded))));
        return () => { unsubW(); unsubB(); };
      } catch(e) { 
          console.error("Erreur Setup Query:", e);
          if (user?.isAnonymous) setUseLocalStorage(true);
          setLoading(false); 
      }
    }
  }, [user, useLocalStorage]);

  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watches));
      localStorage.setItem(LOCAL_STORAGE_BRACELETS_KEY, JSON.stringify(bracelets));
    }
  }, [watches, bracelets, useLocalStorage]);

  // --- ACTIONS ---
  // MODIFICATION : Support multi-upload pour les montres
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try { 
      const base64 = await compressImage(file); 
      
      if (type === 'watch') {
          // Gestion des 3 images max
          setWatchForm(prev => {
              const currentImages = prev.images || (prev.image ? [prev.image] : []);
              if (currentImages.length >= 3) {
                  alert("Maximum 3 photos par montre.");
                  return prev;
              }
              // Ajout à la liste et mise à jour de l'image principale si c'est la première
              const newImages = [...currentImages, base64];
              return { ...prev, images: newImages, image: newImages[0] };
          });
      }
      else {
          setBraceletForm(prev => ({ ...prev, image: base64 }));
      }
    } catch (err) { alert("Erreur image : " + err.message); }
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
    
    // Normalisation des données montre (legacy 'image' vs new 'images')
    let data;
    if (isWatch) {
        const images = watchForm.images && watchForm.images.length > 0 
                       ? watchForm.images 
                       : (watchForm.image ? [watchForm.image] : []);
        data = { 
            ...watchForm, 
            id, 
            purchasePrice: Number(watchForm.purchasePrice), 
            sellingPrice: Number(watchForm.sellingPrice), 
            dateAdded: new Date().toISOString(),
            images: images,
            image: images[0] || null // Maintenir la rétrocompatibilité pour l'instant
        };
    } else {
        data = { ...braceletForm, id, dateAdded: new Date().toISOString() };
    }

    if (useLocalStorage) {
      if (isWatch) setWatches(prev => editingId ? prev.map(w => w.id === id ? data : w) : [data, ...prev]);
      else setBracelets(prev => editingId ? prev.map(b => b.id === id ? data : b) : [data, ...prev]);
      closeForm(data);
    } else {
      try { 
        await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, isWatch ? 'watches' : 'bracelets', id), data); 
        closeForm(data); 
      }
      catch(e) { alert("Erreur Cloud: " + e.message); }
    }
  };

  const exportCSV = () => {
    const sep = ";";
    let csvContent = "\uFEFF"; 
    csvContent += "sep=;\n"; 
    const headers = ["Marque", "Modele", "Reference", "Couleur Cadran", "Diametre (mm)", "Entre-corne (mm)", "Annee", "Mouvement", "Pays", "Etanch.", "Verre", "Boite", "Garantie", "Revision", "Prix Achat", "Prix Vente", "Estimation", "Statut", "Modele Pile", "Notes", "Lien", "Edition Limitee", "Num", "Total"];
    csvContent += headers.join(sep) + "\n";
    watches.forEach(w => {
      const row = [
        w.brand, w.model, w.reference, w.dialColor, w.diameter, w.strapWidth, w.year, w.movement, w.country, w.waterResistance, w.glass, w.box, w.warrantyDate, w.revision, w.purchasePrice, w.sellingPrice, w.status, 
        w.batteryModel,
        w.conditionNotes ? w.conditionNotes.replace(/(\r\n|\n|\r|;)/gm, " ") : "", 
        w.link,
        w.isLimitedEdition ? "Oui" : "Non", w.limitedNumber, w.limitedTotal
      ].map(e => `"${(e || '').toString().replace(/"/g, '""')}"`); 
      csvContent += row.join(sep) + "\n";
    });
    bracelets.forEach(b => {
      const row = [
        "BRACELET", b.type, "", "", "", b.width, "", "", "", "", "", "", "", "", "", "", "actif", "",
        (b.notes + (b.quickRelease ? " (Quick Release)" : "")).replace(/(\r\n|\n|\r|;)/gm, " "), 
        "", "", "", ""
      ].map(e => `"${(e || '').toString().replace(/"/g, '""')}"`);
      csvContent += row.join(sep) + "\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ma_collection_horlogere.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeForm = (data) => { 
    if (editingType === 'watch') {
        if(selectedWatch) {
            setSelectedWatch(data);
            setViewedImageIndex(0); // Reset galerie view
        }
        setView(data.status === 'wishlist' ? 'wishlist' : 'list');
    } else {
        setView('list');
    }
    setEditingId(null); 
    setWatchForm(DEFAULT_WATCH_STATE); 
    setBraceletForm(DEFAULT_BRACELET_STATE); 
  };

  const openAdd = () => {
      setEditingId(null);
      const initialStatus = view === 'wishlist' ? 'wishlist' : 'collection';
      setWatchForm({ ...DEFAULT_WATCH_STATE, status: initialStatus });
      setBraceletForm(DEFAULT_BRACELET_STATE);
      const initialType = (filter === 'bracelets' && view !== 'wishlist') ? 'bracelet' : 'watch';
      setEditingType(initialType);
      setView('add');
  };

  const handleEdit = (item, type) => { 
      if (type === 'watch') {
          // Migration à la volée pour l'édition : s'assurer que images existe
          const safeImages = item.images || (item.image ? [item.image] : []);
          setWatchForm({ ...DEFAULT_WATCH_STATE, ...item, images: safeImages });
      }
      else setBraceletForm({ ...DEFAULT_BRACELET_STATE, ...item });
      setEditingType(type);
      setEditingId(item.id); 
      setView('add'); 
  };
  
  const handleDelete = async (id, type) => {
    if(!confirm("Supprimer ?")) return;
    if(useLocalStorage) { 
        if (type === 'watch') setWatches(prev => prev.filter(w => w.id !== id));
        else setBracelets(prev => prev.filter(b => b.id !== id));
        setView('list'); 
    }
    else { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, type === 'watch' ? 'watches' : 'bracelets', id)); setView('list'); }
  };

  const handleBoxClick = () => { 
      setIsBoxOpening(true); 
      setTimeout(() => { setFilter('collection'); setView('list'); setIsBoxOpening(false); }, 800); 
  };
  
  const activeWatchesCount = watches.filter(w => w.status === 'collection' || w.status === 'forsale').length;

  // --- FILTRAGE ET TRI ---
  const getFilteredAndSortedWatches = useMemo(() => {
    let filtered = watches;
    // Filtre de recherche
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filtered = filtered.filter(w => (w.brand && w.brand.toLowerCase().includes(lower)) || (w.model && w.model.toLowerCase().includes(lower)));
    }
    
    // Copie pour le tri
    let sorted = [...filtered];

    if (sortOrder === 'priceAsc') {
        sorted.sort((a, b) => {
            const priceA = a.status === 'collection' ? (a.purchasePrice || 0) : (a.sellingPrice || a.purchasePrice || 0);
            const priceB = b.status === 'collection' ? (b.purchasePrice || 0) : (b.sellingPrice || b.purchasePrice || 0);
            return priceA - priceB;
        });
    } else if (sortOrder === 'priceDesc') {
        sorted.sort((a, b) => {
            const priceA = a.status === 'collection' ? (a.purchasePrice || 0) : (a.sellingPrice || a.purchasePrice || 0);
            const priceB = b.status === 'collection' ? (b.purchasePrice || 0) : (b.sellingPrice || b.purchasePrice || 0);
            return priceB - priceA;
        });
    } else if (sortOrder === 'alpha') {
        sorted.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
    } else if (sortOrder === 'random') {
        sorted.sort(() => Math.random() - 0.5);
    } else {
        sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }
    return sorted;
  }, [watches, searchTerm, sortOrder]);

  const getFilteredBracelets = () => {
    if (!searchTerm) return bracelets;
    const lower = searchTerm.toLowerCase();
    return bracelets.filter(b => (b.type && b.type.toLowerCase().includes(lower)) || (b.width && b.width.includes(lower)));
  };
  
  const filteredWatches = getFilteredAndSortedWatches;
  const filteredBracelets = getFilteredBracelets();

  // --- COMPOSANT RENDER PLEIN ECRAN ---
  const renderFullScreenImage = () => {
    if (!fullScreenImage) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
            <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2"><X size={32}/></button>
            <img 
                src={fullScreenImage} 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                onClick={(e) => e.stopPropagation()} 
            />
        </div>
    );
  };

  // --- RENDER FINANCE ---
  const renderFinance = () => {
    const collectionWatches = watches.filter(w => w.status === 'collection');
    const forSaleWatches = watches.filter(w => w.status === 'forsale');
    const soldWatches = watches.filter(w => w.status === 'sold');

    const calculateStats = (list, isSold = false) => {
        const buy = list.reduce((acc, w) => acc + (Number(w.purchasePrice) || 0), 0);
        const val = list.reduce((acc, w) => acc + (Number(w.sellingPrice) || Number(w.purchasePrice) || 0), 0);
        return { buy, val, profit: val - buy };
    };

    const sCol = calculateStats(collectionWatches);
    const sSale = calculateStats(forSaleWatches);
    const sSold = calculateStats(soldWatches, true);

    const sTotal = {
        buy: sCol.buy + sSale.buy + sSold.buy,
        val: sCol.val + sSale.val + sSold.val,
        profit: sCol.profit + sSale.profit + sSold.profit
    };

    return (
      <div className="pb-24 px-3 space-y-2">
        <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2 border-b border-slate-100 mb-2">
            <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide px-1">Finances</h1>
        </div>
        {financeDetail === 'collection' && <FinanceDetailList title="Détail Collection" items={collectionWatches} onClose={() => setFinanceDetail(null)} />}
        {financeDetail === 'forsale' && <FinanceDetailList title="Détail En Vente" items={forSaleWatches} onClose={() => setFinanceDetail(null)} />}
        {financeDetail === 'sold' && <FinanceDetailList title="Détail Vendues" items={soldWatches} onClose={() => setFinanceDetail(null)} />}

        <FinanceCardFull title={`Ma Collection (${collectionWatches.length})`} icon={Watch} stats={sCol} type="collection" bgColor="bg-emerald-500" onClick={() => setFinanceDetail('collection')} />
        <FinanceCardFull title={`En Vente (${forSaleWatches.length})`} icon={TrendingUp} stats={sSale} type="forsale" bgColor="bg-amber-500" onClick={() => setFinanceDetail('forsale')} />
        <FinanceCardFull title={`Vendues (${soldWatches.length})`} icon={DollarSign} stats={sSold} type="sold" bgColor="bg-blue-600" onClick={() => setFinanceDetail('sold')} />
        <div className="mt-4 pt-2">
            <FinanceCardFull title="TOTAL GLOBAL" icon={Activity} stats={sTotal} type="total" bgColor="bg-white" onClick={() => {}} />
        </div>
      </div>
    );
  };

  // --- RENDER FRIENDS ---
  const renderFriendDetail = (watch) => {
      // Compatibilité multi-images ami
      const displayImages = watch.images && watch.images.length > 0 ? watch.images : (watch.image ? [watch.image] : []);
      const [friendImgIndex, setFriendImgIndex] = useState(0);

      return (
          <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                  <h3 className="font-serif font-bold text-slate-800 tracking-wide">Détail Montre</h3>
                  <button onClick={() => setSelectedWatch(null)} className="p-2 bg-white rounded-full shadow-sm"><X size={20}/></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  {/* AJOUT CLICK FULLSCREEN ICI AUSSI */}
                  <div 
                    className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative cursor-pointer"
                    onClick={() => setFullScreenImage(displayImages[friendImgIndex])}
                  >
                       {displayImages[friendImgIndex] ? <img src={displayImages[friendImgIndex]} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full"><Camera size={48} className="text-slate-300"/></div>}
                       {/* Icone Loupe pour indiquer cliquable */}
                       {displayImages[friendImgIndex] && <div className="absolute top-2 right-2 bg-black/40 p-1.5 rounded-full text-white/80 pointer-events-none"><ZoomIn size={16}/></div>}
                  </div>
                  {displayImages.length > 1 && (
                      <div className="flex gap-2 justify-center">
                          {displayImages.map((_, i) => (
                              <button key={i} onClick={() => setFriendImgIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === friendImgIndex ? 'bg-indigo-600 w-4' : 'bg-slate-300'}`}/>
                          ))}
                      </div>
                  )}

                  <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-wide">{watch.brand}</h2>
                      <p className="text-lg text-slate-600 font-light tracking-wide">{watch.model}</p>
                      {watch.reference && <div className="mt-1 text-xs text-slate-400 font-mono">{watch.reference}</div>}
                      {watch.isLimitedEdition && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">
                             EDITION LIMITÉE {watch.limitedNumber && watch.limitedTotal ? `${watch.limitedNumber} / ${watch.limitedTotal}` : ''}
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <DetailItem icon={Ruler} label="Diamètre" value={watch.diameter ? watch.diameter + ' mm' : ''} />
                      <DetailItem icon={Calendar} label="Année" value={watch.year} />
                      <DetailItem icon={MovementIcon} label="Mouvement" value={watch.movement} />
                      <DetailItem icon={Droplets} label="Étanchéité" value={watch.waterResistance} />
                  </div>
                  
                  {(watch.status === 'wishlist' || watch.status === 'forsale') && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-slate-400">
                            {watch.status === 'forsale' ? 'Prix de vente' : 'Prix'}
                        </span>
                        <span className="font-bold text-slate-900">
                            {formatPrice(watch.status === 'forsale' ? (watch.sellingPrice || watch.purchasePrice) : watch.purchasePrice)}
                        </span>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-xl text-center text-sm text-blue-800 font-medium mt-4">
                      Cette montre appartient à {viewingFriend?.name || 'un ami'}.
                  </div>
              </div>
          </div>
      );
  };

  const renderFriends = () => {
      if (viewingFriend) {
          const friendCollection = friendWatches.filter(w => w.status === 'collection');
          const friendSale = friendWatches.filter(w => w.status === 'forsale');
          const friendWish = friendWatches.filter(w => w.status === 'wishlist');
          
          return (
              <div className="pb-24 bg-slate-50 min-h-screen">
                  <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                      <button onClick={() => setViewingFriend(null)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full"><ChevronLeft/></button>
                      <div>
                          <h1 className="font-serif font-bold text-slate-800 leading-tight tracking-wide">{viewingFriend.name}</h1>
                          <p className="text-xs text-slate-500">Collection partagée</p>
                      </div>
                  </div>
                  
                  <div className="p-4 space-y-6">
                      {/* BLOC COLLECTION */}
                      <div>
                          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Watch size={14}/> Collection ({friendCollection.length})</h3>
                          <div className="grid grid-cols-2 gap-3">
                              {friendCollection.map(w => {
                                  // Fallback ami image
                                  const img = w.images?.[0] || w.image;
                                  return (
                                  <div key={w.id} onClick={() => setSelectedWatch(w)} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 active:scale-95 transition-transform">
                                      <div className="aspect-square bg-slate-50 relative">
                                          {img ? <img src={img} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Activity size={16}/></div>}
                                      </div>
                                      <div className="p-2">
                                          <div className="font-bold text-sm truncate">{w.brand}</div>
                                          <div className="text-xs text-slate-500 truncate">{w.model}</div>
                                      </div>
                                  </div>
                              )})}
                              {friendCollection.length === 0 && <div className="col-span-2 text-center text-xs text-slate-400 py-4 bg-slate-100 rounded-xl border border-dashed">Vide</div>}
                          </div>
                      </div>

                      {/* BLOC EN VENTE */}
                      <div>
                          <h3 className="font-bold text-sm text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp size={14}/> En Vente ({friendSale.length})</h3>
                          <div className="grid grid-cols-2 gap-3">
                              {friendSale.map(w => {
                                  const img = w.images?.[0] || w.image;
                                  return (
                                  <div key={w.id} onClick={() => setSelectedWatch(w)} className="bg-white rounded-xl shadow-sm overflow-hidden border border-amber-100 active:scale-95 transition-transform">
                                      <div className="aspect-square bg-amber-50 relative">
                                          {img ? <img src={img} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-amber-300"><Activity size={16}/></div>}
                                          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                                            {formatPrice(w.sellingPrice || w.purchasePrice)}
                                          </div>
                                          <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Vente</div>
                                      </div>
                                      <div className="p-2">
                                          <div className="font-bold text-sm truncate">{w.brand}</div>
                                          <div className="text-xs text-slate-500 truncate">{w.model}</div>
                                      </div>
                                  </div>
                              )})}
                              {friendSale.length === 0 && <div className="col-span-2 text-center text-xs text-slate-400 py-4 bg-slate-100 rounded-xl border border-dashed">Rien à vendre</div>}
                          </div>
                      </div>

                      {/* BLOC SOUHAITS */}
                      <div>
                          <h3 className="font-bold text-sm text-rose-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Heart size={14}/> Souhaits ({friendWish.length})</h3>
                          <div className="space-y-2">
                              {friendWish.map(w => {
                                  const img = w.images?.[0] || w.image;
                                  return (
                                  <div key={w.id} onClick={() => setSelectedWatch(w)} className="flex items-center bg-white p-2 rounded-xl border border-rose-100 shadow-sm cursor-pointer hover:bg-rose-50/50 transition-colors">
                                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 mr-3 relative">
                                          {img ? <img src={img} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Heart size={14}/></div>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <div className="font-bold text-sm text-slate-800 truncate">{w.brand}</div>
                                          <div className="text-xs text-slate-500 truncate">{w.model}</div>
                                      </div>
                                      <div className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg whitespace-nowrap ml-2">
                                        {formatPrice(w.purchasePrice)}
                                      </div>
                                  </div>
                              )})}
                              {friendWish.length === 0 && <div className="text-center text-xs text-slate-400 py-4 bg-slate-100 rounded-xl border border-dashed">Aucun souhait</div>}
                          </div>
                      </div>
                  </div>
                  {/* MODAL DETAIL AMI */}
                  {selectedWatch && renderFriendDetail(selectedWatch)}
              </div>
          );
      }

      return (
          <div className="pb-24 px-3">
              <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2 border-b border-slate-100 mb-4">
                  <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide px-1">Mes Amis</h1>
              </div>
              
              {/* 1. LISTE DES DEMANDES EN ATTENTE */}
              {friendRequests.length > 0 && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h3 className="font-bold text-sm text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Bell size={16}/> Demandes reçues</h3>
                      <div className="space-y-2">
                          {friendRequests.map(req => (
                              <div key={req.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
                                  <div>
                                      <div className="font-bold text-sm text-slate-800">{req.fromEmail || 'Utilisateur'}</div>
                                      <div className="text-[10px] text-slate-400 font-mono">ID: {req.fromUser.substring(0,8)}...</div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => rejectRequest(req.id)} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"><X size={16}/></button>
                                      <button onClick={() => acceptRequest(req)} className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100"><Check size={16}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-lg mb-6">
                  <h3 className="font-bold text-lg mb-1">Inviter un ami</h3>
                  <p className="text-indigo-100 text-xs mb-4">Partagez votre code unique pour qu'ils puissent voir votre collection.</p>
                  <div className="bg-white/10 p-3 rounded-lg flex items-center justify-between backdrop-blur-sm border border-white/20">
                      <code className="font-mono text-sm truncate mr-2">{user?.uid || '...'}</code>
                      <button onClick={() => { navigator.clipboard.writeText(user?.uid); alert('Code copié !'); }} className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-50 transition-colors"><Copy size={12}/> Copier</button>
                  </div>
              </div>

              {/* NEW BUTTON: VIEW OWN PROFILE AS FRIEND */}
              <button 
                  onClick={handlePreviewOwnProfile}
                  className="w-full mb-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
              >
                  <Eye size={18} /> Voir mon profil public
              </button>

              <div className="mb-6">
                   <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Ajouter</h3>
                   <div className="flex gap-2">
                       <input 
                          type="text" 
                          placeholder="Coller le code ami ici..." 
                          className="flex-1 p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={addFriendId}
                          onChange={(e) => setAddFriendId(e.target.value)}
                       />
                       <button 
                          onClick={() => { if(addFriendId) sendFriendRequest(); }}
                          className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800"
                       >
                           <UserPlus size={20} />
                       </button>
                   </div>
              </div>

              <div>
                  <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Vos amis ({friends.length})</h3>
                  <div className="space-y-3">
                      {friends.map(friend => (
                          <div key={friend.id} onClick={() => loadFriendCollection(friend)} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-colors group relative">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                      {friend.name.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="font-bold text-slate-800">{friend.name}</div>
                                      <div className="text-[10px] text-slate-400 font-mono truncate w-32">ID: {friend.id}</div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-2">
                                  {isFriendsLoading && viewingFriend?.id === friend.id && <Loader2 className="animate-spin text-indigo-500" size={18}/>}
                                  {/* BOUTON RENOMMER */}
                                  <button onClick={(e) => { e.stopPropagation(); renameFriend(friend.id, friend.name); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Renommer">
                                      <Edit2 size={16}/>
                                  </button>
                                  {/* BOUTON SUPPRIMER */}
                                  <button onClick={(e) => { e.stopPropagation(); if(confirm('Supprimer cet ami ?')) removeFriend(friend.id); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
                                      <Trash2 size={16}/>
                                  </button>
                                  <ChevronLeft className="rotate-180 text-slate-300 group-hover:text-indigo-500" size={18}/>
                              </div>
                          </div>
                      ))}
                      {friends.length === 0 && (
                          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                              <Users className="mx-auto text-slate-300 mb-2" size={32}/>
                              <p className="text-sm text-slate-400">Vous n'avez pas encore d'amis.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const renderHeaderControls = () => {
    const isConfigMissing = !firebaseReady;
    const isAnonymous = user?.isAnonymous || user?.uid === 'local-user';

    return (
      <div className="absolute top-4 right-4 z-20">
        {(!user || isAnonymous) ? (
          <div className="flex flex-col items-end">
              <button 
                onClick={handleGoogleLogin} 
                disabled={isAuthLoading}
                className={`flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-full shadow-sm border text-xs font-medium transition-all active:scale-95 ${isConfigMissing ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`}
              >
                {isAuthLoading ? <Loader2 size={14} className="animate-spin" /> : (isConfigMissing ? <Settings size={14} /> : <LogIn size={14} />)}
                <span className="hidden sm:inline">{isConfigMissing ? 'Configurer Cloud' : 'Connexion'}</span>
              </button>
              {isConfigMissing && globalInitError && (
                  <div className="mt-1 bg-red-500 text-white text-[9px] p-1.5 rounded shadow-sm max-w-[150px] animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-1 font-bold mb-0.5"><AlertCircle size={10}/> Erreur connexion</div>
                      <div className="opacity-90 truncate" title={globalInitError}>{globalInitError}</div>
                  </div>
              )}
          </div>
        ) : (
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-transform active:scale-95">
              {user.photoURL ? <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full bg-indigo-800 flex items-center justify-center text-white"><span className="text-xs font-bold">{user.email ? user.email[0].toUpperCase() : 'U'}</span></div>}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 z-30">
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${isAnonymous ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{isAnonymous ? 'Local (Non synchronisé)' : 'Cloud (Synchronisé)'}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{user.email || 'Utilisateur Anonyme'}</p>
                </div>
                <button onClick={() => { handleLogout(); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                    {isAuthLoading ? <Loader2 size={16} className="animate-spin"/> : <LogOut size={16} />} 
                    Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBox = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] px-8 relative bg-slate-50 text-slate-800 overflow-hidden">
      <GraphicBackground />

      {renderHeaderControls()}
      
      <div className="z-10 mt-12 mb-2 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-[0.3em] uppercase font-light">
              Mes Montres
          </h1>
          <div className="w-16 h-0.5 bg-slate-900 mx-auto mt-4 opacity-20"></div>
      </div>

      <div className="mb-8 text-center z-10 scale-75 opacity-80"><LiveClock /></div>
      
      <div onClick={handleBoxClick} className="flex items-center justify-center w-72 h-64 cursor-pointer transform transition-transform active:scale-95 hover:scale-105 duration-300 z-10" title="Ouvrir">
        <WatchBoxLogo isOpen={isBoxOpening} />
      </div>
      <div className="mt-12 flex flex-col items-center z-10 pb-20">
        <p className="text-slate-800 font-serif text-sm mb-2 tracking-widest shadow-sm uppercase opacity-70">{activeWatchesCount} {activeWatchesCount > 1 ? 'pièces' : 'pièce'}</p>
        {!firebaseReady && (<div className="inline-flex items-center justify-center text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 backdrop-blur-sm"><WifiOff size={10} className="mr-1"/> Mode Local</div>)}
        
        {error && !useLocalStorage && (
             <div className="mt-3 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-xs flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <AlertCircle size={14} className="flex-shrink-0"/>
                <span>Problème de synchronisation ({typeof error === 'string' ? error : 'Erreur inconnue'})</span>
                {typeof error === 'string' && error.includes('permission-denied') && (
                    <button onClick={() => setShowRulesHelp(true)} className="ml-auto bg-white px-2 py-1 rounded border shadow-sm font-bold text-emerald-600 hover:bg-emerald-50">
                        Réparer
                    </button>
                )}
             </div>
        )}
      </div>
    </div>
  );

  const renderHeader = (title, withFilters = false) => (
    <div className="sticky top-0 bg-white z-10 pt-2 pb-2 px-1 shadow-sm border-b border-slate-100">
      <div className="flex justify-between items-center px-2 mb-2">
        <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide">{title}</h1>
        <div className="flex items-center gap-2">
            {(title === "Collection" || title === "Inventaire" || title === "Galerie") && (
                <div className="relative">
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="appearance-none bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                        <option value="date">Date</option>
                        <option value="alpha">A-Z</option>
                        <option value="random">Aléatoire</option>
                        <option value="priceAsc">Prix Croissant</option>
                        <option value="priceDesc">Prix Décroissant</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ArrowUpDown size={12} />
                    </div>
                </div>
            )}
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchTerm(''); }} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Search size={18} /></button>
        </div>
      </div>
      {isSearchOpen && (<div className="px-2 mb-3 animate-in fade-in slide-in-from-top-2"><input autoFocus type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"/></div>)}
      {withFilters && !isSearchOpen && (
        <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar px-2 pb-1">
            {['all', 'collection', 'forsale', 'sold', 'bracelets'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter===f ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {f === 'all' ? `Tout (${watches.length})` : 
                     f === 'collection' ? `Ma Collection (${watches.filter(w=>w.status==='collection').length})` : 
                     f === 'forsale' ? `En Vente (${watches.filter(w=>w.status==='forsale').length})` : 
                     f === 'sold' ? `Vendues (${watches.filter(w=>w.status==='sold').length})` : 
                     `Bracelets (${bracelets.length})`}
                </button>
            ))}
        </div>
      )}
    </div>
  );

  const renderList = () => {
    if (filter === 'bracelets') {
        return (
            <div className="pb-24">
                {renderHeader("Collection", true)}
                <div className="grid grid-cols-2 gap-3 px-3 mt-3">
                    {filteredBracelets.map(b => (
                        <Card key={b.id} onClick={() => { handleEdit(b, 'bracelet'); }}>
                            <div className="aspect-square bg-slate-50 relative">
                                {b.image ? <img src={b.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Activity/></div>}
                                <div className="absolute bottom-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm border border-slate-100">{b.width}mm</div>
                            </div>
                            <div className="p-3">
                                <div className="font-bold text-sm truncate text-slate-800">{b.type}</div>
                                <div className="text-xs text-slate-500 truncate">{b.quickRelease ? 'Quick Release' : 'Standard'}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    const displayWatches = filteredWatches.filter(w => { 
        if (w.status === 'wishlist') return false; 
        if (filter === 'all') return true; 
        return w.status === filter; 
    });
    return (
      <div className="pb-24">
        {renderHeader("Collection", true)}
        <div className="grid grid-cols-2 gap-3 px-3 mt-3">
          {displayWatches.map(w => {
            // Priorité à la première image de la liste, sinon fallback sur l'ancienne propriété single image
            const displayImage = w.images && w.images.length > 0 ? w.images[0] : w.image;

            return (
            <Card key={w.id} onClick={() => { setSelectedWatch(w); setViewedImageIndex(0); setView('detail'); }}>
              <div className="aspect-square bg-slate-50 relative">
                {displayImage ? <img src={displayImage} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera/></div>}
                
                {(w.purchasePrice) && (
                    <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white/20">
                        {formatPrice(w.purchasePrice)}
                    </div>
                )}

                <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm border border-slate-100 flex flex-col items-end">
                    {w.status === 'sold' ? (
                        <>
                            <span className="text-emerald-600 font-extrabold">VENDUE</span>
                            <span className="text-[9px] text-emerald-600 leading-none">{formatPrice(w.sellingPrice)}</span>
                        </>
                    ) : (
                        formatPrice(w.sellingPrice || w.purchasePrice)
                    )}
                </div>

                <div 
                    className="absolute bottom-1 right-1 p-1.5 bg-white/90 rounded-full shadow-sm cursor-pointer hover:scale-110 transition-transform z-10"
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(w); }}
                >
                    {w.publicVisible ? <Eye size={14} className="text-emerald-600"/> : <EyeOff size={14} className="text-slate-400"/>}
                </div>
                
                {/* INDICATEUR MULTI-PHOTOS */}
                {w.images && w.images.length > 1 && (
                    <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <ImageIcon size={10} /> {w.images.length}
                    </div>
                )}
              </div>
              <div className="p-3">
                  <div className="font-bold font-serif text-sm truncate text-slate-800 tracking-wide">{w.brand}</div>
                  <div className="text-xs text-slate-500 truncate">{w.model}</div>
              </div>
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
        {renderHeader("Souhaits")}
        <div className="space-y-3 px-3 mt-3">
          <button 
            onClick={() => openAdd()}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-medium hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Plus className="mr-2" size={20}/> Ajouter un souhait
          </button>

          {wishes.map(w => {
            const displayImage = w.images && w.images.length > 0 ? w.images[0] : w.image;
            return (
            <Card key={w.id} className="flex p-3 gap-3 relative" onClick={() => { setSelectedWatch(w); setView('detail'); }}>
                <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {displayImage ? <img src={displayImage} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Heart size={20}/></div>}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div><h3 className="font-bold font-serif text-slate-800 tracking-wide">{w.brand}</h3><p className="text-xs text-slate-500">{w.model}</p></div>
                    <div className="flex justify-between items-end">
                        <div className="font-semibold text-emerald-600">{formatPrice(w.purchasePrice)}</div>
                        {w.link && (
                            <a 
                                href={w.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 z-10"
                                onClick={(e) => { e.stopPropagation(); }}
                            >
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
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
    // Construction de la liste d'images unifiée (support ancien format et nouveau format)
    const displayImages = w.images && w.images.length > 0 ? w.images : (w.image ? [w.image] : []);
    const compatibleBracelets = w.strapWidth ? bracelets.filter(b => b.width === w.strapWidth) : [];
    
    return (
      <div className="pb-24 bg-white min-h-screen">
        <div className="sticky top-0 bg-white/90 backdrop-blur p-4 flex items-center justify-between border-b z-10">
          <button onClick={() => { setSelectedWatch(null); setView(w.status === 'wishlist' ? 'wishlist' : 'list'); }}><ChevronLeft/></button>
          <span className="font-bold font-serif text-slate-800 tracking-wide">Détails</span>
          <div className="flex gap-2">
            <button 
                onClick={() => toggleVisibility(w)}
                className={`p-2 rounded-full transition-colors ${w.publicVisible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
            >
                {w.publicVisible ? <Eye size={18}/> : <EyeOff size={18}/>}
            </button>
            <button onClick={() => handleEdit(w, 'watch')} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100"><Edit2 size={18}/></button>
            <button onClick={() => handleDelete(w.id, 'watch')} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"><Trash2 size={18}/></button>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="space-y-4">
              {/* GALERIE PRINCIPALE */}
              {/* AJOUTER LE HANDLER DE CLIC POUR LE FULLSCREEN */}
              <div 
                className="aspect-square bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative group cursor-pointer"
                onClick={() => setFullScreenImage(displayImages[viewedImageIndex])}
              >
                {displayImages[viewedImageIndex] ? (
                    <img src={displayImages[viewedImageIndex]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                ) : (
                    <div className="flex h-full items-center justify-center"><Camera size={48} className="text-slate-300"/></div>
                )}
                
                {/* ICONE ZOOM INDICATEUR */}
                {displayImages[viewedImageIndex] && (
                    <div className="absolute top-2 right-2 bg-black/30 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn size={20}/>
                    </div>
                )}
                
                {/* INDICATEUR NOMBRE PHOTOS */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {displayImages.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all shadow-sm ${i === viewedImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}></div>
                        ))}
                    </div>
                )}
              </div>

              {/* MINIATURES GALERIE (Si plus d'une photo) */}
              {displayImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {displayImages.map((img, i) => (
                          <div 
                            key={i} 
                            onClick={() => setViewedImageIndex(i)}
                            className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all ${i === viewedImageIndex ? 'border-indigo-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                              <img src={img} className="w-full h-full object-cover" />
                          </div>
                      ))}
                  </div>
              )}

              <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 leading-tight tracking-wide">{w.brand}</h1>
                <p className="text-xl text-slate-600 font-medium font-serif tracking-wide">{w.model}</p>
                {w.reference && <span className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 inline-block border font-mono text-slate-500">REF: {w.reference}</span>}
                
                {w.isLimitedEdition && (
                     <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full shadow-sm">
                         EDITION LIMITÉE {w.limitedNumber && w.limitedTotal ? `${w.limitedNumber} / ${w.limitedTotal}` : ''}
                     </div>
                )}
              </div>
          </div>
          {w.status === 'wishlist' && w.link && (
              <a href={w.link} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full py-3 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm border border-indigo-100 hover:bg-indigo-100 transition-colors"><ExternalLink size={16} className="mr-2" /> Voir le site web</a>
          )}
          {w.status !== 'wishlist' && (
            <>
              <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Spécifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <DetailItem icon={Ruler} label="Diamètre" value={w.diameter ? w.diameter + ' mm' : ''} />
                     <DetailItem icon={Layers} label="Épaisseur" value={w.thickness ? w.thickness + ' mm' : ''} />
                     <DetailItem icon={Activity} label="Bracelet" value={w.strapWidth ? w.strapWidth + ' mm' : ''} />
                     {w.dialColor && <DetailItem icon={Palette} label="Cadran" value={w.dialColor} />}
                     <DetailItem icon={Droplets} label="Étanchéité" value={w.waterResistance ? w.waterResistance + ' ATM' : ''} />
                     <DetailItem icon={MovementIcon} label="Mouvement" value={w.movement} />
                     {w.powerReserve && <DetailItem icon={Zap} label="Réserve" value={w.powerReserve + ' h'} />}
                     {w.jewels && <DetailItem icon={Gem} label="Rubis" value={w.jewels} />}
                     <DetailItem icon={Search} label="Verre" value={w.glass} />
                     <DetailItem icon={MapPin} label="Pays" value={w.country} />
                     <DetailItem icon={Calendar} label="Année" value={w.year} />
                     {/* AFFICHAGE DU MODÈLE DE PILE DANS LE DÉTAIL */}
                     {w.batteryModel && <DetailItem icon={Battery} label="Pile" value={w.batteryModel} />}
                  </div>
              </div>
              {compatibleBracelets.length > 0 && (
                  <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Bracelets Compatibles ({w.strapWidth}mm)</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                          {compatibleBracelets.map(b => (
                              <div key={b.id} className="flex-shrink-0 w-24 bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm">
                                  <div className="h-24 bg-slate-50">
                                      {b.image ? <img src={b.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Activity size={16}/></div>}
                                  </div>
                                  <div className="p-2 text-center">
                                      <div className="text-[10px] font-bold truncate">{b.type}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Origine & Entretien</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <DetailItem icon={Package} label="Boîte" value={w.box} />
                     <DetailItem icon={ShieldCheck} label="Garantie" value={w.warrantyDate} />
                     <DetailItem icon={Wrench} label="Révision" value={w.revision} />
                  </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg border"><div className="text-xs text-slate-400 uppercase">Prix</div><div className="text-lg font-bold">{formatPrice(w.purchasePrice)}</div></div>
            {w.status !== 'wishlist' && (
                <div className="p-3 bg-slate-50 rounded-lg border"><div className="text-xs text-slate-400 uppercase">{w.status === 'sold' ? 'Vente' : 'Estim.'}</div><div className="text-lg font-bold text-emerald-600">{formatPrice(w.status === 'sold' ? w.sellingPrice : (w.sellingPrice || w.purchasePrice))}</div>{w.status === 'sold' && <div className="text-xs text-emerald-600 mt-1">Profit: {formatPrice(w.sellingPrice - w.purchasePrice)}</div>}</div>
            )}
          </div>
          {w.conditionNotes && <div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-800 border border-amber-100"><div className="flex items-center font-bold text-amber-800 mb-2 text-xs uppercase"><FileText size={12} className="mr-1"/> Notes</div>{w.conditionNotes}</div>}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const categories = [
        { id: 'collection', title: 'Ma Collection', color: 'text-blue-800 bg-blue-50 border-blue-100' }, 
        { id: 'forsale', title: 'En Vente', color: 'text-amber-800 bg-amber-50 border-amber-100' }, 
        { id: 'sold', title: 'Vendues', color: 'text-emerald-800 bg-emerald-50 border-emerald-100' }
    ];

    return (
      <div className="pb-24 px-2">
        {renderHeader("Inventaire")}
        <div className="space-y-6 px-1 mt-2">
            <button className="w-full p-4 text-left bg-white border rounded-lg shadow-sm" onClick={() => exportCSV()}>
                <div className="font-bold flex items-center"><Download className="mr-2" size={18}/> Exporter CSV</div>
                <div className="text-xs text-slate-500 mt-1">Télécharger toutes les données</div>
            </button>

            {categories.map(cat => {
                const list = filteredWatches.filter(w => w.status === cat.id);
                if (list.length === 0) return null;
                
                return (
                    <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className={`px-4 py-2 border-b font-bold text-sm ${cat.color} flex justify-between items-center`}>
                            <span>{cat.title}</span>
                            <span className="text-xs opacity-70 bg-white/50 px-2 py-0.5 rounded-full">{list.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {list.map(w => {
                                const thumb = w.images && w.images.length > 0 ? w.images[0] : w.image;
                                return (
                                <div key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }} className="flex items-center p-2 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <div className="w-8 h-8 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 mr-3 border border-slate-100">
                                        {thumb ? <img src={thumb} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera size={14}/></div>}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-baseline gap-1 overflow-hidden">
                                        <span className="font-bold text-sm text-slate-900 whitespace-nowrap">{w.brand}</span>
                                        <span className="text-xs text-slate-500 truncate">{w.model}</span>
                                    </div>
                                    <ChevronLeft className="text-slate-300 rotate-180 flex-shrink-0 ml-1" size={14}/>
                                </div>
                            )})}
                        </div>
                    </div>
                );
            })}
            
            {filteredWatches.length === 0 && <div className="text-center text-slate-400 py-10 text-sm">Inventaire vide.</div>}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="pb-24 px-2">
      {/* NOUVEAU : Header avec Filtres Galerie */}
      <div className="sticky top-0 bg-white z-10 pt-2 pb-2 px-1 shadow-sm border-b border-slate-100 mb-2">
         {/* LIGNE 1 : TITRE + TRI + RECHERCHE */}
         <div className="flex justify-between items-center px-2 mb-2">
            <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide">Galerie</h1>
            <div className="flex items-center gap-2">
                {/* SELECTEUR DE TRI RÉINTÉGRÉ */}
                <div className="relative">
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="appearance-none bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                        <option value="date">Date</option>
                        <option value="alpha">A-Z</option>
                        <option value="random">Aléatoire</option>
                        <option value="priceAsc">Prix Croissant</option>
                        <option value="priceDesc">Prix Décroissant</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ArrowUpDown size={12} />
                    </div>
                </div>
                <button onClick={() => { setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchTerm(''); }} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Search size={18} /></button>
            </div>
         </div>

         {/* RECHERCHE */}
         {isSearchOpen && (<div className="px-2 mb-3 animate-in fade-in slide-in-from-top-2"><input autoFocus type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"/></div>)}

         {/* LIGNE 2 : FILTRES BOUTONS */}
         <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar pb-1">
               <button 
                  onClick={() => setShowGalleryCollection(!showGalleryCollection)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryCollection ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                  Collection
               </button>
               <button 
                  onClick={() => setShowGalleryForsale(!showGalleryForsale)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryForsale ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                  Vente
               </button>
               <button 
                  onClick={() => setShowGallerySold(!showGallerySold)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGallerySold ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                  Vendus
               </button>
               <button 
                  onClick={() => setShowGalleryWishlist(!showGalleryWishlist)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${showGalleryWishlist ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                  Souhaits
               </button>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-1 mt-2 px-1">
          {filteredWatches.filter(w => {
             if (!w.image && (!w.images || w.images.length === 0)) return false;
             if (w.status === 'collection' && showGalleryCollection) return true;
             if (w.status === 'forsale' && showGalleryForsale) return true;
             if (w.status === 'wishlist' && showGalleryWishlist) return true;
             if (w.status === 'sold' && showGallerySold) return true;
             return false;
          }).map(w => {
              const displayImage = w.images && w.images.length > 0 ? w.images[0] : w.image;
              return (
              <div key={w.id} className="aspect-square bg-slate-100 rounded overflow-hidden relative cursor-pointer" onClick={() => { setSelectedWatch(w); setView('detail'); }}>
                  <img src={displayImage} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] p-1 truncate">
                    <span className="font-bold">{w.brand}</span> {w.model}
                  </div>
              </div>
          )})}
          {filteredWatches.length === 0 && <div className="col-span-3 text-center text-slate-400 py-8 text-sm">Aucune photo disponible</div>}
      </div>
    </div>
  );

  const renderForm = () => {
      const isWatch = editingType === 'watch';
      const currentImages = isWatch ? (watchForm.images || (watchForm.image ? [watchForm.image] : [])) : [];
      
      return (
        <div className="pb-24 p-4">
          <div className="flex justify-between items-center mb-6 mt-2"><h1 className="text-2xl font-bold font-serif tracking-wide">{editingId ? 'Modifier' : 'Ajouter'} {isWatch ? 'Montre' : 'Bracelet'}</h1><button onClick={() => handleCancelForm()}><X/></button></div>
          {!editingId && filter === 'all' && (
              <div className="flex mb-6 p-1 bg-slate-100 rounded-lg">
                  <button onClick={() => setEditingType('watch')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isWatch ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Montre</button>
                  <button onClick={() => setEditingType('bracelet')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isWatch ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Bracelet</button>
              </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* GESTION MULTI-PHOTOS POUR MONTRES */}
            {isWatch ? (
                <div className="grid grid-cols-3 gap-3">
                    {/* Affiche les images existantes */}
                    {currentImages.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden relative border border-slate-200 group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                            >
                                <X size={12}/>
                            </button>
                            {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5 font-bold">PRINCIPALE</div>}
                        </div>
                    ))}
                    
                    {/* Bouton d'ajout si < 3 photos */}
                    {currentImages.length < 3 && (
                        <label className="aspect-square bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                            <Camera className="text-slate-400 mb-1" size={24}/>
                            <span className="text-[10px] font-bold text-slate-500">Ajouter</span>
                            <span className="text-[9px] text-slate-400">{currentImages.length}/3</span>
                            <input type="file" onChange={(e) => handleImageUpload(e, 'watch')} className="hidden" accept="image/*"/>
                        </label>
                    )}
                </div>
            ) : (
                // GESTION SIMPLE POUR BRACELET
                <label className="block w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden hover:bg-slate-50">
                  {braceletForm.image ? <img src={braceletForm.image} className="w-full h-full object-cover"/> : <div className="text-center text-slate-400"><Camera className="mx-auto mb-2"/><span className="text-xs">Ajouter Photo</span></div>}
                  <input type="file" onChange={(e) => handleImageUpload(e, 'bracelet')} className="hidden"/>
                </label>
            )}

            {isWatch ? (
                <>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Identité</h3>
                        <input className="w-full p-3 border rounded-lg" placeholder="Marque (ex: Rolex)" value={watchForm.brand} onChange={e => setWatchForm({...watchForm, brand: e.target.value})} required />
                        <input className="w-full p-3 border rounded-lg" placeholder="Modèle" value={watchForm.model} onChange={e => setWatchForm({...watchForm, model: e.target.value})} required />
                        <input className="w-full p-3 border rounded-lg" placeholder="Référence" value={watchForm.reference} onChange={e => setWatchForm({...watchForm, reference: e.target.value})} />
                        {/* NOUVEAU CHAMP : COULEUR CADRAN */}
                        <div className="relative">
                            <input className="w-full p-3 pl-10 border rounded-lg" placeholder="Couleur cadran" value={watchForm.dialColor || ''} onChange={e => setWatchForm({...watchForm, dialColor: e.target.value})} />
                            <Palette className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        </div>
                        
                        {/* NOUVEAU : EDITION LIMITEE (V40.4) */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center mb-2">
                                <input 
                                    type="checkbox" 
                                    id="isLimited"
                                    checked={watchForm.isLimitedEdition}
                                    onChange={e => setWatchForm({...watchForm, isLimitedEdition: e.target.checked})}
                                    className="w-4 h-4 text-indigo-600 rounded mr-2"
                                />
                                <label htmlFor="isLimited" className="text-sm font-bold text-slate-700">Édition Limitée</label>
                            </div>
                            {watchForm.isLimitedEdition && (
                                <div className="flex gap-2 pl-6 animate-in slide-in-from-top-1">
                                    <input 
                                        className="w-full p-2 border rounded text-sm" 
                                        placeholder="N° (ex: 42)" 
                                        value={watchForm.limitedNumber}
                                        onChange={e => setWatchForm({...watchForm, limitedNumber: e.target.value})}
                                    />
                                    <span className="text-slate-400 py-2">/</span>
                                    <input 
                                        className="w-full p-2 border rounded text-sm" 
                                        placeholder="Total (ex: 100)" 
                                        value={watchForm.limitedTotal}
                                        onChange={e => setWatchForm({...watchForm, limitedTotal: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* NOUVEAU : VISIBILITE (V41.0) */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {watchForm.publicVisible ? <Eye className="text-indigo-600 mr-2" size={20}/> : <EyeOff className="text-slate-400 mr-2" size={20}/>}
                                    <span className="text-sm font-bold text-slate-700">Visible par les amis</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={watchForm.publicVisible !== false}
                                    onChange={e => setWatchForm({...watchForm, publicVisible: e.target.checked})}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 pl-8">Si décoché, cette montre restera privée dans votre coffre.</p>
                        </div>
                    </div>
                    {watchForm.status === 'wishlist' ? (
                        <div className="space-y-3"><h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Lien Web</h3><input className="w-full p-3 border rounded-lg" placeholder="https://..." value={watchForm.link} onChange={e => setWatchForm({...watchForm, link: e.target.value})} /></div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Technique</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Diamètre (mm)" type="number" value={watchForm.diameter} onChange={e => setWatchForm({...watchForm, diameter: e.target.value})} />
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Épaisseur (mm)" type="number" value={watchForm.thickness} onChange={e => setWatchForm({...watchForm, thickness: e.target.value})} />
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Entre-corne (mm)" type="number" value={watchForm.strapWidth} onChange={e => setWatchForm({...watchForm, strapWidth: e.target.value})} />
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Étanchéité (ATM)" type="number" value={watchForm.waterResistance} onChange={e => setWatchForm({...watchForm, waterResistance: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Mouvement" value={watchForm.movement} onChange={e => setWatchForm({...watchForm, movement: e.target.value})} />
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Verre" value={watchForm.glass} onChange={e => setWatchForm({...watchForm, glass: e.target.value})} />
                                </div>
                                
                                {/* NOUVEAU : DETECTION PILE POUR QUARTZ */}
                                {['quartz', 'pile', 'battery', 'electronic', 'électronique'].some(k => (watchForm.movement || '').toLowerCase().includes(k)) && (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 animate-in slide-in-from-top-1">
                                        <div className="flex items-center gap-2 mb-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
                                            <Battery size={14}/> Alimentation
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                className="w-full p-3 border rounded-lg text-sm" 
                                                placeholder="Modèle de pile (ex: 377, CR2032...)" 
                                                value={watchForm.batteryModel || ''} 
                                                onChange={e => setWatchForm({...watchForm, batteryModel: e.target.value})} 
                                            />
                                            {watchForm.batteryModel && (
                                                <a 
                                                    href={`https://www.amazon.fr/s?k=pile+${watchForm.batteryModel}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="bg-blue-600 text-white px-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                                                    title="Commander"
                                                >
                                                    <ShoppingCart size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* NOUVEAU : DETAILS AUTO/MECA (V41.0) */}
                                {['auto', 'meca', 'automatic', 'automatique', 'mécanique', 'mechanic'].some(k => (watchForm.movement || '').toLowerCase().includes(k)) && (
                                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1">
                                        <div className="relative">
                                            <input className="w-full p-3 pl-8 border rounded-lg text-sm" placeholder="Réserve (h)" value={watchForm.powerReserve || ''} onChange={e => setWatchForm({...watchForm, powerReserve: e.target.value})} />
                                            <div className="absolute left-2.5 top-3.5 text-slate-400"><Zap size={14}/></div>
                                        </div>
                                        <div className="relative">
                                            <input className="w-full p-3 pl-8 border rounded-lg text-sm" placeholder="Nb Rubis" value={watchForm.jewels || ''} onChange={e => setWatchForm({...watchForm, jewels: e.target.value})} />
                                            <div className="absolute left-2.5 top-3.5 text-slate-400"><Gem size={14}/></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Origine</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Pays" value={watchForm.country} onChange={e => setWatchForm({...watchForm, country: e.target.value})} />
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Année" type="number" value={watchForm.year} onChange={e => setWatchForm({...watchForm, year: e.target.value})} />
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Boîte" value={watchForm.box} onChange={e => setWatchForm({...watchForm, box: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Garantie" value={watchForm.warrantyDate} onChange={e => setWatchForm({...watchForm, warrantyDate: e.target.value})} />
                                    <input className="p-3 border rounded-lg text-sm" placeholder="Révision" value={watchForm.revision} onChange={e => setWatchForm({...watchForm, revision: e.target.value})} />
                                </div>
                            </div>
                        </>
                    )}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Finances & Statut</h3>
                        <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full p-3 border rounded-lg" placeholder={watchForm.status === 'wishlist' ? "Prix (Optionnel)" : "Prix Achat (€)"} value={watchForm.purchasePrice} onChange={e => setWatchForm({...watchForm, purchasePrice: e.target.value})} />
                        {watchForm.status !== 'wishlist' && <input type="number" className="w-full p-3 border rounded-lg" placeholder={watchForm.status === 'sold' ? "Prix de Vente Final (€)" : "Estimation (€)"} value={watchForm.sellingPrice} onChange={e => setWatchForm({...watchForm, sellingPrice: e.target.value})} />}
                        </div>
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                        {[{id: 'collection', label: 'Ma Collection'}, {id: 'forsale', label: 'En Vente'}, {id: 'sold', label: 'Vendu'}, {id: 'wishlist', label: 'Souhait ❤️'}].map(s => (
                            <button key={s.id} type="button" onClick={() => setWatchForm({...watchForm, status: s.id})} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border whitespace-nowrap ${watchForm.status === s.id ? 'bg-slate-800 text-white' : 'bg-white'}`}>{s.label}</button>
                        ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Notes & Commentaires</h3>
                        <textarea className="w-full p-3 border rounded-lg min-h-[100px]" placeholder="État, histoire, détails..." value={watchForm.conditionNotes} onChange={e => setWatchForm({...watchForm, conditionNotes: e.target.value})} />
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Caractéristiques</h3>
                        <div className="grid grid-cols-2 gap-3">
                             <input className="p-3 border rounded-lg text-sm" placeholder="Largeur (mm)" type="number" value={braceletForm.width} onChange={e => setBraceletForm({...braceletForm, width: e.target.value})} required />
                             <input className="p-3 border rounded-lg text-sm" placeholder="Type (Nato, Cuir...)" value={braceletForm.type} onChange={e => setBraceletForm({...braceletForm, type: e.target.value})} />
                        </div>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50">
                            <input type="checkbox" checked={braceletForm.quickRelease} onChange={e => setBraceletForm({...braceletForm, quickRelease: e.target.checked})} className="w-4 h-4 text-slate-800 rounded"/>
                            <span className="text-sm text-slate-700">Pompe Flash (Changement rapide) ?</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                         <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Notes</h3>
                         <textarea className="w-full p-3 border rounded-lg min-h-[80px]" placeholder="Couleur, matière, boucle..." value={braceletForm.notes} onChange={e => setBraceletForm({...braceletForm, notes: e.target.value})} />
                    </div>
                </>
            )}
            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform">Sauvegarder</button>
          </form>
        </div>
      );
  };
  const handleCancelForm = () => {
      setEditingId(null);
      setWatchForm(DEFAULT_WATCH_STATE);
      setBraceletForm(DEFAULT_BRACELET_STATE);
      if (selectedWatch) { setView('detail'); } else { setView('list'); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/><button onClick={() => setLoading(false)} className="ml-2 text-xs">Skip</button></div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 scrollbar-hide">
            {view === 'box' && renderBox()}
            {view === 'finance' && renderFinance()}
            {view === 'list' && renderList()}
            {view === 'wishlist' && renderWishlist()}
            {view === 'detail' && renderDetail()}
            {view === 'add' && renderForm()}
            {view === 'summary' && renderSummary()}
            {view === 'profile' && renderProfile()}
            {view === 'friends' && renderFriends()}
        </div>
        
        {/* NOUVEAU: RENDER DU MODAL PLEIN ECRAN */}
        {renderFullScreenImage()}

        {authDomainError && (
            <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <AlertTriangle size={32} />
                        <h3 className="font-bold text-lg leading-tight">Domaine non autorisé</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                        Firebase bloque la connexion car ce site de prévisualisation n'est pas dans la liste blanche.
                    </p>
                    <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 mb-4">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Domaine à ajouter</div>
                        <div className="flex items-center justify-between">
                            <code className="text-sm font-mono text-slate-800 break-all">{authDomainError}</code>
                            <button onClick={() => navigator.clipboard.writeText(authDomainError)} className="ml-2 p-1 hover:bg-slate-200 rounded"><Copy size={14}/></button>
                        </div>
                    </div>
                    <ol className="text-xs text-slate-500 list-decimal pl-4 space-y-1 mb-6">
                        <li>Allez dans la <b>Console Firebase</b></li>
                        <li>Menu <b>Authentication</b> {'>'} <b>Settings</b></li>
                        <li>Onglet <b>Authorized Domains</b></li>
                        <li>Cliquez sur <b>Add Domain</b> et collez le lien ci-dessus.</li>
                    </ol>
                    <button onClick={() => setAuthDomainError(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">J'ai compris</button>
                </div>
            </div>
        )}

        {view !== 'add' && (
          <nav className="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-between px-4 py-2 z-50 text-[10px] font-medium text-slate-400">
            <button onClick={() => setView('box')} className={`flex flex-col items-center w-1/6 ${view === 'box' ? 'text-amber-800' : ''}`}><Box size={20}/><span className="mt-1">Coffre</span></button>
            <button onClick={() => { setFilter('all'); setView('list'); }} className={`flex flex-col items-center w-1/6 ${view === 'list' ? 'text-slate-900' : ''}`}><Watch size={20}/><span className="mt-1">Liste</span></button>
            <button onClick={() => setView('wishlist')} className={`flex flex-col items-center w-1/6 ${view === 'wishlist' ? 'text-rose-600' : ''}`}><Heart size={20}/><span className="mt-1">Souhaits</span></button>
            <button onClick={() => openAdd()} className="flex-none flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg -mt-4 border-2 border-slate-50"><Plus size={24}/></button>
            <button onClick={() => setView('finance')} className={`flex flex-col items-center w-1/6 ${view === 'finance' ? 'text-emerald-700' : ''}`}><TrendingUp size={20}/><span className="mt-1">Finance</span></button>
            <button onClick={() => setView('friends')} className={`flex flex-col items-center w-1/6 ${view === 'friends' ? 'text-indigo-600' : ''}`}><Users size={20}/><span className="mt-1">Amis</span></button>
            <button onClick={() => setView('profile')} className={`flex flex-col items-center w-1/6 ${view === 'profile' ? 'text-slate-900' : ''}`}><Grid size={20}/><span className="mt-1">Galerie</span></button>
          </nav>
        )}
        
        {showConfigModal && <ConfigModal onClose={() => setShowConfigModal(false)} currentError={globalInitError} />}
        {showRulesHelp && <RulesHelpModal onClose={() => setShowRulesHelp(false)} />}
      </div>
    </div>
  );
}
