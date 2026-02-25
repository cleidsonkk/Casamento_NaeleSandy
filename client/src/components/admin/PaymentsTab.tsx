import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function PaymentsTab() {
  const { data: payments = [], isLoading, refetch } = trpc.payment.list.useQuery();
  const confirmPayment = trpc.payment.confirm.useMutation();
  const revertPayment = trpc.payment.confirm.useMutation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const filteredPayments = payments.filter(
    (p) => filterStatus === 'all' || p.status === filterStatus
  );

  const handleConfirm = async (paymentId: number) => {
    try {
      await confirmPayment.mutateAsync({
        paymentId,
        notes: notes,
      });
      toast.success('Pagamento confirmado com sucesso');
      setShowDialog(false);
      setNotes('');
      refetch();
    } catch (error) {
      toast.error('Erro ao confirmar pagamento');
      console.error(error);
    }
  };

  const handleRevert = async (paymentId: number) => {
    if (!confirm('Tem certeza que deseja reverter este pagamento?')) return;

    try {
      await revertPayment.mutateAsync({ paymentId });
      toast.success('Pagamento revertido com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao reverter pagamento');
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
        <div className="flex items-center justify-between">
          <CardTitle>Gerenciar Pagamentos</CardTitle>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="awaiting_payment">Aguardando Pagamento</SelectItem>
              <SelectItem value="payment_informed">Pagamento Informado</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pagamento encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                    <TableCell>R$ {parseFloat(payment.amount.toString()).toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          payment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'payment_informed'
                            ? 'bg-yellow-100 text-yellow-700'
                            : payment.status === 'awaiting_payment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.status === 'confirmed'
                          ? 'Confirmado'
                          : payment.status === 'payment_informed'
                          ? 'Informado'
                          : payment.status === 'awaiting_payment'
                          ? 'Aguardando'
                          : 'Cancelado'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {payment.status !== 'confirmed' && (
                        <Dialog open={showDialog && selectedPayment?.id === payment.id} onOpenChange={setShowDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmar Pagamento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-semibold">Observações Internas</label>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Ex: Comprovante recebido, confirmado no extrato..."
                                  className="min-h-20 mt-2"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowDialog(false)}
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => handleConfirm(payment.id)}
                                  className="flex-1 btn-luxury"
                                  disabled={confirmPayment.isPending}
                                >
                                  {confirmPayment.isPending ? 'Confirmando...' : 'Confirmar'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {payment.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevert(payment.id)}
                          disabled={revertPayment.isPending}
                        >
                          <RotateCcw className="w-4 h-4 text-yellow-600" />
                        </Button>
                      )}
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
