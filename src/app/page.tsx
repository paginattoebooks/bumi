"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Types (iguais ao original)
type UserRole = 'visitor' | 'user' | 'subscriber';
type Tab = 'home' | 'explore' | 'community' | 'scanner' | 'products' | 'profile';
type ProductType = 'ebook' | 'video';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isFollowing: boolean;
  role: UserRole;
}

interface Post {
  id: string;
  author: User;
  image: string;
  caption: string;
  plantSpecies: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: Date;
  hashtags: string[];
}

interface Ebook {
  id: string;
  title: string;
  author: string;
  cover: string;
  pages: number;
  isPremium: boolean;
  previewPages: number;
  description: string;
  rating: number;
}

interface PlantScanResult {
  speciesName: string;
  scientificName: string;
  confidence: number;
  needsWater: boolean;
  lightRecommendation: 'more' | 'less' | 'ok';
  tips: string[];
  alternativeCandidates?: {
    name: string;
    scientificName: string;
    confidence: number;
  }[];
}

interface Product {
  id: string;
  type: ProductType;
  title: string;
  author: string;
  cover: string;
  fileUrl?: string;
  duration?: number;
  pages?: number;
  isPremium: boolean;
  previewContent?: string;
  previewPages?: number;
  description: string;
  rating: number;
}

interface ScanHistory {
  id: string;
  userId: string;
  imageUrl: string;
  result: PlantScanResult;
  feedback?: 'correct' | 'incorrect';
  timestamp: Date;
}

interface ImageQuality {
  resolution: { width: number; height: number };
  brightness: number;
  sharpness: number;
  isAcceptable: boolean;
  issues: string[];
}

// Mock Data (igual ao original)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Maria Silva',
    username: 'plantlover_maria',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1668cfaf-adff-4f3c-87a2-d7a9fd71c620.png',
    bio: 'Apaixonada por suculentas e jardins urbanos',
    followers: 1234,
    following: 567,
    isFollowing: false,
    role: 'subscriber'
  },
  {
    id: '2',
    name: 'João Costa',
    username: 'green_joao',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9c89d9af-3c36-4566-9b92-9cc63175b13c.png',
    bio: 'Paisagista profissional | Dicas de jardinagem',
    followers: 3456,
    following: 890,
    isFollowing: true,
    role: 'user'
  },
  {
    id: '3',
    name: 'Ana Paula',
    username: 'ana_plants',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/926c5629-578e-4d85-a8d4-c86f31e609d8.png',
    bio: 'Colecionadora de orquídeas raras',
    followers: 2789,
    following: 1234,
    isFollowing: false,
    role: 'subscriber'
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ab94d0af-4728-4374-b8f8-c610b79b6d02.png',
    caption: 'Minha coleção de suculentas está crescendo! 🌵 Qual a favorita de vocês?',
    plantSpecies: 'Echeveria elegans',
    likes: 234,
    comments: 45,
    isLiked: false,
    timestamp: new Date('2025-01-10T10:30:00'),
    hashtags: ['suculentas', 'jardinagem', 'plantasemcasa']
  },
  {
    id: '2',
    author: mockUsers[1],
    image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/43217aa5-13f3-4954-89c9-7d6f3793bf63.png',
    caption: 'Dica do dia: sempre regue suas plantas pela manhã para evitar fungos',
    plantSpecies: 'Monstera deliciosa',
    likes: 567,
    comments: 89,
    isLiked: true,
    timestamp: new Date('2025-01-10T09:15:00'),
    hashtags: ['dicasdejardim', 'plantasinteriores', 'monstera']
  },
  {
    id: '3',
    author: mockUsers[2],
    image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/23a95e82-a9c9-4f6d-b042-53648ec4bfca.png',
    caption: 'Finalmente floriu! Depois de 3 anos de cuidados, minha orquídea deu essa flor linda',
    plantSpecies: 'Phalaenopsis amabilis',
    likes: 891,
    comments: 123,
    isLiked: false,
    timestamp: new Date('2025-01-09T16:45:00'),
    hashtags: ['orquideas', 'floracao', 'paciencia']
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Guia Completo de Suculentas',
    author: 'Dr. Pedro Jardim',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/12df69a7-0d39-40c1-ac07-f42b91305a5f.png',
    pages: 156,
    isPremium: true,
    previewPages: 15,
    description: 'Aprenda tudo sobre cuidados, propagação e identificação de suculentas',
    rating: 4.8,
    type: 'ebook',
    fileUrl: ''
  },
  {
    id: '2',
    title: 'Orquídeas Brasileiras',
    author: 'Profa. Carla Flores',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f8d49dbd-4461-468e-9646-9ad27bcc2470.png',
    pages: 234,
    isPremium: true,
    previewPages: 23,
    description: 'Catálogo completo de orquídeas nativas do Brasil com técnicas de cultivo',
    rating: 4.9,
    type: 'ebook',
    fileUrl: ''
  },
  {
    id: '3',
    title: 'Jardinagem Urbana Fácil',
    author: 'Lucas Verde',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6b4cf216-b75f-4c3f-80ba-c9c1e620e2b3.png',
    pages: 128,
    isPremium: false,
    previewPages: 128,
    description: 'Transforme pequenos espaços em jardins incríveis',
    rating: 4.6,
    type: 'ebook',
    fileUrl: ''
  },
  {
    id: '4',
    title: 'Plantas Medicinais Caseiras',
    author: 'Dra. Helena Herbal',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/...',
    pages: 189,
    isPremium: true,
    previewPages: 18,
    description: 'Cultive e use plantas medicinais no seu dia a dia',
    type: 'ebook',
    rating: 4.7
  },
  {
    id: 'v1',
    title: 'Curso Completo de Jardinagem',
    type: 'video',
    author: 'Prof. Roberto Jardins',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/video1-cover.png',
    fileUrl: 'https://example.com/video1.mp4',
    duration: 1800,
    isPremium: true,
    previewContent: '120',
    description: 'Aprenda técnicas profissionais de jardinagem do zero',
    rating: 4.9
  },
  {
    id: 'v2',
    title: 'Cuidados com Suculentas - Aula Prática',
    type: 'video',
    author: 'Maria Suculentas',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/video2-cover.png',
    fileUrl: 'https://example.com/video2.mp4',
    duration: 900,
    isPremium: false,
    previewContent: '900',
    description: 'Guia completo sobre rega, sol e propagação de suculentas',
    rating: 4.7
  },
  {
    id: 'v3',
    title: 'Diagnóstico de Pragas em Plantas',
    type: 'video',
    author: 'Dr. Carlos Botânica',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/video3-cover.png',
    fileUrl: 'https://example.com/video3.mp4',
    duration: 1200,
    isPremium: true,
    previewContent: '180',
    description: 'Identifique e trate pragas comuns em plantas domésticas',
    rating: 4.8
  }
];

const mockEbooks: Ebook[] = mockProducts.filter(p => p.type === 'ebook').map(p => ({
  id: p.id,
  title: p.title,
  author: p.author,
  cover: p.cover,
  pages: p.pages || 0,
  isPremium: p.isPremium,
  previewPages: p.previewPages ?? (p.previewContent ? parseInt(p.previewContent) : 0),
  description: p.description,
  rating: p.rating
}));

function AuthForm({ onClose, onLogged }: { onClose: () => void; onLogged: () => void }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password: pw });
    setLoading(false);
    if (error) alert(error.message);
    else { alert('Conta criada! Verifique seu e-mail.'); setMode('login'); }
  }

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) alert(error.message);
    else { onLogged(); onClose(); }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setMode('login')} className={`flex-1 p-2 rounded ${mode === 'login' ? 'bg-purple-600 text-white' : 'border'}`}>Entrar</button>
        <button onClick={() => setMode('signup')} className={`flex-1 p-2 rounded ${mode === 'signup' ? 'bg-purple-600 text-white' : 'border'}`}>Criar conta</button>
      </div>
      <input className="border p-2 w-full rounded" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full rounded" type="password" placeholder="senha" value={pw} onChange={e => setPw(e.target.value)} />
      {mode === 'login' ? (
        <button onClick={signIn} disabled={loading} className="w-full bg-purple-600 text-white p-2 rounded">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      ) : (
        <button onClick={signUp} disabled={loading} className="w-full bg-purple-600 text-white p-2 rounded">
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      )}
    </div>
  );
}

const PlantCommunityApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isChildMode, setIsChildMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PlantScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showEbookReader, setShowEbookReader] = useState<Ebook | null>(null);
  const [showReportModal, setShowReportModal] = useState<Post | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) {
        setCurrentUser({
          ...mockUsers[0],
          name: email,
          username: email.split('@')[0],
          role: 'user'
        });
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  const colors = {
    primary: isDarkMode ? 'bg-purple-900' : 'bg-purple-600',
    secondary: isDarkMode ? 'bg-teal-800' : 'bg-teal-500',
    accent: isDarkMode ? 'bg-purple-700' : 'bg-purple-500',
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600'
  };

  // Actions (iguais ao original)
  const handleLike = (postId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const handleFollow = (userId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    // Implementation for follow logic
  };

  const handleOpenEbook = (ebook: Ebook) => {
   
