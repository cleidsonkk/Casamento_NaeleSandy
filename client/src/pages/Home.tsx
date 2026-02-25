import { useEffect, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ChevronDown, Gift, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const DEFAULT_COUPLE_NAMES = 'Amonael & Sandriellyy';
const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&h=1400&fit=crop';

type FormErrors = {
  name?: string;
  whatsapp?: string;
  companions?: string;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type GiftType = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  suggestedValue: string;
  status: string;
};

function toCountdown(targetDate: Date): Countdown {
  const now = Date.now();
  const target = targetDate.getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function Home() {
  const { data: event, isLoading: eventLoading } = trpc.event.get.useQuery();
  const { data: gifts = [], isLoading: giftsLoading } = trpc.gift.list.useQuery();
  const createGuest = trpc.guest.create.useMutation();
  const createGiftSelection = trpc.giftSelection.create.useMutation();
  const createPayment = trpc.payment.create.useMutation();
  const markPaymentAsInformed = trpc.payment.markAsInformed.useMutation();

  const [navScrolled, setNavScrolled] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [guestId, setGuestId] = useState<number | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    companions: 0,
    message: '',
    dietaryRestrictions: '',
  });
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(Number(storedGuestId));
    }
  }, []);

  useEffect(() => {
    if (!event?.eventDate) return;

    const target = new Date(event.eventDate);
    const tick = () => setCountdown(toCountdown(target));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [event?.eventDate]);

  const formattedDate = useMemo(() => {
    if (!event?.eventDate) return '';
    const eventDate = new Date(event.eventDate);
    return eventDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [event?.eventDate]);

  const coupleNames =
    event?.title?.trim() && event.title !== 'Nosso Grande Dia' ? event.title : DEFAULT_COUPLE_NAMES;

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    const phoneDigits = formData.whatsapp.replace(/\D/g, '');

    if (!formData.name.trim()) errors.name = 'Informe seu nome completo';
    if (!phoneDigits) errors.whatsapp = 'Informe seu WhatsApp';
    if (phoneDigits && phoneDigits.length < 10) errors.whatsapp = 'Numero incompleto';
    if (formData.companions < 0 || formData.companions > 10) {
      errors.companions = 'Use um numero entre 0 e 10';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Revise os campos obrigatorios');
      return;
    }

    try {
      const guest = await createGuest.mutateAsync({
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        companions: parseInt(formData.companions.toString()) || 0,
        message: formData.message.trim() || undefined,
        dietaryRestrictions: formData.dietaryRestrictions.trim() || undefined,
      });

      if (guest) {
        setGuestId(guest.id);
        localStorage.setItem('guestId', String(guest.id));
        toast.success('Presenca confirmada. Agora escolha um presente');
        document.getElementById('presentes')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      toast.error('Erro ao confirmar presenca. Tente novamente.');
      console.error(error);
    }
  };

  const handleGiftSelect = async (gift: GiftType) => {
    if (!guestId) {
      toast.error('Confirme o RSVP antes de selecionar um presente');
      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
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
    } catch (error) {
      toast.error('Erro ao selecionar presente. Tente novamente.');
      console.error(error);
    }
  };

  const handlePixConfirmed = async () => {
    if (!selectedPaymentId) return;
    try {
      await markPaymentAsInformed.mutateAsync({
        paymentId: selectedPaymentId,
      });
      toast.success('Pagamento registrado com sucesso');
      setShowPixModal(false);
    } catch (error) {
      toast.error('Erro ao registrar pagamento');
      console.error(error);
    }
  };

  const handleCopyPixKey = async (pixKey: string) => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success('Chave Pix copiada');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Evento nao encontrado</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <nav className={`fixed top-0 left-0 right-0 z-50 ${navScrolled ? 'navbar-blur scrolled' : 'navbar-blur'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-sm font-bold text-accent">A&S</span>
            </div>
            <h1 className="text-lg font-playfair font-bold text-foreground">{coupleNames}</h1>
          </div>
          <div className="flex gap-6">
            <a href="#rsvp" className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors">
              RSVP
            </a>
            <a href="#presentes" className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors">
              Presentes
            </a>
          </div>
        </div>
      </nav>

      <section className="hero-full bg-black">
        <div
          className="hero-background"
          style={{
            backgroundImage: `url('${DEFAULT_HERO_IMAGE}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            transform: 'scale(1.02)',
          }}
        />

        <div
          className="hero-overlay"
          style={{
            background:
              'linear-gradient(145deg, rgba(30, 24, 18, 0.68) 0%, rgba(212, 175, 55, 0.12) 48%, rgba(8, 8, 8, 0.72) 100%)',
          }}
        />
        <div className="hero-grain" />

        <div className="hero-content space-y-8 animate-fade-in-up">
          <div className="space-y-5">
            <p className="text-accent text-sm font-semibold tracking-widest uppercase">Nosso Grande Dia</p>
            <h1 className="text-6xl md:text-8xl font-playfair font-bold text-white text-shadow-lg">{coupleNames}</h1>
            <div className="hero-date-line">
              <span>{formattedDate}</span>
              {event.eventTime ? <span className="mx-2">•</span> : null}
              {event.eventTime ? <span>{event.eventTime}</span> : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-5">
            <button onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })} className="btn-luxury">
              Confirmar Presenca
            </button>
            <button onClick={() => document.getElementById('presentes')?.scrollIntoView({ behavior: 'smooth' })} className="btn-luxury-outline">
              Ver Lista de Presentes
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>
      </section>

      <section className="section-alternate-1 py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-luxury text-center">
            <div className="text-4xl text-accent mb-4">◌</div>
            <h3 className="text-2xl font-playfair mb-3">Uma Celebracao</h3>
            <p className="text-muted-foreground">
              Celebramos o amor, a uniao e a alegria de compartilhar este momento com voces.
            </p>
          </div>
          <div className="card-luxury text-center">
            <div className="text-4xl text-accent mb-4">◍</div>
            <h3 className="text-2xl font-playfair mb-3">Presentes</h3>
            <p className="text-muted-foreground">
              Escolha um presente simbolico para contribuir com nosso novo comeco.
            </p>
          </div>
          <div className="card-luxury text-center">
            <div className="text-4xl text-accent mb-4">✦</div>
            <h3 className="text-2xl font-playfair mb-3">Elegancia</h3>
            <p className="text-muted-foreground">
              Uma experiencia digital moderna, delicada e feita para ser inesquecivel.
            </p>
          </div>
        </div>
      </section>

      <section id="rsvp" className="section-alternate-3 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-5xl font-playfair mb-4">Confirme Sua Presenca</h2>
          <p className="text-lg text-muted-foreground">
            Preencha seus dados para confirmar e liberar a escolha de presentes.
          </p>
        </div>

        <div className="max-w-3xl mx-auto card-luxury p-8 md:p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className="input-luxury h-11"
                disabled={createGuest.isPending}
              />
              {formErrors.name ? <p className="text-sm text-destructive">{formErrors.name}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="whatsapp">Telefone (WhatsApp)</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => {
                  setFormData({ ...formData, whatsapp: formatWhatsapp(e.target.value) });
                  if (formErrors.whatsapp) setFormErrors((prev) => ({ ...prev, whatsapp: undefined }));
                }}
                className="input-luxury h-11"
                disabled={createGuest.isPending}
              />
              {formErrors.whatsapp ? (
                <p className="text-sm text-destructive">{formErrors.whatsapp}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Digite DDD + numero</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="companions">Acompanhantes</Label>
              <Input
                id="companions"
                type="number"
                min="0"
                max="10"
                value={formData.companions}
                onChange={(e) => {
                  const next = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, companions: next });
                  if (formErrors.companions) setFormErrors((prev) => ({ ...prev, companions: undefined }));
                }}
                className="input-luxury h-11"
                disabled={createGuest.isPending}
              />
              {formErrors.companions ? <p className="text-sm text-destructive">{formErrors.companions}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="dietary">Restricoes alimentares (opcional)</Label>
              <Input
                id="dietary"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className="input-luxury h-11"
                disabled={createGuest.isPending}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="message">Mensagem (opcional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-luxury min-h-24 resize-none"
                disabled={createGuest.isPending}
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="w-full btn-luxury h-12 text-base" disabled={createGuest.isPending}>
                {createGuest.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar Presenca'
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="section-alternate-2 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-playfair mb-6">Contagem Regressiva</h3>
          <div className="countdown-panel">
            <div>
              <strong>{countdown.days}</strong>
              <span>Dias</span>
            </div>
            <div>
              <strong>{countdown.hours}</strong>
              <span>Horas</span>
            </div>
            <div>
              <strong>{countdown.minutes}</strong>
              <span>Minutos</span>
            </div>
            <div>
              <strong>{countdown.seconds}</strong>
              <span>Segundos</span>
            </div>
          </div>
        </div>
      </section>

      <section id="presentes" className="section-alternate-3 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h2 className="text-5xl font-playfair mb-4">Lista de Presentes</h2>
          <p className="text-lg text-muted-foreground">Escolha um presente e contribua de forma simbolica.</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {giftsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-accent" />
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-16">
              <Gift className="w-14 h-14 text-accent/40 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum presente disponivel no momento.</p>
            </div>
          ) : (
            <div className="gift-grid">
              {gifts.map((gift) => (
                <article key={gift.id} className="gift-card">
                  {gift.imageUrl ? (
                    <div className="gift-image-wrap">
                      <img src={gift.imageUrl} alt={gift.name} className="gift-image" />
                      {gift.status !== 'available' ? <span className="gift-chip">Indisponivel</span> : null}
                    </div>
                  ) : null}

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-3xl font-playfair mb-2 leading-tight">{gift.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">
                      {gift.description || 'Contribuicao simbolica para nosso novo lar.'}
                    </p>
                    <p className="text-3xl font-playfair text-accent mb-4">
                      R$ {Number(gift.suggestedValue).toFixed(2)}
                    </p>
                    <Button
                      onClick={() => handleGiftSelect(gift as GiftType)}
                      disabled={gift.status !== 'available' || createGiftSelection.isPending}
                      className="btn-luxury w-full"
                    >
                      {gift.status === 'available' ? 'Presentear via Pix' : 'Indisponivel'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-alternate-2 py-14 px-4 border-t border-accent/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">Obrigado por fazer parte do nosso grande dia.</p>
        </div>
      </section>

      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-playfair">Pagamento via Pix</DialogTitle>
          </DialogHeader>
          {selectedGift && event && (
            <div className="space-y-5 py-4">
              <div className="text-center">
                <h4 className="font-playfair text-2xl">{selectedGift.name}</h4>
                <p className="text-3xl text-accent font-playfair mt-1">
                  R$ {Number(selectedGift.suggestedValue).toFixed(2)}
                </p>
              </div>

              {event.pixKey ? (
                <div className="pix-panel">
                  <QRCode
                    value={`00020126580014br.gov.bcb.pix0136${event.pixKey}52040000530398654061${Number(selectedGift.suggestedValue).toFixed(2)}5802BR5913${event.receiverName || 'Noivo e Noiva'}6009SAO PAULO62410503***63041D3D`}
                    size={210}
                    includeMargin
                    level="H"
                  />
                </div>
              ) : null}

              {event.pixKey ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Copie a chave Pix:</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={event.pixKey}
                      className="flex-1 px-3 py-2 rounded-lg border border-accent/30 bg-accent/5 text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={() => handleCopyPixKey(event.pixKey)}>
                      {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-3">
                <Button className="flex-1" variant="outline" onClick={() => setShowPixModal(false)}>
                  Fechar
                </Button>
                <Button className="flex-1 btn-luxury" onClick={handlePixConfirmed} disabled={markPaymentAsInformed.isPending}>
                  {markPaymentAsInformed.isPending ? 'Registrando...' : 'Ja realizei o pagamento'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
