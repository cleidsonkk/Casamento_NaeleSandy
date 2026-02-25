import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { clearAdminAccessKey, getAdminAccessKey, setAdminAccessKey } from '@/lib/adminAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TRPCClientError } from '@trpc/client';
import { Loader2, LogOut, Users, Gift, CreditCard, Settings, BarChart3, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import GuestsTab from '@/components/admin/GuestsTab';
import GiftsTab from '@/components/admin/GiftsTab';
import PaymentsTab from '@/components/admin/PaymentsTab';
import SettingsTab from '@/components/admin/SettingsTab';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [hasAdminAccess, setHasAdminAccess] = useState(() => Boolean(getAdminAccessKey()));
  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: hasAdminAccess,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!(statsError instanceof TRPCClientError)) return;
    if (statsError.data?.code !== 'UNAUTHORIZED' && statsError.data?.code !== 'FORBIDDEN') return;
    clearAdminAccessKey();
    setHasAdminAccess(false);
    toast.error('Chave de admin invalida. Tente novamente.');
  }, [statsError]);

  const handleUnlockAdmin = () => {
    const normalized = accessKeyInput.trim();
    if (!normalized) {
      toast.error('Digite a chave de acesso admin');
      return;
    }
    setAdminAccessKey(normalized);
    setHasAdminAccess(true);
  };

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md card-luxury space-y-5">
          <div className="text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-accent mx-auto" />
            <h1 className="text-3xl font-playfair">Painel dos Noivos</h1>
            <p className="text-sm text-muted-foreground">
              Digite a chave admin para editar precos, confirmar pix e ver RSVPs.
            </p>
          </div>
          <Input
            type="password"
            placeholder="Chave de acesso admin"
            value={accessKeyInput}
            onChange={e => setAccessKeyInput(e.target.value)}
            className="input-luxury h-11"
          />
          <div className="flex gap-3">
            <Button onClick={handleUnlockAdmin} className="btn-luxury flex-1">
              Entrar no painel
            </Button>
            <Button onClick={() => setLocation('/')} variant="outline" className="flex-1">
              Voltar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Configure a variavel `ADMIN_ACCESS_KEY` no Vercel para liberar acesso.
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearAdminAccessKey();
    setHasAdminAccess(false);
    toast.success('Acesso admin encerrado');
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Nao foi possivel carregar o painel admin.</p>
          <Button onClick={handleLogout} className="btn-luxury">
            Entrar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold text-foreground">Painel Admin</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-border"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-5 bg-card border border-border">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Convidados</span>
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Presentes</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat Card 1 */}
              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Confirmações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {stats?.confirmedCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{stats?.totalCompanions || 0} acompanhantes
                  </p>
                </CardContent>
              </Card>

              {/* Stat Card 2 */}
              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Convidados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {stats?.totalGuests || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confirmados + acompanhantes
                  </p>
                </CardContent>
              </Card>

              {/* Stat Card 3 */}
              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Presentes Selecionados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {stats?.selectedGifts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Presentes reservados
                  </p>
                </CardContent>
              </Card>

              {/* Stat Card 4 */}
              <Card className="card-luxury">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Valor Arrecadado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    R$ {(stats?.totalAmount || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pagamentos confirmados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="text-base">Pagamentos Confirmados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.confirmedPayments || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="text-base">Pagamentos Informados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats?.informedPayments || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Guests Tab */}
          <TabsContent value="guests">
            <GuestsTab />
          </TabsContent>

          {/* Gifts Tab */}
          <TabsContent value="gifts">
            <GiftsTab />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
