import React, { useState, useEffect } from 'react';
import { 
  Watch, Plus, TrendingUp, Trash2, Edit2, Camera, X,
  LayoutDashboard, Search, ArrowUpRight, ArrowDownRight, Clock, AlertCircle,
  Package, DollarSign, FileText, Box, Cloud, CloudOff, Loader2,
  ChevronLeft, ClipboardList, WifiOff, Ruler, Calendar, Activity
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

// ==========================================================================
// CONFIGURATION
// ==========================================================================
const productionConfig = {
  apiKey: "VOTRE_API_KEY_ICI",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  projectId: "VOTRE_PROJET",
  storageBucket: "VOTRE_BUCKET.firebasestorage.app",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// ==========================================================================
// INITIALISATION
// ==========================================================================
let app, auth, db;
let firebaseReady = false;

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

const appId = typeof __app_id !== 'undefined' ? __app_id : 'chrono-v10';

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

const WatchBoxLogo = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5D4037" />
        <stop offset="100%" stopColor="#3E2723" />
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

  // AUTH
  useEffect(() => {
    if (useLocalStorage) return;
    const init = async () => {
      try { await signInAnonymously(auth); } 
      catch (err) { setUseLocalStorage(true); setUser({ uid: 'local-user' }); setLoading(false); }
    };
    init();
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); if(!u) setLoading(false); });
    return () => unsub();
  }, [useLocalStorage]);

  // DATA SYNC
  useEffect(() => {
    if (!user && !useLocalStorage) return;
    if (useLocalStorage) {
      try {
        const local = localStorage.getItem('chrono_v10_data'); // Version 10 DB
        if (local) setWatches(JSON.parse(local));
      } catch(e){}
      setLoading(false);
    } else {
      try {
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'watches'));
        const unsub = onSnapshot(q, (snap) => {
          setWatches(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded)));
          setLoading(false);
        }, () => { setUseLocalStorage(true); setLoading(false); });
        return () => unsub();
      } catch(e) { setUseLocalStorage(true); setLoading(false); }
    }
  }, [user, useLocalStorage]);

  // SAVE LOCAL
  useEffect(() => {
    if (useLocalStorage) localStorage.setItem('chrono_v10_data', JSON.stringify(watches));
  }, [watches, useLocalStorage]);

  // --- ACTIONS ---
  
  // Ajout des nouveaux champs dans le state initial
  const [formData, setFormData] = useState({
    brand: '', model: '', reference: '', 
    diameter: '', year: '', movement: '', // Nouveaux champs
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
      try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'watches', id), newWatch); closeForm(newWatch); }
      catch(e) { alert("Erreur Cloud"); }
    }
  };

  const closeForm = (w) => { if(selectedWatch) setSelectedWatch(w); setFilter('all'); setView('list'); setEditingId(null); resetForm(); };
  
  const resetForm = () => setFormData({ 
    brand: '', model: '', reference: '', 
    diameter: '', year: '', movement: '',
    purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', image: null 
  });
  
  const handleEdit = (w) => { setFormData(w); setEditingId(w.id); setView('add'); };
  
  const handleDelete = async (id) => {
    if(!confirm("Supprimer ?")) return;
    if(useLocalStorage) { setWatches(prev => prev.filter(w => w.id !== id)); setView('list'); }
    else { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'watches', id)); setView('list'); }
  };

  // --- VUES ---

  const renderBox = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8">
      <h1 className="text-xl font-serif text-slate-800 mb-4 tracking-widest uppercase">Écrin Privé</h1>
      <div className="w-64 h-64 transition-transform hover:scale-105 duration-500"><WatchBoxLogo /></div>
      <p className="mt-8 text-slate-800 font-medium">{watches.length} montres</p>
      <div className={`flex items-center justify-center text-xs mt-2 px-3 py-1 rounded-full ${useLocalStorage ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {useLocalStorage ? <><WifiOff size={12} className="mr-1"/>Local</> : <><Cloud size={12} className="mr-1"/>Cloud</>}
      </div>
      <button onClick={() => setView('list')} className="mt-10 px-10 py-3 bg-slate-900 text-white rounded-full shadow-xl active:scale-95 transition-transform">Entrer</button>
    </div>
  );

  const renderList = () => (
    <div className="pb-24 px-2">
      <header className="sticky top-0 bg-slate-50 py-4 z-10 flex justify-between items-center px-1">
        <h1 className="text-2xl font-bold text-slate-800">Collection</h1>
        <div className="flex gap-1 overflow-x-auto max-w-[60%] no-scrollbar">
          {['all', 'collection', 'forsale', 'sold'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${filter===f ? 'bg-slate-800 text-white' : 'bg-white border'}`}>{f === 'all' ? 'Tout' : f === 'collection' ? 'Collec' : f === 'forsale' ? 'Vente' : 'Vendu'}</button>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {watches.filter(w => filter === 'all' || w.status === filter).map(w => (
          <Card key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }}>
            <div className="aspect-square bg-slate-100 relative">
              {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera/></div>}
              <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">{w.status === 'sold' ? 'VENDU' : formatPrice(w.sellingPrice || w.purchasePrice)}</div>
            </div>
            <div className="p-3"><div className="font-bold text-sm truncate">{w.brand}</div><div className="text-xs text-slate-500 truncate">{w.model}</div></div>
          </Card>
        ))}
      </div>
      {watches.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Aucune montre.</div>}
    </div>
  );

  const renderDetail = () => {
    if(!selectedWatch) return null;
    const w = selectedWatch;
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
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-sm border">
            {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center"><Camera size={48} className="text-slate-300"/></div>}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{w.brand}</h1>
            <p className="text-lg text-slate-600">{w.model}</p>
            {w.reference && <span className="text-xs bg-slate-50 px-2 py-1 rounded mt-2 inline-block border font-mono">Ref: {w.reference}</span>}
          </div>

          {/* CARACTÉRISTIQUES TECHNIQUES */}
          <div className="flex justify-between gap-2">
             <div className="flex-1 bg-slate-50 p-2 rounded-lg border text-center">
               <Ruler size={16} className="mx-auto mb-1 text-slate-400"/>
               <span className="text-xs block text-slate-500">Diamètre</span>
               <span className="font-semibold text-sm">{w.diameter ? w.diameter + ' mm' : '-'}</span>
             </div>
             <div className="flex-1 bg-slate-50 p-2 rounded-lg border text-center">
               <Calendar size={16} className="mx-auto mb-1 text-slate-400"/>
               <span className="text-xs block text-slate-500">Année</span>
               <span className="font-semibold text-sm">{w.year || '-'}</span>
             </div>
             <div className="flex-1 bg-slate-50 p-2 rounded-lg border text-center">
               <Activity size={16} className="mx-auto mb-1 text-slate-400"/>
               <span className="text-xs block text-slate-500">Mouv.</span>
               <span className="font-semibold text-sm">{w.movement || '-'}</span>
             </div>
          </div>

          {/* PRIX */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border"><div className="text-xs text-slate-400 uppercase">Achat</div><div className="text-lg font-bold">{formatPrice(w.purchasePrice)}</div></div>
            <div className="p-3 bg-slate-50 rounded-lg border">
                <div className="text-xs text-slate-400 uppercase">{w.status === 'sold' ? 'Vente' : 'Estim.'}</div>
                <div className="text-lg font-bold text-emerald-600">{formatPrice(w.sellingPrice)}</div>
                {w.status === 'sold' && <div className="text-xs text-emerald-600 mt-1">Profit: {formatPrice(w.sellingPrice - w.purchasePrice)}</div>}
            </div>
          </div>

          {/* NOTES */}
          {w.conditionNotes && <div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-800 border border-amber-100"><div className="flex items-center font-bold text-amber-800 mb-1 text-xs"><FileText size={12} className="mr-1"/> Notes</div>{w.conditionNotes}</div>}
          
          <div className="text-center pt-4 text-xs text-slate-300">Ajouté le {new Date(w.dateAdded).toLocaleDateString()}</div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="pb-24 p-4">
      <div className="flex justify-between items-center mb-6 mt-2"><h1 className="text-2xl font-bold">{editingId ? 'Modifier' : 'Ajouter'}</h1><button onClick={() => { setEditingId(null); setFormData({ brand: '', model: '', reference: '', diameter: '', year: '', movement: '', purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', image: null }); setView(selectedWatch ? 'detail' : 'list'); }}><X/></button></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo */}
        <label className="block w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden hover:bg-slate-50">
          {formData.image ? <img src={formData.image} className="w-full h-full object-cover"/> : <div className="text-center text-slate-400"><Camera className="mx-auto mb-2"/><span className="text-xs">Ajouter Photo</span></div>}
          <input type="file" onChange={handleImageUpload} className="hidden"/>
        </label>

        {/* Infos Principales */}
        <div className="space-y-3">
            <input className="w-full p-3 border rounded-lg" placeholder="Marque (ex: Rolex)" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
            <input className="w-full p-3 border rounded-lg" placeholder="Modèle (ex: Submariner)" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
            <input className="w-full p-3 border rounded-lg" placeholder="Référence" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
        </div>

        {/* Détails Techniques (Nouvelle ligne) */}
        <div className="grid grid-cols-3 gap-2">
            <input className="p-3 border rounded-lg text-sm" placeholder="Diam. (mm)" type="number" value={formData.diameter} onChange={e => setFormData({...formData, diameter: e.target.value})} />
            <input className="p-3 border rounded-lg text-sm" placeholder="Année" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
            <input className="p-3 border rounded-lg text-sm" placeholder="Mouvement" value={formData.movement} onChange={e => setFormData({...formData, movement: e.target.value})} />
        </div>

        {/* Prix */}
        <div className="grid grid-cols-2 gap-4">
          <input type="number" className="w-full p-3 border rounded-lg" placeholder="Prix Achat" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
          <input type="number" className="w-full p-3 border rounded-lg" placeholder="Estimation" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
        </div>

        <textarea className="w-full p-3 border rounded-lg" rows="3" placeholder="Notes / État..." value={formData.conditionNotes} onChange={e => setFormData({...formData, conditionNotes: e.target.value})} />
        
        <div className="flex gap-2">
          {['collection', 'forsale', 'sold'].map(s => (
            <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${formData.status === s ? 'bg-slate-800 text-white' : 'bg-white'}`}>{s === 'collection' ? 'Collec' : s === 'forsale' ? 'Vente' : 'Vendu'}</button>
          ))}
        </div>
        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform">Sauvegarder</button>
      </form>
    </div>
  );

  const renderSummary = () => (
    <div className="pb-24 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 mt-4">Inventaire</h1>
      {['collection', 'forsale', 'sold'].map(cat => {
        const list = watches.filter(w => w.status === cat);
        if(list.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h3 className="font-bold text-sm text-slate-500 uppercase mb-2">{cat === 'collection' ? 'Ma Collection' : cat === 'forsale' ? 'En Vente' : 'Vendu'} ({list.length})</h3>
            <div className="bg-white rounded-xl border divide-y shadow-sm">
              {list.map(w => (
                <div key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }} className="flex items-center p-3 gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">{w.image && <img src={w.image} className="w-full h-full object-cover"/>}</div>
                  <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{w.brand}</div><div className="text-xs text-slate-500 truncate">{w.model}</div></div>
                  <div className="font-mono text-sm">{formatPrice(w.purchasePrice)}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );

  // --- RESTAURATION DE L'ONGLET FINANCE ---
  const renderFinance = () => {
    const stats = {
      // Total investi (Montres en collection + Montres en vente)
      invested: watches.filter(w => w.status !== 'sold').reduce((a, c) => a + (c.purchasePrice || 0), 0),
      
      // Valeur estimée (Prix de vente estimé OU prix d'achat si pas d'estimation)
      potentialValue: watches.filter(w => w.status !== 'sold').reduce((a, c) => a + (c.sellingPrice || c.purchasePrice || 0), 0),
      
      // Total vendu (Prix de vente final des montres vendues)
      soldTotal: watches.filter(w => w.status === 'sold').reduce((a, c) => a + (c.sellingPrice || 0), 0),
      
      // Bénéfice réalisé (Prix de vente - Prix d'achat)
      soldProfit: watches.filter(w => w.status === 'sold').reduce((a, c) => a + ((c.sellingPrice || 0) - (c.purchasePrice || 0)), 0),
    };

    return (
      <div className="space-y-4 pb-24 px-2">
        <header className="mb-6 mt-4">
            <h1 className="text-2xl font-bold text-slate-800">Finance</h1>
            <p className="text-slate-500 text-sm">Tableau de bord financier</p>
        </header>
        
        {/* Bloc Investissement Actuel */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-slate-900 text-white border-none">
            <div className="flex items-center space-x-2 text-slate-300 mb-1">
                <DollarSign size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Investi</span>
            </div>
            <div className="text-lg font-bold">{formatPrice(stats.invested)}</div>
            <div className="text-xs text-slate-400 mt-1">{watches.filter(w => w.status !== 'sold').length} montres</div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
                <TrendingUp size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Estimation</span>
            </div>
            <div className="text-lg font-bold text-slate-800">{formatPrice(stats.potentialValue)}</div>
            <div className="text-xs text-emerald-600 mt-1">
                {stats.potentialValue - stats.invested > 0 ? '+' : ''}
                {formatPrice(stats.potentialValue - stats.invested)} latents
            </div>
          </Card>
        </div>

        {/* Bloc Ventes Réalisées */}
        <Card className="p-4 border-emerald-100 bg-emerald-50/50">
          <h3 className="text-sm font-semibold text-emerald-800 mb-3 border-b border-emerald-100 pb-2">Bilan des Ventes</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-emerald-600">Chiffre d'affaires</div>
              <div className="font-bold text-emerald-900">{formatPrice(stats.soldTotal)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-600">Bénéfice Net</div>
              <div className={`font-bold text-xl ${stats.soldProfit >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                {stats.soldProfit > 0 ? '+' : ''}{formatPrice(stats.soldProfit)}
              </div>
            </div>
          </div>
        </Card>
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
