import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Users, Gift, CreditCard, Settings, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import GuestsTab from '@/components/admin/GuestsTab';
import GiftsTab from '@/components/admin/GiftsTab';
import PaymentsTab from '@/components/admin/PaymentsTab';
import SettingsTab from '@/components/admin/SettingsTab';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
          <Button onClick={() => setLocation('/')} className="btn-luxury">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
            <span className="text-sm text-muted-foreground">
              Bem-vindo, <span className="font-semibold text-foreground">{user.name}</span>
            </span>
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
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
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
