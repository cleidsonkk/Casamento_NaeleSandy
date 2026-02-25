import type { InsertGift } from "../drizzle/schema";

type DefaultGiftInput = Pick<InsertGift, "name" | "description" | "imageUrl" | "suggestedValue">;

export const DEFAULT_GIFTS: DefaultGiftInput[] = [
  {
    name: "Air fryer",
    description: "Para receitas práticas no dia a dia.",
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
    description: "Serviço de jantar para receber amigos e família.",
    imageUrl: "https://source.unsplash.com/1200x900/?dinnerware,plates",
    suggestedValue: "329.90",
  },
  {
    name: "Faqueiro",
    description: "Talheres para o dia a dia e ocasiões especiais.",
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
    description: "Café fresco para começar o dia em grande estilo.",
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
    description: "Praticidade para lanches rápidos e café da tarde.",
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
    description: "Rapidez para preparar refeições completas.",
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
    description: "Contribuição para experiências inesquecíveis na viagem.",
    imageUrl: "https://source.unsplash.com/1200x900/?honeymoon,travel,beach",
    suggestedValue: "300.00",
  },
  {
    name: "Forno elétrico",
    description: "Ideal para assados e receitas especiais.",
    imageUrl: "https://source.unsplash.com/1200x900/?electric-oven,kitchen",
    suggestedValue: "699.90",
  },
  {
    name: "Aparelho de jantar 30 peças",
    description: "Conjunto elegante para receber a família.",
    imageUrl: "https://source.unsplash.com/1200x900/?dinner-set,tableware",
    suggestedValue: "459.90",
  },
  {
    name: "Jogo de travesseiros premium",
    description: "Mais conforto e qualidade para as noites do casal.",
    imageUrl: "https://source.unsplash.com/1200x900/?pillows,bedroom",
    suggestedValue: "249.90",
  },
  {
    name: "Purificador de água",
    description: "Praticidade e saúde para o dia a dia.",
    imageUrl: "https://source.unsplash.com/1200x900/?water-purifier,kitchen",
    suggestedValue: "389.90",
  },
  {
    name: "Smart TV 50 polegadas",
    description: "Para momentos de lazer no novo lar.",
    imageUrl: "https://source.unsplash.com/1200x900/?smart-tv,living-room",
    suggestedValue: "2299.90",
  },
  {
    name: "Máquina de lavar",
    description: "Ajuda essencial para a rotina da casa.",
    imageUrl: "https://source.unsplash.com/1200x900/?washing-machine,laundry",
    suggestedValue: "1999.90",
  },
  {
    name: "Sofá 3 lugares",
    description: "Conforto para receber amigos e família.",
    imageUrl: "https://source.unsplash.com/1200x900/?sofa,living-room",
    suggestedValue: "2499.90",
  },
  {
    name: "Conjunto de malas",
    description: "Perfeito para viagens e lua de mel.",
    imageUrl: "https://source.unsplash.com/1200x900/?luggage,travel",
    suggestedValue: "899.90",
  },
  {
    name: "Robô aspirador",
    description: "Tecnologia e praticidade para limpeza diária.",
    imageUrl: "https://source.unsplash.com/1200x900/?robot-vacuum,home",
    suggestedValue: "1199.90",
  },
  {
    name: "Churrasqueira elétrica",
    description: "Para encontros e celebrações em casa.",
    imageUrl: "https://source.unsplash.com/1200x900/?electric-grill,barbecue",
    suggestedValue: "529.90",
  },
];
