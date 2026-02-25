import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type RSVPStatusFilter = 'all' | 'confirmed' | 'declined' | 'pending';

export default function GuestsTab() {
  const { data: guests = [], isLoading, refetch } = trpc.guest.list.useQuery();
  const { data: gifts = [] } = trpc.gift.list.useQuery();
  const { data: giftSelections = [] } = trpc.giftSelection.list.useQuery();
  const { data: payments = [] } = trpc.payment.list.useQuery();
  const deleteGuest = trpc.guest.delete.useMutation();

  const [filterStatus, setFilterStatus] = useState<RSVPStatusFilter>('all');
  const [filterGiftId, setFilterGiftId] = useState<number | 'all'>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);

  const giftMap = useMemo(() => new Map(gifts.map(g => [g.id, g])), [gifts]);
  const guestSelectionMap = useMemo(() => {
    const map = new Map<number, (typeof giftSelections)[number]>();
    for (const selection of giftSelections) {
      if (!map.has(selection.guestId)) {
        map.set(selection.guestId, selection);
      }
    }
    return map;
  }, [giftSelections]);

  const guestPaymentMap = useMemo(() => {
    const map = new Map<number, (typeof payments)[number]>();
    for (const payment of payments) {
      if (!map.has(payment.guestId)) {
        map.set(payment.guestId, payment);
      }
    }
    return map;
  }, [payments]);

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      if (filterStatus !== 'all' && guest.rsvpStatus !== filterStatus) return false;
      if (searchName.trim()) {
        const normalizedName = guest.name.toLowerCase();
        const normalizedSearch = searchName.trim().toLowerCase();
        if (!normalizedName.includes(normalizedSearch)) return false;
      }

      const selectedGift = guestSelectionMap.get(guest.id);
      if (filterGiftId !== 'all' && selectedGift?.giftId !== filterGiftId) return false;
      if (filterGiftId !== 'all' && !selectedGift) return false;

      const referenceDate = guest.confirmedAt ? new Date(guest.confirmedAt) : new Date(guest.createdAt);
      const dateStr = referenceDate.toISOString().slice(0, 10);
      if (filterDateFrom && dateStr < filterDateFrom) return false;
      if (filterDateTo && dateStr > filterDateTo) return false;

      return true;
    });
  }, [filterDateFrom, filterDateTo, filterGiftId, filterStatus, guestSelectionMap, guests, searchName]);

  const selectedGuest = useMemo(
    () => guests.find(guest => guest.id === selectedGuestId) ?? null,
    [guests, selectedGuestId],
  );

  const selectedGuestSelection = selectedGuest ? guestSelectionMap.get(selectedGuest.id) : null;
  const selectedGuestGift = selectedGuestSelection ? giftMap.get(selectedGuestSelection.giftId) : null;
  const selectedGuestPayment = selectedGuest ? guestPaymentMap.get(selectedGuest.id) : null;

  const handleDelete = async (guestId: number) => {
    if (!confirm('Tem certeza que deseja remover este convidado?')) return;

    try {
      await deleteGuest.mutateAsync({ guestId });
      toast.success('Convidado removido com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao remover convidado');
      console.error(error);
    }
  };

  const exportGuestsCsv = () => {
    if (filteredGuests.length === 0) {
      toast.error('Nao ha convidados para exportar');
      return;
    }

    const lines = [
      [
        'Nome',
        'WhatsApp',
        'Acompanhantes',
        'Status RSVP',
        'Data RSVP',
        'Presente',
        'Status Pagamento',
        'Restricoes Alimentares',
        'Mensagem',
      ].join(';'),
      ...filteredGuests.map(guest => {
        const giftSelection = guestSelectionMap.get(guest.id);
        const giftName = giftSelection ? giftMap.get(giftSelection.giftId)?.name ?? '' : '';
        const payment = guestPaymentMap.get(guest.id);
        const date = guest.confirmedAt ?? guest.createdAt;
        const formattedDate = new Date(date).toLocaleString('pt-BR');
        const row = [
          guest.name,
          guest.whatsapp,
          String(guest.companions),
          guest.rsvpStatus,
          formattedDate,
          giftName,
          payment?.status ?? '',
          guest.dietaryRestrictions ?? '',
          guest.message ?? '',
        ];
        return row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';');
      }),
    ];

    const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `convidados-rsvp-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso');
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
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Gerenciar Convidados</CardTitle>
          <Button onClick={exportGuestsCsv} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            placeholder="Buscar por nome"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as RSVPStatusFilter)}
            className="input-luxury h-10 rounded-md px-3"
          >
            <option value="all">Todos os status</option>
            <option value="confirmed">Confirmado</option>
            <option value="pending">Pendente</option>
            <option value="declined">Recusado</option>
          </select>
          <select
            value={String(filterGiftId)}
            onChange={e => setFilterGiftId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="input-luxury h-10 rounded-md px-3"
          >
            <option value="all">Todos os presentes</option>
            {gifts.map(gift => (
              <option key={gift.id} value={gift.id}>
                {gift.name}
              </option>
            ))}
          </select>
          <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={Boolean(selectedGuest)} onOpenChange={open => !open && setSelectedGuestId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do RSVP</DialogTitle>
            </DialogHeader>
            {selectedGuest ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="font-semibold">{selectedGuest.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">WhatsApp</p>
                  <p className="font-semibold">{selectedGuest.whatsapp}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Acompanhantes</p>
                  <p className="font-semibold">{selectedGuest.companions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status RSVP</p>
                  <p className="font-semibold">{selectedGuest.rsvpStatus}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data RSVP</p>
                  <p className="font-semibold">
                    {selectedGuest.confirmedAt
                      ? new Date(selectedGuest.confirmedAt).toLocaleString('pt-BR')
                      : new Date(selectedGuest.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Presente escolhido</p>
                  <p className="font-semibold">{selectedGuestGift?.name ?? 'Nao selecionado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status pagamento Pix</p>
                  <p className="font-semibold">{selectedGuestPayment?.status ?? 'Sem pagamento'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Restricoes alimentares</p>
                  <p className="font-semibold">{selectedGuest.dietaryRestrictions || 'Nenhuma'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Mensagem</p>
                  <p className="font-semibold">{selectedGuest.message || 'Sem mensagem'}</p>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum convidado encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Acompanhantes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Presente</TableHead>
                  <TableHead>Restricoes</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => {
                  const giftSelection = guestSelectionMap.get(guest.id);
                  const giftName = giftSelection ? giftMap.get(giftSelection.giftId)?.name ?? '-' : '-';
                  const hasRestrictions = Boolean(guest.dietaryRestrictions?.trim());
                  return (
                    <TableRow key={guest.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.whatsapp}</TableCell>
                      <TableCell className="text-center">{guest.companions}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            guest.rsvpStatus === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : guest.rsvpStatus === 'declined'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {guest.rsvpStatus === 'confirmed'
                            ? 'Confirmado'
                            : guest.rsvpStatus === 'declined'
                            ? 'Recusado'
                            : 'Pendente'}
                        </span>
                      </TableCell>
                      <TableCell>{giftName}</TableCell>
                      <TableCell>
                        <span className={hasRestrictions ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}>
                          {hasRestrictions ? 'Sim' : 'Nao'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {guest.confirmedAt
                          ? new Date(guest.confirmedAt).toLocaleDateString('pt-BR')
                          : new Date(guest.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedGuestId(guest.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(guest.id)}
                            disabled={deleteGuest.isPending}
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
