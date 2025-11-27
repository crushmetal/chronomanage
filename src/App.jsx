import React, { useState, useEffect, useMemo } from 'react';
import { 
  Watch, Plus, TrendingUp, Trash2, Edit2, Camera, X,
  Search, Clock, AlertCircle,
  Package, DollarSign, FileText, Box, Loader2,
  ChevronLeft, ClipboardList, WifiOff, Ruler, Calendar, LogIn, LogOut, User, AlertTriangle, MapPin, Droplets, ShieldCheck, Layers, Wrench, Activity, Heart, Download, ExternalLink, Settings, Grid, ArrowUpDown, Shuffle, Save, Copy, Palette, Cloud, CheckCircle2
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

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
const APP_ID_STABLE = 'chrono-manager-universal'; 
const APP_VERSION = "v39.7"; 

const DEFAULT_WATCH_STATE = {
    brand: '', model: '', reference: '', 
    diameter: '', year: '', movement: '',
    country: '', waterResistance: '', glass: '', strapWidth: '', thickness: '', 
    dialColor: '', // Nouveau champ
    box: '', warrantyDate: '', revision: '',
    purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', link: '', image: null
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
        globalInitError = e.message; 
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
            <span className="font-medium text-sm text-slate-800 truncate block">{value || '-'}</span>
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
        const MAX_WIDTH = 600; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
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
    <div className="font-mono text-4xl font-light text-slate-600 tracking-wider mb-2">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

// --- COMPOSANTS EXTERNALISÉS ---

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
            <h2 className="font-bold text-lg text-slate-800">{title}</h2>
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
               const profit = (w.sellingPrice || 0) - (w.purchasePrice || 0);
               return (
                 <div key={w.id} className="flex items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                     <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0 mr-3 border border-slate-200">{w.image && <img src={w.image} className="w-full h-full object-cover"/>}</div>
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
                    <span className={`font-bold text-lg ${txtMain}`}>{title}</span>
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
                            {currentError}
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

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('box'); 
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState('watch');

  const [selectedWatch, setSelectedWatch] = useState(null);
  const [financeDetail, setFinanceDetail] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date');
  const [error, setError] = useState(null); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBoxOpening, setIsBoxOpening] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false); 
  const [authDomainError, setAuthDomainError] = useState(null); 
  
  const [isAuthLoading, setIsAuthLoading] = useState(false); // New state for loading spinners

  const [watchForm, setWatchForm] = useState(DEFAULT_WATCH_STATE);
  const [braceletForm, setBraceletForm] = useState(DEFAULT_BRACELET_STATE);

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

  // --- ICONE APP (FAVICON) ---
  useEffect(() => {
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

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    if (!firebaseReady) {
        setShowConfigModal(true);
        return;
    }
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

  // --- AUTH EFFECT ---
  useEffect(() => {
    if (useLocalStorage) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
          setUser(currentUser);
          setError(null);
          setLoading(false);
      } else {
          // Utilisation d'un timeout pour éviter le flash blanc si l'auth Google est en cours
          // On ne passe en mode anonyme que si vraiment rien ne se passe
          const timer = setTimeout(() => {
              // On vérifie qu'on n'est pas déjà en train de se logger via le bouton
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

  // --- DATA LOADING ---
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
        }, (err) => { setError("Erreur lecture DB"); setUseLocalStorage(true); setLoading(false); });

        const qB = query(collection(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'bracelets'));
        const unsubB = onSnapshot(qB, (snap) => setBracelets(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded))));
        return () => { unsubW(); unsubB(); };
      } catch(e) { setUseLocalStorage(true); setLoading(false); }
    }
  }, [user, useLocalStorage]);

  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watches));
      localStorage.setItem(LOCAL_STORAGE_BRACELETS_KEY, JSON.stringify(bracelets));
    }
  }, [watches, bracelets, useLocalStorage]);

  // --- ACTIONS ---
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try { 
        const base64 = await compressImage(file); 
        if (type === 'watch') setWatchForm(prev => ({ ...prev, image: base64 }));
        else setBraceletForm(prev => ({ ...prev, image: base64 }));
      } catch (err) { alert("Erreur image"); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = editingId || Date.now().toString();
    const isWatch = editingType === 'watch';
    const data = isWatch 
      ? { ...watchForm, id, purchasePrice: Number(watchForm.purchasePrice), sellingPrice: Number(watchForm.sellingPrice), dateAdded: new Date().toISOString() }
      : { ...braceletForm, id, dateAdded: new Date().toISOString() };

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
    const headers = ["Marque", "Modele", "Reference", "Couleur Cadran", "Diametre (mm)", "Entre-corne (mm)", "Annee", "Mouvement", "Pays", "Etanch.", "Verre", "Boite", "Garantie", "Revision", "Prix Achat", "Prix Vente", "Estimation", "Statut", "Notes", "Lien"];
    csvContent += headers.join(sep) + "\n";
    watches.forEach(w => {
      const row = [
        w.brand, w.model, w.reference, w.dialColor, w.diameter, w.strapWidth, w.year, w.movement, w.country, w.waterResistance, w.glass, w.box, w.warrantyDate, w.revision, w.purchasePrice, w.sellingPrice, w.status, 
        w.conditionNotes ? w.conditionNotes.replace(/(\r\n|\n|\r|;)/gm, " ") : "", 
        w.link
      ].map(e => `"${(e || '').toString().replace(/"/g, '""')}"`); 
      csvContent += row.join(sep) + "\n";
    });
    bracelets.forEach(b => {
      const row = [
        "BRACELET", b.type, "", "", "", b.width, "", "", "", "", "", "", "", "", "", "", "actif", 
        (b.notes + (b.quickRelease ? " (Quick Release)" : "")).replace(/(\r\n|\n|\r|;)/gm, " "), 
        ""
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
        if(selectedWatch) setSelectedWatch(data);
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
      if (type === 'watch') setWatchForm({ ...DEFAULT_WATCH_STATE, ...item });
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
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filtered = filtered.filter(w => (w.brand && w.brand.toLowerCase().includes(lower)) || (w.model && w.model.toLowerCase().includes(lower)));
    }
    let sorted = [...filtered];
    if (sortOrder === 'alpha') {
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

  // --- COMPOSANTS VUE ---

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
                className={`flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 text-xs font-medium transition-all active:scale-95 ${isConfigMissing ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-white/90 text-slate-700 hover:bg-slate-50'}`}
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
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-slate-200 transition-transform active:scale-95">
              {/* Ajout du referrerPolicy pour éviter les 403 de Google */}
              {user.photoURL ? <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white"><span className="text-xs font-bold">{user.email ? user.email[0].toUpperCase() : 'U'}</span></div>}
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
            <h2 className="font-bold text-lg text-slate-800">{title}</h2>
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
               const profit = (w.sellingPrice || 0) - (w.purchasePrice || 0);
               return (
                 <div key={w.id} className="flex items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                     <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0 mr-3 border border-slate-200">{w.image && <img src={w.image} className="w-full h-full object-cover"/>}</div>
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
                    <span className={`font-bold text-lg ${txtMain}`}>{title}</span>
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
            <h1 className="text-xl font-bold text-slate-800 tracking-tight px-1">Finances</h1>
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

  const renderBox = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] px-8 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-200">
      {renderHeaderControls()}
      <div className="mb-4 text-center"><LiveClock /></div>
      <div onClick={handleBoxClick} className="flex items-center justify-center w-72 h-64 cursor-pointer transform transition-transform active:scale-95 hover:scale-105 duration-300 z-10" title="Ouvrir">
        <WatchBoxLogo isOpen={isBoxOpening} />
      </div>
      <div className="absolute bottom-24 flex flex-col items-center z-0">
        <p className="text-slate-800 font-medium text-sm mb-2 tracking-wide">{activeWatchesCount} {activeWatchesCount > 1 ? 'montres' : 'montre'}</p>
        {!firebaseReady && (<div className="inline-flex items-center justify-center text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 opacity-60"><WifiOff size={10} className="mr-1"/> Mode Local</div>)}
      </div>
    </div>
  );

  const renderHeader = (title, withFilters = false) => (
    <div className="sticky top-0 bg-white z-10 pt-2 pb-2 px-1 shadow-sm border-b border-slate-100">
      <div className="flex justify-between items-center px-2 mb-2">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <div className="flex items-center gap-2">
            {(title === "Collection" || title === "Inventaire" || title === "Galerie") && (
                <button 
                    onClick={() => setSortOrder(prev => prev === 'date' ? 'alpha' : prev === 'alpha' ? 'random' : 'date')} 
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-1 bg-slate-50"
                >
                    {sortOrder === 'random' ? <Shuffle size={16} /> : <ArrowUpDown size={16} />}
                    <span className="text-[10px] font-medium w-9 text-center">
                        {sortOrder === 'date' ? 'Date' : sortOrder === 'alpha' ? 'A-Z' : 'Aléat.'}
                    </span>
                </button>
            )}
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchTerm(''); }} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Search size={18} /></button>
        </div>
      </div>
      {isSearchOpen && (<div className="px-2 mb-3 animate-in fade-in slide-in-from-top-2"><input autoFocus type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"/></div>)}
      {withFilters && !isSearchOpen && (
        <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar px-2 pb-1">
            {['all', 'collection', 'forsale', 'sold', 'bracelets'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter===f ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {f === 'all' ? 'Tout' : f === 'collection' ? 'Ma Collection' : f === 'forsale' ? 'En Vente' : f === 'sold' ? 'Vendu' : 'Bracelets'}
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
          {displayWatches.map(w => (
            <Card key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }}>
              <div className="aspect-square bg-slate-50 relative">
                {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera/></div>}
                <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm border border-slate-100">
                    {w.status === 'sold' ? <span className="text-emerald-600">VENDU</span> : formatPrice(w.sellingPrice || w.purchasePrice)}
                </div>
              </div>
              <div className="p-3">
                  <div className="font-bold text-sm truncate text-slate-800">{w.brand}</div>
                  <div className="text-xs text-slate-500 truncate">{w.model}</div>
              </div>
            </Card>
          ))}
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
          {/* BOUTON D'AJOUT EXPLICITE EN HAUT DE LISTE */}
          <button 
            onClick={() => openAdd()}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-medium hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Plus className="mr-2" size={20}/> Ajouter un souhait
          </button>

          {wishes.map(w => (
            <Card key={w.id} className="flex p-3 gap-3" onClick={() => { setSelectedWatch(w); setView('detail'); }}>
                <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Heart size={20}/></div>}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div><h3 className="font-bold text-slate-800">{w.brand}</h3><p className="text-xs text-slate-500">{w.model}</p></div>
                    <div className="flex justify-between items-end">
                        <div className="font-semibold text-emerald-600">{formatPrice(w.purchasePrice)}</div>
                        {w.link && <a href={w.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100"><ExternalLink size={14} /></a>}
                    </div>
                </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if(!selectedWatch) return null;
    const w = selectedWatch;
    const compatibleBracelets = w.strapWidth ? bracelets.filter(b => b.width === w.strapWidth) : [];
    return (
      <div className="pb-24 bg-white min-h-screen">
        <div className="sticky top-0 bg-white/90 backdrop-blur p-4 flex items-center justify-between border-b z-10">
          <button onClick={() => { setSelectedWatch(null); setView(w.status === 'wishlist' ? 'wishlist' : 'list'); }}><ChevronLeft/></button>
          <span className="font-bold text-slate-800">Détails</span>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(w, 'watch')} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100"><Edit2 size={18}/></button>
            <button onClick={() => handleDelete(w.id, 'watch')} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"><Trash2 size={18}/></button>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="space-y-4">
              <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center"><Camera size={48} className="text-slate-300"/></div>}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 leading-tight">{w.brand}</h1>
                <p className="text-xl text-slate-600 font-medium">{w.model}</p>
                {w.reference && <span className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 inline-block border font-mono text-slate-500">REF: {w.reference}</span>}
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
                     <DetailItem icon={Search} label="Verre" value={w.glass} />
                     <DetailItem icon={MapPin} label="Pays" value={w.country} />
                     <DetailItem icon={Calendar} label="Année" value={w.year} />
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
                            {list.map(w => (
                                <div key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }} className="flex items-center p-2 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <div className="w-8 h-8 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 mr-3 border border-slate-100">
                                        {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera size={14}/></div>}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-baseline gap-1 overflow-hidden">
                                        <span className="font-bold text-sm text-slate-900 whitespace-nowrap">{w.brand}</span>
                                        <span className="text-xs text-slate-500 truncate">{w.model}</span>
                                    </div>
                                    <ChevronLeft className="text-slate-300 rotate-180 flex-shrink-0 ml-1" size={14}/>
                                </div>
                            ))}
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
      {renderHeader("Galerie")}
      <div className="grid grid-cols-3 gap-1 mt-2 px-1">
          {filteredWatches.filter(w => w.image).map(w => (
              <div key={w.id} className="aspect-square bg-slate-100 rounded overflow-hidden relative cursor-pointer" onClick={() => { setSelectedWatch(w); setView('detail'); }}>
                  <img src={w.image} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] p-1 truncate">{w.model}</div>
              </div>
          ))}
      </div>
    </div>
  );

  const renderForm = () => {
      const isWatch = editingType === 'watch';
      return (
        <div className="pb-24 p-4">
          <div className="flex justify-between items-center mb-6 mt-2"><h1 className="text-2xl font-bold">{editingId ? 'Modifier' : 'Ajouter'} {isWatch ? 'Montre' : 'Bracelet'}</h1><button onClick={() => handleCancelForm()}><X/></button></div>
          {!editingId && filter === 'all' && (
              <div className="flex mb-6 p-1 bg-slate-100 rounded-lg">
                  <button onClick={() => setEditingType('watch')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isWatch ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Montre</button>
                  <button onClick={() => setEditingType('bracelet')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isWatch ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Bracelet</button>
              </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden hover:bg-slate-50">
              {(isWatch ? watchForm.image : braceletForm.image) ? <img src={isWatch ? watchForm.image : braceletForm.image} className="w-full h-full object-cover"/> : <div className="text-center text-slate-400"><Camera className="mx-auto mb-2"/><span className="text-xs">Ajouter Photo</span></div>}
              <input type="file" onChange={(e) => handleImageUpload(e, isWatch ? 'watch' : 'bracelet')} className="hidden"/>
            </label>
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
        <div className="h-full overflow-y-auto p-4 scrollbar-hide">
            {view === 'box' && renderBox()}
            {view === 'finance' && renderFinance()}
            {view === 'list' && renderList()}
            {view === 'wishlist' && renderWishlist()}
            {view === 'detail' && renderDetail()}
            {view === 'add' && renderForm()}
            {view === 'summary' && renderSummary()}
            {view === 'profile' && renderProfile()}
        </div>
        
        {/* BANNIÈRE AIDE DOMAINE */}
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
            <button onClick={() => setView('summary')} className={`flex flex-col items-center w-1/6 ${view === 'summary' ? 'text-indigo-600' : ''}`}><ClipboardList size={20}/><span className="mt-1">Inventaire</span></button>
            <button onClick={() => setView('profile')} className={`flex flex-col items-center w-1/6 ${view === 'profile' ? 'text-slate-900' : ''}`}><Grid size={20}/><span className="mt-1">Galerie</span></button>
          </nav>
        )}
        
        {/* MODALE CONFIG */}
        {showConfigModal && <ConfigModal onClose={() => setShowConfigModal(false)} currentError={globalInitError} />}
      </div>
    </div>
  );
}
}
