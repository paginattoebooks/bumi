"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, Search, Users, BookOpen, User, Heart, MessageCircle, Share2, 
  Settings, Bell, Plus, ChevronLeft, Eye, Download, Flag, Lock,
  Menu, X, Sun, Moon, Check, Star, TrendingUp, Filter, Crown,
  Scan, Camera, Droplets, SunMedium, Leaf, Play, Pause, Volume2, 
  VolumeX, Maximize, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { AuthModal, PaywallModal, CreatePostModal, EbookReaderModal, ReportModal } from '@/components/modals' ;


// Types
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
  fileUrl?: string;   // ← opcional
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

// Mock Data
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
    fileUrl: '',
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
    rating: 4.7,
    // fileUrl pode ficar faltando porque deixamos como opcional (fileUrl?)
},

  {
    id: 'v1',
    title: 'Curso Completo de Jardinagem',
    type: 'video',
    author: 'Prof. Roberto Jardins',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/video1-cover.png',
    fileUrl: 'https://example.com/video1.mp4',
    duration: 1800, // 30 minutes
    isPremium: true,
    previewContent: '120', // 2 minutes preview
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
    duration: 900, // 15 minutes
    isPremium: false,
    previewContent: '900', // full access
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
    duration: 1200, // 20 minutes
    isPremium: true,
    previewContent: '180', // 3 minutes preview
    description: 'Identifique e trate pragas comuns em plantas domésticas',
    rating: 4.8
  }
];

// Keep old Ebook type for backward compatibility

const mockEbooks: Ebook[] = mockProducts
  .filter(p => p.type === 'ebook')
  .map(p => ({
    id: p.id ?? '',
    title: p.title ?? '',
    author: p.author ?? '',
    cover: p.cover ?? '',
    pages: p.pages ?? 0,
    isPremium: p.isPremium ?? false,
    previewPages: p.previewPages ?? (p.previewContent ? parseInt(p.previewContent) : 0),
    description: p.description ?? '',
    rating: p.rating ?? 0,
  }));


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
        <button onClick={() => setMode('login')}  className={`flex-1 p-2 rounded ${mode==='login' ? 'bg-purple-600 text-white' : 'border'}`}>Entrar</button>
        <button onClick={() => setMode('signup')} className={`flex-1 p-2 rounded ${mode==='signup' ? 'bg-purple-600 text-white' : 'border'}`}>Criar conta</button>
      </div>

      <input className="border p-2 w-full rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full rounded" type="password" placeholder="senha" value={pw} onChange={e=>setPw(e.target.value)} />

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


export default function PlantCommunityApp() {
  // State Management
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
   useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) {
        setCurrentUser({
          ...mockUsers[0],
          name: email,
          username: email.split('@')[0],
          role: 'user', // depois mudamos para 'subscriber' após o pagamento
        });
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  // Theme colors
  const colors = {
    primary: isDarkMode ? 'bg-purple-900' : 'bg-purple-600',
    secondary: isDarkMode ? 'bg-teal-800' : 'bg-teal-500',
    accent: isDarkMode ? 'bg-purple-700' : 'bg-purple-500',
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600'
  };

  // Actions
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
    if (ebook.isPremium && currentUser?.role !== 'subscriber') {
      setShowPaywallModal(true);
      return;
    }
    setShowEbookReader(ebook);
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setShowCreatePostModal(true);
  };

  const handleSubscribe = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: 'subscriber' });
      setShowPaywallModal(false);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogin = (role: UserRole = 'user') => {
    setCurrentUser({
      ...mockUsers[0],
      role
    });
    setShowAuthModal(false);
  };

  // Image Quality Check
  const checkImageQuality = async (imageDataUrl: string): Promise<ImageQuality> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({
            resolution: { width: 0, height: 0 },
            brightness: 0,
            sharpness: 0,
            isAcceptable: false,
            issues: ['Erro ao processar imagem']
          });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate brightness
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += (r + g + b) / 3;
        }
        const brightness = totalBrightness / (data.length / 4);

        // Simple sharpness estimation (variance of grayscale)
        const grayscale: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          grayscale.push((r + g + b) / 3);
        }
        
        const mean = grayscale.reduce((a, b) => a + b, 0) / grayscale.length;
        const variance = grayscale.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / grayscale.length;
        const sharpness = Math.sqrt(variance);

        const issues: string[] = [];
        let isAcceptable = true;

        // Check resolution
        if (img.width < 512 || img.height < 512) {
          issues.push('Resolução muito baixa');
          isAcceptable = false;
        }

        // Check brightness (ideal range: 80-170)
        if (brightness < 60) {
          issues.push('Imagem muito escura');
          isAcceptable = false;
        } else if (brightness > 200) {
          issues.push('Imagem muito clara');
          isAcceptable = false;
        }

        // Check sharpness (threshold: 20)
        if (sharpness < 15) {
          issues.push('Imagem sem foco ou borrada');
          isAcceptable = false;
        }

        resolve({
          resolution: { width: img.width, height: img.height },
          brightness,
          sharpness,
          isAcceptable,
          issues
        });
      };

      img.onerror = () => {
        resolve({
          resolution: { width: 0, height: 0 },
          brightness: 0,
          sharpness: 0,
          isAcceptable: false,
          issues: ['Erro ao carregar imagem']
        });
      };

      img.src = imageDataUrl;
    });
  };

  // Real AI Plant Analysis using OpenAI GPT-4 Vision
  const analyzePlantWithAI = async (imageDataUrl: string): Promise<PlantScanResult> => {
    try {
      // This should be called via backend API to protect the API key
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao analisar a planta');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Erro na análise:', error);
      // Fallback to mock for demo
      return mockAnalyzePlant(imageDataUrl);
    }
  };

  // Scanner Functions (Mock - for demo purposes)
  const mockAnalyzePlant = (imageDataUrl: string): PlantScanResult => {
    // Simple deterministic hash based on image data length
    const hash = imageDataUrl.length % 10;
    
    const species = [
      { name: 'Monstera deliciosa', tips: ['Regar 1-2x por semana', 'Luz indireta brilhante', 'Limpar folhas mensalmente', 'Adubo líquido a cada 2 semanas', 'Tutor para crescimento vertical'] },
      { name: 'Ficus lyrata', tips: ['Regar quando solo secar 5cm', 'Evitar mudanças de local', 'Girar vaso mensalmente', 'Limpar folhas com pano úmido', 'Solo bem drenado'] },
      { name: 'Pothos aureus', tips: ['Muito resistente', 'Tolera pouca luz', 'Regar moderadamente', 'Propaga fácil na água', 'Pode crescer em hidroponia'] },
      { name: 'Sansevieria trifasciata', tips: ['Regar pouco', 'Tolera sombra', 'Purifica o ar', 'Solo arenoso', 'Resistente a pragas'] },
      { name: 'Zamioculcas zamiifolia', tips: ['Extremamente resistente', 'Regar a cada 2-3 semanas', 'Tolera baixa luz', 'Cresce devagar', 'Evitar excesso de água'] },
      { name: 'Spathiphyllum wallisii', tips: ['Indica sede com folhas murchas', 'Prefere sombra', 'Flores brancas frequentes', 'Alta umidade', 'Adubo mensal'] },
      { name: 'Chlorophytum comosum', tips: ['Produz mudinhas', 'Muito fácil de cuidar', 'Luz indireta', 'Regar regularmente', 'Purifica o ar'] },
      { name: 'Epipremnum aureum', tips: ['Cresce rápido', 'Pode ser trepadeira', 'Luz baixa a média', 'Regar quando secar', 'Poda estimula crescimento'] },
      { name: 'Philodendron hederaceum', tips: ['Folhas em formato de coração', 'Luz filtrada', 'Solo úmido', 'Cresce em cascata', 'Fácil propagação'] },
      { name: 'Dracaena marginata', tips: ['Cresce vertical', 'Luz média', 'Sensível ao flúor', 'Regar moderadamente', 'Folhas pontiagudas'] }
    ];
    
    const selected = species[hash];
    const confidence = 75 + (hash * 2);
    const needsWater = hash % 3 === 0;
    const lightOptions: ('more' | 'less' | 'ok')[] = ['more', 'less', 'ok'];
    const lightRecommendation = lightOptions[hash % 3];
    
    // Generate alternative candidates
    const alternativeCandidates = [
      species[(hash + 1) % 10],
      species[(hash + 3) % 10],
    ].map(s => ({
      name: s.name,
      scientificName: s.name.replace(' ', '_').toLowerCase(),
      confidence: Math.max(40, confidence - Math.floor(Math.random() * 20) - 10)
    }));

    return {
      speciesName: selected.name,
      scientificName: selected.name.replace(' ', '_').toLowerCase(),
      confidence,
      needsWater,
      lightRecommendation,
      tips: selected.tips,
      alternativeCandidates: confidence < 85 ? alternativeCandidates : undefined
    };
  };

  const onPickImage = (file: File | null) => {
    if (!file) {
      setScanImage(null);
      setScanResult(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setScanImage(reader.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const [imageQuality, setImageQuality] = useState<ImageQuality | null>(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);

  const onAnalyze = async () => {
    if (!scanImage) return;
    
    setIsAnalyzing(true);
    setShowQualityWarning(false);
    
    try {
      // Step 1: Check image quality
      const quality = await checkImageQuality(scanImage);
      setImageQuality(quality);
      
      if (!quality.isAcceptable) {
        setShowQualityWarning(true);
        setIsAnalyzing(false);
        return;
      }
      
      // Step 2: Analyze with AI
      // In production, this calls the real API
      // For demo, we use mock
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const result = await analyzePlantWithAI(scanImage);
      // const result = mockAnalyzePlant(scanImage); // Fallback
      
      setScanResult(result);
      
      // Save to history (would be saved to DB in production)
      if (currentUser) {
        const scanRecord: ScanHistory = {
          id: `scan-${Date.now()}`,
          userId: currentUser.id,
          imageUrl: scanImage,
          result,
          timestamp: new Date()
        };
        // TODO: Save to Firebase/Supabase
        console.log('Scan saved:', scanRecord);
      }
      
    } catch (error) {
      console.error('Erro na análise:', error);
      alert('Erro ao analisar a planta. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const shareScanAsPost = () => {
    if (!currentUser || !scanResult || !scanImage) {
      setShowAuthModal(true);
      return;
    }
    
    const waterStatus = scanResult.needsWater ? 'precisa de água' : 'água ok';
    const lightStatus = scanResult.lightRecommendation === 'more' ? 'mais sol' : 
                        scanResult.lightRecommendation === 'less' ? 'menos sol' : 'luz ok';
    
    const caption = `Identificada: ${scanResult.speciesName} (${scanResult.confidence}%). ${waterStatus} · ${lightStatus}. Dica: ${scanResult.tips[0]}`;
    
    const newPost: Post = {
      id: `scan-${Date.now()}`,
      author: currentUser,
      image: scanImage,
      caption,
      plantSpecies: scanResult.speciesName,
      likes: 0,
      comments: 0,
      isLiked: false,
      timestamp: new Date(),
      hashtags: ['plantscanner', 'identificacao', scanResult.speciesName.split(' ')[0].toLowerCase()]
    };
    
    setPosts([newPost, ...posts]);
    setCurrentTab('home');
    setScanImage(null);
    setScanResult(null);
  };

// Header — versão corrigida e completa
const Header: React.FC = () => {
  return (
    <header
      className={`sticky top-0 z-50 ${colors.card} border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } shadow-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">🌿</span>
          </div>
          <h1 className={`text-xl font-bold ${colors.text} ${isChildMode ? 'text-2xl' : ''}`}>
            PlantHub
          </h1>
        </div>

        {/* Ações no canto direito */}
        <div className="flex items-center gap-2">
          {/* Alternar tema */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Se está logado → sininho + avatar. Senão → Entrar/Cadastrar */}
          {currentUser ? (
            <>
              {/* Notificações */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* Avatar → ir para perfil */}
              <Avatar className="cursor-pointer" onClick={() => setCurrentTab('profile')}>
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
              </Avatar>
            </>
          ) : (
            <Button onClick={() => setShowAuthModal(true)} className="rounded-full px-4">
              Entrar / Cadastrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

// Bottom Navigation — mobile first
const BottomTabBar: React.FC = () => {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 ${colors.card} border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      } shadow-lg z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-around">
        {[
          { id: 'home' as Tab, icon: Home, label: 'Início' },
          { id: 'explore' as Tab, icon: Search, label: 'Explorar' },
          { id: 'community' as Tab, icon: Users, label: 'Comunidade' },
          { id: 'scanner' as Tab, icon: Scan, label: 'Scanner' },
          {
            id: 'products' as Tab,
            icon: BookOpen,
            label: isChildMode ? 'Produtos' : 'Meus Produtos',
          },
          { id: 'profile' as Tab, icon: User, label: 'Perfil' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-all duration-150 ${
                isActive
                  ? `${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-semibold`
                  : `${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
              } hover:scale-105`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
  const PostCard = ({ post }: { post: Post }) => (
    <Card className={`${colors.card} overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setSelectedProfile(post.author);
              setCurrentTab('profile');
            }}
          >
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className={`font-semibold ${colors.text} ${isChildMode ? 'text-lg' : ''}`}>
                {post.author.name}
              </p>
              <p className={`text-xs ${colors.textSecondary}`}>
                @{post.author.username}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowReportModal(post)}
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={post.image} 
            alt={`Post showing ${post.plantSpecies} shared by ${post.author.name}`}
            className="w-full aspect-square object-cover"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="ghost"
              size={isChildMode ? 'default' : 'sm'}
              className="gap-2 hover:text-red-500"
              onClick={() => handleLike(post.id)}
            >
              <Heart className={`${isChildMode ? 'w-6 h-6' : 'w-5 h-5'} ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className={isChildMode ? 'text-lg' : ''}>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size={isChildMode ? 'default' : 'sm'}
              className="gap-2"
              onClick={() => !currentUser && setShowAuthModal(true)}
            >
              <MessageCircle className={isChildMode ? 'w-6 h-6' : 'w-5 h-5'} />
              <span className={isChildMode ? 'text-lg' : ''}>{post.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size={isChildMode ? 'default' : 'sm'}
              className="gap-2"
            >
              <Share2 className={isChildMode ? 'w-6 h-6' : 'w-5 h-5'} />
            </Button>
          </div>
          
          <p className={`${colors.text} mb-2 ${isChildMode ? 'text-lg' : ''}`}>
            {post.caption}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${colors.secondary} text-white`}>
              {post.plantSpecies}
            </span>
            {post.hashtags.map(tag => (
              <span key={tag} className={`text-xs ${colors.textSecondary}`}>
                #{tag}
              </span>
            ))}
          </div>
          
          <p className={`text-xs ${colors.textSecondary}`}>
            {new Date(post.timestamp).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const HomeTab = () => (
    <div className="space-y-4 pb-20">
      {currentUser && (
        <Card className={`${colors.card} rounded-2xl shadow-sm`}>
          <CardContent className="p-4">
            <button
              onClick={handleCreatePost}
              className={`w-full ${colors.background} rounded-full px-4 py-3 text-left ${colors.textSecondary} hover:bg-opacity-80 transition-all ${isChildMode ? 'py-4 text-lg' : ''}`}
            >
              {isChildMode ? '📸 Postar foto da sua planta' : 'O que está cultivando hoje?'}
            </button>
          </CardContent>
        </Card>
      )}
      
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );

  const ExploreTab = () => (
    <div className="pb-20 space-y-6">
      <div className={`sticky top-16 z-40 ${colors.card} p-4 rounded-2xl shadow-md`}>
        <Input
          placeholder={isChildMode ? '🔍 Procurar plantas...' : 'Buscar plantas, pessoas, hashtags...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
        />
      </div>
      
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} flex items-center gap-2 ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          <TrendingUp className={isChildMode ? 'w-7 h-7' : 'w-5 h-5'} />
          {isChildMode ? '🔥 Mais populares' : 'Tendências'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['#suculentas', '#jardinagem', '#plantasinteriores', '#orquideas', '#cactos', '#dicasdejardim'].map(tag => (
            <Card key={tag} className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
              <CardContent className="p-4 text-center">
                <p className={`font-semibold ${colors.text} ${isChildMode ? 'text-xl' : ''}`}>{tag}</p>
                <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                  {Math.floor(Math.random() * 1000) + 100} posts
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '🌱 Tipos de plantas' : 'Espécies Populares'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Suculentas', scientific: 'Crassulaceae', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5bbec6a6-bef4-47ed-9e36-1068e668cd89.png' },
            { name: 'Orquídeas', scientific: 'Orchidaceae', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/dd255a5d-af36-4bed-904e-63ad6452cd4a.png' },
            { name: 'Samambaias', scientific: 'Pteridophyta', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ae8c3ed1-ce84-429f-8984-4edead9e337a.png' },
            { name: 'Cactos', scientific: 'Cactaceae', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/eed97d56-22c7-4897-bcb9-a936bffbe6f2.png' }
          ].map(species => (
            <Card key={species.name} className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}>
              <img 
                src={species.image} 
                alt={`${species.name} plant category showing various specimens and characteristics`}
                className="w-full h-40 object-cover"
              />
              <CardContent className="p-4">
                <h3 className={`font-bold ${colors.text} ${isChildMode ? 'text-xl' : ''}`}>
                  {species.name}
                </h3>
                {!isChildMode && (
                  <p className={`text-sm italic ${colors.textSecondary}`}>
                    {species.scientific}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const CommunityTab = () => (
    <div className="pb-20 space-y-6">
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '👥 Pessoas para seguir' : 'Sugestões de Usuários'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUsers.map(user => (
            <Card key={user.id} className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className={isChildMode ? 'w-16 h-16' : 'w-12 h-12'}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${colors.text} ${isChildMode ? 'text-lg' : ''}`}>
                        {user.name}
                      </h3>
                      {user.role === 'subscriber' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                      @{user.username}
                    </p>
                    <p className={`text-sm ${colors.text} mt-2 ${isChildMode ? 'text-base' : ''}`}>
                      {user.bio}
                    </p>
                    <div className={`flex gap-4 mt-2 text-sm ${colors.textSecondary}`}>
                      <span>{user.followers} seguidores</span>
                      <span>{user.following} seguindo</span>
                    </div>
                  </div>
                </div>
                <Button
                  className={`w-full mt-4 rounded-full ${
                    user.isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : `${colors.primary} text-white`
                  } ${isChildMode ? 'h-12 text-lg' : ''}`}
                  onClick={() => handleFollow(user.id)}
                >
                  {user.isFollowing ? (isChildMode ? '✓ Seguindo' : 'Seguindo') : (isChildMode ? '+ Seguir' : 'Seguir')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const EbooksTab = () => (
    <div className="pb-20 space-y-6">
      {currentUser?.role !== 'subscriber' && (
        <Card className={`${colors.accent} text-white rounded-2xl shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Crown className={isChildMode ? 'w-8 h-8' : 'w-6 h-6'} />
              <h3 className={`font-bold ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                {isChildMode ? '⭐ Seja Premium' : 'Acesso Premium'}
              </h3>
            </div>
            <p className={`mb-4 ${isChildMode ? 'text-lg' : ''}`}>
              {isChildMode 
                ? 'Leia todos os livros e aprenda muito mais!' 
                : 'Acesso ilimitado a todos os eBooks, guias e conteúdos exclusivos'}
            </p>
            <Button
              onClick={() => setShowPaywallModal(true)}
              className="bg-white text-purple-600 hover:bg-gray-100 rounded-full w-full"
              size={isChildMode ? 'lg' : 'default'}
            >
              {isChildMode ? '🎁 Começar Grátis' : 'Assinar Agora - 7 dias grátis'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '📚 Livros sobre plantas' : 'Biblioteca de eBooks'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockEbooks.map(ebook => (
            <Card 
              key={ebook.id} 
              className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
              onClick={() => handleOpenEbook(ebook)}
            >
              <div className="relative">
                <img 
                  src={ebook.cover} 
                  alt={`Cover of ${ebook.title} ebook showing plant illustrations and title text`}
                  className="w-full aspect-2/3 object-cover"
                />
                {ebook.isPremium && currentUser?.role !== 'subscriber' && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                {!ebook.isPremium && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    GRÁTIS
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className={`font-bold ${colors.text} line-clamp-2 ${isChildMode ? 'text-base' : 'text-sm'}`}>
                  {ebook.title}
                </h3>
                <p className={`text-xs ${colors.textSecondary} mt-1 ${isChildMode ? 'text-sm' : ''}`}>
                  {ebook.author}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className={`text-xs ${colors.text}`}>{ebook.rating}</span>
                  <span className={`text-xs ${colors.textSecondary} ml-auto`}>
                    {ebook.pages} pág.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const ProductsTab = () => {
    const [selectedType, setSelectedType] = useState<ProductType>('ebook');
    const filteredProducts = mockProducts.filter(p => p.type === selectedType);

    return (
      <div className="pb-20 space-y-6">
        {currentUser?.role !== 'subscriber' && (
          <Card className={`${colors.accent} text-white rounded-2xl shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Crown className={isChildMode ? 'w-8 h-8' : 'w-6 h-6'} />
                <h3 className={`font-bold ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                  {isChildMode ? '⭐ Seja Premium' : 'Acesso Premium'}
                </h3>
              </div>
              <p className={`mb-4 ${isChildMode ? 'text-lg' : ''}`}>
                {isChildMode 
                  ? 'Veja todos os vídeos e livros!' 
                  : 'Acesso ilimitado a todos os eBooks, vídeos e conteúdos exclusivos'}
              </p>
              <Button
                onClick={() => setShowPaywallModal(true)}
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-full w-full"
                size={isChildMode ? 'lg' : 'default'}
              >
                {isChildMode ? '🎁 Começar Grátis' : 'Assinar Agora - 7 dias grátis'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setSelectedType('ebook')}
            className={`flex-1 rounded-full ${
              selectedType === 'ebook' 
                ? `${colors.primary} text-white` 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
          >
            📚 {isChildMode ? 'Livros' : 'eBooks'}
          </Button>
          <Button
            onClick={() => setSelectedType('video')}
            className={`flex-1 rounded-full ${
              selectedType === 'video' 
                ? `${colors.primary} text-white` 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
          >
            🎥 {isChildMode ? 'Vídeos' : 'Vídeo-aulas'}
          </Button>
        </div>

        <div>
          <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
            {selectedType === 'ebook' 
              ? (isChildMode ? '📚 Livros sobre plantas' : 'Biblioteca de eBooks')
              : (isChildMode ? '🎥 Vídeos de cuidados' : 'Vídeo-aulas e Cursos')
            }
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                onClick={() => {
                  if (product.isPremium && currentUser?.role !== 'subscriber') {
                    setShowPaywallModal(true);
                  } else {
                    // Open product viewer
                    if (product.type === 'ebook') {
                      const ebook = mockEbooks.find(e => e.id === product.id);
                      if (ebook) setShowEbookReader(ebook);
                    } else {
                      // Open video player (implement VideoPlayerModal)
                      alert(`Reproduzir: ${product.title}`);
                    }
                  }
                }}
              >
                <div className="relative">
                  <img 
                    src={product.cover} 
                    alt={`${product.title} cover showing educational content about plants`}
                    className={`w-full ${product.type === 'ebook' ? 'aspect-2/3' : 'aspect-video'} object-cover`}
                  />
                  {product.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-purple-600 ml-1" />
                      </div>
                    </div>
                  )}
                  {product.isPremium && currentUser?.role !== 'subscriber' && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  {!product.isPremium && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      GRÁTIS
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className={`font-bold ${colors.text} line-clamp-2 mb-2 ${isChildMode ? 'text-lg' : 'text-base'}`}>
                    {product.title}
                  </h3>
                  <p className={`text-xs ${colors.textSecondary} mb-3 ${isChildMode ? 'text-sm' : ''}`}>
                    {product.author}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className={`text-xs ${colors.text}`}>{product.rating}</span>
                    <span className={`text-xs ${colors.textSecondary} ml-auto`}>
                      {product.type === 'ebook' 
                        ? `${product.pages} pág.` 
                        : `${Math.floor((product.duration || 0) / 60)} min`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ScannerTab = () => (
    <div className="pb-20 space-y-6">
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '📸 Identificar Planta' : 'Scanner de Plantas'}
        </h2>
        
        {!scanImage && !scanResult && (
          <Card className={`${colors.card} rounded-2xl shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Leaf className={`${colors.primary.replace('bg-', 'text-')} ${isChildMode ? 'w-6 h-6' : 'w-5 h-5'} shrink-0 mt-1`} />
                <div>
                  <h3 className={`font-semibold ${colors.text} mb-2 ${isChildMode ? 'text-lg' : ''}`}>
                    {isChildMode ? '💡 Dicas para tirar foto' : 'Dicas para um bom scan'}
                  </h3>
                  <ul className={`space-y-2 ${colors.textSecondary} ${isChildMode ? 'text-base' : 'text-sm'}`}>
                    <li>• {isChildMode ? 'Foto bem iluminada' : 'Boa iluminação natural'}</li>
                    <li>• {isChildMode ? 'Folhas no centro' : 'Folhas ou flores no centro'}</li>
                    <li>• {isChildMode ? 'Foto de perto' : 'Close-up da planta'}</li>
                    <li>• {isChildMode ? 'Imagem nítida' : 'Imagem focada e nítida'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className={`${colors.card} rounded-2xl shadow-md overflow-hidden`}>
          <CardContent className="p-6">
            {!scanImage ? (
              <div>
                <label 
                  htmlFor="plant-image-input"
                  className={`block border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full ${colors.primary} flex items-center justify-center ${isChildMode ? 'w-20 h-20' : ''}`}>
                      <Camera className={`text-white ${isChildMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
                    </div>
                    <p className={`${colors.text} font-semibold ${isChildMode ? 'text-xl' : ''}`}>
                      {isChildMode ? '📷 Tirar ou escolher foto' : 'Tirar foto ou escolher da galeria'}
                    </p>
                    <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                      {isChildMode ? 'Clique aqui' : 'Clique para selecionar'}
                    </p>
                  </div>
                </label>
                <input
                  id="plant-image-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src={scanImage} 
                    alt="Plant photo selected for identification by scanner"
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setScanImage(null);
                      setScanResult(null);
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {showQualityWarning && imageQuality && (
                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                            {isChildMode ? '⚠️ Foto precisa melhorar' : 'Qualidade da Imagem Insuficiente'}
                          </h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                            {imageQuality.issues.map((issue, i) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-3">
                            {isChildMode 
                              ? 'Tire outra foto com mais luz e foco.' 
                              : 'Por favor, tire uma nova foto com melhor iluminação e foco.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!scanResult && !showQualityWarning && (
                  <Button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full ${colors.primary} text-white rounded-full ${isChildMode ? 'h-16 text-xl' : 'h-12'}`}
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="animate-pulse">{isChildMode ? '🔍 Analisando...' : 'Analisando...'}</span>
                      </>
                    ) : (
                      <>{isChildMode ? '🔍 Analisar Planta' : 'Analisar Planta'}</>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {scanResult && (
          <Card className={`${colors.card} rounded-2xl shadow-lg overflow-hidden`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className={`${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                    {scanResult.speciesName}
                  </CardTitle>
                  {!isChildMode && (
                    <p className={`text-sm italic ${colors.textSecondary} mt-1`}>
                      {scanResult.scientificName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      scanResult.confidence >= 85 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      scanResult.confidence >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    } ${isChildMode ? 'text-sm px-4 py-2' : ''}`}>
                      {scanResult.confidence}% {isChildMode ? 'certeza' : 'confiança'}
                    </span>
                  </div>
                  
                  {scanResult.confidence < 70 && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {isChildMode 
                          ? '⚠️ Não temos certeza. Tente outra foto.' 
                          : 'Confiança baixa. Recomendamos tirar outra foto mais próxima da planta.'}
                      </p>
                    </div>
                  )}
                </div>
                <Leaf className={`${colors.primary.replace('bg-', 'text-')} ${isChildMode ? 'w-10 h-10' : 'w-8 h-8'} shrink-0`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {scanResult.alternativeCandidates && scanResult.alternativeCandidates.length > 0 && (
                <div>
                  <h4 className={`font-semibold ${colors.text} mb-3 ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                    {isChildMode ? '🤔 Pode ser também:' : 'Outras Possibilidades'}
                  </h4>
                  <div className="space-y-2">
                    {scanResult.alternativeCandidates.map((candidate, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} cursor-pointer hover:bg-opacity-80`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${colors.text} ${isChildMode ? 'text-base' : 'text-sm'}`}>
                              {candidate.name}
                            </p>
                            {!isChildMode && (
                              <p className={`text-xs italic ${colors.textSecondary}`}>
                                {candidate.scientificName}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            candidate.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {candidate.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${scanResult.needsWater ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className={`${scanResult.needsWater ? 'text-blue-600' : 'text-green-600'} ${isChildMode ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    <span className={`font-semibold ${colors.text} ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                      {isChildMode ? '💧 Água' : 'Água'}
                    </span>
                  </div>
                  <p className={`${colors.text} font-medium ${isChildMode ? 'text-base' : 'text-sm'}`}>
                    {scanResult.needsWater ? 
                      (isChildMode ? 'Precisa agora' : 'Precisa de água') : 
                      (isChildMode ? 'Está ok' : 'Não precisa agora')
                    }
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl ${
                  scanResult.lightRecommendation === 'more' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  scanResult.lightRecommendation === 'less' ? 'bg-purple-50 dark:bg-purple-900/20' :
                  'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <SunMedium className={`${
                      scanResult.lightRecommendation === 'more' ? 'text-yellow-600' :
                      scanResult.lightRecommendation === 'less' ? 'text-purple-600' :
                      'text-green-600'
                    } ${isChildMode ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    <span className={`font-semibold ${colors.text} ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                      {isChildMode ? '☀️ Luz' : 'Luz'}
                    </span>
                  </div>
                  <p className={`${colors.text} font-medium ${isChildMode ? 'text-base' : 'text-sm'}`}>
                    {scanResult.lightRecommendation === 'more' ? 
                      (isChildMode ? 'Mais sol' : 'Precisa de mais') :
                      scanResult.lightRecommendation === 'less' ?
                      (isChildMode ? 'Menos sol' : 'Reduzir exposição') :
                      (isChildMode ? 'Está boa' : 'Adequada')
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className={`font-semibold ${colors.text} mb-3 ${isChildMode ? 'text-xl' : 'text-base'}`}>
                  {isChildMode ? '💡 Dicas de cuidado' : 'Dicas de Cuidado'}
                </h4>
                <ul className={`space-y-2 ${colors.textSecondary} ${isChildMode ? 'text-base' : 'text-sm'}`}>
                  {scanResult.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={colors.primary.replace('bg-', 'text-')}>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <p className={`font-semibold ${colors.text} mb-3 ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                  {isChildMode ? '👍 Estava certo?' : 'A identificação estava correta?'}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      // Save feedback
                      console.log('Feedback: Correto');
                      alert(isChildMode ? '✅ Obrigado!' : 'Obrigado pelo feedback!');
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {isChildMode ? '✅ Sim' : 'Sim, correto'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      // Save feedback
                      console.log('Feedback: Incorreto');
                      alert(isChildMode ? '📝 Vamos melhorar!' : 'Obrigado! Vamos melhorar nossa identificação.');
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    {isChildMode ? '❌ Não' : 'Não, incorreto'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={shareScanAsPost}
                  className={`w-full ${colors.primary} text-white rounded-full ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
                >
                  <Share2 className={`mr-2 ${isChildMode ? 'w-6 h-6' : 'w-4 h-4'}`} />
                  {isChildMode ? '📤 Compartilhar' : 'Compartilhar no Feed'}
                </Button>
                
                {!currentUser && (
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="outline"
                    className={`w-full rounded-full ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
                  >
                    {isChildMode ? '👋 Entrar' : 'Fazer Login para Salvar'}
                  </Button>
                )}
                
                <Button
                  onClick={() => {
                    setScanImage(null);
                    setScanResult(null);
                  }}
                  variant="ghost"
                  className={`w-full ${isChildMode ? 'h-12 text-base' : ''}`}
                >
                  {isChildMode ? '🔄 Nova foto' : 'Analisar outra planta'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const ProfileTab = () => {
    const user = selectedProfile || currentUser;
    
    if (!user) {
      return (
        <div className="pb-20 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className={`font-bold ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
              {isChildMode ? 'Você precisa entrar' : 'Faça login para ver seu perfil'}
            </h2>
            <Button
              onClick={() => setShowAuthModal(true)}
              className={`${colors.primary} text-white rounded-full ${isChildMode ? 'h-14 text-lg px-8' : ''}`}
            >
              {isChildMode ? '👋 Entrar' : 'Fazer Login'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-20 space-y-6">
        {selectedProfile && (
          <Button
            variant="ghost"
            onClick={() => setSelectedProfile(null)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>
        )}
        
        <Card className={`${colors.card} rounded-2xl shadow-md`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 mx-auto md:mx-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h2 className={`font-bold ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                    {user.name}
                  </h2>
                  {user.role === 'subscriber' && (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-semibold">Premium</span>
                    </div>
                  )}
                </div>
                <p className={`${colors.textSecondary} mb-4 ${isChildMode ? 'text-lg' : ''}`}>
                  @{user.username}
                </p>
                <p className={`${colors.text} mb-4 ${isChildMode ? 'text-lg' : ''}`}>
                  {user.bio}
                </p>
                
                <div className={`flex gap-6 justify-center md:justify-start mb-4 ${colors.text}`}>
                  <div>
                    <span className={`font-bold ${isChildMode ? 'text-xl' : ''}`}>{user.followers}</span>
                    <span className={`${colors.textSecondary} ml-1 ${isChildMode ? 'text-lg' : ''}`}>
                      {isChildMode ? 'seguidores' : 'seguidores'}
                    </span>
                  </div>
                  <div>
                    <span className={`font-bold ${isChildMode ? 'text-xl' : ''}`}>{user.following}</span>
                    <span className={`${colors.textSecondary} ml-1 ${isChildMode ? 'text-lg' : ''}`}>
                      {isChildMode ? 'seguindo' : 'seguindo'}
                    </span>
                  </div>
                </div>
                
                {!selectedProfile && (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className={`rounded-full ${isChildMode ? 'h-12 text-lg' : ''}`}
                      onClick={() => {}}
                    >
                      <Settings className={`mr-2 ${isChildMode ? 'w-6 h-6' : 'w-4 h-4'}`} />
                      {isChildMode ? '⚙️ Configurações' : 'Editar Perfil'}
                    </Button>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      <span className={colors.text}>
                        {isChildMode ? '👶 Modo Simples' : 'Modo Criança'}
                      </span>
                      <button
                        onClick={() => setIsChildMode(!isChildMode)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          isChildMode ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            isChildMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h3 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
            {isChildMode ? '📸 Minhas fotos' : 'Publicações'}
          </h3>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {posts.filter(p => p.author.id === user.id).map(post => (
              <div key={post.id} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                  src={post.image} 
                  alt={`User post featuring ${post.plantSpecies}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const PaywallModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`${colors.card} max-w-lg w-full rounded-3xl shadow-2xl`}>
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-linear-to-br from-yellow-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <CardTitle className={`${colors.text} ${isChildMode ? 'text-3xl' : 'text-2xl'}`}>
            {isChildMode ? '⭐ Seja Premium' : 'Desbloqueie Recursos Premium'}
          </CardTitle>
          <CardDescription className={isChildMode ? 'text-lg' : ''}>
            {isChildMode 
              ? 'Leia todos os livros e aprenda muito!' 
              : 'Acesso completo a eBooks, guias exclusivos e muito mais'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { icon: '📚', text: isChildMode ? 'Todos os livros' : 'eBooks ilimitados' },
              { icon: '📥', text: isChildMode ? 'Ler sem internet' : 'Download offline' },
              { icon: '🎓', text: isChildMode ? 'Aulas especiais' : 'Aulas exclusivas' },
              { icon: '🔍', text: isChildMode ? 'Buscar melhor' : 'Filtros avançados' },
              { icon: '⭐', text: isChildMode ? 'Selo especial' : 'Selo Premium no perfil' }
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${colors.secondary} flex items-center justify-center text-white text-xl ${isChildMode ? 'w-12 h-12 text-2xl' : ''}`}>
                  {benefit.icon}
                </div>
                <span className={`${colors.text} ${isChildMode ? 'text-lg' : ''}`}>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
          
          <Card className="bg-linear-to-r from-purple-600 to-teal-500 text-white rounded-2xl border-0">
            <CardContent className="p-6 text-center">
              <div className={`${isChildMode ? 'text-3xl' : 'text-2xl'} font-bold mb-2`}>
                R$ 19,90<span className={`${isChildMode ? 'text-lg' : 'text-base'} font-normal`}>/mês</span>
              </div>
              <p className={`text-white text-opacity-90 ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                {isChildMode ? '🎁 7 dias grátis' : 'Teste grátis por 7 dias'}
              </p>
            </CardContent>
          </Card>
          
          <Button
            onClick={handleSubscribe}
            className={`w-full bg-linear-to-r from-purple-600 to-teal-500 text-white rounded-full hover:opacity-90 ${isChildMode ? 'h-16 text-xl' : 'h-12'}`}
          >
            {isChildMode ? '🎉 Começar Grátis' : 'Começar Teste Grátis'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowPaywallModal(false)}
            className={`w-full ${isChildMode ? 'h-12 text-lg' : ''}`}
          >
            {isChildMode ? 'Agora não' : 'Talvez depois'}
          </Button>
          
          <p className={`text-center text-xs ${colors.textSecondary} ${isChildMode ? 'text-sm' : ''}`}>
            {isChildMode 
              ? 'Cancele quando quiser, sem taxas' 
              : 'Cancele a qualquer momento. Sem compromisso.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`${colors.card} max-w-2xl w-full rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={colors.text}>
              {isChildMode ? '📸 Nova Foto' : 'Criar Publicação'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowCreatePostModal(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full ${colors.secondary} flex items-center justify-center ${isChildMode ? 'w-20 h-20' : ''}`}>
                <Plus className={`text-white ${isChildMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
              </div>
              <p className={`${colors.text} font-semibold ${isChildMode ? 'text-xl' : ''}`}>
                {isChildMode ? 'Escolher foto' : 'Adicionar fotos ou vídeos'}
              </p>
              <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                {isChildMode ? 'Até 10 fotos' : 'Até 10 mídias'}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Textarea
              placeholder={isChildMode ? 'Conte sobre sua planta...' : 'Escreva uma legenda...'}
              className={`rounded-2xl min-h-32 ${isChildMode ? 'text-lg' : ''}`}
            />
            
            <Input
              placeholder={isChildMode ? 'Qual é o nome da planta?' : 'Marcar espécie (ex: Monstera deliciosa)'}
              className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
            />
            
            <Input
              placeholder={isChildMode ? '#meujardim #plantas' : 'Adicionar hashtags'}
              className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
            />
          </div>
          
          <Button
            className={`w-full ${colors.primary} text-white rounded-full ${isChildMode ? 'h-16 text-xl' : ''}`}
            onClick={() => {
              setShowCreatePostModal(false);
              // Add post logic here
            }}
          >
            {isChildMode ? '✅ Publicar' : 'Publicar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const EbookReaderModal = () => {
    if (!showEbookReader) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <Card className={`${colors.card} max-w-4xl w-full h-[90vh] rounded-3xl shadow-2xl flex flex-col`}>
          <CardHeader className="shrink-0">
            <div className="flex justify-between items-center">
              <CardTitle className={colors.text}>
                {showEbookReader.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Download className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowEbookReader(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="prose max-w-none">
              <h1>Capítulo 1: Introdução</h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
              </p>
              {currentUser?.role !== 'subscriber' && (
                <div className="mt-8 p-6 bg-linear-to-r from-purple-100 to-teal-100 dark:from-purple-900 dark:to-teal-900 rounded-2xl text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-bold text-xl mb-2">Conteúdo Premium</h3>
                  <p className="mb-4">Assine para continuar lendo</p>
                  <Button
                    onClick={() => {
                      setShowEbookReader(null);
                      setShowPaywallModal(true);
                    }}
                    className={`${colors.primary} text-white rounded-full`}
                  >
                    Ver Planos
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="shrink-0 flex justify-between items-center border-t">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <span className={`text-sm ${colors.textSecondary}`}>
              Página 1 de {showEbookReader.pages}
            </span>
            <Button variant="ghost" size="sm">
              Próxima
              <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const ReportModal = () => {
    if (!showReportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className={`${colors.card} max-w-md w-full rounded-3xl shadow-2xl`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className={colors.text}>
                {isChildMode ? '⚠️ Reportar' : 'Denunciar Conteúdo'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowReportModal(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`${colors.textSecondary} ${isChildMode ? 'text-lg' : ''}`}>
              {isChildMode 
                ? 'Por que você quer reportar esta foto?' 
                : 'Por que você está denunciando este conteúdo?'}
            </p>
            <div className="space-y-2">
              {[
                { label: isChildMode ? '😢 Conteúdo triste' : 'Conteúdo inapropriado' },
                { label: isChildMode ? '😡 Assédio' : 'Assédio ou bullying' },
                { label: isChildMode ? '❌ Spam' : 'Spam ou publicidade' },
                { label: isChildMode ? '🚫 Informação errada' : 'Informação falsa' },
                { label: isChildMode ? '🔞 Não é para crianças' : 'Conteúdo adulto' }
              ].map((reason, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={`w-full justify-start rounded-full hover:bg-red-50 dark:hover:bg-red-900 ${isChildMode ? 'h-14 text-lg' : ''}`}
                >
                  {reason.label}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder={isChildMode ? 'Quer contar mais alguma coisa?' : 'Detalhes adicionais (opcional)'}
              className={`rounded-2xl ${isChildMode ? 'text-lg' : ''}`}
            />
            <Button
              className={`w-full bg-red-500 hover:bg-red-600 text-white rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
              onClick={() => {
                setShowReportModal(null);
                // Add report logic here
              }}
            >
              {isChildMode ? '✅ Enviar' : 'Enviar Denúncia'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${colors.background} ${colors.text} transition-colors`}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentTab === 'home' && <HomeTab />}
        {currentTab === 'explore' && <ExploreTab />}
        {currentTab === 'community' && <CommunityTab />}
        {currentTab === 'scanner' && <ScannerTab />}
        {currentTab === 'products' && <ProductsTab />}
        {currentTab === 'profile' && <ProfileTab />}
      </main>
      
      <BottomTabBar />
      
      {showAuthModal && <AuthModal />}
      {showPaywallModal && <PaywallModal />}
      {showCreatePostModal && <CreatePostModal />}
      {showEbookReader && <EbookReaderModal />}
      {showReportModal && <ReportModal />}
    </div>
  );
}


 PlantCommunityApp()
  // State Management
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isChildMode, setIsChildMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showEbookReader, setShowEbookReader] = useState<Ebook | null>(null);
  const [showReportModal, setShowReportModal] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateComment, setShowCreateComment] = useState(false);
  const createMenuRef = useRef<HTMLDivElement | null>(null); // para detectar clique fora
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PlantScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
   // Fechar o menu de criação ao clicar fora
useEffect(() => {
  function onDocClick(e: MouseEvent) {
    if (!createMenuRef.current) return;
    const target = e.target as Node;
    if (!createMenuRef.current.contains(target)) {
      setShowCreateMenu(false);
    }
  }
  document.addEventListener('click', onDocClick);
  return () => document.removeEventListener('click', onDocClick);
}, []);

  // Theme colors
  const colors = {
    primary: isDarkMode ? 'bg-purple-900' : 'bg-purple-600',
    secondary: isDarkMode ? 'bg-teal-800' : 'bg-teal-500',
    accent: isDarkMode ? 'bg-purple-700' : 'bg-purple-500',
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600'
  };

  // Actions
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
    if (ebook.isPremium && currentUser?.role !== 'subscriber') {
      setShowPaywallModal(true);
      return;
    }
    setShowEbookReader(ebook);
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setShowCreatePostModal(true);
  };

  const handleSubscribe = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: 'subscriber' });
      setShowPaywallModal(false);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogin = (role: UserRole = 'user') => {
    setCurrentUser({
      ...mockUsers[0],
      role
    });
    setShowAuthModal(false);
  };

  // Image Quality Check
  const checkImageQuality = async (imageDataUrl: string): Promise<ImageQuality> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({
            resolution: { width: 0, height: 0 },
            brightness: 0,
            sharpness: 0,
            isAcceptable: false,
            issues: ['Erro ao processar imagem']
          });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate brightness
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += (r + g + b) / 3;
        }
        const brightness = totalBrightness / (data.length / 4);

        // Simple sharpness estimation (variance of grayscale)
        const grayscale: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          grayscale.push((r + g + b) / 3);
        }
        
        const mean = grayscale.reduce((a, b) => a + b, 0) / grayscale.length;
        const variance = grayscale.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / grayscale.length;
        const sharpness = Math.sqrt(variance);

        const issues: string[] = [];
        let isAcceptable = true;

        // Check resolution
        if (img.width < 512 || img.height < 512) {
          issues.push('Resolução muito baixa');
          isAcceptable = false;
        }

        // Check brightness (ideal range: 80-170)
        if (brightness < 60) {
          issues.push('Imagem muito escura');
          isAcceptable = false;
        } else if (brightness > 200) {
          issues.push('Imagem muito clara');
          isAcceptable = false;
        }

        // Check sharpness (threshold: 20)
        if (sharpness < 15) {
          issues.push('Imagem sem foco ou borrada');
          isAcceptable = false;
        }

        resolve({
          resolution: { width: img.width, height: img.height },
          brightness,
          sharpness,
          isAcceptable,
          issues
        });
      };

      img.onerror = () => {
        resolve({
          resolution: { width: 0, height: 0 },
          brightness: 0,
          sharpness: 0,
          isAcceptable: false,
          issues: ['Erro ao carregar imagem']
        });
      };

      img.src = imageDataUrl;
    });
  };

  // Real AI Plant Analysis using OpenAI GPT-4 Vision
  const analyzePlantWithAI = async (imageDataUrl: string): Promise<PlantScanResult> => {
    try {
      // This should be called via backend API to protect the API key
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao analisar a planta');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Erro na análise:', error);
      // Fallback to mock for demo
      return mockAnalyzePlant(imageDataUrl);
    }
  };

  // Scanner Functions (Mock - for demo purposes)
  const mockAnalyzePlant = (imageDataUrl: string): PlantScanResult => {
    // Simple deterministic hash based on image data length
    const hash = imageDataUrl.length % 10;
    
    const species = [
      { name: 'Monstera deliciosa', tips: ['Regar 1-2x por semana', 'Luz indireta brilhante', 'Limpar folhas mensalmente', 'Adubo líquido a cada 2 semanas', 'Tutor para crescimento vertical'] },
      { name: 'Ficus lyrata', tips: ['Regar quando solo secar 5cm', 'Evitar mudanças de local', 'Girar vaso mensalmente', 'Limpar folhas com pano úmido', 'Solo bem drenado'] },
      { name: 'Pothos aureus', tips: ['Muito resistente', 'Tolera pouca luz', 'Regar moderadamente', 'Propaga fácil na água', 'Pode crescer em hidroponia'] },
      { name: 'Sansevieria trifasciata', tips: ['Regar pouco', 'Tolera sombra', 'Purifica o ar', 'Solo arenoso', 'Resistente a pragas'] },
      { name: 'Zamioculcas zamiifolia', tips: ['Extremamente resistente', 'Regar a cada 2-3 semanas', 'Tolera baixa luz', 'Cresce devagar', 'Evitar excesso de água'] },
      { name: 'Spathiphyllum wallisii', tips: ['Indica sede com folhas murchas', 'Prefere sombra', 'Flores brancas frequentes', 'Alta umidade', 'Adubo mensal'] },
      { name: 'Chlorophytum comosum', tips: ['Produz mudinhas', 'Muito fácil de cuidar', 'Luz indireta', 'Regar regularmente', 'Purifica o ar'] },
      { name: 'Epipremnum aureum', tips: ['Cresce rápido', 'Pode ser trepadeira', 'Luz baixa a média', 'Regar quando secar', 'Poda estimula crescimento'] },
      { name: 'Philodendron hederaceum', tips: ['Folhas em formato de coração', 'Luz filtrada', 'Solo úmido', 'Cresce em cascata', 'Fácil propagação'] },
      { name: 'Dracaena marginata', tips: ['Cresce vertical', 'Luz média', 'Sensível ao flúor', 'Regar moderadamente', 'Folhas pontiagudas'] }
    ];
    
    const selected = species[hash];
    const confidence = 75 + (hash * 2);
    const needsWater = hash % 3 === 0;
    const lightOptions: ('more' | 'less' | 'ok')[] = ['more', 'less', 'ok'];
    const lightRecommendation = lightOptions[hash % 3];
    
    // Generate alternative candidates
    const alternativeCandidates = [
      species[(hash + 1) % 10],
      species[(hash + 3) % 10],
    ].map(s => ({
      name: s.name,
      scientificName: s.name.replace(' ', '_').toLowerCase(),
      confidence: Math.max(40, confidence - Math.floor(Math.random() * 20) - 10)
    }));

    return {
      speciesName: selected.name,
      scientificName: selected.name.replace(' ', '_').toLowerCase(),
      confidence,
      needsWater,
      lightRecommendation,
      tips: selected.tips,
      alternativeCandidates: confidence < 85 ? alternativeCandidates : undefined
    };
  };

  const onPickImage = (file: File | null) => {
    if (!file) {
      setScanImage(null);
      setScanResult(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setScanImage(reader.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const [imageQuality, setImageQuality] = useState<ImageQuality | null>(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);

  const onAnalyze = async () => {
    if (!scanImage) return;
    
    setIsAnalyzing(true);
    setShowQualityWarning(false);
    
    try {
      // Step 1: Check image quality
      const quality = await checkImageQuality(scanImage);
      setImageQuality(quality);
      
      if (!quality.isAcceptable) {
        setShowQualityWarning(true);
        setIsAnalyzing(false);
        return;
      }
      
      // Step 2: Analyze with AI
      // In production, this calls the real API
      // For demo, we use mock
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const result = await analyzePlantWithAI(scanImage);
      // const result = mockAnalyzePlant(scanImage); // Fallback
      
      setScanResult(result);
      
      // Save to history (would be saved to DB in production)
      if (currentUser) {
        const scanRecord: ScanHistory = {
          id: `scan-${Date.now()}`,
          userId: currentUser.id,
          imageUrl: scanImage,
          result,
          timestamp: new Date()
        };
        // TODO: Save to Firebase/Supabase
        console.log('Scan saved:', scanRecord);
      }
      
    } catch (error) {
      console.error('Erro na análise:', error);
      alert('Erro ao analisar a planta. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const shareScanAsPost = () => {
    if (!currentUser || !scanResult || !scanImage) {
      setShowAuthModal(true);
      return;
    }
    
    const waterStatus = scanResult.needsWater ? 'precisa de água' : 'água ok';
    const lightStatus = scanResult.lightRecommendation === 'more' ? 'mais sol' : 
                        scanResult.lightRecommendation === 'less' ? 'menos sol' : 'luz ok';
    
    const caption = `Identificada: ${scanResult.speciesName} (${scanResult.confidence}%). ${waterStatus} · ${lightStatus}. Dica: ${scanResult.tips[0]}`;
    
    const newPost: Post = {
      id: `scan-${Date.now()}`,
      author: currentUser,
      image: scanImage,
      caption,
      plantSpecies: scanResult.speciesName,
      likes: 0,
      comments: 0,
      isLiked: false,
      timestamp: new Date(),
      hashtags: ['plantscanner', 'identificacao', scanResult.speciesName.split(' ')[0].toLowerCase()]
    };
    
    setPosts([newPost, ...posts]);
    setCurrentTab('home');
    setScanImage(null);
    setScanResult(null);
  };

  // Components
const Header = () => (
  <header
    className={`sticky top-0 z-50 ${colors.card} border-b ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } shadow-sm`}
  >
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      {/* Esquerda: logo + nome */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-teal-400 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">🌿</span>
        </div>
        <h1 className={`text-xl font-bold ${colors.text} ${isChildMode ? 'text-2xl' : ''}`}>
          PlantHub
        </h1>
      </div>

      {/* Direita: botões */}
      <div className="flex items-center gap-2">
        {/* Modo Claro/Escuro */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-full"
          aria-label={isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {currentUser ? (
          <>
            {/* Wrapper do botão + e do menu
                - relative para posicionar o dropdown
                - onClick stopPropagation para o clique dentro NÃO fechar pelo listener global */}
            <div
              ref={createMenuRef}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão + (abre/fecha menu) */}
              <Button
                aria-label="Criar conteúdo"
                onClick={() => setShowCreateMenu((v) => !v)}
                className="rounded-full w-9 h-9 flex items-center justify-center border border-gray-300 hover:bg-gray-50"
              >
                +
              </Button>

              {/* Dropdown do botão + */}
              {showCreateMenu && (
                <div
                  className={`absolute right-0 top-12 z-50 ${
                    isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-gray-200'
                  } border rounded-xl shadow-lg w-56 overflow-hidden`}
                >
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800"
                    onClick={() => {
                      setShowCreateMenu(false);
                      setShowCreatePost(true);
                    }}
                  >
                    Nova postagem (texto/foto)
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800"
                    onClick={() => {
                      setShowCreateMenu(false);
                      setShowCreateComment(true);
                    }}
                  >
                    Novo comentário
                  </button>
                </div>
              )}
            </div>

            {/* Notificações */}
            <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notificações">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Avatar → ir para o perfil */}
            <Avatar className="cursor-pointer" onClick={() => setCurrentTab('profile')}>
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
            </Avatar>
          </>
        ) : (
          // Se NÃO está logado, mostrar botão de entrar/cadastrar
          <Button onClick={() => setShowAuthModal(true)} className="rounded-full px-4">
            Entrar / Cadastrar
          </Button>
        )}
      </div>
    </div>
  </header>
);
  const BottomTabBar = () => (
    <nav className={`fixed bottom-0 left-0 right-0 ${colors.card} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg z-50`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-around">
        {[
          { id: 'home' as Tab, icon: Home, label: 'Início' },
          { id: 'explore' as Tab, icon: Search, label: 'Explorar' },
          { id: 'community' as Tab, icon: Users, label: 'Comunidade' },
          { id: 'scanner' as Tab, icon: Scan, label: 'Scanner' },
          { id: 'products' as Tab, icon: BookOpen, label: isChildMode ? 'Produtos' : 'Meus Produtos' },
          { id: 'profile' as Tab, icon: User, label: 'Perfil' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              currentTab === tab.id 
                ? `${colors.primary} text-white` 
                : `${colors.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`
            } ${isChildMode ? 'py-3' : ''}`}
          >
            <tab.icon className={isChildMode ? 'w-7 h-7' : 'w-5 h-5'} />
            <span className={`text-xs ${isChildMode ? 'text-base font-semibold' : ''}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );

  const PostCard = ({ post }: { post: Post }) => (
    <Card className={`${colors.card} overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setSelectedProfile(post.author);
              setCurrentTab('profile');
            }}
          >
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className={`font-semibold ${colors.text} ${isChildMode ? 'text-lg' : ''}`}>
                {post.author.name}
              </p>
              <p className={`text-xs ${colors.textSecondary}`}>
                @{post.author.username}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowReportModal(post)}
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={post.image} 
            alt={`Post showing ${post.plantSpecies} shared by ${post.author.name}`}
            className="w-full aspect-square object-cover"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="ghost"
              size={isChildMode ? 'default' : 'sm'}
              className="gap-2 hover:text-red-500"
              onClick={() => handleLike(post.id)}
            >
              <Heart className={`${isChildMode ? 'w-6 h-6' : 'w-5 h-5'} ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className={isChildMode ? 'text-lg' : ''}>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size={isChildMode ? 'default' : 'sm'}
              className="gap-2"
              onClick={() => !currentUser && setShowAuthModal(true)}
            >
              <MessageCircle className={isChildMode ? 'w-6 h-6' : 'w-5 h-5'} />
              <span className={isChildMode ? 'text-lg' : ''}>{post.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size={isChildMode ? 'default' : 'sm'}
              className="gap-2"
            >
              <Share2 className={isChildMode ? 'w-6 h-6' : 'w-5 h-5'} />
            </Button>
          </div>
          
          <p className={`${colors.text} mb-2 ${isChildMode ? 'text-lg' : ''}`}>
            {post.caption}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full ${colors.secondary} text-white`}>
              {post.plantSpecies}
            </span>
            {post.hashtags.map(tag => (
              <span key={tag} className={`text-xs ${colors.textSecondary}`}>
                #{tag}
              </span>
            ))}
          </div>
          
          <p className={`text-xs ${colors.textSecondary}`}>
            {new Date(post.timestamp).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const HomeTab = () => (
    <div className="space-y-4 pb-20">
      {currentUser && (
        <Card className={`${colors.card} rounded-2xl shadow-sm`}>
          <CardContent className="p-4">
            <button
              onClick={handleCreatePost}
              className={`w-full ${colors.background} rounded-full px-4 py-3 text-left ${colors.textSecondary} hover:bg-opacity-80 transition-all ${isChildMode ? 'py-4 text-lg' : ''}`}
            >
              {isChildMode ? '📸 Postar foto da sua planta' : 'O que está cultivando hoje?'}
            </button>
          </CardContent>
        </Card>
      )}
      
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );

  const ExploreTab = () => (
    <div className="pb-20 space-y-6">
      <div className={`sticky top-16 z-40 ${colors.card} p-4 rounded-2xl shadow-md`}>
        <Input
          placeholder={isChildMode ? '🔍 Procurar plantas...' : 'Buscar plantas, pessoas, hashtags...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
        />
      </div>
      
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} flex items-center gap-2 ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          <TrendingUp className={isChildMode ? 'w-7 h-7' : 'w-5 h-5'} />
          {isChildMode ? '🔥 Mais populares' : 'Tendências'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['#suculentas', '#jardinagem', '#plantasinteriores', '#orquideas', '#cactos', '#dicasdejardim'].map(tag => (
            <Card key={tag} className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
              <CardContent className="p-4 text-center">
                <p className={`font-semibold ${colors.text} ${isChildMode ? 'text-xl' : ''}`}>{tag}</p>
                <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                  {Math.floor(Math.random() * 1000) + 100} posts
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '🌱 Tipos de plantas' : 'Espécies Populares'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Suculentas', scientific: 'Crassulaceae', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5bbec6a6-bef4-47ed-9e36-1068e668cd89.png' },
            { name: 'Orquídeas', scientific: 'Orchidaceae', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/dd255a5d-af36-4bed-904e-63ad6452cd4a.png' },
            { name: 'Samambaias', scientific: 'Pteridophyta', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ae8c3ed1-ce84-429f-8984-4edead9e337a.png' },
            { name: 'Cactos', scientific: 'Cactaceae', image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/eed97d56-22c7-4897-bcb9-a936bffbe6f2.png' }
          ].map(species => (
            <Card key={species.name} className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}>
              <img 
                src={species.image} 
                alt={`${species.name} plant category showing various specimens and characteristics`}
                className="w-full h-40 object-cover"
              />
              <CardContent className="p-4">
                <h3 className={`font-bold ${colors.text} ${isChildMode ? 'text-xl' : ''}`}>
                  {species.name}
                </h3>
                {!isChildMode && (
                  <p className={`text-sm italic ${colors.textSecondary}`}>
                    {species.scientific}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const CommunityTab = () => (
    <div className="pb-20 space-y-6">
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '👥 Pessoas para seguir' : 'Sugestões de Usuários'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUsers.map(user => (
            <Card key={user.id} className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className={isChildMode ? 'w-16 h-16' : 'w-12 h-12'}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${colors.text} ${isChildMode ? 'text-lg' : ''}`}>
                        {user.name}
                      </h3>
                      {user.role === 'subscriber' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                      @{user.username}
                    </p>
                    <p className={`text-sm ${colors.text} mt-2 ${isChildMode ? 'text-base' : ''}`}>
                      {user.bio}
                    </p>
                    <div className={`flex gap-4 mt-2 text-sm ${colors.textSecondary}`}>
                      <span>{user.followers} seguidores</span>
                      <span>{user.following} seguindo</span>
                    </div>
                  </div>
                </div>
                <Button
                  className={`w-full mt-4 rounded-full ${
                    user.isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : `${colors.primary} text-white`
                  } ${isChildMode ? 'h-12 text-lg' : ''}`}
                  onClick={() => handleFollow(user.id)}
                >
                  {user.isFollowing ? (isChildMode ? '✓ Seguindo' : 'Seguindo') : (isChildMode ? '+ Seguir' : 'Seguir')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const EbooksTab = () => (
    <div className="pb-20 space-y-6">
      {currentUser?.role !== 'subscriber' && (
        <Card className={`${colors.accent} text-white rounded-2xl shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Crown className={isChildMode ? 'w-8 h-8' : 'w-6 h-6'} />
              <h3 className={`font-bold ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                {isChildMode ? '⭐ Seja Premium' : 'Acesso Premium'}
              </h3>
            </div>
            <p className={`mb-4 ${isChildMode ? 'text-lg' : ''}`}>
              {isChildMode 
                ? 'Leia todos os livros e aprenda muito mais!' 
                : 'Acesso ilimitado a todos os eBooks, guias e conteúdos exclusivos'}
            </p>
            <Button
              onClick={() => setShowPaywallModal(true)}
              className="bg-white text-purple-600 hover:bg-gray-100 rounded-full w-full"
              size={isChildMode ? 'lg' : 'default'}
            >
              {isChildMode ? '🎁 Começar Grátis' : 'Assinar Agora - 7 dias grátis'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '📚 Livros sobre plantas' : 'Biblioteca de eBooks'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockEbooks.map(ebook => (
            <Card 
              key={ebook.id} 
              className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
              onClick={() => handleOpenEbook(ebook)}
            >
              <div className="relative">
                <img 
                  src={ebook.cover} 
                  alt={`Cover of ${ebook.title} ebook showing plant illustrations and title text`}
                  className="w-full aspect-2/3 object-cover"
                />
                {ebook.isPremium && currentUser?.role !== 'subscriber' && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                {!ebook.isPremium && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    GRÁTIS
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className={`font-bold ${colors.text} line-clamp-2 ${isChildMode ? 'text-base' : 'text-sm'}`}>
                  {ebook.title}
                </h3>
                <p className={`text-xs ${colors.textSecondary} mt-1 ${isChildMode ? 'text-sm' : ''}`}>
                  {ebook.author}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className={`text-xs ${colors.text}`}>{ebook.rating}</span>
                  <span className={`text-xs ${colors.textSecondary} ml-auto`}>
                    {ebook.pages} pág.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const ProductsTab = () => {
    const [selectedType, setSelectedType] = useState<ProductType>('ebook');
    const filteredProducts = mockProducts.filter(p => p.type === selectedType);

    return (
      <div className="pb-20 space-y-6">
        {currentUser?.role !== 'subscriber' && (
          <Card className={`${colors.accent} text-white rounded-2xl shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Crown className={isChildMode ? 'w-8 h-8' : 'w-6 h-6'} />
                <h3 className={`font-bold ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                  {isChildMode ? '⭐ Seja Premium' : 'Acesso Premium'}
                </h3>
              </div>
              <p className={`mb-4 ${isChildMode ? 'text-lg' : ''}`}>
                {isChildMode 
                  ? 'Veja todos os vídeos e livros!' 
                  : 'Acesso ilimitado a todos os eBooks, vídeos e conteúdos exclusivos'}
              </p>
              <Button
                onClick={() => setShowPaywallModal(true)}
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-full w-full"
                size={isChildMode ? 'lg' : 'default'}
              >
                {isChildMode ? '🎁 Começar Grátis' : 'Assinar Agora - 7 dias grátis'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setSelectedType('ebook')}
            className={`flex-1 rounded-full ${
              selectedType === 'ebook' 
                ? `${colors.primary} text-white` 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
          >
            📚 {isChildMode ? 'Livros' : 'eBooks'}
          </Button>
          <Button
            onClick={() => setSelectedType('video')}
            className={`flex-1 rounded-full ${
              selectedType === 'video' 
                ? `${colors.primary} text-white` 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
          >
            🎥 {isChildMode ? 'Vídeos' : 'Vídeo-aulas'}
          </Button>
        </div>

        <div>
          <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
            {selectedType === 'ebook' 
              ? (isChildMode ? '📚 Livros sobre plantas' : 'Biblioteca de eBooks')
              : (isChildMode ? '🎥 Vídeos de cuidados' : 'Vídeo-aulas e Cursos')
            }
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className={`${colors.card} rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                onClick={() => {
                  if (product.isPremium && currentUser?.role !== 'subscriber') {
                    setShowPaywallModal(true);
                  } else {
                    // Open product viewer
                    if (product.type === 'ebook') {
                      const ebook = mockEbooks.find(e => e.id === product.id);
                      if (ebook) setShowEbookReader(ebook);
                    } else {
                      // Open video player (implement VideoPlayerModal)
                      alert(`Reproduzir: ${product.title}`);
                    }
                  }
                }}
              >
                <div className="relative">
                  <img 
                    src={product.cover} 
                    alt={`${product.title} cover showing educational content about plants`}
                    className={`w-full ${product.type === 'ebook' ? 'aspect-2/3' : 'aspect-video'} object-cover`}
                  />
                  {product.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-purple-600 ml-1" />
                      </div>
                    </div>
                  )}
                  {product.isPremium && currentUser?.role !== 'subscriber' && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  {!product.isPremium && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      GRÁTIS
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className={`font-bold ${colors.text} line-clamp-2 mb-2 ${isChildMode ? 'text-lg' : 'text-base'}`}>
                    {product.title}
                  </h3>
                  <p className={`text-xs ${colors.textSecondary} mb-3 ${isChildMode ? 'text-sm' : ''}`}>
                    {product.author}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className={`text-xs ${colors.text}`}>{product.rating}</span>
                    <span className={`text-xs ${colors.textSecondary} ml-auto`}>
                      {product.type === 'ebook' 
                        ? `${product.pages} pág.` 
                        : `${Math.floor((product.duration || 0) / 60)} min`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ScannerTab = () => (
    <div className="pb-20 space-y-6">
      <div>
        <h2 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
          {isChildMode ? '📸 Identificar Planta' : 'Scanner de Plantas'}
        </h2>
        
        {!scanImage && !scanResult && (
          <Card className={`${colors.card} rounded-2xl shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Leaf className={`${colors.primary.replace('bg-', 'text-')} ${isChildMode ? 'w-6 h-6' : 'w-5 h-5'} shrink-0 mt-1`} />
                <div>
                  <h3 className={`font-semibold ${colors.text} mb-2 ${isChildMode ? 'text-lg' : ''}`}>
                    {isChildMode ? '💡 Dicas para tirar foto' : 'Dicas para um bom scan'}
                  </h3>
                  <ul className={`space-y-2 ${colors.textSecondary} ${isChildMode ? 'text-base' : 'text-sm'}`}>
                    <li>• {isChildMode ? 'Foto bem iluminada' : 'Boa iluminação natural'}</li>
                    <li>• {isChildMode ? 'Folhas no centro' : 'Folhas ou flores no centro'}</li>
                    <li>• {isChildMode ? 'Foto de perto' : 'Close-up da planta'}</li>
                    <li>• {isChildMode ? 'Imagem nítida' : 'Imagem focada e nítida'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className={`${colors.card} rounded-2xl shadow-md overflow-hidden`}>
          <CardContent className="p-6">
            {!scanImage ? (
              <div>
                <label 
                  htmlFor="plant-image-input"
                  className={`block border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full ${colors.primary} flex items-center justify-center ${isChildMode ? 'w-20 h-20' : ''}`}>
                      <Camera className={`text-white ${isChildMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
                    </div>
                    <p className={`${colors.text} font-semibold ${isChildMode ? 'text-xl' : ''}`}>
                      {isChildMode ? '📷 Tirar ou escolher foto' : 'Tirar foto ou escolher da galeria'}
                    </p>
                    <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                      {isChildMode ? 'Clique aqui' : 'Clique para selecionar'}
                    </p>
                  </div>
                </label>
                <input
                  id="plant-image-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src={scanImage} 
                    alt="Plant photo selected for identification by scanner"
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setScanImage(null);
                      setScanResult(null);
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {showQualityWarning && imageQuality && (
                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                            {isChildMode ? '⚠️ Foto precisa melhorar' : 'Qualidade da Imagem Insuficiente'}
                          </h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                            {imageQuality.issues.map((issue, i) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-3">
                            {isChildMode 
                              ? 'Tire outra foto com mais luz e foco.' 
                              : 'Por favor, tire uma nova foto com melhor iluminação e foco.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!scanResult && !showQualityWarning && (
                  <Button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full ${colors.primary} text-white rounded-full ${isChildMode ? 'h-16 text-xl' : 'h-12'}`}
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="animate-pulse">{isChildMode ? '🔍 Analisando...' : 'Analisando...'}</span>
                      </>
                    ) : (
                      <>{isChildMode ? '🔍 Analisar Planta' : 'Analisar Planta'}</>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {scanResult && (
          <Card className={`${colors.card} rounded-2xl shadow-lg overflow-hidden`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className={`${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                    {scanResult.speciesName}
                  </CardTitle>
                  {!isChildMode && (
                    <p className={`text-sm italic ${colors.textSecondary} mt-1`}>
                      {scanResult.scientificName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      scanResult.confidence >= 85 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      scanResult.confidence >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    } ${isChildMode ? 'text-sm px-4 py-2' : ''}`}>
                      {scanResult.confidence}% {isChildMode ? 'certeza' : 'confiança'}
                    </span>
                  </div>
                  
                  {scanResult.confidence < 70 && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {isChildMode 
                          ? '⚠️ Não temos certeza. Tente outra foto.' 
                          : 'Confiança baixa. Recomendamos tirar outra foto mais próxima da planta.'}
                      </p>
                    </div>
                  )}
                </div>
                <Leaf className={`${colors.primary.replace('bg-', 'text-')} ${isChildMode ? 'w-10 h-10' : 'w-8 h-8'} shrink-0`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {scanResult.alternativeCandidates && scanResult.alternativeCandidates.length > 0 && (
                <div>
                  <h4 className={`font-semibold ${colors.text} mb-3 ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                    {isChildMode ? '🤔 Pode ser também:' : 'Outras Possibilidades'}
                  </h4>
                  <div className="space-y-2">
                    {scanResult.alternativeCandidates.map((candidate, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} cursor-pointer hover:bg-opacity-80`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${colors.text} ${isChildMode ? 'text-base' : 'text-sm'}`}>
                              {candidate.name}
                            </p>
                            {!isChildMode && (
                              <p className={`text-xs italic ${colors.textSecondary}`}>
                                {candidate.scientificName}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            candidate.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {candidate.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${scanResult.needsWater ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className={`${scanResult.needsWater ? 'text-blue-600' : 'text-green-600'} ${isChildMode ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    <span className={`font-semibold ${colors.text} ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                      {isChildMode ? '💧 Água' : 'Água'}
                    </span>
                  </div>
                  <p className={`${colors.text} font-medium ${isChildMode ? 'text-base' : 'text-sm'}`}>
                    {scanResult.needsWater ? 
                      (isChildMode ? 'Precisa agora' : 'Precisa de água') : 
                      (isChildMode ? 'Está ok' : 'Não precisa agora')
                    }
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl ${
                  scanResult.lightRecommendation === 'more' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  scanResult.lightRecommendation === 'less' ? 'bg-purple-50 dark:bg-purple-900/20' :
                  'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <SunMedium className={`${
                      scanResult.lightRecommendation === 'more' ? 'text-yellow-600' :
                      scanResult.lightRecommendation === 'less' ? 'text-purple-600' :
                      'text-green-600'
                    } ${isChildMode ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    <span className={`font-semibold ${colors.text} ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                      {isChildMode ? '☀️ Luz' : 'Luz'}
                    </span>
                  </div>
                  <p className={`${colors.text} font-medium ${isChildMode ? 'text-base' : 'text-sm'}`}>
                    {scanResult.lightRecommendation === 'more' ? 
                      (isChildMode ? 'Mais sol' : 'Precisa de mais') :
                      scanResult.lightRecommendation === 'less' ?
                      (isChildMode ? 'Menos sol' : 'Reduzir exposição') :
                      (isChildMode ? 'Está boa' : 'Adequada')
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className={`font-semibold ${colors.text} mb-3 ${isChildMode ? 'text-xl' : 'text-base'}`}>
                  {isChildMode ? '💡 Dicas de cuidado' : 'Dicas de Cuidado'}
                </h4>
                <ul className={`space-y-2 ${colors.textSecondary} ${isChildMode ? 'text-base' : 'text-sm'}`}>
                  {scanResult.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={colors.primary.replace('bg-', 'text-')}>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <p className={`font-semibold ${colors.text} mb-3 ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                  {isChildMode ? '👍 Estava certo?' : 'A identificação estava correta?'}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      // Save feedback
                      console.log('Feedback: Correto');
                      alert(isChildMode ? '✅ Obrigado!' : 'Obrigado pelo feedback!');
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {isChildMode ? '✅ Sim' : 'Sim, correto'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      // Save feedback
                      console.log('Feedback: Incorreto');
                      alert(isChildMode ? '📝 Vamos melhorar!' : 'Obrigado! Vamos melhorar nossa identificação.');
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    {isChildMode ? '❌ Não' : 'Não, incorreto'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={shareScanAsPost}
                  className={`w-full ${colors.primary} text-white rounded-full ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
                >
                  <Share2 className={`mr-2 ${isChildMode ? 'w-6 h-6' : 'w-4 h-4'}`} />
                  {isChildMode ? '📤 Compartilhar' : 'Compartilhar no Feed'}
                </Button>
                
                {!currentUser && (
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    variant="outline"
                    className={`w-full rounded-full ${isChildMode ? 'h-14 text-lg' : 'h-12'}`}
                  >
                    {isChildMode ? '👋 Entrar' : 'Fazer Login para Salvar'}
                  </Button>
                )}
                
                <Button
                  onClick={() => {
                    setScanImage(null);
                    setScanResult(null);
                  }}
                  variant="ghost"
                  className={`w-full ${isChildMode ? 'h-12 text-base' : ''}`}
                >
                  {isChildMode ? '🔄 Nova foto' : 'Analisar outra planta'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const ProfileTab = () => {
    const user = selectedProfile || currentUser;
    
    if (!user) {
      return (
        <div className="pb-20 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className={`font-bold ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
              {isChildMode ? 'Você precisa entrar' : 'Faça login para ver seu perfil'}
            </h2>
            <Button
              onClick={() => setShowAuthModal(true)}
              className={`${colors.primary} text-white rounded-full ${isChildMode ? 'h-14 text-lg px-8' : ''}`}
            >
              {isChildMode ? '👋 Entrar' : 'Fazer Login'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-20 space-y-6">
        {selectedProfile && (
          <Button
            variant="ghost"
            onClick={() => setSelectedProfile(null)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>
        )}
        
        <Card className={`${colors.card} rounded-2xl shadow-md`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 mx-auto md:mx-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h2 className={`font-bold ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
                    {user.name}
                  </h2>
                  {user.role === 'subscriber' && (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-semibold">Premium</span>
                    </div>
                  )}
                </div>
                <p className={`${colors.textSecondary} mb-4 ${isChildMode ? 'text-lg' : ''}`}>
                  @{user.username}
                </p>
                <p className={`${colors.text} mb-4 ${isChildMode ? 'text-lg' : ''}`}>
                  {user.bio}
                </p>
                
                <div className={`flex gap-6 justify-center md:justify-start mb-4 ${colors.text}`}>
                  <div>
                    <span className={`font-bold ${isChildMode ? 'text-xl' : ''}`}>{user.followers}</span>
                    <span className={`${colors.textSecondary} ml-1 ${isChildMode ? 'text-lg' : ''}`}>
                      {isChildMode ? 'seguidores' : 'seguidores'}
                    </span>
                  </div>
                  <div>
                    <span className={`font-bold ${isChildMode ? 'text-xl' : ''}`}>{user.following}</span>
                    <span className={`${colors.textSecondary} ml-1 ${isChildMode ? 'text-lg' : ''}`}>
                      {isChildMode ? 'seguindo' : 'seguindo'}
                    </span>
                  </div>
                </div>
                
                {!selectedProfile && (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className={`rounded-full ${isChildMode ? 'h-12 text-lg' : ''}`}
                      onClick={() => {}}
                    >
                      <Settings className={`mr-2 ${isChildMode ? 'w-6 h-6' : 'w-4 h-4'}`} />
                      {isChildMode ? '⚙️ Configurações' : 'Editar Perfil'}
                    </Button>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      <span className={colors.text}>
                        {isChildMode ? '👶 Modo Simples' : 'Modo Criança'}
                      </span>
                      <button
                        onClick={() => setIsChildMode(!isChildMode)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          isChildMode ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            isChildMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h3 className={`font-bold mb-4 ${colors.text} ${isChildMode ? 'text-2xl' : 'text-xl'}`}>
            {isChildMode ? '📸 Minhas fotos' : 'Publicações'}
          </h3>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {posts.filter(p => p.author.id === user.id).map(post => (
              <div key={post.id} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                  src={post.image} 
                  alt={`User post featuring ${post.plantSpecies}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Modals
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`${colors.card} max-w-md w-full rounded-3xl shadow-2xl`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={colors.text}>
              {isChildMode ? '👋 Bem-vindo!' : 'Entre ou Cadastre-se'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAuthModal(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>v
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder={isChildMode ? 'Seu email' : 'E-mail'}
              type="email"
              className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
            />
            <Input
              placeholder={isChildMode ? 'Sua senha' : 'Senha'}
              type="password"
              className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
            />
            <Button
              onClick={() => handleLogin('user')}
              className={`w-full ${colors.primary} text-white rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
            >
              {isChildMode ? '✅ Entrar' : 'Continuar'}
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${colors.background} ${colors.textSecondary}`}>
                {isChildMode ? 'ou' : 'ou continue com'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className={`w-full rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
              onClick={() => handleLogin('user')}
            >
              🍎 {isChildMode ? 'Apple' : 'Continuar com Apple'}
            </Button>
            <Button
              variant="outline"
              className={`w-full rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
              onClick={() => handleLogin('user')}
            >
              🔍 {isChildMode ? 'Google' : 'Continuar com Google'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PaywallModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`${colors.card} max-w-lg w-full rounded-3xl shadow-2xl`}>
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-linear-to-br from-yellow-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <CardTitle className={`${colors.text} ${isChildMode ? 'text-3xl' : 'text-2xl'}`}>
            {isChildMode ? '⭐ Seja Premium' : 'Desbloqueie Recursos Premium'}
          </CardTitle>
          <CardDescription className={isChildMode ? 'text-lg' : ''}>
            {isChildMode 
              ? 'Leia todos os livros e aprenda muito!' 
              : 'Acesso completo a eBooks, guias exclusivos e muito mais'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { icon: '📚', text: isChildMode ? 'Todos os livros' : 'eBooks ilimitados' },
              { icon: '📥', text: isChildMode ? 'Ler sem internet' : 'Download offline' },
              { icon: '🎓', text: isChildMode ? 'Aulas especiais' : 'Aulas exclusivas' },
              { icon: '🔍', text: isChildMode ? 'Buscar melhor' : 'Filtros avançados' },
              { icon: '⭐', text: isChildMode ? 'Selo especial' : 'Selo Premium no perfil' }
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${colors.secondary} flex items-center justify-center text-white text-xl ${isChildMode ? 'w-12 h-12 text-2xl' : ''}`}>
                  {benefit.icon}
                </div>
                <span className={`${colors.text} ${isChildMode ? 'text-lg' : ''}`}>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
          
          <Card className="bg-linear-to-r from-purple-600 to-teal-500 text-white rounded-2xl border-0">
            <CardContent className="p-6 text-center">
              <div className={`${isChildMode ? 'text-3xl' : 'text-2xl'} font-bold mb-2`}>
                R$ 19,90<span className={`${isChildMode ? 'text-lg' : 'text-base'} font-normal`}>/mês</span>
              </div>
              <p className={`text-white text-opacity-90 ${isChildMode ? 'text-lg' : 'text-sm'}`}>
                {isChildMode ? '🎁 7 dias grátis' : 'Teste grátis por 7 dias'}
              </p>
            </CardContent>
          </Card>
          
          <Button
            onClick={handleSubscribe}
            className={`w-full bg-linear-to-r from-purple-600 to-teal-500 text-white rounded-full hover:opacity-90 ${isChildMode ? 'h-16 text-xl' : 'h-12'}`}
          >
            {isChildMode ? '🎉 Começar Grátis' : 'Começar Teste Grátis'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowPaywallModal(false)}
            className={`w-full ${isChildMode ? 'h-12 text-lg' : ''}`}
          >
            {isChildMode ? 'Agora não' : 'Talvez depois'}
          </Button>
          
          <p className={`text-center text-xs ${colors.textSecondary} ${isChildMode ? 'text-sm' : ''}`}>
            {isChildMode 
              ? 'Cancele quando quiser, sem taxas' 
              : 'Cancele a qualquer momento. Sem compromisso.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`${colors.card} max-w-2xl w-full rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={colors.text}>
              {isChildMode ? '📸 Nova Foto' : 'Criar Publicação'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowCreatePostModal(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full ${colors.secondary} flex items-center justify-center ${isChildMode ? 'w-20 h-20' : ''}`}>
                <Plus className={`text-white ${isChildMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
              </div>
              <p className={`${colors.text} font-semibold ${isChildMode ? 'text-xl' : ''}`}>
                {isChildMode ? 'Escolher foto' : 'Adicionar fotos ou vídeos'}
              </p>
              <p className={`text-sm ${colors.textSecondary} ${isChildMode ? 'text-base' : ''}`}>
                {isChildMode ? 'Até 10 fotos' : 'Até 10 mídias'}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Textarea
              placeholder={isChildMode ? 'Conte sobre sua planta...' : 'Escreva uma legenda...'}
              className={`rounded-2xl min-h-32 ${isChildMode ? 'text-lg' : ''}`}
            />
            
            <Input
              placeholder={isChildMode ? 'Qual é o nome da planta?' : 'Marcar espécie (ex: Monstera deliciosa)'}
              className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
            />
            
            <Input
              placeholder={isChildMode ? '#meujardim #plantas' : 'Adicionar hashtags'}
              className={`rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
            />
          </div>
          
          <Button
            className={`w-full ${colors.primary} text-white rounded-full ${isChildMode ? 'h-16 text-xl' : ''}`}
            onClick={() => {
              setShowCreatePostModal(false);
              // Add post logic here
              
            }}
          >
          {showCreatePost && (
  <CreatePostModal onClose={() => setShowCreatePost(false)} />
)}

{showCreateComment && (
  <CreateCommentModal onClose={() => setShowCreateComment(false)} />
)}

           {isChildMode ? '✅ Publicar' : 'Publicar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const EbookReaderModal = () => {
    if (!showEbookReader) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <Card className={`${colors.card} max-w-4xl w-full h-[90vh] rounded-3xl shadow-2xl flex flex-col`}>
          <CardHeader className="shrink-0">
            <div className="flex justify-between items-center">
              <CardTitle className={colors.text}>
                {showEbookReader.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Download className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowEbookReader(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="prose max-w-none">
              <h1>Capítulo 1: Introdução</h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
              </p>
              {currentUser?.role !== 'subscriber' && (
                <div className="mt-8 p-6 bg-linear-to-r from-purple-100 to-teal-100 dark:from-purple-900 dark:to-teal-900 rounded-2xl text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-bold text-xl mb-2">Conteúdo Premium</h3>
                  <p className="mb-4">Assine para continuar lendo</p>
                  <Button
                    onClick={() => {
                      setShowEbookReader(null);
                      setShowPaywallModal(true);
                    }}
                    className={`${colors.primary} text-white rounded-full`}
                  >
                    Ver Planos
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="shrink-0 flex justify-between items-center border-t">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <span className={`text-sm ${colors.textSecondary}`}>
              Página 1 de {showEbookReader.pages}
            </span>
            <Button variant="ghost" size="sm">
              Próxima
              <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const ReportModal = () => {
    if (!showReportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className={`${colors.card} max-w-md w-full rounded-3xl shadow-2xl`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className={colors.text}>
                {isChildMode ? '⚠️ Reportar' : 'Denunciar Conteúdo'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowReportModal(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`${colors.textSecondary} ${isChildMode ? 'text-lg' : ''}`}>
              {isChildMode 
                ? 'Por que você quer reportar esta foto?' 
                : 'Por que você está denunciando este conteúdo?'}
            </p>
            <div className="space-y-2">
              {[
                { label: isChildMode ? '😢 Conteúdo triste' : 'Conteúdo inapropriado' },
                { label: isChildMode ? '😡 Assédio' : 'Assédio ou bullying' },
                { label: isChildMode ? '❌ Spam' : 'Spam ou publicidade' },
                { label: isChildMode ? '🚫 Informação errada' : 'Informação falsa' },
                { label: isChildMode ? '🔞 Não é para crianças' : 'Conteúdo adulto' }
              ].map((reason, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={`w-full justify-start rounded-full hover:bg-red-50 dark:hover:bg-red-900 ${isChildMode ? 'h-14 text-lg' : ''}`}
                >
                  {reason.label}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder={isChildMode ? 'Quer contar mais alguma coisa?' : 'Detalhes adicionais (opcional)'}
              className={`rounded-2xl ${isChildMode ? 'text-lg' : ''}`}
            />
            <Button
              className={`w-full bg-red-500 hover:bg-red-600 text-white rounded-full ${isChildMode ? 'h-14 text-lg' : ''}`}
              onClick={() => {
                setShowReportModal(null);
                // Add report logic here
              }}
            >
              {isChildMode ? '✅ Enviar' : 'Enviar Denúncia'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

     return (
    <div className={`min-h-screen ${colors.background} ${colors.text} transition-colors`}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentTab === 'home' && <HomeTab />}
        {currentTab === 'explore' && <ExploreTab />}
        {currentTab === 'community' && <CommunityTab />}
        {currentTab === 'scanner' && <ScannerTab />}
        {currentTab === 'products' && <ProductsTab />}
        {currentTab === 'profile' && <ProfileTab />}
      </main>

      <BottomTabBar />

      {showAuthModal && <AuthModal />}
      {showPaywallModal && <PaywallModal />}
      {showCreatePostModal && <CreatePostModal />}
      {showEbookReader && <EbookReaderModal />}
      {showReportModal && <ReportModal />}
    </div>
    );
}

