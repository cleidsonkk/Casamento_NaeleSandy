import type { InsertGift } from "../drizzle/schema";

type DefaultGiftInput = Pick<InsertGift, "name" | "description" | "imageUrl" | "suggestedValue">;

export const DEFAULT_GIFTS: DefaultGiftInput[] = [
  {
    name: "Air fryer",
    description: "Para receitas praticas no dia a dia.",
    imageUrl: "https://picsum.photos/seed/air-fryer/1200/900",
    suggestedValue: "399.90",
  },
  {
    name: "Jogo de panelas",
    description: "Conjunto completo para a cozinha da casa nova.",
    imageUrl: "https://picsum.photos/seed/jogo-panelas/1200/900",
    suggestedValue: "549.90",
  },
  {
    name: "Jogo de pratos",
    description: "Servico de jantar para receber amigos e familia.",
    imageUrl: "https://picsum.photos/seed/jogo-pratos/1200/900",
    suggestedValue: "329.90",
  },
  {
    name: "Faqueiro",
    description: "Talheres para o dia a dia e ocasioes especiais.",
    imageUrl: "https://picsum.photos/seed/faqueiro/1200/900",
    suggestedValue: "259.90",
  },
  {
    name: "Liquidificador",
    description: "Aliado para sucos, molhos e receitas da semana.",
    imageUrl: "https://picsum.photos/seed/liquidificador/1200/900",
    suggestedValue: "219.90",
  },
  {
    name: "Cafeteira",
    description: "Cafe fresco para comecar o dia em grande estilo.",
    imageUrl: "https://picsum.photos/seed/cafeteira/1200/900",
    suggestedValue: "289.90",
  },
  {
    name: "Batedeira",
    description: "Para sobremesas e massas em momentos especiais.",
    imageUrl: "https://picsum.photos/seed/batedeira/1200/900",
    suggestedValue: "369.90",
  },
  {
    name: "Sanduicheira",
    description: "Praticidade para lanches rapidos e cafe da tarde.",
    imageUrl: "https://picsum.photos/seed/sanduicheira/1200/900",
    suggestedValue: "149.90",
  },
  {
    name: "Micro-ondas",
    description: "Essencial para aquecer e agilizar a rotina.",
    imageUrl: "https://picsum.photos/seed/microondas/1200/900",
    suggestedValue: "799.90",
  },
  {
    name: "Jogo de cama queen",
    description: "Conforto para noites tranquilas no novo lar.",
    imageUrl: "https://picsum.photos/seed/jogo-cama-queen/1200/900",
    suggestedValue: "279.90",
  },
  {
    name: "Toalhas de banho",
    description: "Kit de toalhas macias para o enxoval.",
    imageUrl: "https://picsum.photos/seed/toalhas-banho/1200/900",
    suggestedValue: "189.90",
  },
  {
    name: "Edredom casal",
    description: "Para deixar o quarto ainda mais aconchegante.",
    imageUrl: "https://picsum.photos/seed/edredom-casal/1200/900",
    suggestedValue: "319.90",
  },
  {
    name: "Aspirador de po",
    description: "Mais praticidade para manter tudo organizado.",
    imageUrl: "https://picsum.photos/seed/aspirador-po/1200/900",
    suggestedValue: "459.90",
  },
  {
    name: "Kit organizacao cozinha",
    description: "Potes e organizadores para uma cozinha funcional.",
    imageUrl: "https://picsum.photos/seed/organizacao-cozinha/1200/900",
    suggestedValue: "199.90",
  },
  {
    name: "Panela de pressao eletrica",
    description: "Rapidez para preparar refeicoes completas.",
    imageUrl: "https://picsum.photos/seed/panela-pressao-eletrica/1200/900",
    suggestedValue: "499.90",
  },
  {
    name: "Conjunto de frigideiras",
    description: "Kit antiaderente para receitas do dia a dia.",
    imageUrl: "https://picsum.photos/seed/frigideiras/1200/900",
    suggestedValue: "239.90",
  },
  {
    name: "Jogo de tacas",
    description: "Para brindar momentos especiais em casal.",
    imageUrl: "https://picsum.photos/seed/tacas/1200/900",
    suggestedValue: "169.90",
  },
  {
    name: "Cota lua de mel",
    description: "Contribuicao para experiencias inesqueciveis na viagem.",
    imageUrl: "https://picsum.photos/seed/lua-de-mel/1200/900",
    suggestedValue: "300.00",
  },
];
