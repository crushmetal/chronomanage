import React, { useState, useEffect } from 'react';
import { 
  Watch, Plus, TrendingUp, Trash2, Edit2, Camera, X,
  LayoutDashboard, Search, ArrowUpRight, ArrowDownRight, Clock, AlertCircle,
  Package, DollarSign, FileText, Box, Cloud, CloudOff, Loader2,
  ChevronLeft, ClipboardList, WifiOff
} from 'lucide-react';

// --- Firebase Imports ---
// On importe uniquement les fonctions nécessaires
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
// INITIALISATION (LOGIQUE PARE-BALLES)
// ==========================================================================
let app, auth, db;
let firebaseReady = false;

// On vérifie si la config est celle par défaut (placeholders) ou une vraie
const hasValidKeys = productionConfig.apiKey && !productionConfig.apiKey.includes("VOTRE_API_KEY");

// Détection de l'environnement (Aperçu vs Production)
let configToUse = productionConfig;
if (typeof __firebase_config !== 'undefined') {
  try { configToUse = JSON.parse(__firebase_config); firebaseReady = true; } catch(e) {}
} else if (hasValidKeys) {
  firebaseReady = true;
}

// Tentative d'initialisation seulement si on pense que ça va marcher
if (firebaseReady) {
  try {
    app = initializeApp(configToUse);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Erreur Init Firebase:", e);
    firebaseReady = false;
  }
} else {
  console.log("⚠️ Mode LOCAL forcé (Pas de clés Firebase valides détectées)");
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'chrono-v9';

// --- Composants ---

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>
    {children}
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

// --- Application ---

export default function App() {
  // État par défaut : Mode Local si Firebase n'est pas prêt
  const [useLocalStorage, setUseLocalStorage] = useState(!firebaseReady);
  const [user, setUser] = useState(useLocalStorage ? { uid: 'local-user' } : null);
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(!useLocalStorage);
  const [view, setView] = useState('box'); 
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [selectedWatch, setSelectedWatch] = useState(null);

  // 1. Auth (si cloud)
  useEffect(() => {
    if (useLocalStorage) return;

    const init = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn("Auth échouée, passage en local");
        setUseLocalStorage(true);
        setUser({ uid: 'local-user' });
        setLoading(false);
      }
    };
    init();
    
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if(!u) setLoading(false);
    });
    return () => unsub();
  }, [useLocalStorage]);

  // 2. Data Sync
  useEffect(() => {
    if (!user && !useLocalStorage) return;

    if (useLocalStorage) {
      try {
        const local = localStorage.getItem('chrono_v9_local');
        if (local) setWatches(JSON.parse(local));
      } catch(e) {}
      setLoading(false);
    } else {
      try {
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'watches'));
        const unsub = onSnapshot(q, (snap) => {
          setWatches(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.dateAdded)-new Date(a.dateAdded)));
          setLoading(false);
        }, (err) => {
          console.warn("Erreur Cloud, repli local", err);
          setUseLocalStorage(true);
          setLoading(false);
        });
        return () => unsub();
      } catch(e) {
        setUseLocalStorage(true);
        setLoading(false);
      }
    }
  }, [user, useLocalStorage]);

  // Save Local
  useEffect(() => {
    if (useLocalStorage) localStorage.setItem('chrono_v9_local', JSON.stringify(watches));
  }, [watches, useLocalStorage]);

  // Actions
  const [formData, setFormData] = useState({
    brand: '', model: '', reference: '', purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', image: null
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
    const newWatch = { id, ...formData, purchasePrice: Number(formData.purchasePrice), sellingPrice: Number(formData.sellingPrice), dateAdded: new Date().toISOString() };

    if (useLocalStorage) {
      setWatches(prev => editingId ? prev.map(w => w.id === id ? newWatch : w) : [newWatch, ...prev]);
      closeForm();
    } else {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'watches', id), newWatch);
        closeForm();
      } catch(e) { alert("Erreur Cloud: " + e.message); }
    }
  };

  const closeForm = () => { setView(selectedWatch ? 'detail' : 'list'); setEditingId(null); resetForm(); if(selectedWatch) setSelectedWatch(null); }; // Petit fix pour retour liste
  const resetForm = () => setFormData({ brand: '', model: '', reference: '', purchasePrice: '', sellingPrice: '', status: 'collection', conditionNotes: '', image: null });
  
  const handleEdit = (w) => { setFormData(w); setEditingId(w.id); setView('add'); };
  const handleDelete = async (id) => {
    if(!confirm("Supprimer ?")) return;
    if(useLocalStorage) {
      setWatches(prev => prev.filter(w => w.id !== id));
      setView('list');
    } else {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'watches', id));
      setView('list');
    }
  };

  // Vues
  const renderBox = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8">
      <h1 className="text-xl font-serif text-slate-800 mb-4 tracking-widest uppercase">Écrin Privé</h1>
      <div className="w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center shadow-inner mb-8">
        <Package size={64} className="text-slate-300" />
      </div>
      <div className="text-center">
        <p className="text-slate-800 font-medium">{watches.length} montres</p>
        {useLocalStorage ? (
          <div className="flex items-center justify-center text-amber-600 text-xs mt-2 bg-amber-50 px-3 py-1 rounded-full">
            <WifiOff size={12} className="mr-1"/> Mode Local (Démo)
          </div>
        ) : (
          <div className="flex items-center justify-center text-emerald-600 text-xs mt-2 bg-emerald-50 px-3 py-1 rounded-full">
            <Cloud size={12} className="mr-1"/> Cloud Actif
          </div>
        )}
      </div>
      <button onClick={() => setView('list')} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full shadow-lg">Entrer</button>
    </div>
  );

  const renderList = () => (
    <div className="pb-24 px-2">
      <header className="sticky top-0 bg-slate-50 py-4 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Collection</h1>
        <div className="flex gap-1 overflow-x-auto max-w-[60%] no-scrollbar">
          {['all', 'collection', 'forsale'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${filter===f ? 'bg-slate-800 text-white' : 'bg-white border'}`}>
              {f === 'all' ? 'Tout' : f === 'collection' ? 'Ma Collec' : 'Vente'}
            </button>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {watches.filter(w => filter === 'all' || w.status === filter).map(w => (
          <Card key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }}>
            <div className="aspect-square bg-slate-100 relative">
              {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-300"><Camera/></div>}
              <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold">{w.status === 'sold' ? 'VENDU' : formatPrice(w.sellingPrice || w.purchasePrice)}</div>
            </div>
            <div className="p-3">
              <div className="font-bold text-sm truncate">{w.brand}</div>
              <div className="text-xs text-slate-500 truncate">{w.model}</div>
            </div>
          </Card>
        ))}
      </div>
      {watches.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Aucune montre.</div>}
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
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
            {w.image ? <img src={w.image} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center"><Camera size={48} className="text-slate-300"/></div>}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{w.brand}</h1>
            <p className="text-lg text-slate-600">{w.model}</p>
            {w.reference && <span className="text-xs bg-slate-100 px-2 py-1 rounded mt-1 inline-block">Ref: {w.reference}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-xs text-slate-400 uppercase">Achat</div>
              <div className="text-lg font-bold">{formatPrice(w.purchasePrice)}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-xs text-slate-400 uppercase">{w.status === 'sold' ? 'Vente' : 'Estim.'}</div>
              <div className="text-lg font-bold text-emerald-600">{formatPrice(w.sellingPrice)}</div>
            </div>
          </div>
          {w.conditionNotes && <div className="bg-amber-50 p-4 rounded-lg text-sm text-slate-800">{w.conditionNotes}</div>}
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="pb-24 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{editingId ? 'Modifier' : 'Ajouter'}</h1>
        <button onClick={closeForm}><X/></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden">
          {formData.image ? <img src={formData.image} className="w-full h-full object-cover"/> : <div className="text-center text-slate-400"><Camera className="mx-auto mb-2"/><span className="text-xs">Ajouter Photo</span></div>}
          <input type="file" onChange={handleImageUpload} className="hidden"/>
        </label>
        <input className="w-full p-3 border rounded-lg" placeholder="Marque (ex: Rolex)" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
        <input className="w-full p-3 border rounded-lg" placeholder="Modèle (ex: Submariner)" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
        <input className="w-full p-3 border rounded-lg" placeholder="Référence" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" className="w-full p-3 border rounded-lg" placeholder="Prix Achat" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
          <input type="number" className="w-full p-3 border rounded-lg" placeholder="Estimation" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
        </div>
        <textarea className="w-full p-3 border rounded-lg" rows="3" placeholder="Notes / État..." value={formData.conditionNotes} onChange={e => setFormData({...formData, conditionNotes: e.target.value})} />
        <div className="flex gap-2">
          {['collection', 'forsale', 'sold'].map(s => (
            <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${formData.status === s ? 'bg-slate-800 text-white' : 'bg-white'}`}>
              {s === 'collection' ? 'Collec' : s === 'forsale' ? 'Vente' : 'Vendu'}
            </button>
          ))}
        </div>
        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Sauvegarder</button>
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
            <div className="bg-white rounded-xl border divide-y">
              {list.map(w => (
                <div key={w.id} onClick={() => { setSelectedWatch(w); setView('detail'); }} className="flex items-center p-3 gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden">{w.image && <img src={w.image} className="w-full h-full object-cover"/>}</div>
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {view === 'box' && renderBox()}
        {view === 'list' && renderList()}
        {view === 'detail' && renderDetail()}
        {view === 'add' && renderForm()}
        {view === 'finance' && <div className="p-4 text-center mt-20">Onglet Finance (À venir)</div>} 
        {view === 'summary' && renderSummary()}

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-between px-4 py-2 z-50">
          <button onClick={() => setView('box')} className={`flex flex-col items-center ${view === 'box' ? 'text-slate-900' : 'text-slate-400'}`}><Box size={20}/><span className="text-[10px]">Coffre</span></button>
          <button onClick={() => setView('list')} className={`flex flex-col items-center ${view === 'list' ? 'text-slate-900' : 'text-slate-400'}`}><Watch size={20}/><span className="text-[10px]">Liste</span></button>
          <button onClick={() => { setEditingId(null); resetForm(); setView('add'); }} className=" -mt-6 bg-slate-900 text-white p-3 rounded-full shadow-lg border-4 border-slate-50"><Plus size={24}/></button>
          <button onClick={() => setView('finance')} className={`flex flex-col items-center ${view === 'finance' ? 'text-slate-900' : 'text-slate-400'}`}><TrendingUp size={20}/><span className="text-[10px]">Finance</span></button>
          <button onClick={() => setView('summary')} className={`flex flex-col items-center ${view === 'summary' ? 'text-slate-900' : 'text-slate-400'}`}><ClipboardList size={20}/><span className="text-[10px]">Inventaire</span></button>
        </nav>
      </div>
    </div>
  );
}
