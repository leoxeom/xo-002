import { StaticImageData } from "next/image";

// Types pour les données mockées
export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  popularity: number; // 1-10
  weatherInfo: string;
  bestTimeToVisit: string[];
  tags: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface GolfCourse {
  id: string;
  name: string;
  destinationId: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  holeCount: number;
  par: number;
  length: number; // en mètres
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = facile, 5 = très difficile
  designer: string;
  yearBuilt: number;
  greenFee: number; // en euros
  buggyFee: number; // en euros
  facilities: string[];
  signatureHole: {
    number: number;
    description: string;
    imageUrl: string;
    hasARPreview: boolean;
  };
  rating: number; // 1-5
  reviews: number;
  tags: string[];
}

export interface Hotel {
  id: string;
  name: string;
  destinationId: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  category: 1 | 2 | 3 | 4 | 5; // étoiles
  pricePerNight: number; // en euros
  address: string;
  amenities: string[];
  distanceToNearestCourse: number; // en km
  roomTypes: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    pricePerNight: number;
    imageUrl: string;
  }[];
  rating: number; // 1-5
  reviews: number;
  tags: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  comment: string;
  rating: number; // 1-5
  packageId?: string; // ID du forfait concerné par le témoignage
  verified: boolean;
  date: string;
}

export interface TravelPackage {
  id: string;
  title: string;
  destinationId: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  duration: number; // en jours
  included: string[];
  notIncluded: string[];
  price: number; // prix par personne en euros
  priceDetails: {
    accommodation: number;
    greenFees: number;
    transport: number;
    extras: number;
  };
  discount?: {
    percentage: number;
    endDate: string;
  };
  golfCourses: string[]; // IDs des parcours inclus
  hotel: string; // ID de l'hôtel
  startDates: string[]; // Dates de départ disponibles
  maxGroupSize: number;
  minGroupSize: number;
  rating: number; // 1-5
  reviews: number;
  featured: boolean;
  badges: string[];
  tags: string[];
  sellerId: string; // ID du vendeur (tour-opérateur)
}

export interface Seller {
  id: string;
  name: string;
  logo: string;
  description: string;
  verified: boolean;
  rating: number; // 1-5
  reviews: number;
  memberSince: string;
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
  specialties: string[];
}

// Données mockées

// Destinations
export const mockDestinations: Destination[] = [
  {
    id: "dest-001",
    name: "Algarve",
    country: "Portugal",
    region: "Sud",
    description: "L'Algarve est la destination golf par excellence en Europe. Avec plus de 300 jours de soleil par an, des parcours de renommée mondiale et une hospitalité chaleureuse, cette région du Portugal offre une expérience golfique incomparable. Les falaises spectaculaires surplombant l'océan Atlantique créent un cadre à couper le souffle pour certains des plus beaux trous de golf d'Europe.",
    shortDescription: "La Mecque du golf européen avec des parcours spectaculaires en bord de mer",
    imageUrl: "https://images.unsplash.com/photo-1600166898405-da9535204843?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    popularity: 9,
    weatherInfo: "Climat méditerranéen avec des étés chauds et des hivers doux",
    bestTimeToVisit: ["Mars", "Avril", "Mai", "Septembre", "Octobre", "Novembre"],
    tags: ["Bord de mer", "Luxe", "Famille", "Gastronomie"],
    coordinates: {
      latitude: 37.0179,
      longitude: -8.0179
    }
  },
  {
    id: "dest-002",
    name: "Costa del Sol",
    country: "Espagne",
    region: "Andalousie",
    description: "La Costa del Sol, surnommée la 'Costa del Golf', abrite plus de 70 parcours de golf sur 150 km de côte méditerranéenne. Cette concentration exceptionnelle, combinée à un climat idéal toute l'année, en fait l'une des destinations golfiques les plus prisées d'Europe. Des parcours conçus par des légendes comme Severiano Ballesteros offrent des défis techniques dans un cadre somptueux.",
    shortDescription: "La plus grande concentration de parcours de golf en Europe dans un cadre méditerranéen",
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    popularity: 8,
    weatherInfo: "Climat méditerranéen avec plus de 320 jours de soleil par an",
    bestTimeToVisit: ["Février", "Mars", "Avril", "Mai", "Octobre", "Novembre"],
    tags: ["Nightlife", "Luxe", "Shopping", "Plage"],
    coordinates: {
      latitude: 36.5298,
      longitude: -4.8829
    }
  },
  {
    id: "dest-003",
    name: "St Andrews",
    country: "Écosse",
    region: "Fife",
    description: "St Andrews est le berceau du golf mondial. Son Old Course, vieux de plus de 600 ans, est un pèlerinage obligatoire pour tout golfeur passionné. La ville médiévale, imprégnée d'histoire et de tradition golfique, offre une expérience authentique unique. Jouer à St Andrews, c'est marcher dans les pas des plus grandes légendes du golf et vivre l'essence même de ce sport.",
    shortDescription: "Le berceau historique du golf avec le légendaire Old Course",
    imageUrl: "https://images.unsplash.com/photo-1592919505780-303950717480?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    popularity: 10,
    weatherInfo: "Climat océanique tempéré, souvent venteux et changeant",
    bestTimeToVisit: ["Mai", "Juin", "Juillet", "Août", "Septembre"],
    tags: ["Historique", "Prestige", "Tradition", "Links"],
    coordinates: {
      latitude: 56.3398,
      longitude: -2.7967
    }
  },
  {
    id: "dest-004",
    name: "Côte d'Azur",
    country: "France",
    region: "Provence-Alpes-Côte d'Azur",
    description: "La Côte d'Azur combine l'art de vivre à la française avec des parcours de golf d'exception. Entre mer Méditerranée et contreforts des Alpes, les golfs offrent des panoramas spectaculaires et des défis techniques variés. Après votre partie, profitez de la gastronomie locale, des villages pittoresques et du glamour des stations balnéaires de renommée mondiale.",
    shortDescription: "L'élégance à la française avec des parcours entre mer et montagne",
    imageUrl: "https://images.unsplash.com/photo-1559631526-5716df3060f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    popularity: 7,
    weatherInfo: "Climat méditerranéen avec des étés chauds et secs",
    bestTimeToVisit: ["Avril", "Mai", "Juin", "Septembre", "Octobre"],
    tags: ["Luxe", "Gastronomie", "Culture", "Romantique"],
    coordinates: {
      latitude: 43.7102,
      longitude: 7.2620
    }
  },
  {
    id: "dest-005",
    name: "Dubai",
    country: "Émirats Arabes Unis",
    region: "Dubai",
    description: "Dubai redéfinit l'expérience du golf de luxe avec ses parcours spectaculaires conçus par des champions et architectes de renom. Imaginez-vous jouer sur des fairways d'un vert émeraude contrastant avec le désert doré, avec en toile de fond les gratte-ciels futuristes. L'hospitalité légendaire, les clubhouses somptueux et les conditions de jeu parfaites toute l'année font de Dubai une destination golf d'exception.",
    shortDescription: "L'extravagance du golf au milieu du désert avec des parcours de championnat",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    popularity: 8,
    weatherInfo: "Climat désertique avec des hivers doux et des étés très chauds",
    bestTimeToVisit: ["Novembre", "Décembre", "Janvier", "Février", "Mars"],
    tags: ["Luxe", "Désert", "Ultra-Premium", "Moderne"],
    coordinates: {
      latitude: 25.2048,
      longitude: 55.2708
    }
  },
  {
    id: "dest-006",
    name: "Pebble Beach",
    country: "États-Unis",
    region: "Californie",
    description: "Pebble Beach est l'incarnation du rêve golfique américain. Ce parcours légendaire, situé sur la péninsule de Monterey en Californie, offre certains des plus beaux trous au monde le long de l'océan Pacifique. Théâtre de nombreux US Open, Pebble Beach combine l'excellence sportive avec des paysages à couper le souffle, entre falaises vertigineuses et eaux turquoise.",
    shortDescription: "Le joyau du golf américain sur la côte Pacifique",
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    popularity: 9,
    weatherInfo: "Climat méditerranéen avec des brouillards matinaux fréquents",
    bestTimeToVisit: ["Avril", "Mai", "Juin", "Septembre", "Octobre"],
    tags: ["Prestige", "Océan", "Championnat", "Luxe"],
    coordinates: {
      latitude: 36.5725,
      longitude: -121.9486
    }
  }
];

// Parcours de golf
export const mockGolfCourses: GolfCourse[] = [
  {
    id: "course-001",
    name: "Monte Rei Golf & Country Club",
    destinationId: "dest-001", // Algarve
    description: "Considéré comme le meilleur parcours du Portugal, Monte Rei est une création magistrale de Jack Nicklaus. Chaque trou est isolé dans un écrin de nature préservée, offrant une expérience de jeu exclusive et mémorable. Le service impeccable et l'attention aux détails font de Monte Rei une expérience golfique de classe mondiale.",
    shortDescription: "Le joyau de l'Algarve signé Jack Nicklaus",
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    holeCount: 18,
    par: 72,
    length: 6567,
    difficulty: 4,
    designer: "Jack Nicklaus",
    yearBuilt: 2007,
    greenFee: 225,
    buggyFee: 45,
    facilities: ["Clubhouse de luxe", "Restaurant gastronomique", "Pro shop", "Académie de golf", "Caddy master", "Voiturettes GPS"],
    signatureHole: {
      number: 13,
      description: "Un par 4 spectaculaire avec vue panoramique sur l'océan Atlantique et les montagnes environnantes. Le trou descend vers un green bien protégé par des bunkers stratégiquement placés.",
      imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      hasARPreview: true
    },
    rating: 4.9,
    reviews: 245,
    tags: ["Championship", "Signature", "Exclusif", "Vallonné"]
  },
  {
    id: "course-002",
    name: "Old Course St Andrews",
    destinationId: "dest-003", // St Andrews
    description: "L'Old Course est le parcours le plus emblématique au monde, considéré comme le berceau du golf. Avec plus de 600 ans d'histoire, ce links traditionnel a accueilli plus de championnats Open que tout autre parcours. Ses caractéristiques uniques comme le fairway partagé, les bunkers profonds et le célèbre pont Swilcan en font une expérience golfique incontournable.",
    shortDescription: "Le parcours le plus mythique au monde, berceau du golf",
    imageUrl: "https://images.unsplash.com/photo-1592919505780-303950717480?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    holeCount: 18,
    par: 72,
    length: 6721,
    difficulty: 5,
    designer: "Nature & Temps",
    yearBuilt: 1400,
    greenFee: 290,
    buggyFee: 0, // Voiturettes non autorisées
    facilities: ["Clubhouse historique", "Restaurant", "Pro shop", "Musée du golf", "Caddy service"],
    signatureHole: {
      number: 17,
      description: "Le célèbre 'Road Hole', un par 4 redoutable avec l'hôtel Old Course sur la droite et la route et le bunker profond protégeant le green. Considéré comme l'un des trous les plus difficiles au monde.",
      imageUrl: "https://images.unsplash.com/photo-1592919505780-303950717480?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      hasARPreview: true
    },
    rating: 5.0,
    reviews: 512,
    tags: ["Links", "Historique", "Championnat", "Traditionnel"]
  },
  {
    id: "course-003",
    name: "Valderrama Golf Club",
    destinationId: "dest-002", // Costa del Sol
    description: "Valderrama est souvent décrit comme l'Augusta National d'Europe. Ce chef-d'œuvre de Robert Trent Jones Sr. a accueilli la Ryder Cup 1997 et de nombreux tournois prestigieux. Connu pour ses fairways étroits bordés de chênes-lièges centenaires et ses greens rapides et complexes, Valderrama représente un défi technique exigeant la précision à chaque coup.",
    shortDescription: "Le parcours le plus prestigieux d'Europe continentale",
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    holeCount: 18,
    par: 71,
    length: 6356,
    difficulty: 5,
    designer: "Robert Trent Jones Sr.",
    yearBuilt: 1974,
    greenFee: 390,
    buggyFee: 55,
    facilities: ["Clubhouse élégant", "Restaurant gastronomique", "Pro shop", "Practice", "Putting green", "Caddy service"],
    signatureHole: {
      number: 17,
      description: "Un par 5 stratégique avec un green surélevé et protégé par un étang. Le trou qui a décidé du sort de nombreux tournois, y compris la Ryder Cup 1997.",
      imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      hasARPreview: true
    },
    rating: 4.9,
    reviews: 328,
    tags: ["Championship", "Exclusif", "Technique", "Prestige"]
  },
  {
    id: "course-004",
    name: "Golf du Château de la Tournette",
    destinationId: "dest-004", // Côte d'Azur
    description: "Niché dans un domaine historique provençal, le Golf du Château de la Tournette offre deux parcours 18 trous d'exception. Les fairways ondulent à travers les oliviers centenaires, la garrigue parfumée et les lacs azur. L'architecture respectueuse du paysage naturel et le climat idéal de la Côte d'Azur en font une destination prisée des golfeurs en quête d'authenticité et d'élégance à la française.",
    shortDescription: "L'élégance provençale dans un cadre historique",
    imageUrl: "https://images.unsplash.com/photo-1559631526-5716df3060f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    holeCount: 18,
    par: 72,
    length: 6275,
    difficulty: 3,
    designer: "Michel Gayon",
    yearBuilt: 1992,
    greenFee: 175,
    buggyFee: 40,
    facilities: ["Château-clubhouse", "Restaurant gastronomique", "Pro shop", "Académie", "Spa", "Piscine"],
    signatureHole: {
      number: 9,
      description: "Un par 3 spectaculaire avec le château en arrière-plan. Le green est entouré d'oliviers centenaires et protégé par des bunkers profonds.",
      imageUrl: "https://images.unsplash.com/photo-1559631526-5716df3060f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      hasARPreview: false
    },
    rating: 4.7,
    reviews: 186,
    tags: ["Château", "Historique", "Gastronomie", "Technique"]
  },
  {
    id: "course-005",
    name: "Emirates Golf Club - Majlis Course",
    destinationId: "dest-005", // Dubai
    description: "Premier parcours gazonné au Moyen-Orient, le Majlis est une oasis de verdure au cœur du désert de Dubai. Hôte du Dubai Desert Classic, ce parcours offre des vues spectaculaires sur les gratte-ciels de la ville. Les fairways généreux contrastent avec des greens techniques et des bunkers stratégiquement placés, offrant un défi accessible à tous les niveaux.",
    shortDescription: "Une oasis de golf au cœur du désert avec vue sur les gratte-ciels",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    holeCount: 18,
    par: 72,
    length: 6676,
    difficulty: 4,
    designer: "Karl Litten",
    yearBuilt: 1988,
    greenFee: 310,
    buggyFee: 50,
    facilities: ["Clubhouse futuriste", "Restaurant étoilé", "Pro shop de luxe", "Académie", "Éclairage nocturne", "Spa"],
    signatureHole: {
      number: 8,
      description: "Un par 4 spectaculaire avec la skyline de Dubai en arrière-plan. Le trou est bordé par un lac sur toute la longueur droite, créant un défi visuel intimidant.",
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      hasARPreview: true
    },
    rating: 4.8,
    reviews: 274,
    tags: ["Championship", "Désert", "Moderne", "Vue urbaine"]
  },
  {
    id: "course-006",
    name: "Quinta do Lago - South Course",
    destinationId: "dest-001", // Algarve
    description: "Le South Course de Quinta do Lago est un parcours de championnat qui a accueilli huit fois l'Open du Portugal. Redessiné par l'architecte américain Beau Welling en collaboration avec le champion européen Paul McGinley, il offre un défi stratégique dans un cadre naturel préservé. Les fairways bordés de pins parasols et les vues sur la Ria Formosa créent une atmosphère unique.",
    shortDescription: "Un parcours de championnat dans la réserve naturelle de Ria Formosa",
    imageUrl: "https://images.unsplash.com/photo-1600166898405-da9535204843?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    holeCount: 18,
    par: 72,
    length: 6488,
    difficulty: 4,
    designer: "William Mitchell / Beau Welling",
    yearBuilt: 1974,
    greenFee: 195,
    buggyFee: 45,
    facilities: ["Clubhouse moderne", "Restaurant", "Pro shop", "Académie", "Practice", "Fitting center"],
    signatureHole: {
      number: 15,
      description: "Un par 3 spectaculaire avec un green insulaire entouré d'eau. La précision est essentielle sur ce trou qui peut faire basculer une carte de score.",
      imageUrl: "https://images.unsplash.com/photo-1600166898405-da9535204843?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      hasARPreview: true
    },
    rating: 4.7,
    reviews: 312,
    tags: ["Championship", "Nature", "Stratégique", "Eau"]
  },
  {
    id: "course-007",
    name: "Pebble Beach Golf Links",
    destinationId: "dest-006", // Pebble Beach
    description: "Pebble Beach Golf Links est l'un des parcours les plus célèbres au monde, offrant des vues imprenables sur l'océan Pacifique depuis presque chaque trou. Hôte de six US Open, ce parcours légendaire combine l'histoire du golf avec une beauté naturelle incomparable. Les trous 7, 8 et 18 sont parmi les plus photographiés et les plus mémorables du golf mondial.",
    shortDescription: "Le joyau de la côte californienne, l'un des plus beaux parcours au monde",
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    holeCount: 18,
    par: 72,
    length: 6828,
    difficulty: 5,
    designer: "Jack Neville & Douglas Grant",
    yearBuilt: 1919,
    greenFee: 575,
    buggyFee: 50,
    facilities: ["Clubhouse historique", "Restaurant gastronomique", "Pro shop", "Practice", "Caddy service"],
    signatureHole: {
      number: 7,
      description: "Un par 3 iconique de seulement 106 yards mais joué du haut d'une falaise vers un minuscule green entouré par l'océan Pacifique. L'un des trous les plus photographiés au monde.",
      imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      hasARPreview: true
    },
    rating: 5.0,
    reviews: 487,
    tags: ["Océan", "Falaises", "Championnat", "Prestige"]
  }
];

// Hôtels
export const mockHotels: Hotel[] = [
  {
    id: "hotel-001",
    name: "Monte Rei Golf & Country Club Villas",
    destinationId: "dest-001", // Algarve
    description: "Nichées au cœur du domaine de Monte Rei, ces villas de luxe offrent une expérience résidentielle exclusive. Chaque villa dispose de sa propre piscine privée, de vastes espaces de vie et d'une vue imprenable sur le parcours de golf. Le service de conciergerie personnalisé et l'accès privilégié aux installations du club en font un séjour d'exception pour les golfeurs exigeants.",
    shortDescription: "Villas de luxe avec piscines privées au cœur du meilleur golf du Portugal",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    category: 5,
    pricePerNight: 450,
    address: "Sítio do Pocinho, 8901-907 Vila Nova de Cacela, Portugal",
    amenities: ["Piscine privée", "Service de conciergerie", "Navette pour le golf", "Wi-Fi gratuit", "Cuisine équipée", "Climatisation", "Parking privé", "Service de ménage quotidien", "Room service"],
    distanceToNearestCourse: 0.1,
    roomTypes: [
      {
        id: "room-001-1",
        name: "Villa 2 chambres",
        description: "Villa luxueuse avec 2 chambres, piscine privée et vue sur le parcours de golf",
        capacity: 4,
        pricePerNight: 450,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        id: "room-001-2",
        name: "Villa 3 chambres",
        description: "Spacieuse villa avec 3 chambres, piscine privée et terrasse panoramique",
        capacity: 6,
        pricePerNight: 650,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        id: "room-001-3",
        name: "Villa Prestige 4 chambres",
        description: "Villa ultra-luxueuse avec 4 chambres, piscine à débordement et service de majordome",
        capacity: 8,
        pricePerNight: 950,
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      }
    ],
    rating: 4.9,
    reviews: 187,
    tags: ["Luxe", "Golf", "Tranquillité", "Famille"]
  },
  {
    id: "hotel-002",
    name: "Old Course Hotel St Andrews",
    destinationId: "dest-003", // St Andrews
    description: "Surplombant le célèbre 17e trou de l'Old Course, cet hôtel iconique offre une immersion totale dans l'histoire et la tradition du golf. Les chambres élégantes, dont certaines avec vue sur le parcours légendaire, allient confort moderne et charme écossais. Le spa primé et les restaurants gastronomiques complètent cette expérience d'exception au cœur du berceau du golf.",
    shortDescription: "Hôtel iconique surplombant le légendaire Old Course de St Andrews",
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    category: 5,
    pricePerNight: 395,
    address: "Old Station Road, St Andrews KY16 9SP, Royaume-Uni",
    amenities: ["Spa de luxe", "Restaurants gastronomiques", "Bar à whisky", "Salle de fitness", "Wi-Fi gratuit", "Service de conciergerie", "Navette pour les golfs", "Parking", "Room service 24h/24"],
    distanceToNearestCourse: 0,
    roomTypes: [
      {
        id: "room-002-1",
        name: "Chambre Eden",
        description: "Chambre élégante avec lit king-size et vue sur la ville historique de St Andrews",
        capacity: 2,
        pricePerNight: 395,
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        id: "room-002-2",
        name: "Chambre Old Course",
        description: "Chambre spacieuse avec vue imprenable sur le légendaire Old Course et la baie de St Andrews",
        capacity: 2,
        pricePerNight: 595,
        imageUrl: "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2121&q=80"
      },
      {
        id: "room-002-3",
        name: "Suite Road Hole",
        description: "Suite luxueuse avec salon séparé et vue panoramique sur le célèbre 17e trou de l'Old Course",
        capacity: 3,
        pricePerNight: 895,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      }
    ],
    rating: 4.8,
    reviews: 324,
    tags: ["Historique", "Luxe", "Vue golf", "Gastronomie"]
  },
  {
    id: "hotel-003",
    name: "Finca Cortesin Hotel Golf & Spa",
    destinationId: "dest-002", // Costa del Sol
    description: "Niché entre mer et montagne, Finca Cortesin est un havre de paix andalou alliant architecture traditionnelle et luxe contemporain. Ce boutique-hôtel de 67 suites spacieuses est entouré de jardins méditerranéens luxuriants. Son spa de 2 200 m², ses quatre piscines et son parcours de golf de championnat en font une destination d'exception pour les voyageurs les plus exigeants.",
    shortDescription: "Domaine andalou de luxe avec l'un des meilleurs golfs d'Espagne",
    imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2089&q=80",
    category: 5,
    pricePerNight: 550,
    address: "Ctra. de Casares, Km 2, 29690 Casares, Málaga, Espagne",
    amenities: ["Parcours de golf 18 trous", "Spa de 2 200 m²", "4 piscines", "3 restaurants", "Plage privée", "Court de tennis", "Salle de fitness", "Service de conciergerie", "Navette pour la plage", "Wi-Fi gratuit"],
    distanceToNearestCourse: 0,
    roomTypes: [
      {
        id: "room-003-1",
        name: "Suite Junior",
        description: "Suite élégante de 52 m² avec terrasse privée et vue sur les jardins",
        capacity: 2,
        pricePerNight: 550,
        imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2089&q=80"
      },
      {
        id: "room-003-2",
        name: "Suite Executive",
        description: "Suite spacieuse de 80 m² avec salon séparé et grande terrasse avec vue sur le golf",
        capacity: 3,
        pricePerNight: 750,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        id: "room-003-3",
        name: "Villa Privée",
        description: "Villa luxueuse de 180 m² avec 2 chambres, piscine privée et service de majordome",
        capacity: 4,
        pricePerNight: 1250,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      }
    ],
    rating: 4.9,
    reviews: 215,
    tags: ["Ultra-luxe", "Golf", "Spa", "Gastronomie"]
  },
  {
    id: "hotel-004",
    name: "Terre Blanche Hotel Spa Golf Resort",
    destinationId: "dest-004", // Côte d'Azur
    description: "Niché dans l'arrière-pays provençal, Terre Blanche est un resort 5 étoiles alliant l'art de vivre méditerranéen au luxe discret. Les suites et villas spacieuses sont disséminées dans un domaine de 300 hectares comprenant deux parcours de golf exceptionnels. Le spa de 3 200 m², les restaurants étoilés et l'académie de golf en font une destination d'exception sur la Côte d'Azur.",
    shortDescription: "Resort provençal de luxe avec deux parcours de golf exceptionnels",
    imageUrl: "https://images.unsplash.com/photo-1559631526-5716df3060f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    category: 5,
    pricePerNight: 490,
    address: "3100 Route de Bagnols-en-Forêt, 83440 Tourrettes, France",
    amenities: ["2 parcours de golf 18 trous", "Spa de 3 200 m²", "4 restaurants", "Piscines intérieure et extérieure", "Académie de golf", "Kids Club", "Salle de fitness", "Tennis", "Service de conciergerie"],
    distanceToNearestCourse: 0,
    roomTypes: [
      {
        id: "room-004-1",
        name: "Suite Deluxe",
        description: "Suite de 60 m² avec terrasse privée et vue sur le golf ou la forêt provençale",
        capacity: 2,
        pricePerNight: 490,
        imageUrl: "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2121&q=80"
      },
      {
        id: "room-004-2",
        name: "Villa Prestige",
        description: "Villa de 100 m² avec salon séparé, grande terrasse et accès piscine",
        capacity: 3,
        pricePerNight: 690,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        id: "room-004-3",
        name: "Villa Méditerranée",
        description: "Villa luxueuse de 200 m² avec 2 chambres, piscine privée et vue panoramique",
        capacity: 5,
        pricePerNight: 1190,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      }
    ],
    rating: 4.8,
    reviews: 278,
    tags: ["Luxe", "Golf", "Spa", "Famille"]
  },
  {
    id: "hotel-005",
    name: "Address Montgomerie Dubai",
    destinationId: "dest-005", // Dubai
    description: "Situé au cœur du prestigieux quartier d'Emirates Hills, l'Address Montgomerie Dubai combine l'élégance contemporaine avec un service personnalisé d'exception. L'hôtel surplombe le parcours de golf Montgomerie conçu par Colin Montgomerie et offre une vue spectaculaire sur la skyline de Dubai. Les chambres spacieuses, le spa de luxe et les restaurants raffinés en font un havre de paix pour les golfeurs exigeants.",
    shortDescription: "Élégance contemporaine surplombant un parcours de golf emblématique de Dubai",
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    category: 5,
    pricePerNight: 420,
    address: "Emirates Hills, Dubai, Émirats Arabes Unis",
    amenities: ["Parcours de golf 18 trous", "Spa", "Piscine extérieure", "Restaurants", "Salle de fitness", "Business center", "Service de conciergerie", "Navette pour le centre-ville", "Wi-Fi gratuit"],
    distanceToNearestCourse: 0,
    roomTypes: [
      {
        id: "room-005-1",
        name: "Chambre Deluxe",
        description: "Chambre élégante avec lit king-size et vue sur le parcours de golf",
        capacity: 2,
        pricePerNight: 420,
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        id: "room-005-2",
        name: "Suite Premier",
        description: "Suite spacieuse avec salon séparé et vue panoramique sur le golf et la skyline de Dubai",
        capacity: 2,
        pricePerNight: 620,
        imageUrl: "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2121&q=80"
      },
      {
        id: "room-005-3",
        name: "Suite Présidentielle",
        description: "Suite luxueuse avec 2 chambres, salon, salle à manger et terrasse privée avec vue imprenable",
        capacity: 4,
        pricePerNight: 1500,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      }
    ],
    rating: 4.7,
    reviews: 245,
    tags: ["Moderne", "Golf", "Business", "Vue urbaine"]
  },
  {
    id: "hotel-006",
    name: "The Lodge at Pebble Beach",
    destinationId: "dest-006", // Pebble Beach
    description: "Situé en bordure du 18e trou du légendaire Pebble Beach Golf Links, The Lodge offre une expérience de luxe intemporelle. Les chambres élégantes avec cheminée et terrasse privée offrent des vues imprenables sur l'océan Pacifique ou le fairway. Le service impeccable, les restaurants gastronomiques et l'accès privilégié aux parcours de golf en font une destination de rêve pour les golfeurs du monde entier.",
    shortDescription: "Hébergement iconique en bordure du 18e trou de Pebble Beach",
    imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2089&q=80",
    category: 5,
    pricePerNight: 950,
    address: "1700 17-Mile Drive, Pebble Beach, CA 93953, États-Unis",
    amenities: ["Accès prioritaire aux parcours", "Spa", "Restaurants gastronomiques", "Piscine extérieure", "Salle de fitness", "Service de conciergerie", "Navette pour les golfs", "Beach Club", "Wi-Fi gratuit"],
    distanceToNearestCourse: 0,
    roomTypes: [
      {
        id: "room-006-1",
        name: "Chambre Garden View",
        description: "Chambre élégante avec cheminée, terrasse privée et vue sur les jardins",
        capacity: 2,
        pricePerNight: 950,
        imageUrl: "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2121&q=80"
      },
      {
        id: "room-006-2",
        name: "Chambre Ocean View",
        description: "Chambre spacieuse avec cheminée, terrasse privée et vue imprenable sur l'océan Pacifique",
        capacity: 2,
        pricePerNight: 1250,
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        id: "room-006-3",
        name: "Suite Fairway One",
        description: "Suite luxueuse en bordure du 1er trou avec salon séparé, cheminée et vue panoramique sur le parcours",
        capacity: 3,
        pricePerNight: 1950,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      }
    ],
    rating: 4.9,
    reviews: 312,
    tags: ["Luxe", "Océan", "Golf", "Gastronomie"]
  }
];

// Témoignages
export const mockTestimonials: Testimonial[] = [
  {
    id: "testimonial-001",
    name: "Marc Dupont",
    role: "Golfeur Luxe",
    imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    comment: "Golf Pass a transformé ma façon de planifier mes séjours golf. Le service VIP et les parcours sélectionnés sont vraiment exceptionnels. J'ai particulièrement apprécié la conciergerie 24/7 qui a pu organiser un tee time de dernière minute à St Andrews. Une expérience que je recommande à tous les golfeurs passionnés.",
    rating: 5,
    packageId: "package-003",
    verified: true,
    date: "2025-05-15"
  },
  {
    id: "testimonial-002",
    name: "Claire Martin",
    role: "CEO & Golfeuse",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    comment: "J'ai organisé un incentive golf pour mon équipe en quelques clics. Le service client a été irréprochable et l'expérience a dépassé nos attentes. La possibilité de payer via un compte entreprise et de recevoir une facturation centralisée a grandement simplifié la gestion administrative. Merci Golf Pass pour cette organisation parfaite !",
    rating: 5,
    packageId: "package-005",
    verified: true,
    date: "2025-04-28"
  },
  {
    id: "testimonial-003",
    name: "Lucas Petit",
    role: "Golfeur Passionné",
    imageUrl: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
    comment: "Les recommandations IA sont bluffantes ! J'ai découvert des parcours incroyables que je n'aurais jamais trouvés autrement. Le split payment entre amis est un vrai plus. Notre séjour au Portugal était parfaitement organisé, avec des transferts ponctuels et un hébergement de qualité. Je réserverai certainement mon prochain séjour via Golf Pass.",
    rating: 4,
    packageId: "package-001",
    verified: true,
    date: "2025-05-02"
  },
  {
    id: "testimonial-004",
    name: "Sophie Legrand",
    role: "Tour-opératrice",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
    comment: "En tant que professionnelle du tourisme golfique, je suis impressionnée par la qualité de la plateforme Golf Pass. Le back-office est intuitif et les analytics avancés me permettent d'optimiser mes offres. Mes clients sont ravis et mon chiffre d'affaires a augmenté de 30% depuis que j'ai rejoint la plateforme. Un partenariat gagnant-gagnant !",
    rating: 5,
    verified: true,
    date: "2025-03-19"
  },
  {
    id: "testimonial-005",
    name: "Philippe Moreau",
    role: "Golfeur Occasionnel",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    comment: "Même en tant que golfeur débutant, j'ai trouvé sur Golf Pass un séjour parfaitement adapté à mon niveau. Les filtres de recherche m'ont permis d'identifier facilement des parcours accessibles. Le service client a été très attentif à mes besoins et m'a conseillé des options adaptées. Une belle découverte !",
    rating: 4,
    packageId: "package-002",
    verified: true,
    date: "2025-05-10"
  },
  {
    id: "testimonial-006",
    name: "Isabelle Dubois",
    role: "Golfeuse Voyageuse",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2088&q=80",
    comment: "J'ai réservé un séjour à Dubai via Golf Pass et tout était simplement parfait. La fonctionnalité AR Preview m'a permis de visualiser le parcours avant de partir, ce qui était vraiment impressionnant. L'hôtel était somptueux et l'organisation sans faille. Je recommande vivement !",
    rating: 5,
    packageId: "package-004",
    verified: true,
    date: "2025-04-05"
  }
];

// Forfaits de voyage
export const mockTravelPackages: TravelPackage[] = [
  {
    id: "package-001",
    title: "Algarve Golf Elite",
    destinationId: "dest-001", // Algarve
    description: "Découvrez l'excellence du golf portugais avec ce séjour premium dans l'Algarve. Jouez sur les trois meilleurs parcours de la région, dont le prestigieux Monte Rei Golf & Country Club conçu par Jack Nicklaus. Séjournez dans des villas luxueuses avec piscine privée et profitez d'un service de conciergerie dédié pour une expérience sans souci.",
    shortDescription: "L'excellence du golf portugais sur les meilleurs parcours de l'Algarve",
    imageUrl: "https://images.unsplash.com/photo-1600166898405-da9535204843?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: 7,
    included: [
      "6 nuits en villa de luxe",
      "3 green fees (Monte Rei, Quinta do Lago South, San Lorenzo)",
      "Voiture de location premium",
      "Petits déjeuners quotidiens",
      "Dîner de bienvenue",
      "Transferts aéroport",
      "Service de conciergerie",
      "Cadeau de bienvenue Golf Pass"
    ],
    notIncluded: [
      "Vols",
      "Déjeuners et dîners (sauf dîner de bienvenue)",
      "Dépenses personnelles",
      "Assurance voyage"
    ],
    price: 1299,
    priceDetails: {
      accommodation: 600,
      greenFees: 450,
      transport: 150,
      extras: 99
    },
    discount: {
      percentage: 10,
      endDate: "2025-06-30"
    },
    golfCourses: ["course-001", "course-006"],
    hotel: "hotel-001",
    startDates: [
      "2025-06-15",
      "2025-07-01",
      "2025-09-15",
      "2025-10-01",
      "2025-10-15"
    ],
    maxGroupSize: 8,
    minGroupSize: 2,
    rating: 4.9,
    reviews: 124,
    featured: true,
    badges: ["Best Seller", "Premium"],
    tags: ["Luxe", "Golf Elite", "Villas", "Soleil"],
    sellerId: "seller-001"
  },
  {
    id: "package-002",
    title: "Costa del Sol Exclusive",
    destinationId: "dest-002", // Costa del Sol
    description: "Vivez l'expérience ultime du golf espagnol sur la célèbre Costa del Sol. Ce forfait exclusif vous permet de jouer sur le légendaire Valderrama, théâtre de la Ryder Cup 1997, ainsi que sur d'autres parcours de championnat. Votre séjour à Finca Cortesin, l'un des meilleurs resorts d'Europe, complète cette expérience d'exception avec son spa luxueux et sa gastronomie raffinée.",
    shortDescription: "L'expérience ultime du golf espagnol avec Valderrama et Finca Cortesin",
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: 5,
    included: [
      "4 nuits en suite de luxe à Finca Cortesin",
      "3 green fees (Valderrama, Finca Cortesin, La Reserva)",
      "Transferts privés aéroport-hôtel",
      "Petits déjeuners gourmet",
      "Un dîner gastronomique",
      "Accès au spa et beach club",
      "Transferts vers les golfs",
      "Caddie à Valderrama"
    ],
    notIncluded: [
      "Vols",
      "Déjeuners et dîners (sauf celui inclus)",
      "Dépenses personnelles",
      "Assurance voyage"
    ],
    price: 1599,
    priceDetails: {
      accommodation: 800,
      greenFees: 550,
      transport: 150,
      extras: 99
    },
    golfCourses: ["course-003"],
    hotel: "hotel-003",
    startDates: [
      "2025-06-01",
      "2025-06-15",
      "2025-09-01",
      "2025-09-15",
      "2025-10-01"
    ],
    maxGroupSize: 4,
    minGroupSize: 2,
    rating: 4.8,
    reviews: 86,
    featured: true,
    badges: ["All Inclusive", "Prestige"],
    tags: ["Luxe", "Gastronomie", "Spa", "Championship"],
    sellerId: "seller-002"
  },
  {
    id: "package-003",
    title: "St Andrews Links Tour",
    destinationId: "dest-003", // St Andrews
    description: "Réalisez le rêve de tout golfeur avec ce séjour exceptionnel au berceau du golf. Jouez sur le légendaire Old Course de St Andrews, théâtre de nombreux Open Championship, ainsi que sur d'autres parcours emblématiques de la région. Séjournez à l'iconique Old Course Hotel avec vue sur le célèbre 17e trou et imprégnez-vous de l'histoire et des traditions du golf écossais.",
    shortDescription: "Un pèlerinage golfique au berceau du golf avec le légendaire Old Course",
    imageUrl: "https://images.unsplash.com/photo-1592919505780-303950717480?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: 6,
    included: [
      "5 nuits à l'Old Course Hotel",
      "3 green fees garantis (Old Course, New Course, Kingsbarns)",
      "Petits déjeuners écossais",
      "Dîner de bienvenue au Road Hole Restaurant",
      "Visite privée du R&A Clubhouse et du British Golf Museum",
      "Transferts aéroport et vers les golfs",
      "Cadeau souvenir St Andrews",
      "Service de conciergerie VIP"
    ],
    notIncluded: [
      "Vols",
      "Déjeuners et dîners (sauf dîner de bienvenue)",
      "Caddies (disponibles en supplément)",
      "Dépenses personnelles",
      "Assurance voyage"
    ],
    price: 2499,
    priceDetails: {
      accommodation: 1000,
      greenFees: 1100,
      transport: 250,
      extras: 149
    },
    golfCourses: ["course-002"],
    hotel: "hotel-002",
    startDates: [
      "2025-05-15",
      "2025-06-01",
      "2025-07-15",
      "2025-08-01",
      "2025-09-15"
    ],
    maxGroupSize: 4,
    minGroupSize: 1,
    rating: 5.0,
    reviews: 92,
    featured: true,
    badges: ["Légendaire", "VIP"],
    tags: ["Historique", "Links", "Prestige", "Bucket List"],
    sellerId: "seller-003"
  },
  {
    id: "package-004",
    title: "Dubai Golf & Luxury",
    destinationId: "dest-005", // Dubai
    description: "Découvrez le luxe ultime du golf à Dubai avec ce séjour d'exception. Jouez sur les parcours emblématiques des Emirates Golf Club et Jumeirah Golf Estates, hôtes du DP World Tour Championship. Séjournez à l'Address Montgomerie Dubai et profitez d'une vue imprenable sur la skyline futuriste. Entre vos parties de golf, explorez les merveilles de Dubai : shopping de luxe, safari dans le désert et expériences gastronomiques d'exception.",
    shortDescription: "L'extravagance du golf à Dubai entre désert et gratte-ciels",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: 5,
    included: [
      "4 nuits à l'Address Montgomerie Dubai",
      "3 green fees (Emirates Majlis, Montgomerie, Jumeirah Earth)",
      "Petits déjeuners quotidiens",
      "Dîner dans un restaurant panoramique",
      "Safari dans le désert avec dîner",
      "Transferts privés aéroport et golfs",
      "Accès au spa et à la piscine",
      "Voiturettes de golf incluses"
    ],
    notIncluded: [
      "Vols",
      "Déjeuners et dîners (sauf ceux mentionnés)",
      "Dépenses personnelles",
      "Assurance voyage"
    ],
    price: 1899,
    priceDetails: {
      accommodation: 850,
      greenFees: 650,
      transport: 200,
      extras: 199
    },
    golfCourses: ["course-005"],
    hotel: "hotel-005",
    startDates: [
      "2025-11-01",
      "2025-11-15",
      "2025-12-01",
      "2026-01-15",
      "2026-02-01"
    ],
    maxGroupSize: 4,
    minGroupSize: 2,
    rating: 4.8,
    reviews: 74,
    featured: true,
    badges: ["Ultra Luxe", "Expérience"],
    tags: ["Luxe", "Moderne", "Désert", "Shopping"],
    sellerId: "seller-004"
  },
  {
    id: "package-005",
    title: "Corporate Golf Retreat Côte d'Azur",
    destinationId: "dest-004", // Côte d'Azur
    description: "Offrez à votre équipe un incentive golf d'exception sur la Côte d'Azur. Ce forfait sur mesure pour les entreprises combine golf de haut niveau, team building et expériences gastronomiques. Séjournez au Terre Blanche Hotel Spa Golf Resort, un havre de paix provençal avec deux parcours exceptionnels. Notre équipe dédiée s'occupe de tous les détails pour un événement d'entreprise mémorable.",
    shortDescription: "Incentive golf d'exception pour entreprises sur la Côte d'Azur",
    imageUrl: "https://images.unsplash.com/photo-1559631526-5716df3060f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: 4,
    included: [
      "3 nuits en suites et villas à Terre Blanche",
      "2 green fees par personne",
      "Salle de réunion équipée pour une demi-journée",
      "Activité team building",
      "Petits déjeuners buffet",
      "Dîner de gala",
      "Dégustation de vins locaux",
      "Transferts aéroport et golfs",
      "Coordinateur événementiel dédié"
    ],
    notIncluded: [
      "Vols",
      "Déjeuners et dîners (sauf ceux mentionnés)",
      "Dépenses personnelles",
      "Assurance voyage"
    ],
    price: 1499,
    priceDetails: {
      accommodation: 700,
      greenFees: 400,
      transport: 150,
      extras: 249
    },
    golfCourses: ["course-004"],
    hotel: "hotel-004",
    startDates: [
      "2025-06-01",
      "2025-06-15",
      "2025-09-01",
      "2025-09-15",
      "2025-10-01"
    ],
    maxGroupSize: 16,
    minGroupSize: 8,
    rating: 4.7,
    reviews: 38,
    featured: false,
    badges: ["Business", "Team Building"],
    tags: ["Corporate", "Incentive", "Gastronomie", "Luxe"],
    sellerId: "seller-005"
  },
  {
    id: "package-006",
    title: "Pebble Beach Dream Experience",
    destinationId: "dest-006", // Pebble Beach
    description: "Vivez le rêve américain du golf avec cette expérience exceptionnelle à Pebble Beach. Jouez sur le légendaire Pebble Beach Golf Links, théâtre de nombreux US Open, ainsi que sur Spyglass Hill et Spanish Bay. Séjournez au prestigieux Lodge at Pebble Beach et imprégnez-vous de l'atmosphère unique de la péninsule de Monterey, entre océan Pacifique et forêts de cyprès.",
    shortDescription: "L'expérience ultime du golf américain sur le légendaire Pebble Beach",
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: 6,
    included: [
      "5 nuits au Lodge at Pebble Beach",
      "3 green fees (Pebble Beach Golf Links, Spyglass Hill, Spanish Bay)",
      "Petits déjeuners américains",
      "Dîner gastronomique au Stillwater Bar",
      "Accès au Beach & Tennis Club",
      "Tour privé de 17-Mile Drive",
      "Transferts aéroport et golfs",
      "Cadeau souvenir Pebble Beach"
    ],
    notIncluded: [
      "Vols",
      "Déjeuners et dîners (sauf celui mentionné)",
      "Caddies (recommandés et disponibles en supplément)",
      "Dépenses personnelles",
      "Assurance voyage"
    ],
    price: 3999,
    priceDetails: {
      accommodation: 1900,
      greenFees: 1600,
      transport: 300,
      extras: 199
    },
    golfCourses: ["course-007"],
    hotel: "hotel-006",
    startDates: [
      "2025-05-01",
      "2025-05-15",
      "2025-06-01",
      "2025-09-15",
      "2025-10-01"
    ],
    maxGroupSize: 4,
    minGroupSize: 2,
    rating: 5.0,
    reviews: 56,
    featured: true,
    badges: ["Bucket List", "Ultra Premium"],
    tags: ["Prestige", "Océan", "Luxe", "Championnat"],
    sellerId: "seller-006"
  }
];

// Vendeurs
export const mockSellers: Seller[] = [
  {
    id: "seller-001",
    name: "Portugal Golf Experience",
    logo: "https://via.placeholder.com/150x150.png?text=PGE",
    description: "Spécialiste des séjours golf au Portugal depuis plus de 15 ans. Notre connaissance approfondie des parcours et hébergements portugais nous permet de créer des expériences sur mesure pour tous les golfeurs.",
    verified: true,
    rating: 4.8,
    reviews: 245,
    memberSince: "2023-10-15",
    contactInfo: {
      email: "contact@portugalgolfexperience.com",
      phone: "+351 289 123 456",
      website: "www.portugalgolfexperience.com"
    },
    specialties: ["Algarve", "Lisbonne", "Madère", "Groupes", "VIP"]
  },
  {
    id: "seller-002",
    name: "Spanish Golf Tours",
    logo: "https://via.placeholder.com/150x150.png?text=SGT",
    description: "Premier tour-opérateur espagnol spécialisé dans les séjours golf de luxe. Accès privilégié aux parcours les plus exclusifs d'Espagne et service personnalisé pour une clientèle exigeante.",
    verified: true,
    rating: 4.9,
    reviews: 187,
    memberSince: "2023-11-02",
    contactInfo: {
      email: "info@spanishgolftours.com",
      phone: "+34 952 789 123",
      website: "www.spanishgolftours.com"
    },
    specialties: ["Costa del Sol", "Costa Brava", "Parcours privés", "Expériences VIP", "Gastronomie"]
  },
  {
    id: "seller-003",
    name: "Scottish Links Heritage",
    logo: "https://via.placeholder.com/150x150.png?text=SLH",
    description: "Spécialiste des voyages golf en Écosse avec un accès privilégié aux parcours les plus emblématiques. Notre équipe de passionnés vous fait découvrir l'histoire et les traditions du golf écossais.",
    verified: true,
    rating: 5.0,
    reviews: 156,
    memberSince: "2024-01-10",
    contactInfo: {
      email: "bookings@scottishlinksheritage.com",
      phone: "+44 1334 123 456",
      website: "www.scottishlinksheritage.com"
    },
    specialties: ["St Andrews", "Old Course", "Links traditionnels", "Histoire du golf", "Whisky"]
  },
  {
    id: "seller-004",
    name: "Emirates Golf Voyages",
    logo: "https://via.placeholder.com/150x150.png?text=EGV",
    description: "Leader des séjours golf de luxe à Dubai et dans les Émirats. Notre service d'exception et nos partenariats exclusifs vous garantissent une expérience inoubliable dans le luxe oriental.",
    verified: true,
    rating: 4.7,
    reviews: 92,
    memberSince: "2024-02-15",
    contactInfo: {
      email: "luxury@emiratesgolfvoyages.com",
      phone: "+971 4 123 4567",
      website: "www.emiratesgolfvoyages.com"
    },
    specialties: ["Dubai", "Abu Dhabi", "Expériences VIP", "Hôtels 5 étoiles", "Désert"]
  },
  {
    id: "seller-005",
    name: "French Riviera Golf Prestige",
    logo: "https://via.placeholder.com/150x150.png?text=FRGP",
    description: "Spécialiste des séjours golf sur la Côte d'Azur et en Provence. Organisation d'événements corporate et de séjours sur mesure dans les plus beaux golfs du sud de la France.",
    verified: true,
    rating: 4.6,
    reviews: 78,
    memberSince: "2024-01-25",
    contactInfo: {
      email: "contact@rivieragolfprestige.fr",
      phone: "+33 4 93 12 34 56",
      website: "www.rivieragolfprestige.fr"
    },
    specialties: ["Côte d'Azur", "Provence", "Événements corporate", "Gastronomie", "Œnotourisme"]
  },
  {
    id: "seller-006",
    name: "American Golf Legends",
    logo: "https://via.placeholder.com/150x150.png?text=AGL",
    description: "Accès privilégié aux parcours légendaires américains comme Pebble Beach, Augusta National et TPC Sawgrass. Voyages de rêve pour les golfeurs passionnés souhaitant découvrir les joyaux du golf américain.",
    verified: true,
    rating: 4.9,
    reviews: 103,
    memberSince: "2023-12-05",
    contactInfo: {
      email: "info@americangolflegends.com",
      phone: "+1 831 123 4567",
      website: "www.americangolflegends.com"
    },
    specialties: ["Pebble Beach", "Californie", "Floride", "Masters Experience", "Parcours de championnat"]
  }
];

// Fonctions utilitaires pour manipuler les données

// Trouver une destination par ID
export const findDestinationById = (id: string): Destination | undefined => {
  return mockDestinations.find(destination => destination.id === id);
};

// Trouver un parcours de golf par ID
export const findGolfCourseById = (id: string): GolfCourse | undefined => {
  return mockGolfCourses.find(course => course.id === id);
};

// Trouver un hôtel par ID
export const findHotelById = (id: string): Hotel | undefined => {
  return mockHotels.find(hotel => hotel.id === id);
};

// Trouver un forfait par ID
export const findPackageById = (id: string): TravelPackage | undefined => {
  return mockTravelPackages.find(pkg => pkg.id === id);
};

// Trouver un vendeur par ID
export const findSellerById = (id: string): Seller | undefined => {
  return mockSellers.find(seller => seller.id === id);
};

// Obtenir les parcours de golf pour une destination
export const getGolfCoursesByDestination = (destinationId: string): GolfCourse[] => {
  return mockGolfCourses.filter(course => course.destinationId === destinationId);
};

// Obtenir les hôtels pour une destination
export const getHotelsByDestination = (destinationId: string): Hotel[] => {
  return mockHotels.filter(hotel => hotel.destinationId === destinationId);
};

// Obtenir les forfaits pour une destination
export const getPackagesByDestination = (destinationId: string): TravelPackage[] => {
  return mockTravelPackages.filter(pkg => pkg.destinationId === destinationId);
};

// Obtenir les forfaits en vedette
export const getFeaturedPackages = (): TravelPackage[] => {
  return mockTravelPackages.filter(pkg => pkg.featured);
};

// Filtrer les forfaits par budget
export const getPackagesByBudget = (maxPrice: number): TravelPackage[] => {
  return mockTravelPackages.filter(pkg => pkg.price <= maxPrice);
};

// Filtrer les forfaits par durée
export const getPackagesByDuration = (minDuration: number, maxDuration: number): TravelPackage[] => {
  return mockTravelPackages.filter(pkg => pkg.duration >= minDuration && pkg.duration <= maxDuration);
};

// Rechercher des forfaits par mot-clé
export const searchPackages = (keyword: string): TravelPackage[] => {
  const lowerKeyword = keyword.toLowerCase();
  return mockTravelPackages.filter(pkg =>
