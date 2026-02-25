import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Gift, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { getGiftImageSrc, getGiftPlaceholderDataUrl } from '@/lib/giftPlaceholder';

export default function GiftsList() {
  const [, setLocation] = useLocation();
  const { data: gifts = [], isLoading } = trpc.gift.list.useQuery();
  const { data: event } = trpc.event.get.useQuery();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const createGiftSelection = trpc.giftSelection.create.useMutation();
  const createPayment = trpc.payment.create.useMutation();
  const markPaymentAsInformed = trpc.payment.markAsInformed.useMutation();

  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(parseInt(storedGuestId, 10));
    }
  }, []);

  const handleGiftSelect = async (gift: any) => {
    if (!guestId) {
      toast.error('Erro: convidado não identificado. Volte e confirme seu RSVP.');
      return;
    }

    try {
      await createGiftSelection.mutateAsync({
        giftId: gift.id,
        guestId,
      });

      const payment = await createPayment.mutateAsync({
        guestId,
        giftSelectionId: gift.id,
        amount: gift.suggestedValue.toString(),
      });

      if (payment) {
        setSelectedGift(gift);
        setSelectedPaymentId(payment.id);
        setShowPixModal(true);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao selecionar presente. Tente novamente.');
    }
  };

  const handlePixConfirmed = async () => {
    if (!selectedPaymentId) return;

    try {
      await markPaymentAsInformed.mutateAsync({
        paymentId: selectedPaymentId,
      });
      toast.success('Pagamento registrado com sucesso!');
      setShowPixModal(false);
      setTimeout(() => setLocation('/'), 2000);
    } catch (error) {
      toast.error('Erro ao registrar pagamento');
      console.error(error);
    }
  };

  const handleCopyPixKey = async (pixKey: string) => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success('Chave Pix copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5 py-16 px-4">
      <div className="max-w-6xl mx-auto mb-16">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-accent/70 hover:text-accent transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent" />
            <span className="text-xs font-semibold text-accent tracking-[0.2em] uppercase">
              Escolha seu Presente
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent" />
          </div>

          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-foreground">
            Lista de Presentes
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha um presente especial para nos ajudar a celebrar este momento único.
            Cada presente é uma forma de compartilhar da nossa alegria.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {gifts.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-accent/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum presente disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gifts.map(gift => (
              <div
                key={gift.id}
                className="group card-luxury overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-accent/5">
                  <img
                    src={getGiftImageSrc(gift.imageUrl, gift.name)}
                    alt={gift.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget;
                      target.onerror = null;
                      target.src = getGiftPlaceholderDataUrl(gift.name);
                    }}
                  />
                  {gift.status === 'reserved' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">Reservado</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-playfair font-bold text-foreground mb-2">
                    {gift.name}
                  </h3>

                  {gift.description && (
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {gift.description}
                    </p>
                  )}

                  <div className="flex items-end justify-between pt-4 border-t border-accent/10">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Valor sugerido</p>
                      <p className="text-2xl font-bold text-accent">
                        R$ {parseFloat(gift.suggestedValue.toString()).toFixed(2)}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleGiftSelect(gift)}
                      disabled={gift.status !== 'available' || createGiftSelection.isPending}
                      className={`btn-luxury ${
                        gift.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {gift.status === 'available' ? 'Selecionar' : 'Indisponível'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-playfair">
              Confirmar Pagamento
            </DialogTitle>
          </DialogHeader>

          {selectedGift && event && (
            <div className="space-y-6 py-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{selectedGift.name}</h3>
                <p className="text-3xl font-bold text-accent">
                  R$ {parseFloat(selectedGift.suggestedValue.toString()).toFixed(2)}
                </p>
              </div>

              {event.pixKey && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <QRCode
                      value={`00020126580014br.gov.bcb.pix0136${event.pixKey}52040000530398654061${parseFloat(selectedGift.suggestedValue.toString()).toFixed(2)}5802BR5913${event.receiverName}6009SAO PAULO62410503***63041D3D`}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>
              )}

              {event.pixKey && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Ou copie a chave Pix:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={event.pixKey}
                      readOnly
                      className="flex-1 px-4 py-3 bg-accent/5 border border-accent/20 rounded-lg text-sm font-mono text-foreground"
                    />
                    <Button
                      onClick={() => handleCopyPixKey(event.pixKey)}
                      variant="outline"
                      size="icon"
                      className="border-accent/20 hover:bg-accent/10"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {event.receiverName && (
                <div className="bg-accent/5 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Recebedor</p>
                  <p className="font-semibold text-foreground">{event.receiverName}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowPixModal(false)}
                  variant="outline"
                  className="flex-1 border-accent/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePixConfirmed}
                  className="flex-1 btn-luxury"
                  disabled={markPaymentAsInformed.isPending}
                >
                  {markPaymentAsInformed.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Já fiz o Pix'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
