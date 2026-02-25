import type { InsertGift } from "../drizzle/schema";

type DefaultGiftInput = Pick<InsertGift, "name" | "description" | "imageUrl" | "suggestedValue">;

export const DEFAULT_GIFTS: DefaultGiftInput[] = [
  {
    name: "Air fryer",
    description: "Para receitas praticas no dia a dia.",
    imageUrl: "https://source.unsplash.com/1200x900/?airfryer,kitchen",
    suggestedValue: "399.90",
  },
  {
    name: "Jogo de panelas",
    description: "Conjunto completo para a cozinha da casa nova.",
    imageUrl: "https://source.unsplash.com/1200x900/?cookware,pots",
    suggestedValue: "549.90",
  },
  {
    name: "Jogo de pratos",
    description: "Servico de jantar para receber amigos e familia.",
    imageUrl: "https://source.unsplash.com/1200x900/?dinnerware,plates",
    suggestedValue: "329.90",
  },
  {
    name: "Faqueiro",
    description: "Talheres para o dia a dia e ocasioes especiais.",
    imageUrl: "https://source.unsplash.com/1200x900/?cutlery,silverware",
    suggestedValue: "259.90",
  },
  {
    name: "Liquidificador",
    description: "Aliado para sucos, molhos e receitas da semana.",
    imageUrl: "https://source.unsplash.com/1200x900/?blender,kitchen",
    suggestedValue: "219.90",
  },
  {
    name: "Cafeteira",
    description: "Cafe fresco para comecar o dia em grande estilo.",
    imageUrl: "https://source.unsplash.com/1200x900/?coffee-maker,coffee",
    suggestedValue: "289.90",
  },
  {
    name: "Batedeira",
    description: "Para sobremesas e massas em momentos especiais.",
    imageUrl: "https://source.unsplash.com/1200x900/?stand-mixer,baking",
    suggestedValue: "369.90",
  },
  {
    name: "Sanduicheira",
    description: "Praticidade para lanches rapidos e cafe da tarde.",
    imageUrl: "https://source.unsplash.com/1200x900/?sandwich-maker,toast",
    suggestedValue: "149.90",
  },
  {
    name: "Micro-ondas",
    description: "Essencial para aquecer e agilizar a rotina.",
    imageUrl: "https://source.unsplash.com/1200x900/?microwave,kitchen",
    suggestedValue: "799.90",
  },
  {
    name: "Jogo de cama queen",
    description: "Conforto para noites tranquilas no novo lar.",
    imageUrl: "https://source.unsplash.com/1200x900/?bed-linen,bedroom",
    suggestedValue: "279.90",
  },
  {
    name: "Toalhas de banho",
    description: "Kit de toalhas macias para o enxoval.",
    imageUrl: "https://source.unsplash.com/1200x900/?bath-towels,bathroom",
    suggestedValue: "189.90",
  },
  {
    name: "Edredom casal",
    description: "Para deixar o quarto ainda mais aconchegante.",
    imageUrl: "https://source.unsplash.com/1200x900/?duvet,bed",
    suggestedValue: "319.90",
  },
  {
    name: "Aspirador de po",
    description: "Mais praticidade para manter tudo organizado.",
    imageUrl: "https://source.unsplash.com/1200x900/?vacuum-cleaner,home",
    suggestedValue: "459.90",
  },
  {
    name: "Kit organizacao cozinha",
    description: "Potes e organizadores para uma cozinha funcional.",
    imageUrl: "https://source.unsplash.com/1200x900/?kitchen-organization,containers",
    suggestedValue: "199.90",
  },
  {
    name: "Panela de pressao eletrica",
    description: "Rapidez para preparar refeicoes completas.",
    imageUrl: "https://source.unsplash.com/1200x900/?pressure-cooker,kitchen",
    suggestedValue: "499.90",
  },
  {
    name: "Conjunto de frigideiras",
    description: "Kit antiaderente para receitas do dia a dia.",
    imageUrl: "https://source.unsplash.com/1200x900/?frying-pan,cookware",
    suggestedValue: "239.90",
  },
  {
    name: "Jogo de tacas",
    description: "Para brindar momentos especiais em casal.",
    imageUrl: "https://source.unsplash.com/1200x900/?wine-glasses,table",
    suggestedValue: "169.90",
  },
  {
    name: "Cota lua de mel",
    description: "Contribuicao para experiencias inesqueciveis na viagem.",
    imageUrl: "https://source.unsplash.com/1200x900/?honeymoon,travel,beach",
    suggestedValue: "300.00",
  },
];
