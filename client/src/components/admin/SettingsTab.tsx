import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsTab() {
  const { data: event, isLoading, refetch } = trpc.event.get.useQuery();
  const updateEvent = trpc.event.update.useMutation();
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    eventDate: event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
    eventTime: event?.eventTime || '',
    location: event?.location || '',
    pixKey: event?.pixKey || '',
        pixKeyType: (event?.pixKeyType || 'celular') as 'celular' | 'email' | 'cpf' | 'aleatoria',
    receiverName: event?.receiverName || '',
    whatsappContact: event?.whatsappContact || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pixKey.trim() || !formData.receiverName.trim()) {
      toast.error('Chave Pix e Nome do Recebedor são obrigatórios');
      return;
    }

    try {
      await updateEvent.mutateAsync({
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
        eventDate: formData.eventDate ? new Date(formData.eventDate) : undefined,
        eventTime: formData.eventTime.trim() || undefined,
        location: formData.location.trim() || undefined,
        pixKey: formData.pixKey.trim(),
        pixKeyType: formData.pixKeyType as any,
        receiverName: formData.receiverName.trim(),
        whatsappContact: formData.whatsappContact.trim() || undefined,
      });

      toast.success('Configurações atualizadas com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Info */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título do Evento</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Casamento de João e Maria"
                />
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Salão de Festas XYZ"
                />
              </div>

              <div>
                <Label htmlFor="eventDate">Data do Evento</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="eventTime">Horário</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do evento"
                className="min-h-24"
              />
            </div>

            <Button type="submit" className="btn-luxury" disabled={updateEvent.isPending}>
              {updateEvent.isPending ? 'Salvando...' : 'Salvar Informações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pix Configuration */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>Configuração Pix</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pixKeyType">Tipo de Chave Pix</Label>
                <Select value={formData.pixKeyType} onValueChange={(value) => setFormData({ ...formData, pixKeyType: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celular">Celular</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="aleatoria">Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pixKey">Chave Pix *</Label>
                <Input
                  id="pixKey"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  placeholder="Sua chave Pix"
                />
              </div>

              <div>
                <Label htmlFor="receiverName">Nome do Recebedor *</Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp para Comprovante</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsappContact}
                  onChange={(e) => setFormData({ ...formData, whatsappContact: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <Button type="submit" className="btn-luxury" disabled={updateEvent.isPending}>
              {updateEvent.isPending ? 'Salvando...' : 'Salvar Configuração Pix'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
