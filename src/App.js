import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut,
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    deleteDoc,
    collection, 
    query, 
    where, 
    onSnapshot,
    writeBatch,
    Timestamp,
    getDocs
} from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Ícones SVG para a UI ---
const GoogleIcon = () => (<svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.94C34.935 5.433 29.833 3 24 3C12.955 3 4 11.955 4 23s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.94C34.935 5.433 29.833 3 24 3c-5.833 0-10.935 2.433-14.694 6.306l-3.004-2.315z"></path><path fill="#4CAF50" d="M24 43c5.833 0 10.935-2.433 14.694-6.306l-3.004-2.315C33.842 37.846 30.059 40 24 40c-5.039 0-9.345-2.892-11.124-6.971l-6.571 4.819C9.065 40.567 15.961 43 24 43z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.572 4.82c3.56-3.318 5.21-8.273 5.21-13.391c0-1.341-.138-2.65-.389-3.917z"></path></svg>);
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SparklesIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" /><path d="M5.26 17.242a.75.75 0 10-1.06-1.06l-1.954 1.954a.75.75 0 101.06 1.06l1.954-1.954zM21.394 18.394a.75.75 0 10-1.06-1.06l-1.954 1.954a.75.75 0 101.06 1.06l1.954-1.954z" /></svg>);
const PencilIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>);
const TrashIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const CloseIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const SunIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>);
const MoonIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>);
const MenuIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const CogIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" /></svg>);


// --- Configuração e Inicialização do Firebase (Fora do Componente) ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- Componentes de UI ---
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <CloseIcon />
                </button>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="text-gray-600 dark:text-gray-300 mb-6">{children}</div>
        <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Cancelar</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirmar</button>
        </div>
    </Modal>
);

const EditTransactionModal = ({ isOpen, onClose, transaction, onSave }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [tag, setTag] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (transaction) {
            setAmount(Math.abs(transaction.amount));
            setDescription(transaction.description);
            setTag(transaction.tag);
            setDate(transaction.date.toDate().toISOString().split('T')[0]);
        }
    }, [transaction]);

    if (!transaction) return null;

    const handleSave = () => {
        onSave({
            ...transaction,
            amount: -Math.abs(parseFloat(amount) || 0),
            description,
            tag,
            date: Timestamp.fromDate(new Date(date))
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Editar Transação</h3>
            <div className="space-y-4">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor" className="p-2 border rounded-md w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" className="p-2 border rounded-md w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag" className="p-2 border rounded-md w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded-md w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar Alterações</button>
            </div>
        </Modal>
    );
};

const WeekSettingsModal = ({ isOpen, onClose, household, householdId }) => {
    const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    
    const handleWeekStartChange = async (e) => {
        const newStartDay = parseInt(e.target.value, 10);
        if (!isNaN(newStartDay)) {
            const householdRef = doc(db, 'households', householdId);
            try {
                await setDoc(householdRef, { weekStartsOn: newStartDay }, { merge: true });
            } catch (error) {
                console.error("Erro ao atualizar o dia de início da semana:", error);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Configurar Semana</h3>
            <div className="flex items-center justify-between">
                <label htmlFor="week-start-day" className="text-gray-700 dark:text-gray-300">O ciclo semanal começa na:</label>
                <select
                    id="week-start-day"
                    value={household.weekStartsOn ?? 1}
                    onChange={handleWeekStartChange}
                    className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                >
                    {weekDays.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Fechar</button>
            </div>
        </Modal>
    );
};


// --- Componentes Principais ---
const AuthComponent = () => {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro ao fazer login com Google:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Bem-vindo ao OrçaCasal!</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">Gerencie as finanças do casal de forma simples e colaborativa.</p>
                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300"
                >
                    <GoogleIcon />
                    Entrar com Google
                </button>
            </div>
        </div>
    );
};

const HouseholdSetup = ({ user, setHouseholdId }) => {
    const [joinId, setJoinId] = useState('');

    const createHousehold = async () => {
        try {
            const newHouseholdRef = doc(collection(db, 'households'));
            const newHousehold = {
                members: [user.uid],
                weeklyBudget: 500,
                weekStartsOn: 1, // Padrão: Segunda-feira
                tags: {}, // Objeto de tags inicial
                createdAt: Timestamp.now(),
            };
            await setDoc(newHouseholdRef, newHousehold);
            await setDoc(doc(db, 'users', user.uid), { householdId: newHouseholdRef.id }, { merge: true });
            setHouseholdId(newHouseholdRef.id);
        } catch (error) {
            console.error("Erro ao criar o lar:", error);
        }
    };

    const joinHousehold = async () => {
        if (!joinId.trim()) {
            alert("Por favor, insira um ID de Lar válido.");
            return;
        }
        try {
            const householdRef = doc(db, 'households', joinId.trim());
            const householdSnap = await getDoc(householdRef);
            if (householdSnap.exists()) {
                const householdData = householdSnap.data();
                const updatedMembers = householdData.members.includes(user.uid) ? householdData.members : [...householdData.members, user.uid];
                await setDoc(householdRef, { members: updatedMembers }, { merge: true });
                await setDoc(doc(db, 'users', user.uid), { householdId: joinId.trim() }, { merge: true });
                setHouseholdId(joinId.trim());
            } else {
                alert("Lar não encontrado. Verifique o ID.");
            }
        } catch (error) {
            console.error("Erro ao entrar no lar:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Configure seu Lar</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Crie um novo lar para compartilhar com seu parceiro(a) ou junte-se a um existente usando um ID.</p>
                <div className="space-y-4">
                    <button onClick={createHousehold} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">Criar um Novo Lar</button>
                    <div className="relative flex items-center justify-center my-4"><div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div><span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">OU</span><div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div></div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Insira o ID do Lar" className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                        <button onClick={joinHousehold} className="bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition duration-300">Juntar-se ao Lar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TransactionForm = ({ householdId, type, household }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [tag, setTag] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [installments, setInstallments] = useState(1);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

    const handleTagChange = (e) => {
        const value = e.target.value;
        setTag(value);
        if (value) {
            const allTags = Object.keys(household.tags || {});
            const filtered = allTags.filter(t => t.toLowerCase().includes(value.toLowerCase()));
            setSuggestions(filtered);
            setIsSuggestionsOpen(true);
        } else {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setTag(suggestion);
        setIsSuggestionsOpen(false);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description || !tag) {
            alert("Por favor, preencha todos os campos."); return;
        }
        
        const householdRef = doc(db, 'households', householdId);
        const allTags = household.tags || {};

        // Verifica se a tag é nova e a adiciona com uma cor aleatória
        if (!allTags[tag]) {
            const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            const newTags = { ...allTags, [tag]: { color: randomColor } };
            await setDoc(householdRef, { tags: newTags }, { merge: true });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            alert("O valor deve ser um número."); return;
        }
        const batch = writeBatch(db);
        const installmentId = crypto.randomUUID();
        for (let i = 0; i < installments; i++) {
            const transactionDate = new Date(date);
            transactionDate.setMonth(transactionDate.getMonth() + i);
            const newTransaction = {
                householdId, amount: -Math.abs(numericAmount / installments),
                description: installments > 1 ? `${description} (${i + 1}/${installments})` : description,
                tag, date: Timestamp.fromDate(transactionDate), createdAt: Timestamp.now(),
                isInstallment: installments > 1, installmentId: installments > 1 ? installmentId : null,
            };
            const newTransactionRef = doc(collection(db, 'transactions'));
            batch.set(newTransactionRef, newTransaction);
        }
        try {
            await batch.commit();
            setAmount(''); setDescription(''); setTag('');
            setDate(new Date().toISOString().split('T')[0]); setInstallments(1);
        } catch (error) {
            console.error("Erro ao adicionar transação:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-3">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{type === 'weekly' ? 'Adicionar Gasto Semanal' : 'Adicionar Despesa Fixa/Parcelada'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (ex: Supermercado)" className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor Total (R$)" className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                <div className="relative">
                    <input 
                        type="text" 
                        value={tag} 
                        onChange={handleTagChange} 
                        onFocus={() => setIsSuggestionsOpen(true)}
                        onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)} // Delay para permitir o clique na sugestão
                        placeholder="Tag (ex: Alimentação)" 
                        className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" 
                        autoComplete="off"
                    />
                    {isSuggestionsOpen && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {suggestions.map(s => (
                                <li 
                                    key={s} 
                                    onMouseDown={() => handleSuggestionClick(s)}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-2"
                                >
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: household.tags[s]?.color || '#ccc' }}></span>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded-md w-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
            </div>
            {type === 'monthly' && (
                <div>
                    <label htmlFor="installments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Parcelas</label>
                    <input type="number" id="installments" value={installments} onChange={e => setInstallments(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="p-2 border rounded-md w-full mt-1 bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                </div>
            )}
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">Adicionar</button>
        </form>
    );
};

const TransactionList = ({ transactions, onEdit, onDelete, household }) => {
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    if (transactions.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">Nenhuma transação para exibir.</p>;
    }

    return (
        <ul className="space-y-3">
            {transactions.map(t => {
                const tagColor = household.tags?.[t.tag]?.color || '#cccccc';
                return (
                    <li key={t.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{t.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tagColor }}></span>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t.tag} - {t.date.toDate().toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className={`font-bold ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(t.amount)}</p>
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(t)} className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(t)} className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

const WeeklyView = ({ householdId, household, transactions, handleEdit, handleDelete }) => {
    const [newBudget, setNewBudget] = useState(household.weeklyBudget || 0);

    const { weeklyExpenses, remainingBudget } = useMemo(() => {
        const now = new Date();
        const weekStartsOn = household.weekStartsOn ?? 1; // 0=Dom, 1=Seg, ...
        const dayOfWeek = now.getDay();

        let diff = now.getDate() - dayOfWeek + weekStartsOn;
        if (dayOfWeek < weekStartsOn) {
            diff -= 7;
        }

        const startOfWeek = new Date(new Date().setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyExpenses = transactions.filter(t => {
            const tDate = t.date.toDate();
            return tDate >= startOfWeek && tDate <= endOfWeek;
        }).sort((a, b) => b.date.toDate() - a.date.toDate());

        const totalSpent = weeklyExpenses.reduce((sum, t) => sum + t.amount, 0);
        const remainingBudget = (household.weeklyBudget || 0) + totalSpent;
        return { weeklyExpenses, remainingBudget };
    }, [transactions, household.weeklyBudget, household.weekStartsOn]);

    const handleBudgetUpdate = async () => {
        const budgetValue = parseFloat(newBudget);
        if (!isNaN(budgetValue)) {
            const householdRef = doc(db, 'households', householdId);
            await setDoc(householdRef, { weeklyBudget: budgetValue }, { merge: true });
        }
    };
    
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Orçamento Semanal</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">R$</span>
                        <input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} onBlur={handleBudgetUpdate} className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 bg-transparent border-b-2 border-indigo-200 dark:border-indigo-700 focus:outline-none focus:border-indigo-500 text-center w-32" />
                    </div>
                </div>
                <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Saldo Restante</h3>
                    <p className="text-3xl font-bold">{formatCurrency(remainingBudget)}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"><TransactionForm householdId={householdId} type="weekly" household={household} /></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">Gastos da Semana</h3>
                <TransactionList transactions={weeklyExpenses} onEdit={handleEdit} onDelete={handleDelete} household={household} />
            </div>
        </div>
    );
};

const MonthlyView = ({ householdId, transactions, handleEdit, handleDelete, household }) => {
    const [analysis, setAnalysis] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const { monthlyExpenses, tagData } = useMemo(() => {
        const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59);
        const monthlyExpenses = transactions.filter(t => {
            const tDate = t.date.toDate();
            return tDate >= startOfMonth && tDate <= endOfMonth;
        }).sort((a, b) => b.date.toDate() - a.date.toDate());
        const tagTotals = monthlyExpenses.reduce((acc, t) => {
            acc[t.tag] = (acc[t.tag] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
        const tagData = Object.keys(tagTotals).map(tag => ({ 
            name: tag, 
            value: tagTotals[tag],
            fill: household.tags?.[tag]?.color || '#cccccc' // Usa a cor da tag
        }));
        return { monthlyExpenses, tagData };
    }, [transactions, viewDate, household.tags]);
    
    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis('');
        if (monthlyExpenses.length === 0) {
            setAnalysis("Não há gastos neste mês para analisar.");
            setIsAnalyzing(false); return;
        }
        const transactionsText = monthlyExpenses.map(t => `- ${t.description} (Tag: ${t.tag}): ${formatCurrency(Math.abs(t.amount))}`).join('\n');
        const prompt = `Você é um consultor financeiro amigável e prestativo para um casal. Com base na lista de despesas mensais a seguir, forneça uma análise detalhada e concisa em português do Brasil.\n\nSua análise deve incluir:\n1. **Resumo Geral:** Um parágrafo curto sobre o padrão de gastos do mês.\n2. **Principais Categorias:** Identifique as 3 principais categorias de gastos.\n3. **Dicas para Economizar:** Ofereça 2-3 dicas práticas e realistas para o casal reduzir despesas, com base nos gastos apresentados.\n4. **Palavra de Incentivo:** Termine com uma nota positiva e encorajadora.\n\nFormate sua resposta de forma clara, usando títulos para cada seção.\n\n**Dados de Despesas:**\n${transactionsText}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setAnalysis(result.candidates[0].content.parts[0].text);
            } else {
                setAnalysis("Não foi possível gerar a análise. A resposta da API estava vazia ou em formato inesperado.");
            }
        } catch (error) {
            console.error("Erro ao chamar a API Gemini:", error);
            setAnalysis("Ocorreu um erro ao tentar analisar seus gastos. Por favor, tente novamente mais tarde.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const changeMonth = (offset) => {
        setViewDate(current => {
            const newDate = new Date(current);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        setAnalysis("");
    };

    const monthName = viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">Gastos por Categoria</h3>
                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-100">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&lt;</button>
                        <span className="font-semibold text-center w-36 capitalize">{monthName}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&gt;</button>
                    </div>
                </div>
                {tagData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={tagData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {tagData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">Sem dados de gastos para exibir no gráfico deste mês.</p>}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">Análise Financeira com IA</h3></div>
                <button onClick={handleAnalysis} disabled={isAnalyzing || monthlyExpenses.length === 0} className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isAnalyzing ? 'Analisando...' : '✨ Analisar Gastos do Mês'}
                </button>
                {isAnalyzing && (<div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>)}
                {analysis && (<div className="mt-4 p-4 bg-indigo-50 dark:bg-gray-700/50 border border-indigo-200 dark:border-gray-600 rounded-lg whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{analysis}</div>)}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"><TransactionForm householdId={householdId} type="monthly" household={household} /></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">Todas as Transações do Mês</h3>
                <TransactionList transactions={monthlyExpenses} onEdit={handleEdit} onDelete={handleDelete} household={household} />
            </div>
        </div>
    );
};

const Dashboard = ({ user, householdId, household, transactions, theme, onThemeToggle }) => {
    const [activeTab, setActiveTab] = useState('weekly');
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [deleteScope, setDeleteScope] = useState('single');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Erro ao fazer logout:", error); } };
    const copyToClipboard = () => { navigator.clipboard.writeText(householdId).then(() => alert('ID do Lar copiado!'), (err) => console.error('Falha ao copiar: ', err)); };

    const handleOpenEditModal = (transaction) => setEditingTransaction(transaction);
    const handleOpenDeleteModal = (transaction) => setDeletingTransaction(transaction);
    const handleCloseModals = () => {
        setEditingTransaction(null);
        setDeletingTransaction(null);
        setDeleteScope('single');
    };

    const handleSaveTransaction = async (updatedTransaction) => {
        const transRef = doc(db, 'transactions', updatedTransaction.id);
        try {
            await setDoc(transRef, updatedTransaction, { merge: true });
            handleCloseModals();
        } catch (error) {
            console.error("Erro ao atualizar transação:", error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTransaction) return;
        const batch = writeBatch(db);
        if (deletingTransaction.isInstallment && deleteScope === 'all') {
            const q = query(
                collection(db, 'transactions'),
                where("installmentId", "==", deletingTransaction.installmentId),
                where("date", ">=", deletingTransaction.date)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => batch.delete(doc.ref));
        } else {
            const transRef = doc(db, 'transactions', deletingTransaction.id);
            batch.delete(transRef);
        }
        try {
            await batch.commit();
            handleCloseModals();
        } catch (error) {
            console.error("Erro ao excluir transação:", error);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100"><WalletIcon /><h1 className="text-2xl font-bold">OrçaCasal</h1></div>
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <MenuIcon />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-200 dark:border-gray-700">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">ID do Lar</p>
                                    <p onClick={copyToClipboard} className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-1 rounded-md cursor-pointer text-gray-700 dark:text-gray-200" title="Clique para copiar">{householdId}</p>
                                </div>
                                <div className="py-2">
                                    <button onClick={() => { onThemeToggle(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                                        {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5" />}
                                        Alternar Tema
                                    </button>
                                    <button onClick={() => { setIsSettingsModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                                        <CogIcon />
                                        Configurar Semana
                                    </button>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3">
                                        <LogoutIcon />Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-6"><div className="border-b border-gray-200 dark:border-gray-700"><nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('weekly')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'weekly' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>Visão Semanal</button>
                    <button onClick={() => setActiveTab('monthly')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'monthly' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>Visão Mensal</button>
                </nav></div></div>
                
                {activeTab === 'weekly' && <WeeklyView householdId={householdId} household={household} transactions={transactions} handleEdit={handleOpenEditModal} handleDelete={handleOpenDeleteModal} />}
                {activeTab === 'monthly' && <MonthlyView householdId={householdId} transactions={transactions} handleEdit={handleOpenEditModal} handleDelete={handleOpenDeleteModal} household={household} />}
            </main>

            <WeekSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} household={household} householdId={householdId} />
            <EditTransactionModal isOpen={!!editingTransaction} onClose={handleCloseModals} transaction={editingTransaction} onSave={handleSaveTransaction} />
            <ConfirmationModal isOpen={!!deletingTransaction} onClose={handleCloseModals} onConfirm={handleDeleteConfirm} title="Confirmar Exclusão">
                <p>Você tem certeza que deseja excluir esta transação?</p>
                <p className="font-semibold mt-2">{deletingTransaction?.description}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deletingTransaction?.amount || 0)}</p>
                {deletingTransaction?.isInstallment && (
                    <div className="mt-4 space-y-2">
                        <label className="flex items-center"><input type="radio" name="deleteScope" value="single" checked={deleteScope === 'single'} onChange={() => setDeleteScope('single')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Excluir apenas esta parcela</span></label>
                        <label className="flex items-center"><input type="radio" name="deleteScope" value="all" checked={deleteScope === 'all'} onChange={() => setDeleteScope('all')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /><span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Excluir esta e todas as parcelas futuras</span></label>
                    </div>
                )}
            </ConfirmationModal>
        </div>
    );
};

// --- Componente Raiz da Aplicação ---
export default function App() {
    const [user, setUser] = useState(null);
    const [householdId, setHouseholdId] = useState(null);
    const [household, setHousehold] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState('light'); // Estado para o tema

    // Efeito para aplicar a classe do tema no HTML
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    // Efeito para gerenciar o estado de autenticação.
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setIsLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Efeito para buscar dados do usuário, incluindo a preferência de tema.
    useEffect(() => {
        if (!user) {
            setHouseholdId(null);
            return;
        };

        setIsLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setHouseholdId(userData.householdId || null);
                setTheme(userData.theme || 'light'); // Carrega o tema salvo ou usa 'light'
            } else {
                setHouseholdId(null);
                setTheme('light'); // Padrão para novos usuários
            }
            
            if (!docSnap.data()?.householdId) {
                setIsLoading(false);
            }
        }, (error) => {
            console.error("Erro ao buscar dados do usuário:", error);
            setIsLoading(false);
        });
        return () => unsubscribeUser();
    }, [user]);

    // Efeito para buscar dados do lar e transações.
    useEffect(() => {
        if (!householdId) {
            setHousehold(null);
            setTransactions([]);
            return;
        };

        setIsLoading(true);
        const householdDocRef = doc(db, 'households', householdId);
        const unsubscribeHousehold = onSnapshot(householdDocRef, (docSnap) => {
            setHousehold(docSnap.exists() ? docSnap.data() : null);
        }, (error) => {
            console.error("Erro ao buscar dados do lar:", error);
            setIsLoading(false);
        });

        const transactionsQuery = query(collection(db, 'transactions'), where("householdId", "==", householdId));
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (querySnapshot) => {
            const trans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(trans);
            setIsLoading(false);
        }, (error) => {
            console.error("Erro ao buscar transações:", error);
            setIsLoading(false);
        });

        return () => {
            unsubscribeHousehold();
            unsubscribeTransactions();
        };
    }, [householdId]);

    // Função para alternar e salvar o tema
    const handleThemeToggle = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
            } catch (error) {
                console.error("Erro ao salvar a preferência de tema:", error);
            }
        }
    };

    // Lógica de Renderização
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>;
    }

    if (!user) {
        return <AuthComponent />;
    }

    if (!householdId) {
        return <HouseholdSetup user={user} setHouseholdId={setHouseholdId} />;
    }
    
    if (household) {
        return <Dashboard user={user} householdId={householdId} household={household} transactions={transactions} theme={theme} onThemeToggle={handleThemeToggle} />;
    }

    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>;
}
