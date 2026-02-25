import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function GuestsTab() {
  const { data: guests = [], isLoading, refetch } = trpc.guest.list.useQuery();
  const deleteGuest = trpc.guest.delete.useMutation();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle>Gerenciar Convidados</CardTitle>
      </CardHeader>
      <CardContent>
        {guests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum convidado confirmado ainda.
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
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
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
                    <TableCell className="text-sm text-muted-foreground">
                      {guest.confirmedAt
                        ? new Date(guest.confirmedAt).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info('Edição em desenvolvimento')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(guest.id)}
                        disabled={deleteGuest.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
