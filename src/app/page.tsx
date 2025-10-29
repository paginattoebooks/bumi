import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, Search, Users, BookOpen, User, Heart, MessageCircle, Share2, 
  Settings, Bell, Plus, ChevronLeft, Download, Flag, Lock,
  X, Sun, Moon, Star, TrendingUp, Crown,
  Scan, Camera, Droplets, SunMedium, Leaf, Play, 
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

// Types
type UserRole = 'visitor' | 'user' | 'subscriber';
type Tab = 'home' | 'explore' | 'community' | 'scanner' | 'products' | 'profile' | 'settings';
type ProductType = 'ebook' | 'video';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  email?: string;
  phone?: string;
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
  isArchived: boolean;
  audience: PostAudience;
  timestamp: Date;
  hashtags: string[];
}

interface Product {
  id: string;
  type: 'ebook' | 'video';
  title: string;
  author: string;
  cover: string;
  fileUrl: string;
  duration?: number;
  pages?: number;
  isPremium: boolean;
  previewContent: string;
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
}

interface ImageQuality {
  resolution: { width: number; height: number };
  brightness: number;
  sharpness: number;
  isAcceptable: boolean;
  issues: string[];
}

type PostAudience = 'public' | 'followers' | 'close_friends';
type PermissionLevel = 'all' | 'followers' | 'none';

interface UserSettings {
  id: string;
  userId: string;
  isPrivate: boolean;
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    messages: boolean;
    updates: boolean;
  };
  twoFactorEnabled: boolean;
  blockedUsers: string[];
  language: string;
  allowTagging: boolean;
}

interface PrivacySettings {
  id: string;
  userId: string;
  defaultAudience: PostAudience;
  allowReshare: boolean;
  allowSave: boolean;
  showLocation: boolean;
  activityStatusEnabled: boolean;
  mentionsPermission: PermissionLevel;
  tagsPermission: PermissionLevel;
  requireTagReview: boolean;
  closeFriends: string[];
}

interface FollowRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  timestamp: Date;
}

// Mock Data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Maria Silva',
    username: 'plantlover_maria',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/eb7c9c48-aa21-47b0-8270-eee604c6de4c.png',
    bio: 'Apaixonada por suculentas e jardins urbanos 🌵',
    email: 'maria@example.com',
    phone: '(11) 98765-4321',
    followers: 1234,
    following: 567,
    isFollowing: false,
    role: 'subscriber'
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/adb9b894-bc13-469b-837e-8f2872ee2c63.png',
    caption: 'Minha coleção de suculentas está crescendo!',
    plantSpecies: 'Echeveria elegans',
    likes: 234,
    comments: 45,
    isLiked: false,
    isArchived: false,
    audience: 'public',
    timestamp: new Date('2025-01-10T10:30:00'),
    hashtags: ['suculentas', 'jardinagem']
  },
  {
    id: '2',
    author: mockUsers[0],
    image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ea561c6f-ea74-4632-b45f-ff64e87d2144.png',
    caption: 'Dica: regue pela manhã!',
    plantSpecies: 'Monstera deliciosa',
    likes: 567,
    comments: 89,
    isLiked: true,
    isArchived: false,
    audience: 'public',
    timestamp: new Date('2025-01-09'),
    hashtags: ['dicas', 'monstera']
  }
];

const helpArticles = [
  {
    id: 1,
    title: 'Como postar uma foto',
    category: 'Publicações',
    content: 'Toque no botão + no topo, selecione "Postar Foto", escolha da galeria ou tire uma foto, adicione legenda e publique!'
  },
  {
    id: 2,
    title: 'Como usar o Scanner',
    category: 'Scanner',
    content: 'Acesse Scanner, tire foto clara da planta, aguarde análise com nome científico e dicas de cuidado.'
  }
];

const mockProducts: Product[] = [
  {
    id: 'e1',
    type: 'ebook',
    title: 'Guia de Suculentas',
    author: 'Dr. Pedro',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fd5f9e7f-9ff3-4023-aa07-c640cc3b247b.png',
    fileUrl: '/ebooks/suculentas.pdf',
    pages: 156,
    isPremium: true,
    previewContent: '15',
    description: 'Aprenda tudo sobre suculentas',
    rating: 4.8
  },
  {
    id: 'v1',
    type: 'video',
    title: 'Curso de Jardinagem',
    author: 'Prof. Roberto',
    cover: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9d4f896d-43b3-4509-b932-f50ac1156b5a.png',
    fileUrl: '/videos/jardinagem.mp4',
    duration: 1800,
    isPremium: true,
    previewContent: '120',
    description: 'Técnicas profissionais',
    rating: 4.9
  }
];

export default function BumiApp() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCreatePostMenu, setShowCreatePostMenu] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showArchivedPosts, setShowArchivedPosts] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAppVersion, setShowAppVersion] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [selectedHelpArticle, setSelectedHelpArticle] = useState<any>(null);
  const [communityView, setCommunityView] = useState<'feed' | 'explore'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: User[];
    hashtags: { tag: string; count: number }[];
    species: { name: string; scientific: string; count: number }[];
    posts: Post[];
  }>({ users: [], hashtags: [], species: [], posts: [] });
  const [searchTab, setSearchTab] = useState<'users' | 'hashtags' | 'species' | 'posts'>('users');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showFollowRequests, setShowFollowRequests] = useState(false);
  const [showCloseFriends, setShowCloseFriends] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [postAudience, setPostAudience] = useState<PostAudience>('public');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    id: '1',
    userId: '1',
    defaultAudience: 'public',
    allowReshare: true,
    allowSave: true,
    showLocation: false,
    activityStatusEnabled: false,
    mentionsPermission: 'all',
    tagsPermission: 'followers',
    requireTagReview: true,
    closeFriends: []
  });
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([
    {
      id: '1',
      requesterId: '2',
      requesterName: 'João Costa',
      requesterAvatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3afc6ac7-85c4-4120-a573-bf7022c47057.png',
      timestamp: new Date()
    }
  ]);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PlantScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    id: '1',
    userId: '1',
    isPrivate: false,
    notifications: { likes: true, comments: true, follows: true, messages: true, updates: false },
    twoFactorEnabled: false,
    blockedUsers: [],
    language: 'pt-BR',
    allowTagging: true
  });

  const colors = {
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    background: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600'
  };

  const handleLike = (postId: string) => {
    if (!currentUser) { setShowAuthModal(true); return; }
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleArchivePost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isArchived: true } : p));
  };

  const handleRestorePost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isArchived: false } : p));
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Excluir permanentemente?')) {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  const mockAnalyzePlant = (): PlantScanResult => ({
    speciesName: 'Monstera deliciosa',
    scientificName: 'monstera_deliciosa',
    confidence: 87,
    needsWater: false,
    lightRecommendation: 'ok',
    tips: ['Regar 1-2x por semana', 'Luz indireta', 'Limpar folhas']
  });

  const analyzePlantWithAI = async (imageDataUrl: string): Promise<PlantScanResult> => {
    try {
      // Call backend API (never expose API key in frontend!)
      const response = await fetch('/api/scanner/identify', {
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
      
      // Transform API response to our format
      return {
        speciesName: data.species || 'Espécie desconhecida',
        scientificName: data.scientific_name || data.species?.replace(' ', '_').toLowerCase() || 'unknown',
        confidence: Math.round((data.confidence || 0) * 100),
        needsWater: data.care?.water?.toLowerCase().includes('regar') || false,
        lightRecommendation: data.care?.light?.toLowerCase().includes('mais') ? 'more' :
                            data.care?.light?.toLowerCase().includes('menos') ? 'less' : 'ok',
        tips: [
          data.care?.water || 'Manter solo úmido',
          data.care?.light || 'Luz indireta',
          data.care?.soil || 'Solo bem drenado',
          data.care?.pests || 'Verificar pragas semanalmente'
        ].filter(Boolean)
      };
    } catch (error) {
      console.error('Erro na análise com IA:', error);
      // Fallback to mock for demo
      return mockAnalyzePlant();
    }
  };

  const onAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Try real AI analysis
      const result = await analyzePlantWithAI(scanImage!);
      setScanResult(result);
    } catch (error) {
      console.error('Erro:', error);
      // Fallback to mock
      await new Promise(r => setTimeout(r, 1500));
      setScanResult(mockAnalyzePlant());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const Header = () => (
    <header className={`sticky top-0 z-[220] bg-white border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <img 
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f37c0043-27d7-43bb-a588-cdd43a1d2f4b.png" 
          alt="Bumi - Your Plant Community" 
          className="h-7 select-none"
        />
        
        <div className="flex items-center gap-2">
          {currentUser && (
            <>
              <Button 
                onClick={() => setShowNotifications(true)} 
                size="icon" 
                variant="ghost"
                className="rounded-full relative"
              >
                <Bell className="w-5 h-5" />
                {followRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {followRequests.length > 99 ? '99+' : followRequests.length}
                  </span>
                )}
              </Button>
              <Button 
                onClick={() => setShowCreatePostMenu(true)} 
                size="icon" 
                className="rounded-full"
                style={{ backgroundColor: '#43A047', color: '#fff' }}
                onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#2E7D32'}
                onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#43A047'}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </>
          )}
          {currentUser ? (
            <Avatar className="cursor-pointer" onClick={() => setCurrentTab('profile')}>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Button onClick={() => setShowAuthModal(true)} className={`${colors.primary} text-white rounded-full`}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );

  const PostCard = ({ post, showMenu = false }: { post: Post; showMenu?: boolean }) => {
    const [showPostMenu, setShowPostMenu] = useState(false);
    return (
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar><AvatarImage src={post.author.avatar} /><AvatarFallback>{post.author.name[0]}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="text-xs text-gray-600">@{post.author.username}</p>
              </div>
            </div>
            {showMenu && currentUser?.id === post.author.id && (
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setShowPostMenu(!showPostMenu)}>
                  <span className="text-xl">⋯</span>
                </Button>
                {showPostMenu && (
                  <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg w-48 z-10">
                    <button onClick={() => { handleArchivePost(post.id); setShowPostMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50">Arquivar</button>
                    <button onClick={() => { handleDeletePost(post.id); setShowPostMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600">Excluir</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <img src={post.image} alt="Post de planta" className="w-full aspect-square object-cover" />
          <div className="p-4">
            <div className="flex gap-4 mb-3">
              <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="ml-2">{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm"><MessageCircle className="w-5 h-5" /><span className="ml-2">{post.comments}</span></Button>
            </div>
            <p className="mb-2">{post.caption}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-[#43A047] text-white">{post.plantSpecies}</span>
              {post.hashtags.map(tag => <span key={tag} className="text-xs text-gray-600">#{tag}</span>)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const HomeTab = () => (
    <div className="space-y-4 pb-20">
      {posts.filter(p => !p.isArchived).map(post => <PostCard key={post.id} post={post} showMenu={true} />)}
    </div>
  );

  const ProfileTab = () => {
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editingAvatar, setEditingAvatar] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    
    if (!currentUser) return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-screen">
        <User className="w-20 h-20 text-gray-400 mb-4" />
        <Button onClick={() => setShowAuthModal(true)} className="bg-[#43A047] hover:bg-[#2E7D32] text-white rounded-full">Login</Button>
      </div>
    );

    const userPosts = posts.filter(p => p.author.id === currentUser.id);

    return (
      <div className="pb-20">
        <div className="bg-white pb-4">
          <div className="px-4 pt-4">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-20 h-20 border-2 border-gray-200">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex justify-around text-center pt-2">
                <div><div className="font-bold text-lg">{userPosts.filter(p => !p.isArchived).length}</div><div className="text-xs text-gray-600">publicações</div></div>
                <div><div className="font-bold text-lg">{currentUser.followers}</div><div className="text-xs text-gray-600">seguidores</div></div>
                <div><div className="font-bold text-lg">{currentUser.following}</div><div className="text-xs text-gray-600">seguindo</div></div>
              </div>
            </div>
            <div className="mb-4">
              <h2 className="font-bold text-sm">{currentUser.name}</h2>
              <p className="text-sm mt-1">{currentUser.bio}</p>
            </div>
            <Button onClick={() => setShowEditProfile(true)} variant="outline" className="w-full rounded-lg h-9">Editar perfil</Button>
            <div className="mt-3">
              <Button variant="outline" className="w-full rounded-lg h-9 text-sm" onClick={() => setCurrentTab('settings')}>
                <Settings className="w-4 h-4 mr-2" />Configurações
              </Button>
            </div>
          </div>
          <div className="flex border-t mt-4">
            <button className="flex-1 py-3 border-b-2 border-gray-900">
              <span className="text-xs font-semibold">PUBLICAÇÕES</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          {userPosts.filter(p => !p.isArchived).map(post => (
            <div 
              key={post.id} 
              className="aspect-square relative cursor-pointer group"
              onClick={() => setSelectedPost(post)}
            >
              <img src={post.image} alt="Post" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-4 text-white font-semibold">
                  <div className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white" />{post.likes}</div>
                  <div className="flex items-center gap-1"><MessageCircle className="w-5 h-5 fill-white" />{post.comments}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showArchivedPosts && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="bg-white sticky top-0 border-b px-4 py-4 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setShowArchivedPosts(false)}><ChevronLeft /></Button>
              <h1 className="font-bold text-xl">Arquivados</h1>
            </div>
            <div className="grid grid-cols-3 gap-1 p-4">
              {posts.filter(p => p.isArchived && p.author.id === currentUser.id).map(post => (
                <div key={post.id} className="aspect-square relative group">
                  <img src={post.image} alt="Arquivado" className="w-full h-full object-cover rounded" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-white text-green-600" onClick={() => handleRestorePost(post.id)}>Restaurar</Button>
                      <Button size="sm" className="bg-red-500 text-white" onClick={() => handleDeletePost(post.id)}>Excluir</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedPost.author.avatar} />
                    <AvatarFallback>{selectedPost.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">{selectedPost.author.name}</p>
                    <p className="text-xs text-gray-300">@{selectedPost.author.username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPost(null)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <img 
                src={selectedPost.image} 
                alt="Post" 
                className="w-full rounded-2xl mb-4 max-h-[70vh] object-contain"
              />
              
              <div className="bg-white rounded-2xl p-4">
                <div className="flex gap-4 mb-3">
                  <Button variant="ghost" size="sm" onClick={() => handleLike(selectedPost.id)}>
                    <Heart className={`w-5 h-5 ${selectedPost.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="ml-2">{selectedPost.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-5 h-5" />
                    <span className="ml-2">{selectedPost.comments}</span>
                  </Button>
                </div>
                <p className="mb-2">{selectedPost.caption}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#43A047] text-white">
                    {selectedPost.plantSpecies}
                  </span>
                  {selectedPost.hashtags.map(tag => (
                    <span key={tag} className="text-xs text-gray-600">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full rounded-3xl shadow-2xl max-h-screen overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Editar Perfil</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowEditProfile(false)}><X /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={editingAvatar || currentUser.avatar} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <label htmlFor="edit-pic" className="text-sm text-[#43A047] cursor-pointer hover:underline hover:text-[#2E7D32]">Alterar foto</label>
                  <input id="edit-pic" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setEditingAvatar(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
                <Input defaultValue={currentUser.name} placeholder="Nome" />
                <Input defaultValue={currentUser.username} placeholder="Username" />
                <Textarea defaultValue={currentUser.bio} placeholder="Bio" className="min-h-24" />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => { setShowEditProfile(false); setEditingAvatar(null); }}>Cancelar</Button>
                  <Button className="flex-1 bg-[#43A047] hover:bg-[#2E7D32] text-white rounded-full" onClick={() => {
                    if (editingAvatar) setCurrentUser({ ...currentUser, avatar: editingAvatar });
                    setShowEditProfile(false);
                    setEditingAvatar(null);
                  }}>Salvar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const SettingsTab = () => (
    <div className="pb-20">
      <div className="bg-white sticky top-16 border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setCurrentTab('profile')}><ChevronLeft /></Button>
        <h1 className="font-bold text-xl">Configurações</h1>
      </div>
      <div className="space-y-6 mt-4">
        <div>
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Conta</h3>
          <div className="bg-white">
            <button onClick={() => setShowChangePassword(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b">Alterar Senha</button>
            <button onClick={() => setShowArchivedPosts(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50">📦 Arquivados</button>
          </div>
        </div>
        <div>
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Privacidade</h3>
          <div className="bg-white">
            <button onClick={() => setShowPrivacySettings(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b">Quem pode ver seu conteúdo</button>
            <button 
              onClick={() => setUserSettings({ ...userSettings, isPrivate: !userSettings.isPrivate })}
              className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b flex items-center justify-between"
            >
              <span>Conta Privada</span>
              <div className={`w-12 h-6 rounded-full ${userSettings.isPrivate ? 'bg-[#43A047]' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${userSettings.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </button>
            <button 
              onClick={() => setShowFollowRequests(true)}
              className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b flex items-center justify-between"
            >
              <span>Solicitações de Seguidores</span>
              {followRequests.length > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">{followRequests.length}</span>
              )}
            </button>
            <button onClick={() => setShowCloseFriends(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50">Lista de Próximos</button>
          </div>
        </div>
        <div>
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Ajuda</h3>
          <div className="bg-white">
            <button onClick={() => setShowHelpCenter(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b">Central de Ajuda</button>
            <button onClick={() => setShowContactSupport(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b">Contatar Suporte</button>
            <button onClick={() => setShowFeedback(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50">Enviar Feedback</button>
          </div>
        </div>
        <div>
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Sobre</h3>
          <div className="bg-white">
            <button onClick={() => setShowAppVersion(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b flex justify-between">
              <span>Versão do App</span><span className="text-gray-600">v1.0.0</span>
            </button>
            <button onClick={() => setShowTerms(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50 border-b">Termos de Uso</button>
            <button onClick={() => setShowPrivacy(true)} className="w-full px-4 py-4 text-left hover:bg-gray-50">Política de Privacidade</button>
          </div>
        </div>
        <div className="px-4">
          <Button onClick={() => { if (confirm('Sair?')) { setCurrentUser(null); setCurrentTab('home'); }}} variant="outline" className="w-full h-12 text-red-600 border-red-300">Sair</Button>
        </div>
      </div>
    </div>
  );

  const HelpCenterModal = () => {
    if (selectedHelpArticle) {
      return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="bg-white sticky top-0 border-b px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedHelpArticle(null)}><ChevronLeft /></Button>
            <h1 className="font-bold text-lg">{selectedHelpArticle.title}</h1>
          </div>
          <div className="px-4 py-6"><p>{selectedHelpArticle.content}</p></div>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="bg-white sticky top-0 border-b px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowHelpCenter(false)}><ChevronLeft /></Button>
          <h1 className="font-bold text-xl">Central de Ajuda</h1>
        </div>
        <div className="px-4 py-6 space-y-3">
          {helpArticles.map(article => (
            <Card key={article.id} className="cursor-pointer" onClick={() => setSelectedHelpArticle(article)}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-gray-600">{article.category}</p>
                </div>
                <ChevronLeft className="rotate-180 text-gray-400" />
              </CardContent>
            </Card>
          ))}
          <Button onClick={() => setShowContactSupport(true)} className="w-full bg-green-600 text-white rounded-full h-12 mt-6">Fale conosco</Button>
        </div>
      </div>
    );
  };

  const FeedbackModal = () => {
    const [rating, setRating] = useState(0);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full rounded-3xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Enviar Feedback</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowFeedback(false)}><X /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRating(s)}><Star className={`w-8 h-8 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} /></button>)}
            </div>
            <Textarea placeholder="Comentários" className="min-h-32" />
            <Button onClick={() => { alert('Obrigado! 🌿'); setShowFeedback(false); }} className="w-full bg-green-600 text-white rounded-full">Enviar</Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const PrivacySettingsModal = () => {
    const audienceOptions = [
      { value: 'public' as PostAudience, label: 'Todos (público)', icon: '🌍', desc: 'Qualquer pessoa pode ver' },
      { value: 'followers' as PostAudience, label: 'Somente seguidores', icon: '👥', desc: 'Apenas quem te segue' },
      { value: 'close_friends' as PostAudience, label: 'Lista de próximos', icon: '⭐', desc: 'Amigos especiais' }
    ];

    const permissionOptions = [
      { value: 'all' as PermissionLevel, label: 'Todos' },
      { value: 'followers' as PermissionLevel, label: 'Somente seguidores' },
      { value: 'none' as PermissionLevel, label: 'Ninguém' }
    ];

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="bg-white sticky top-0 border-b px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowPrivacySettings(false)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-xl">Quem pode ver seu conteúdo</h1>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Default Audience */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Audiência padrão das postagens</h3>
            <div className="space-y-2">
              {audienceOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setPrivacySettings({ ...privacySettings, defaultAudience: option.value })}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    privacySettings.defaultAudience === option.value
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </div>
                    {privacySettings.defaultAudience === option.value && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sharing Controls */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Controles de compartilhamento</h3>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Permitir compartilhamento</p>
                <p className="text-sm text-gray-600">Outros podem compartilhar suas publicações</p>
              </div>
              <div
                onClick={() => setPrivacySettings({ ...privacySettings, allowReshare: !privacySettings.allowReshare })}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  privacySettings.allowReshare ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                  privacySettings.allowReshare ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Permitir salvar</p>
                <p className="text-sm text-gray-600">Usuários podem salvar suas fotos</p>
              </div>
              <div
                onClick={() => setPrivacySettings({ ...privacySettings, allowSave: !privacySettings.allowSave })}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  privacySettings.allowSave ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                  privacySettings.allowSave ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Exibir localização</p>
                <p className="text-sm text-gray-600">Mostrar onde a foto foi tirada</p>
              </div>
              <div
                onClick={() => setPrivacySettings({ ...privacySettings, showLocation: !privacySettings.showLocation })}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  privacySettings.showLocation ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                  privacySettings.showLocation ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Status de atividade</p>
                <p className="text-sm text-gray-600">Mostrar quando você está online</p>
              </div>
              <div
                onClick={() => setPrivacySettings({ ...privacySettings, activityStatusEnabled: !privacySettings.activityStatusEnabled })}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  privacySettings.activityStatusEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                  privacySettings.activityStatusEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </div>

          {/* Mentions & Tags */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Interações</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Quem pode te mencionar</label>
              <div className="flex gap-2">
                {permissionOptions.map(opt => (
                  <Button
                    key={opt.value}
                    variant={privacySettings.mentionsPermission === opt.value ? 'default' : 'outline'}
                    className={`flex-1 rounded-full text-xs ${
                      privacySettings.mentionsPermission === opt.value ? 'bg-green-600 text-white' : ''
                    }`}
                    onClick={() => setPrivacySettings({ ...privacySettings, mentionsPermission: opt.value })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Quem pode te marcar em fotos</label>
              <div className="flex gap-2 mb-3">
                {permissionOptions.map(opt => (
                  <Button
                    key={opt.value}
                    variant={privacySettings.tagsPermission === opt.value ? 'default' : 'outline'}
                    className={`flex-1 rounded-full text-xs ${
                      privacySettings.tagsPermission === opt.value ? 'bg-green-600 text-white' : ''
                    }`}
                    onClick={() => setPrivacySettings({ ...privacySettings, tagsPermission: opt.value })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Revisar marcações manualmente</p>
                  <p className="text-xs text-gray-600">Aprovar antes de aparecer no seu perfil</p>
                </div>
                <div
                  onClick={() => setPrivacySettings({ ...privacySettings, requireTagReview: !privacySettings.requireTagReview })}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    privacySettings.requireTagReview ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    privacySettings.requireTagReview ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              alert('Configurações de privacidade salvas!');
              setShowPrivacySettings(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full h-12"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    );
  };

  const FollowRequestsModal = () => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="bg-white sticky top-0 border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setShowFollowRequests(false)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-xl">Solicitações de Seguidores</h1>
      </div>

      <div className="px-4 py-6 space-y-3">
        {followRequests.length > 0 ? (
          followRequests.map(request => (
            <Card key={request.id} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={request.requesterAvatar} />
                    <AvatarFallback>{request.requesterName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{request.requesterName}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(request.timestamp).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setFollowRequests(followRequests.filter(r => r.id !== request.id));
                      alert('Solicitação aprovada!');
                    }}
                    className="flex-1 bg-green-600 text-white rounded-full"
                  >
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => {
                      setFollowRequests(followRequests.filter(r => r.id !== request.id));
                    }}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Recusar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-gray-900 mb-2">Nenhuma solicitação</p>
            <p className="text-sm text-gray-600">Quando alguém pedir para seguir você, aparecerá aqui</p>
          </div>
        )}
      </div>
    </div>
  );

  const CloseFriendsModal = () => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="bg-white sticky top-0 border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setShowCloseFriends(false)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-xl">Lista de Próximos</h1>
      </div>

      <div className="px-4 py-6">
        <Card className="bg-green-50 border-green-200 rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-green-900 mb-1">O que é a Lista de Próximos?</p>
                <p className="text-sm text-green-800">
                  Compartilhe publicações apenas com seus melhores amigos. Eles não serão notificados quando você os adicionar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {mockUsers.slice(1).map(user => (
          <Card key={user.id} className="rounded-2xl mb-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
                <Button
                  variant={privacySettings.closeFriends.includes(user.id) ? 'default' : 'outline'}
                  className={`rounded-full ${
                    privacySettings.closeFriends.includes(user.id) ? 'bg-green-600 text-white' : ''
                  }`}
                  onClick={() => {
                    if (privacySettings.closeFriends.includes(user.id)) {
                      setPrivacySettings({
                        ...privacySettings,
                        closeFriends: privacySettings.closeFriends.filter(id => id !== user.id)
                      });
                    } else {
                      setPrivacySettings({
                        ...privacySettings,
                        closeFriends: [...privacySettings.closeFriends, user.id]
                      });
                    }
                  }}
                >
                  {privacySettings.closeFriends.includes(user.id) ? 'Remover' : 'Adicionar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ScannerTab = () => {
    const [showQualityWarning, setShowQualityWarning] = useState(false);
    const [imageQuality, setImageQuality] = useState<ImageQuality | null>(null);

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
        setShowQualityWarning(false);
      };
      reader.readAsDataURL(file);
    };

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

          const issues: string[] = [];
          let isAcceptable = true;

          if (img.width < 1024 || img.height < 1024) {
            issues.push('Resolução muito baixa - tire uma foto mais próxima');
            isAcceptable = false;
          }

          resolve({
            resolution: { width: img.width, height: img.height },
            brightness: 120,
            sharpness: 25,
            isAcceptable,
            issues
          });
        };

        img.src = imageDataUrl;
      });
    };

    const onAnalyze = async () => {
      if (!scanImage) return;
      
      setIsAnalyzing(true);
      setShowQualityWarning(false);
      
      try {
        const quality = await checkImageQuality(scanImage);
        setImageQuality(quality);
        
        if (!quality.isAcceptable) {
          setShowQualityWarning(true);
          setIsAnalyzing(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setScanResult(mockAnalyzePlant());
        
      } catch (error) {
        console.error('Erro na análise:', error);
        alert('Erro ao analisar a planta. Tente novamente.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    return (
      <div className="pb-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">Scanner de Plantas</h2>
          <Button variant="ghost" size="icon" onClick={() => alert('Dicas de captura:\n• Boa iluminação\n• Foco nas folhas\n• Imagem nítida')}>
            <AlertCircle className="w-5 h-5 text-[#43A047]" />
          </Button>
        </div>
        
        {!scanImage && !scanResult && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Leaf className="text-[#43A047] w-5 h-5 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Dicas para um bom scan</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Boa iluminação natural</li>
                    <li>• Folhas ou flores no centro</li>
                    <li>• Close-up da planta</li>
                    <li>• Imagem nítida e focada</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            {!scanImage ? (
              <div className="space-y-3">
                <label 
                  htmlFor="plant-camera-input"
                  className="block border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                    <p className="font-semibold">Tirar Foto</p>
                    <p className="text-sm text-gray-600">Usar câmera do dispositivo</p>
                  </div>
                </label>
                <input
                  id="plant-camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
                
                <label 
                  htmlFor="plant-gallery-input"
                  className="block border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                      <Download className="text-white w-8 h-8" />
                    </div>
                    <p className="font-semibold">Escolher da Galeria</p>
                    <p className="text-sm text-gray-600">Selecionar foto existente</p>
                  </div>
                </label>
                <input
                  id="plant-gallery-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`relative rounded-2xl overflow-hidden border-4 ${
                  showQualityWarning ? 'border-red-500' :
                  imageQuality?.isAcceptable ? 'border-green-500' : 'border-yellow-500'
                }`}>
                  <img 
                    src={scanImage} 
                    alt="Plant photo selected for identification"
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setScanImage(null);
                      setScanResult(null);
                      setShowQualityWarning(false);
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {showQualityWarning && imageQuality && (
                  <Card className="bg-orange-50 border-orange-200 rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-2">Qualidade Insuficiente</h4>
                          <ul className="text-sm text-orange-800 space-y-1">
                            {imageQuality.issues.map((issue, i) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!scanResult && !showQualityWarning && (
                  <Button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full h-12"
                  >
                    {isAnalyzing ? <span className="animate-pulse">🔍 Analisando sua planta...</span> : '🔍 Identificar Planta'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {scanResult && (
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>{scanResult.speciesName}</CardTitle>
              <p className="text-sm italic text-gray-600">{scanResult.scientificName}</p>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32] w-fit">
                ✓ {scanResult.confidence}% de confiança
              </span>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${scanResult.needsWater ? 'bg-blue-50' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className={`${scanResult.needsWater ? 'text-blue-600' : 'text-[#43A047]'} w-5 h-5`} />
                    <span className="font-semibold text-sm">Água</span>
                  </div>
                  <p className="font-medium text-sm">
                    {scanResult.needsWater ? 'Precisa de água' : 'Água adequada'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl ${
                  scanResult.lightRecommendation === 'more' ? 'bg-yellow-50' :
                  scanResult.lightRecommendation === 'less' ? 'bg-purple-50' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <SunMedium className={`w-5 h-5 ${
                      scanResult.lightRecommendation === 'more' ? 'text-yellow-600' :
                      scanResult.lightRecommendation === 'less' ? 'text-purple-600' : 'text-[#43A047]'
                    }`} />
                    <span className="font-semibold text-sm">Luz</span>
                  </div>
                  <p className="font-medium text-sm">
                    {scanResult.lightRecommendation === 'more' ? 'Precisa de mais' :
                     scanResult.lightRecommendation === 'less' ? 'Reduzir exposição' : 'Luz adequada'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">💡 Dicas de Cuidado</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {scanResult.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#43A047]">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-[#43A047] hover:bg-[#2E7D32] text-white rounded-full">
                  💾 Salvar no Jardim
                </Button>
                <Button onClick={() => {
                  if (!currentUser) { setShowAuthModal(true); return; }
                  const newPost: Post = {
                    id: `scan-${Date.now()}`,
                    author: currentUser,
                    image: scanImage!,
                    caption: `Identificada: ${scanResult.speciesName} 🌿`,
                    plantSpecies: scanResult.speciesName,
                    likes: 0,
                    comments: 0,
                    isLiked: false,
                    isArchived: false,
                    audience: 'public',
                    timestamp: new Date(),
                    hashtags: ['scanner', 'identificacao']
                  };
                  setPosts([newPost, ...posts]);
                  setCurrentTab('home');
                  setScanImage(null);
                  setScanResult(null);
                }} className="flex-1 bg-[#43A047] hover:bg-[#2E7D32] text-white rounded-full">
                  📤 Compartilhar
                </Button>
              </div>

              <Button
                onClick={() => {
                  setScanImage(null);
                  setScanResult(null);
                }}
                variant="ghost"
                className="w-full"
              >
                🔄 Analisar outra planta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const ProductsTab = () => {
    const [selectedType, setSelectedType] = useState<ProductType>('ebook');
    const filteredProducts = mockProducts.filter(p => p.type === selectedType);

    return (
      <div className="pb-20 space-y-6">
        <h2 className="font-bold text-xl">Biblioteca BUMI</h2>

        <div className="flex gap-3">
          <Button
            onClick={() => setSelectedType('ebook')}
            className={`flex-1 rounded-full h-12 ${
              selectedType === 'ebook' 
                ? 'bg-[#43A047] text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            📚 eBooks
          </Button>
          <Button
            onClick={() => setSelectedType('video')}
            className={`flex-1 rounded-full h-12 ${
              selectedType === 'video' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            🎥 Vídeos
          </Button>
        </div>

        {currentUser?.role !== 'subscriber' && (
          <Card className="bg-gradient-to-r from-[#43A047] to-[#5DC15E] text-white rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6" />
                <h3 className="font-bold text-xl">Acesso Premium</h3>
              </div>
              <p className="mb-4">
                Desbloqueie todos os eBooks, vídeos e conteúdos exclusivos
              </p>
              <Button className="bg-white text-[#43A047] hover:bg-gray-100 rounded-full w-full">
                Assinar Agora - 7 dias grátis
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className="rounded-2xl shadow-sm cursor-pointer overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={product.cover} 
                  alt={`Cover of ${product.title} showing plant education content`}
                  className={`w-full ${product.type === 'ebook' ? 'aspect-[2/3]' : 'aspect-video'} object-cover`}
                />
                {product.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <Play className="w-6 h-6 text-[#43A047] ml-1" />
                    </div>
                  </div>
                )}
                {product.isPremium && currentUser?.role !== 'subscriber' && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                {!product.isPremium && (
                  <div className="absolute top-2 left-2 bg-[#5DC15E] text-white px-2 py-1 rounded-full text-xs font-semibold">
                    GRÁTIS
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-bold text-sm line-clamp-2 mb-1">{product.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{product.author}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-600">
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
    );
  };

  const CommunityTab = () => {
    const publicPosts = posts.filter(p => !p.isArchived && p.audience === 'public');
    
    const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query.length < 2) {
        setShowSearchResults(false);
        return;
      }

      setTimeout(() => {
        const results = {
          users: mockUsers.filter(u => 
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.username.toLowerCase().includes(query.toLowerCase())
          ),
          hashtags: [
            { tag: 'suculentas', count: 234 },
            { tag: 'jardinagem', count: 567 }
          ].filter(h => h.tag.includes(query.toLowerCase())),
          species: [
            { name: 'Monstera deliciosa', scientific: 'Monstera deliciosa', count: 89 }
          ].filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
          posts: publicPosts.filter(p => 
            p.caption.toLowerCase().includes(query.toLowerCase()) ||
            p.plantSpecies.toLowerCase().includes(query.toLowerCase())
          )
        };
        setSearchResults(results);
        setShowSearchResults(true);
      }, 300);
    };

    return (
      <div className="pb-20">
        <div className="bg-white sticky top-16 z-40 border-b">
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Pesquisar usuários, #hashtags, espécies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 rounded-full h-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-1 top-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {!showSearchResults && (
            <div className="flex border-t">
              <button
                onClick={() => setCommunityView('feed')}
                className={`flex-1 py-3 border-b-2 transition-colors ${
                  communityView === 'feed' ? 'border-[#43A047] text-[#43A047]' : 'border-transparent text-gray-600'
                }`}
              >
                <span className="text-sm font-semibold">FEED</span>
              </button>
              <button
                onClick={() => setCommunityView('explore')}
                className={`flex-1 py-3 border-b-2 transition-colors ${
                  communityView === 'explore' ? 'border-[#43A047] text-[#43A047]' : 'border-transparent text-gray-600'
                }`}
              >
                <span className="text-sm font-semibold">EXPLORAR</span>
              </button>
            </div>
          )}
        </div>

        {showSearchResults ? (
          <div className="mt-4">
            <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
              {(['users', 'hashtags', 'species', 'posts'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                    searchTab === tab ? 'bg-[#43A047] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab === 'users' && 'Usuários'}
                  {tab === 'hashtags' && 'Hashtags'}
                  {tab === 'species' && 'Espécies'}
                  {tab === 'posts' && 'Posts'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {communityView === 'feed' && (
              <div className="space-y-4 mt-4">
                {publicPosts.map(post => (
                  <PostCard key={post.id} post={post} showMenu={currentUser?.id === post.author.id} />
                ))}
              </div>
            )}
            {communityView === 'explore' && (
              <div className="grid grid-cols-3 gap-0.5 mt-4">
                {publicPosts.map(post => (
                  <div key={post.id} className="aspect-square cursor-pointer group">
                    <img src={post.image} alt="Explorar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2 text-white text-sm">
                        <span>{post.likes}❤️</span>
                        <span>{post.comments}💬</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const NotificationsPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full rounded-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Solicitações de Seguidores */}
          {followRequests.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">Solicitações de Seguidores</h3>
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                  {followRequests.length}
                </span>
              </div>
              <div className="space-y-3">
                {followRequests.map(request => (
                  <Card key={request.id} className="rounded-2xl border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={request.requesterAvatar} />
                          <AvatarFallback>{request.requesterName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{request.requesterName}</p>
                          <p className="text-xs text-gray-600">
                            quer seguir você
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setFollowRequests(followRequests.filter(r => r.id !== request.id));
                            alert('✅ Solicitação aprovada!');
                          }}
                          size="sm"
                          className="flex-1 bg-[#43A047] hover:bg-[#2E7D32] text-white rounded-full h-8 text-xs"
                        >
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => {
                            setFollowRequests(followRequests.filter(r => r.id !== request.id));
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-full h-8 text-xs"
                        >
                          Recusar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Outras Notificações (placeholder) */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Atividade Recente</h3>
            <div className="space-y-3">
              {/* Exemplo de notificação de curtida */}
              <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e001a280-40c7-4df4-bdc9-112f3a791aa4.png" />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">João Costa</span> curtiu sua publicação
                  </p>
                  <p className="text-xs text-gray-500">há 2 horas</p>
                </div>
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>

              {/* Exemplo de notificação de comentário */}
              <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f973b509-ff56-4ab8-a86e-732c0f766a11.png" />
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Ana Paula</span> comentou: "Que linda!"
                  </p>
                  <p className="text-xs text-gray-500">há 5 horas</p>
                </div>
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Estado vazio */}
          {followRequests.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold text-gray-900 mb-2">Sem notificações novas</p>
              <p className="text-sm text-gray-600">Quando alguém interagir com você, aparecerá aqui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const CreatePostMenu = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-sm w-full rounded-3xl shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Novo Post</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowCreatePostMenu(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => {
              setShowCreatePostMenu(false);
              setShowCreatePostModal(true);
            }}
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl h-14 hover:bg-green-50"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-green-700" />
            </div>
            <span>📸 Postar Foto</span>
          </Button>

          <Button
            onClick={() => {
              setShowCreatePostMenu(false);
              setShowCreatePostModal(true);
            }}
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl h-14 hover:bg-green-50"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-purple-700" />
            </div>
            <span>🎥 Postar Vídeo</span>
          </Button>

          <Button
            onClick={() => {
              setShowCreatePostMenu(false);
              setShowCreatePostModal(true);
            }}
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl h-14 hover:bg-green-50"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-teal-700" />
            </div>
            <span>📝 Compartilhar Dica</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const CreatePostModal = () => {
    const [postImage, setPostImage] = useState<string | null>(null);
    const [postCaption, setPostCaption] = useState('');
    const [selectedAudience, setSelectedAudience] = useState<PostAudience>(privacySettings.defaultAudience);

    const handleImageUpload = (file: File | null) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    const handlePublish = () => {
      if (!postImage || !currentUser) return;

      const newPost: Post = {
        id: `post-${Date.now()}`,
        author: currentUser,
        image: postImage,
        caption: postCaption || 'Nova publicação',
        plantSpecies: 'Planta identificada',
        likes: 0,
        comments: 0,
        isLiked: false,
        isArchived: false,
        audience: selectedAudience,
        timestamp: new Date(),
        hashtags: ['bumi', 'plantas']
      };

      setPosts([newPost, ...posts]);
      setShowCreatePostModal(false);
      setPostImage(null);
      setPostCaption('');
      setCurrentTab('home');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full rounded-3xl shadow-2xl max-h-screen overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Criar Publicação</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => {
                setShowCreatePostModal(false);
                setPostImage(null);
                setPostCaption('');
              }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!postImage ? (
              <div>
                <label 
                  htmlFor="post-image-input"
                  className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                      <Plus className="text-white w-8 h-8" />
                    </div>
                    <p className="font-semibold">Clique para adicionar fotos ou vídeos</p>
                    <p className="text-sm text-gray-600">Até 10 arquivos</p>
                  </div>
                </label>
                <input
                  id="post-image-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden">
                <img 
                  src={postImage} 
                  alt="Preview of selected image for post"
                  className="w-full max-h-96 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPostImage(null)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
            
            <Textarea
              placeholder="Escreva uma legenda..."
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              className="rounded-2xl min-h-32"
            />
            
            <Input
              placeholder="Adicionar hashtags (#suculentas #jardinagem)"
              className="rounded-full"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Quem pode ver</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedAudience === 'public' ? 'default' : 'outline'}
                  className={`flex-1 rounded-full text-xs ${selectedAudience === 'public' ? 'bg-[#43A047] text-white' : ''}`}
                  onClick={() => setSelectedAudience('public')}
                >
                  🌍 Todos
                </Button>
                <Button
                  type="button"
                  variant={selectedAudience === 'followers' ? 'default' : 'outline'}
                  className={`flex-1 rounded-full text-xs ${selectedAudience === 'followers' ? 'bg-green-600 text-white' : ''}`}
                  onClick={() => setSelectedAudience('followers')}
                >
                  👥 Seguidores
                </Button>
                <Button
                  type="button"
                  variant={selectedAudience === 'close_friends' ? 'default' : 'outline'}
                  className={`flex-1 rounded-full text-xs ${selectedAudience === 'close_friends' ? 'bg-green-600 text-white' : ''}`}
                  onClick={() => setSelectedAudience('close_friends')}
                >
                  ⭐ Próximos
                </Button>
              </div>
            </div>
            
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full h-12"
              onClick={handlePublish}
              disabled={!postImage}
            >
              Publicar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const TermsModal = () => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 border-b px-4 py-4 flex items-center gap-3 bg-white">
        <Button variant="ghost" size="icon" onClick={() => setShowTerms(false)}><ChevronLeft /></Button>
        <h1 className="font-bold text-xl">Termos de Uso</h1>
      </div>
      <div className="px-4 py-6 space-y-4">
        <section><h2 className="font-bold text-lg mb-3">1. Aceitação</h2><p className="text-sm text-gray-600">Ao usar o BUMI, você concorda com estes termos.</p></section>
        <section><h2 className="font-bold text-lg mb-3">2. Uso Permitido</h2><p className="text-sm text-gray-600">Destinado ao compartilhamento de conteúdo sobre plantas.</p></section>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentTab === 'home' && <HomeTab />}
        {currentTab === 'community' && <CommunityTab />}
        {currentTab === 'scanner' && <ScannerTab />}
        {currentTab === 'products' && <ProductsTab />}
        {currentTab === 'profile' && <ProfileTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-[200]">
        <div className="flex justify-around py-2">
          {[
            { id: 'home' as Tab, icon: Home, label: 'Início' },
            { id: 'community' as Tab, icon: Users, label: 'Comunidade' },
            { id: 'scanner' as Tab, icon: Scan, label: 'Scanner' },
            { id: 'products' as Tab, icon: BookOpen, label: 'Produtos' },
            { id: 'profile' as Tab, icon: User, label: 'Perfil' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-h-12 rounded-lg focus:outline-none focus-visible:ring-0 active:opacity-90 transition-colors ${
                currentTab === tab.id ? 'bg-[#43A047] text-white' : 'text-gray-600'
              }`}
            >
              <span className="inline-flex items-center justify-center w-5 h-5">
                <tab.icon className="w-5 h-5 shrink-0" />
              </span>
              <span className="text-xs leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {showNotifications && <NotificationsPanel />}
      {showCreatePostMenu && <CreatePostMenu />}
      {showCreatePostModal && <CreatePostModal />}
      {showHelpCenter && <HelpCenterModal />}
      {showFeedback && <FeedbackModal />}
      {showTerms && <TermsModal />}
      {showPrivacySettings && <PrivacySettingsModal />}
      {showFollowRequests && <FollowRequestsModal />}
      {showCloseFriends && <CloseFriendsModal />}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full rounded-3xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Alterar Senha</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowChangePassword(false)}><X /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="password" placeholder="Senha atual" />
              <Input type="password" placeholder="Nova senha (min 8 caracteres)" />
              <Input type="password" placeholder="Confirmar nova senha" />
              <Button onClick={() => { alert('Senha alterada!'); setShowChangePassword(false); }} className="w-full bg-green-600 text-white rounded-full">Salvar</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
