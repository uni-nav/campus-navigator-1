import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Server, LogIn, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getApiUrl, setApiUrl, getAdminToken, setAdminToken, healthCheck } from '@/lib/api/client';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const setStoreApiUrl = useAppStore((s) => s.setApiUrl);

  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [token, setToken] = useState(getAdminToken());
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTested(null);
    try {
      setApiUrl(apiUrl);
      setStoreApiUrl(apiUrl);
      const ok = await healthCheck();
      setTested(ok);
      if (ok) {
        toast.success('API ulanishi muvaffaqiyatli');
      } else {
        toast.error('API bilan ulanib bo‘lmadi');
      }
    } catch {
      setTested(false);
      toast.error('Ulanishda xato');
    } finally {
      setTesting(false);
    }
  };

  const handleLogin = async () => {
    if (!token.trim()) {
      toast.error('Admin tokenni kiriting');
      return;
    }
    setSubmitting(true);
    try {
      setApiUrl(apiUrl);
      setStoreApiUrl(apiUrl);
      setAdminToken(token);
      navigate('/floors', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearToken = () => {
    setAdminToken('');
    setToken('');
    toast.success('Token tozalandi');
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-6">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin kirish</h1>
              <p className="text-sm text-muted-foreground">Bino navigatsiya paneli</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Admin panelga kirish uchun API manzilini va admin tokenni kiriting.
            Token to‘g‘ri bo‘lmasa, keyingi so‘rovlarda 401 xatolik chiqadi.
          </p>
          {tested !== null && (
            <div
              className={cn(
                'mt-5 rounded-lg border px-3 py-2 text-xs',
                tested
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              )}
            >
              {tested ? 'API ulanmoqda' : 'API ulanmayapti'}
            </div>
          )}
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>API manzili</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={apiUrl}
                    onChange={(e) => setApiUrlState(e.target.value)}
                    placeholder="http://localhost:8000"
                    aria-label="API manzili"
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTest}
                  disabled={testing}
                  className="w-full sm:w-auto"
                >
                  {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Test'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Admin token</Label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Bearer token"
                aria-label="Admin token"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleLogin} disabled={submitting} className="w-full gap-2">
                <LogIn className="w-4 h-4" />
                Kirish
              </Button>
              <Button type="button" variant="outline" onClick={handleClearToken} className="w-full">
                Tokenni tozalash
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
