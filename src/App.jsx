import React, { useState, useEffect } from 'react';
import { 
  Watch, Plus, TrendingUp, Trash2, Edit2, Camera, X,
  LayoutDashboard, Search, ArrowUpRight, ArrowDownRight, Clock, AlertCircle,
  Package, DollarSign, FileText, Box, Cloud, CloudOff, Loader2,
  ChevronLeft, ClipboardList, WifiOff, Ruler, Calendar, LogIn, LogOut, User, AlertTriangle, MapPin, Droplets, ShieldCheck, Layers, Wrench
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

// ==========================================================================
// CONFIGURATION
// ==========================================================================
const productionConfig = {
apiKey: "AIzaSyAB4nISY14ctmHxgAMaVEG0nzGesvPgSc8",
  authDomain: "chronomanage-cfe36.firebaseapp.com",
  projectId: "chronomanage-cfe36",
  storageBucket: "chronomanage-cfe36.firebasestorage.app",
  messagingSenderId: "449745267926",
  appId: "1:449745267926:web:f218d0a1ece65b9dc7ad77"
};

// ==========================================================================
// INITIALISATION
// ==========================================================================
let app, auth, db;
let firebaseReady = false;

// NOMS DE STOCKAGE FIXES (POUR NE PLUS PERDRE LES DONNEES)
const LOCAL_STORAGE_KEY = 'chrono_manager_universal_db';
const APP_ID_STABLE = 'chrono-manager-universal'; 

const hasValidKeys = productionConfig.apiKey && !productionConfig.apiKey.includes("VOTRE_API_KEY");
let configToUse = productionConfig;

if (typeof __firebase_config !== 'undefined') {
  try { configToUse = JSON.parse(__firebase_config); firebaseReady = true; } catch(e) {}
} else if (hasValidKeys) {
  firebaseReady = true;
}

if (firebaseReady) {
  try {
    app = initializeApp(configToUse);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Erreur Init Firebase:", e);
    firebaseReady = false;
  }
}

// --- UTILS ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>{children}</div>
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

const WatchBoxLogo = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5D4037" />
        <stop offset="100%" stopColor="#3E2723" />
      </linearGradient>
      <linearGradient id="cushionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#6D4C41" />
      </linearGradient>
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
      </linearGradient>
    </defs>
    <path d="M20,60 L180,60 L180,110 C180,112 178,114 176,114 L24,114 C22,114 20,112 20,110 Z" fill="url(#leatherGrad)" stroke="#271c19" strokeWidth="1"/>
    <path d="M24,60 L24,106 L176,106 L176,60 L24,60" fill="none" stroke="#3E2723" strokeWidth="2"/>
    <rect x="25" y="65" width="150" height="40" rx="2" fill="#3E2723" />
    <g transform="translate(28, 68)">
      {[0, 25, 50, 75, 100, 125].map((x, i) => (
        <g key={i} transform={`translate(${x}, 0)`}>
          <rect x="2" y="2" width="21" height="30" rx="4" fill="#8D6E63" />
          <path d="M12,2 L12,32" stroke="#5D4037" strokeWidth="1" opacity="0.5" />
        </g>
      ))}
    </g>
    <rect x="94" y="60" width="12" height="10" rx="1" fill="#FFC107" stroke="#B7880B" strokeWidth="1" />
    <path d="M20,60 L180,60 L170,10 L30,10 Z" fill="url(#leatherGrad)" stroke="#3E2723" strokeWidth="1" opacity="0.95"/>
    <path d="M35,55 L165,55 L158,18 L42,18 Z" fill="url(#glassGrad)" stroke="#8D6E63" strokeWidth="1"/>
  </svg>
);

// --- Application ---

export default function App() {
  const [useLocalStorage, setUseLocalStorage] = useState(!firebaseReady);
  const [user, setUser] = useState(useLocalStorage ? { uid: 'local-user' } : null);
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(!useLocalStorage);
  const [view, setView] = useState('box'); 
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // --- GESTION CONNEXION ---
  const handleGoogleLogin = async () => {
    if (!firebaseReady) return alert("Le Cloud n'est pas configuré.");
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (error) { console.error("Erreur connexion", error); alert("Erreur de connexion : " + error.message); }
  };

  const handleLogout = async () => {
    if (!firebaseReady) return;
    try { await signOut(auth); signInAnonymously(auth).catch(() => setUseLocalStorage(true)); setShowProfileMenu(false); } 
    catch (error) { console.error("Erreur déconnexion", error); }
  };

  // --- AUTHENTIFICATION ---
  useEffect(() => {
    if (useLocalStorage) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); setLoading(false); setError(null); } 
      else {
        signInAnonymously(auth).catch((err) => {
          setUseLocalStorage(true); setUser({ uid: 'local-user' }); setLoading(false);
        });
      }
    });
    return () => unsubscribe();
  }, [useLocalStorage]);

  // --- CHARGEMENT ET MIGRATION ---
  useEffect(() => {
    if (!user && !useLocalStorage) return;

    if (useLocalStorage) {
      try {
        let local = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        // --- RESTAURATION DES DONNEES PERDUES ---
        // Si la base principale est vide, on cherche dans TOUTES les anciennes versions
        if (!local || local === '[]') {
           const rescueKeys = [
             'chrono_v16_data', 'chrono_v15_data', 'chrono_v14_data', 'chrono_v10_data', 
             'chrono_v9_local', 'chrono_manager_v9', 'chronoManager_prod_v1', 
             'chronoManager_local_v8'
           ];
           for (const key of rescueKeys) {
             const oldData = localStorage.getItem(key);
             if (oldData && oldData !== '[]' && oldData.length > 5) { 
                local = oldData; 
                // On sauvegarde immédiatement dans la nouvelle clé stable
                localStorage.setItem(LOCAL_STORAGE_KEY, local);
                break; 
             }
           }
        }
        
        if (local) setWatches(JSON.parse(local));
      } catch(e){}
      setLoading(false);
    } else {
      // Mode Cloud
      try {
        const q = query(collection(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches'));
        const unsub = onSnapshot(q, (snap) => {
          setWatches(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded)));
          setLoading(false);
        }, (err) => { setError("Erreur lecture DB"); setUseLocalStorage(true); setLoading(false); });
        return () => unsub();
      } catch(e) { setUseLocalStorage(true); setLoading(false); }
    }
  }, [user, useLocalStorage]);

  // SAVE LOCAL (Stable)
  useEffect(() => {
    if (useLocalStorage) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watches));
  }, [watches, useLocalStorage]);

  // --- ACTIONS ---
  const [formData, setFormData] = useState({
    brand: '', model: '', reference: '', 
    diameter: '', year: '', movement: '',
    country: '', waterResistance: '', glass: '', strapWidth: '', thickness: '', box: '', warrantyDate: '', revision: '', // Ajout revision
    purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', image: null
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try { const base64 = await compressImage(file); setFormData(prev => ({ ...prev, image: base64 })); } catch (err) { alert("Erreur image"); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = editingId || Date.now().toString();
    const newWatch = { 
      id, ...formData, 
      purchasePrice: Number(formData.purchasePrice), 
      sellingPrice: Number(formData.sellingPrice), 
      dateAdded: new Date().toISOString() 
    };

    if (useLocalStorage) {
      setWatches(prev => editingId ? prev.map(w => w.id === id ? newWatch : w) : [newWatch, ...prev]);
      closeForm(newWatch);
    } else {
      try { await setDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches', id), newWatch); closeForm(newWatch); }
      catch(e) { alert("Erreur Cloud: " + e.message); }
    }
  };

  const closeForm = (w) => { if(selectedWatch) setSelectedWatch(w); setFilter('all'); setView('list'); setEditingId(null); resetForm(); };
  const resetForm = () => setFormData({ 
    brand: '', model: '', reference: '', 
    diameter: '', year: '', movement: '',
    country: '', waterResistance: '', glass: '', strapWidth: '', thickness: '', box: '', warrantyDate: '', revision: '',
    purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', image: null 
  });
  const handleEdit = (w) => { setFormData(w); setEditingId(w.id); setView('add'); };
  const handleDelete = async (id) => {
    if(!confirm("Supprimer ?")) return;
    if(useLocalStorage) { setWatches(prev => prev.filter(w => w.id !== id)); setView('list'); }
    else { await deleteDoc(doc(db, 'artifacts', APP_ID_STABLE, 'users', user.uid, 'watches', id)); setView('list'); }
  };

  const getFilteredWatches = () => {
    if (!searchTerm) return watches;
    const lower = searchTerm.toLowerCase();
    return watches.filter(w => (w.brand && w.brand.toLowerCase().includes(lower)) || (w.model && w.model.toLowerCase().includes(lower)));
  };
  const filteredList = getFilteredWatches();

  const renderHeaderControls = () => {
    if (useLocalStorage && !hasValidKeys) return null;
    return (
      <div className="absolute top-4 right-4 z-20">
        {!user || user.isAnonymous ? (
          <button onClick={handleGoogleLogin} className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <LogIn size={14} /><span className="hidden sm:inline">Connexion</span>
          </button>
        ) : (
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-slate-200 transition-transform active:scale-95">
              {user.photoURL ? <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white"><span className="text-xs font-bold">{user.email ? user.email[0].toUpperCase() : 'U'}</span></div>}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 z-30">
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Connecté</p>
                  <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                </div>
                <button onClick={() => { handleLogout(); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"><LogOut size={16} /> Déconnexion</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // --- VUES ---

  const renderBox = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 relative">
      {renderHeaderControls()}
      <h1 className="text-xl font-serif text-slate-800 mb-4 tracking-widest uppercase">Écrin Privé</h1>
      <div className="w-64 h-64 transition-transform hover:scale-105 duration-500"><WatchBoxLogo /></div>
      <div className="mt-6 w-full max-w-xs text-center">
        {!hasValidKeys && (<div className="inline-flex items-center justify-center text-amber-600 text-xs bg-amber-50 px-3 py-1 rounded-full border border-amber-100"><WifiOff size={12} className="mr-1"/> Mode Local (Démo)</div>)}
        {hasValidKeys && error && (<div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center mb-3"><p className="text-xs text-red-800 font-bold flex items-center justify-center"><AlertTriangle size={12} className="mr-1"/> Problème Cloud</p><p className="text-[10px] text-red-600 mt-1">{error}</p></div>)}
      </div>
      <p className="mt-4 text-slate-800 font-medium">{watches.length} montres</p>
      <button onClick={() => setView('list')} className="mt-8 px-10 py-3 bg-slate-900 text-white rounded-full shadow-xl active:scale-95 transition-transform">Entrer</button>
    </div>
  );

  const renderHeader = (title, withFilters = false) => (
    <div className="sticky top-0 bg-slate-50 z-10 pt-2 pb-2 px-1 shadow-sm">
      <div className="flex justify-between items-center px-1 mb-2">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <button onClick={() => { setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchTerm(''); }} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Search size={20} /></button>
      </div>
      {isSearchOpen && (<div className="px-1 mb-3 animate-in fade-in slide-in-from-top-2"><input autoFocus type="text" placeholder="Rechercher marque, modèle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"/></div>)}
      {withFilters && !isSearchOpen && (<div className="flex gap-1 overflow-x-auto max-w-full no-scrollbar px-1 pb-1">{['all', 'collection', 'forsale', 'sold'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${filter===f ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600'}`}>{f === 'all' ? 'Tout' : f === 'collection' ? 'Ma Collec' : f === 'forsale' ? 'Vente' : 'Vendu'}</button>))}</div>)}
    </div>
  );

  const renderList = () => {
    const displayWatches = filteredList.filter(w => { if (filter === 'all') return true; if (filter === 'collection') return w.status === 'collection'; if (filter === 'forsale') return w.status === 'forsale'; if (filter === 'sold') return w.status === 'sold'; return true; });
    return (
      <div className="pb-24 px-2">
        {renderHeader("Collection", true)}
        <div className="grid grid-cols-2 gap-3 px-1 mt-2">
          {displayWatches.map(w => (
            <Card key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }}>
              <div className="aspect-square bg-slate-100 relative">
                {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera/></div>}
                <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">{w.status === 'sold' ? 'VENDU' : formatPrice(w.sellingPrice || w.purchasePrice)}</div>
              </div>
              <div className="p-3"><div className="font-bold text-sm truncate">{w.brand}</div><div className="text-xs text-slate-500 truncate">{w.model}</div></div>
            </Card>
          ))}
        </div>
        {displayWatches.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Aucune montre trouvée.</div>}
      </div>
    );
  };

  const renderSummary = () => {
    const categories = [{ id: 'collection', title: 'Ma Collection', color: 'bg-blue-50 text-blue-800 border-blue-100', icon: Watch }, { id: 'forsale', title: 'En Vente', color: 'bg-amber-50 text-amber-800 border-amber-100', icon: TrendingUp }, { id: 'sold', title: 'Vendues', color: 'bg-emerald-50 text-emerald-800 border-emerald-100', icon: DollarSign }];
    const hasWatches = filteredList.length > 0;
    return (
      <div className="pb-24 px-2">
        {renderHeader("Inventaire")}
        <div className="space-y-6 px-1 mt-2">
          {categories.map(cat => {
            const list = filteredList.filter(w => w.status === cat.id);
            if(list.length === 0) return null;
            return (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`px-4 py-3 border-b flex items-center ${cat.color} border-opacity-50`}><cat.icon size={16} className="mr-2" /><h3 className="font-bold text-sm">{cat.title} <span className="opacity-60 text-xs font-normal">({list.length})</span></h3></div>
                <div className="divide-y divide-slate-100">
                    {list.map(w => (
                        <div key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }} className="flex items-center p-3 hover:bg-slate-50 cursor-pointer">
                            <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0 mr-3">{w.image && <img src={w.image} className="w-full h-full object-cover"/>}</div>
                            <div className="flex-1 min-w-0"><div className="font-medium text-sm text-slate-900 truncate">{w.brand}</div><div className="text-xs text-slate-500 truncate">{w.model}</div></div>
                            <div className="text-right"><div className="font-semibold text-xs text-slate-700">{cat.id === 'sold' ? formatPrice(w.sellingPrice) : formatPrice(w.purchasePrice)}</div><div className="text-[9px] text-slate-400 uppercase">{cat.id === 'sold' ? 'Vente' : 'Achat'}</div></div>
                        </div>
                    ))}
                </div>
              </div>
            );
          })}
          {!hasWatches && <div className="text-center text-slate-400 py-10 text-sm">Aucun résultat.</div>}
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if(!selectedWatch) return null;
    const w = selectedWatch;
    
    const DetailItem = ({ icon: Icon, label, value }) => (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center">
            <div className="bg-white p-2 rounded-full border border-slate-100 mr-3 text-slate-400">
                <Icon size={16} />
            </div>
            <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">{label}</span>
                <span className="font-medium text-sm text-slate-800">{value || '-'}</span>
            </div>
        </div>
    );

    return (
      <div className="pb-24 bg-white min-h-screen">
        <div className="sticky top-0 bg-white/90 backdrop-blur p-4 flex items-center justify-between border-b z-10">
          <button onClick={() => { setSelectedWatch(null); setView('list'); }}><ChevronLeft/></button>
          <span className="font-bold">Détails</span>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(w)} className="p-2 bg-slate-50 rounded-full"><Edit2 size={18}/></button>
            <button onClick={() => handleDelete(w.id)} className="p-2 bg-red-50 text-red-500 rounded-full"><Trash2 size={18}/></button>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          <div className="space-y-4">
              <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm border">
                {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center"><Camera size={48} className="text-slate-300"/></div>}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 leading-tight">{w.brand}</h1>
                <p className="text-xl text-slate-600 font-medium">{w.model}</p>
                {w.reference && <span className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 inline-block border font-mono text-slate-500">REF: {w.reference}</span>}
              </div>
          </div>

          <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Spécifications</h3>
              <div className="grid grid-cols-2 gap-3">
                 <DetailItem icon={Ruler} label="Diamètre" value={w.diameter ? w.diameter + ' mm' : ''} />
                 <DetailItem icon={Layers} label="Épaisseur" value={w.thickness ? w.thickness + ' mm' : ''} />
                 <DetailItem icon={Activity} label="Bracelet" value={w.strapWidth ? w.strapWidth + ' mm' : ''} />
                 <DetailItem icon={Droplets} label="Étanchéité" value={w.waterResistance ? w.waterResistance + ' ATM' : ''} />
                 <DetailItem icon={MovementIcon} label="Mouvement" value={w.movement} />
                 <DetailItem icon={Search} label="Verre" value={w.glass} />
                 <DetailItem icon={MapPin} label="Pays" value={w.country} />
                 <DetailItem icon={Calendar} label="Année" value={w.year} />
              </div>
          </div>

          <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Origine & Entretien</h3>
              <div className="grid grid-cols-2 gap-3">
                 <DetailItem icon={Package} label="Boîte" value={w.box} />
                 <DetailItem icon={ShieldCheck} label="Garantie" value={w.warrantyDate} />
                 <DetailItem icon={Wrench} label="Révision" value={w.revision} />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg border"><div className="text-xs text-slate-400 uppercase">Achat</div><div className="text-lg font-bold">{formatPrice(w.purchasePrice)}</div></div>
            <div className="p-3 bg-slate-50 rounded-lg border"><div className="text-xs text-slate-400 uppercase">{w.status === 'sold' ? 'Vente' : 'Estim.'}</div><div className="text-lg font-bold text-emerald-600">{formatPrice(w.sellingPrice)}</div>{w.status === 'sold' && <div className="text-xs text-emerald-600 mt-1">Profit: {formatPrice(w.sellingPrice - w.purchasePrice)}</div>}</div>
          </div>

          {w.conditionNotes && <div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-800 border border-amber-100"><div className="flex items-center font-bold text-amber-800 mb-2 text-xs uppercase"><FileText size={12} className="mr-1"/> Notes</div>{w.conditionNotes}</div>}
          
          <div className="text-center pt-4 text-xs text-slate-300">Ajouté le {new Date(w.dateAdded).toLocaleDateString()}</div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="pb-24 p-4">
      <div className="flex justify-between items-center mb-6 mt-2"><h1 className="text-2xl font-bold">{editingId ? 'Modifier' : 'Ajouter'}</h1><button onClick={() => { setEditingId(null); resetForm(); setView(selectedWatch ? 'detail' : 'list'); }}><X/></button></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <label className="block w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden hover:bg-slate-50">
          {formData.image ? <img src={formData.image} className="w-full h-full object-cover"/> : <div className="text-center text-slate-400"><Camera className="mx-auto mb-2"/><span className="text-xs">Ajouter Photo</span></div>}
          <input type="file" onChange={handleImageUpload} className="hidden"/>
        </label>

        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Identité</h3>
            <input className="w-full p-3 border rounded-lg" placeholder="Marque (ex: Rolex)" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
            <input className="w-full p-3 border rounded-lg" placeholder="Modèle (ex: Submariner)" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
            <input className="w-full p-3 border rounded-lg" placeholder="Référence" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
        </div>

        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Technique</h3>
            <div className="grid grid-cols-2 gap-3">
                <input className="p-3 border rounded-lg text-sm" placeholder="Diamètre (mm)" type="number" value={formData.diameter} onChange={e => setFormData({...formData, diameter: e.target.value})} />
                <input className="p-3 border rounded-lg text-sm" placeholder="Épaisseur (mm)" type="number" value={formData.thickness} onChange={e => setFormData({...formData, thickness: e.target.value})} />
                <input className="p-3 border rounded-lg text-sm" placeholder="Entre-corne (mm)" type="number" value={formData.strapWidth} onChange={e => setFormData({...formData, strapWidth: e.target.value})} />
                <input className="p-3 border rounded-lg text-sm" placeholder="Étanchéité (ATM)" type="number" value={formData.waterResistance} onChange={e => setFormData({...formData, waterResistance: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input className="p-3 border rounded-lg text-sm" placeholder="Mouvement" value={formData.movement} onChange={e => setFormData({...formData, movement: e.target.value})} />
                <input className="p-3 border rounded-lg text-sm" placeholder="Verre (Saphir...)" value={formData.glass} onChange={e => setFormData({...formData, glass: e.target.value})} />
            </div>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Origine & Entretien</h3>
            <div className="grid grid-cols-3 gap-3">
                <input className="p-3 border rounded-lg text-sm" placeholder="Pays" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                <input className="p-3 border rounded-lg text-sm" placeholder="Année" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                <input className="p-3 border rounded-lg text-sm" placeholder="Boîte" value={formData.box} onChange={e => setFormData({...formData, box: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input className="p-3 border rounded-lg text-sm" placeholder="Garantie (ex: 2 ans, Non...)" type="text" value={formData.warrantyDate} onChange={e => setFormData({...formData, warrantyDate: e.target.value})} />
                <input className="p-3 border rounded-lg text-sm" placeholder="Révision (ex: 2022, à faire...)" type="text" value={formData.revision} onChange={e => setFormData({...formData, revision: e.target.value})} />
            </div>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Finances</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" className="w-full p-3 border rounded-lg" placeholder="Prix Achat (€)" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
              <input type="number" className="w-full p-3 border rounded-lg" placeholder="Estimation (€)" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
            </div>
            <div className="flex gap-2 mt-2">
              {['collection', 'forsale', 'sold'].map(s => (
                <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${formData.status === s ? 'bg-slate-800 text-white' : 'bg-white'}`}>{s === 'collection' ? 'Collec' : s === 'forsale' ? 'Vente' : 'Vendu'}</button>
              ))}
            </div>
        </div>

        <textarea className="w-full p-3 border rounded-lg" rows="3" placeholder="Notes / État..." value={formData.conditionNotes} onChange={e => setFormData({...formData, conditionNotes: e.target.value})} />
        
        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform">Sauvegarder</button>
      </form>
    </div>
  );

  const renderFinance = () => {
    const stats = {
      invested: watches.filter(w => w.status !== 'sold').reduce((a, c) => a + (c.purchasePrice || 0), 0),
      potentialValue: watches.filter(w => w.status !== 'sold').reduce((a, c) => a + (c.sellingPrice || c.purchasePrice || 0), 0),
      soldTotal: watches.filter(w => w.status === 'sold').reduce((a, c) => a + (c.sellingPrice || 0), 0),
      soldProfit: watches.filter(w => w.status === 'sold').reduce((a, c) => a + ((c.sellingPrice || 0) - (c.purchasePrice || 0)), 0),
    };
    return (
      <div className="space-y-4 pb-24 px-2">
        <header className="mb-6 mt-4"><h1 className="text-2xl font-bold text-slate-800">Finance</h1><p className="text-slate-500 text-sm">Tableau de bord financier</p></header>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-slate-900 text-white border-none"><div className="flex items-center space-x-2 text-slate-300 mb-1"><DollarSign size={16} /><span className="text-xs font-medium uppercase tracking-wider">Investi</span></div><div className="text-lg font-bold">{formatPrice(stats.invested)}</div><div className="text-xs text-slate-400 mt-1">{watches.filter(w => w.status !== 'sold').length} montres</div></Card>
          <Card className="p-4 bg-white"><div className="flex items-center space-x-2 text-emerald-600 mb-1"><TrendingUp size={16} /><span className="text-xs font-medium uppercase tracking-wider">Estimation</span></div><div className="text-lg font-bold text-slate-800">{formatPrice(stats.potentialValue)}</div><div className="text-xs text-emerald-600 mt-1">{stats.potentialValue - stats.invested > 0 ? '+' : ''}{formatPrice(stats.potentialValue - stats.invested)} latents</div></Card>
        </div>
        <Card className="p-4 border-emerald-100 bg-emerald-50/50"><h3 className="text-sm font-semibold text-emerald-800 mb-3 border-b border-emerald-100 pb-2">Bilan des Ventes</h3><div className="flex justify-between items-center"><div><div className="text-xs text-emerald-600">Chiffre d'affaires</div><div className="font-bold text-emerald-900">{formatPrice(stats.soldTotal)}</div></div><div className="text-right"><div className="text-xs text-emerald-600">Bénéfice Net</div><div className={`font-bold text-xl ${stats.soldProfit >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>{stats.soldProfit > 0 ? '+' : ''}{formatPrice(stats.soldProfit)}</div></div></div></Card>
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/><button onClick={() => setLoading(false)} className="ml-2 text-xs">Skip</button></div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        <div className="h-full overflow-y-auto p-4 scrollbar-hide">
            {view === 'box' && renderBox()}
            {view === 'finance' && renderFinance()}
            {view === 'list' && renderList()}
            {view === 'detail' && renderDetail()}
            {view === 'add' && renderForm()}
            {view === 'summary' && renderSummary()}
        </div>
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-between px-4 py-2 z-50 text-[10px] font-medium text-slate-400">
          <button onClick={() => setView('box')} className={`flex flex-col items-center ${view === 'box' ? 'text-amber-800' : ''}`}><Box size={20}/><span className="mt-1">Coffre</span></button>
          <button onClick={() => setView('list')} className={`flex flex-col items-center ${view === 'list' ? 'text-slate-900' : ''}`}><Watch size={20}/><span className="mt-1">Liste</span></button>
          <button onClick={() => { setEditingId(null); resetForm(); setView('add'); }} className=" -mt-6 bg-slate-900 text-white p-3 rounded-full shadow-lg border-4 border-slate-50"><Plus size={24}/></button>
          <button onClick={() => setView('finance')} className={`flex flex-col items-center ${view === 'finance' ? 'text-emerald-700' : ''}`}><TrendingUp size={20}/><span className="mt-1">Finance</span></button>
          <button onClick={() => setView('summary')} className={`flex flex-col items-center ${view === 'summary' ? 'text-indigo-600' : ''}`}><ClipboardList size={20}/><span className="mt-1">Inventaire</span></button>
        </nav>
      </div>
    </div>
  );
}
