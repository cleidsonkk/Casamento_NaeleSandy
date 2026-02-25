import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function GiftsTab() {
  const { data: gifts = [], isLoading, refetch } = trpc.gift.list.useQuery();
  const { data: guests = [] } = trpc.guest.list.useQuery();
  const { data: giftSelections = [] } = trpc.giftSelection.list.useQuery();
  const deleteGift = trpc.gift.delete.useMutation();
  const createGift = trpc.gift.create.useMutation();
  const updateGift = trpc.gift.update.useMutation();

  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    suggestedValue: '',
  });
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    suggestedValue: '',
    status: 'available' as 'available' | 'reserved' | 'completed',
  });

  const guestMap = useMemo(() => new Map(guests.map(guest => [guest.id, guest])), [guests]);
  const selectionByGiftMap = useMemo(() => {
    const map = new Map<number, (typeof giftSelections)[number]>();
    for (const selection of giftSelections) {
      if (!map.has(selection.giftId)) {
        map.set(selection.giftId, selection);
      }
    }
    return map;
  }, [giftSelections]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.suggestedValue.trim()) {
      toast.error('Nome e valor sao obrigatorios');
      return;
    }

    try {
      await createGift.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        suggestedValue: formData.suggestedValue.trim(),
      });

      toast.success('Presente criado com sucesso');
      setFormData({ name: '', description: '', imageUrl: '', suggestedValue: '' });
      setShowDialog(false);
      refetch();
    } catch (error) {
      toast.error('Erro ao criar presente');
      console.error(error);
    }
  };

  const handleDelete = async (giftId: number) => {
    if (!confirm('Tem certeza que deseja remover este presente?')) return;

    try {
      await deleteGift.mutateAsync({ giftId });
      toast.success('Presente removido com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao remover presente');
      console.error(error);
    }
  };

  const startEdit = (gift: (typeof gifts)[number]) => {
    setEditingGiftId(gift.id);
    setEditData({
      name: gift.name,
      description: gift.description ?? '',
      imageUrl: gift.imageUrl ?? '',
      suggestedValue: Number(gift.suggestedValue).toFixed(2),
      status: gift.status as 'available' | 'reserved' | 'completed',
    });
    setShowEditDialog(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGiftId) return;
    if (!editData.name.trim() || !editData.suggestedValue.trim()) {
      toast.error('Nome e valor sao obrigatorios');
      return;
    }

    try {
      await updateGift.mutateAsync({
        giftId: editingGiftId,
        name: editData.name.trim(),
        description: editData.description.trim() || undefined,
        imageUrl: editData.imageUrl.trim() || undefined,
        suggestedValue: parseFloat(editData.suggestedValue),
        status: editData.status,
      });
      toast.success('Presente atualizado com sucesso');
      setShowEditDialog(false);
      setEditingGiftId(null);
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar presente');
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
    <Card className="card-luxury">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Presentes</CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="btn-luxury">
              <Plus className="w-4 h-4 mr-2" />
              Novo Presente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Presente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Jogo de Cama"
                />
              </div>
              <div>
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descricao do presente"
                  className="min-h-20"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="value">Valor Sugerido (R$) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.suggestedValue}
                  onChange={e => setFormData({ ...formData, suggestedValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 btn-luxury" disabled={createGift.isPending}>
                  {createGift.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Presente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descricao</Label>
                <Textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  className="min-h-20"
                />
              </div>
              <div>
                <Label htmlFor="edit-imageUrl">URL da Imagem</Label>
                <Input
                  id="edit-imageUrl"
                  value={editData.imageUrl}
                  onChange={e => setEditData({ ...editData, imageUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-value">Valor Sugerido (R$) *</Label>
                <Input
                  id="edit-value"
                  type="number"
                  step="0.01"
                  value={editData.suggestedValue}
                  onChange={e => setEditData({ ...editData, suggestedValue: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editData.status}
                  onChange={e =>
                    setEditData({ ...editData, status: e.target.value as 'available' | 'reserved' | 'completed' })
                  }
                  className="input-luxury h-11 w-full rounded-md px-3"
                >
                  <option value="available">Disponivel</option>
                  <option value="reserved">Reservado</option>
                  <option value="completed">Concluido</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 btn-luxury" disabled={updateGift.isPending}>
                  {updateGift.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {gifts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum presente cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reservado por</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gifts.map(gift => {
                  const selection = selectionByGiftMap.get(gift.id);
                  const guestName = selection ? guestMap.get(selection.guestId)?.name ?? `Convidado #${selection.guestId}` : '-';

                  return (
                    <TableRow key={gift.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{gift.name}</TableCell>
                      <TableCell>R$ {parseFloat(gift.suggestedValue.toString()).toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            gift.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : gift.status === 'reserved'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {gift.status === 'available'
                            ? 'Disponivel'
                            : gift.status === 'reserved'
                            ? 'Reservado'
                            : 'Concluido'}
                        </span>
                      </TableCell>
                      <TableCell>{guestName}</TableCell>
                      <TableCell>
                        <span className={gift.isActive ? 'text-green-600 font-semibold' : 'text-red-600'}>
                          {gift.isActive ? 'Sim' : 'Nao'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(gift)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(gift.id)}
                            disabled={deleteGift.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
