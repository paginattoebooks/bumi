'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

type Props = { onClose: () => void };

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // 6 dígitos
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string| null>(null);

  const canSubmit = email && password.length >= 6 && password.length <= 6;

  async function handleLogin() {
    try {
      setErr(null);
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    try {
      setErr(null);
      setLoading(true);
      // Requisito: senha exatamente 6 dígitos
      if (password.length !== 6) throw new Error('A senha deve ter exatamente 6 dígitos.');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;

      // Cria um esqueleto de profile
      const userId = data.user?.id;
      if (userId) {
        // username provisório baseado no email — você vai permitir mudar depois
        const usernameSeed = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
        await supabase.from('profiles').insert({
          id: userId,
          username: usernameSeed,
          full_name: '',
          bio: '',
          avatar_url: '',
          is_private: false
        });
      }

      alert('Conta criada! Verifique seu e-mail (se necessário) e faça login.');
      setMode('login');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{mode === 'login' ? 'Entrar' : 'Criar conta'}</CardTitle>
          <button onClick={onClose} aria-label="Fechar" className="text-xl">×</button>
        </CardHeader>

        <CardContent className="space-y-3">
          {err && <p className="text-red-600 text-sm">{err}</p>}

          <Input placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <Input
            placeholder="Senha (6 dígitos)"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            maxLength={6}
            minLength={6}
          />

          {mode === 'login' ? (
            <Button className="w-full" disabled={!canSubmit || loading} onClick={handleLogin}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          ) : (
            <Button className="w-full" disabled={!canSubmit || loading} onClick={handleSignup}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
          )}

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <button className="underline" onClick={()=>setMode('signup')}>
                Não tem cadastro? Criar conta
              </button>
            ) : (
              <button className="underline" onClick={()=>setMode('login')}>
                Já tem cadastro? Entrar
              </button>
            )}
          </div>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}

