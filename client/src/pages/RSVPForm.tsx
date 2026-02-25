import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Heart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type FormErrors = {
  name?: string;
  whatsapp?: string;
  companions?: string;
};

export default function RSVPForm() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    companions: 0,
    message: '',
    dietaryRestrictions: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const createGuest = trpc.guest.create.useMutation();

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const phoneDigits = formData.whatsapp.replace(/\D/g, '');

    if (!formData.name.trim()) nextErrors.name = 'Informe seu nome completo';
    if (!phoneDigits) nextErrors.whatsapp = 'Informe seu WhatsApp';
    if (phoneDigits && phoneDigits.length < 10) nextErrors.whatsapp = 'Número incompleto';
    if (formData.companions < 0 || formData.companions > 10) {
      nextErrors.companions = 'Use um número entre 0 e 10';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Revise os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const guest = await createGuest.mutateAsync({
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        companions: parseInt(formData.companions.toString()) || 0,
        message: formData.message.trim() || undefined,
        dietaryRestrictions: formData.dietaryRestrictions.trim() || undefined,
      });

      if (guest) {
        toast.success('Presença confirmada com sucesso');
        localStorage.setItem('guestId', guest.id.toString());
      }
      setTimeout(() => {
        setLocation('/gifts');
      }, 1500);
    } catch (error) {
      toast.error('Erro ao confirmar presença. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12 px-4">
      <div className="container max-w-2xl mb-12">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-accent" fill="currentColor" />
            <span className="text-sm font-medium text-accent tracking-widest">CONFIRME SUA PRESENÇA</span>
            <Heart className="w-6 h-6 text-accent" fill="currentColor" />
          </div>

          <h1 className="heading-luxury text-foreground">Que alegria ter você conosco!</h1>

          <p className="text-lg text-muted-foreground">
            Preencha os dados abaixo para confirmar sua presença em nosso grande dia.
          </p>
        </div>
      </div>

      <div className="container max-w-2xl">
        <div className="card-luxury animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">
                Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-foreground font-semibold">
                WhatsApp *
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => {
                  setFormData({ ...formData, whatsapp: formatWhatsapp(e.target.value) });
                  if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: undefined }));
                }}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              {errors.whatsapp ? (
                <p className="text-sm text-destructive">{errors.whatsapp}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Digite DDD + número</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companions" className="text-foreground font-semibold">
                Número de Acompanhantes
              </Label>
              <Input
                id="companions"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={formData.companions}
                onChange={(e) => {
                  const next = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, companions: next });
                  if (errors.companions) setErrors((prev) => ({ ...prev, companions: undefined }));
                }}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
              />
              {errors.companions ? <p className="text-sm text-destructive">{errors.companions}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary" className="text-foreground font-semibold">
                Restrições Alimentares
              </Label>
              <Textarea
                id="dietary"
                placeholder="Ex: Vegetariano, alergia a frutos do mar, etc."
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground font-semibold">
                Mensagem Especial
              </Label>
              <Textarea
                id="message"
                placeholder="Deixe uma mensagem especial para nós..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/')}
                className="flex-1 border-2 border-accent text-accent hover:bg-accent/10"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 btn-luxury" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar Presença'
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 card-luxury bg-accent/5 border-accent/20 animate-fade-in-up stagger-1">
          <p className="text-sm text-muted-foreground">
            Após confirmar sua presença, você poderá escolher um presente especial para contribuir
            com nosso grande dia.
          </p>
        </div>
      </div>
    </div>
  );
}
