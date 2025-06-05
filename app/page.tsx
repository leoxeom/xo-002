import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { FeaturedCard } from "@/components/featured-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { Button } from "@/components/ui/button";
import { mockFeaturedDestinations, mockTestimonials } from "@/data/mock-data";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Golf course panorama"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-blue-900/90 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="animate-fade-in font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            <span className="block">Réinventer le voyage de golf,</span>
            <span className="mt-2 block text-gradient-premium">un parcours à la fois</span>
          </h1>
          
          <p className="mt-6 animate-slide-up animation-delay-200 max-w-2xl text-lg text-gray-200">
            Découvrez des séjours golf premium dans les plus beaux parcours du monde.
            Réservez en toute simplicité et vivez des expériences inoubliables.
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 w-full max-w-4xl animate-slide-up animation-delay-300">
            <div className="glass-card flex flex-col gap-4 p-6 md:flex-row md:items-end">
              <div className="flex-1">
                <label htmlFor="destination" className="mb-2 block text-sm font-medium text-white">
                  Destination
                </label>
                <select id="destination" className="input">
                  <option value="">Toutes les destinations</option>
                  <option value="portugal">Portugal</option>
                  <option value="espagne">Espagne</option>
                  <option value="france">France</option>
                  <option value="ecosse">Écosse</option>
                  <option value="irlande">Irlande</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label htmlFor="dates" className="mb-2 block text-sm font-medium text-white">
                  Dates
                </label>
                <input type="text" id="dates" placeholder="Quand souhaitez-vous partir ?" className="input" />
              </div>
              
              <div className="flex-1">
                <label htmlFor="budget" className="mb-2 block text-sm font-medium text-white">
                  Budget max
                </label>
                <select id="budget" className="input">
                  <option value="">Tous les prix</option>
                  <option value="1000">Moins de 1 000 €</option>
                  <option value="2000">Moins de 2 000 €</option>
                  <option value="3000">Moins de 3 000 €</option>
                  <option value="5000">Moins de 5 000 €</option>
                </select>
              </div>
              
              <button className="btn-primary mt-4 h-12 w-full md:mt-0 md:w-auto">
                Rechercher
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-12 flex animate-fade-in animation-delay-500 flex-wrap justify-center gap-8 text-center">
            <div className="glass-card min-w-[120px]">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-gray-300">Parcours</p>
            </div>
            <div className="glass-card min-w-[120px]">
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-xs text-gray-300">Destinations</p>
            </div>
            <div className="glass-card min-w-[120px]">
              <p className="text-2xl font-bold text-white">10k+</p>
              <p className="text-xs text-gray-300">Golfeurs satisfaits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="bg-gradient-to-b from-dark-blue-900 to-dark-blue-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Destinations en vedette
            </h2>
            <p className="mt-4 text-gray-300">
              Explorez nos sélections de séjours golf dans des destinations d'exception
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Mock featured destinations */}
            {[
              {
                id: 1,
                title: "Algarve Golf Elite",
                location: "Portugal",
                image: "https://images.unsplash.com/photo-1600166898405-da9535204843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                price: 1299,
                rating: 4.9,
                duration: "7 jours",
                badges: ["Best Seller", "Premium"],
              },
              {
                id: 2,
                title: "Costa del Sol Exclusive",
                location: "Espagne",
                image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                price: 1599,
                rating: 4.8,
                duration: "5 jours",
                badges: ["All Inclusive"],
              },
              {
                id: 3,
                title: "St Andrews Links Tour",
                location: "Écosse",
                image: "https://images.unsplash.com/photo-1592919505780-303950717480?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                price: 2499,
                rating: 5.0,
                duration: "6 jours",
                badges: ["Légendaire", "VIP"],
              },
            ].map((destination) => (
              <div 
                key={destination.id}
                className="group glass-card card-hover-effect overflow-hidden"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-glassmorphic">
                  <Image
                    src={destination.image}
                    alt={destination.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-blue-900 to-transparent p-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.badges.map((badge) => (
                        <span key={badge} className="badge-primary">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-white">
                    {destination.title}
                  </h3>
                  <p className="text-gray-300">{destination.location}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{destination.duration}</p>
                      <div className="mt-1 flex items-center">
                        <svg
                          className="h-4 w-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.11l7.871-1.143L10 0l2.542 5.967 7.871 1.143-5.693 5.325 1.35 7.857z"
                          />
                        </svg>
                        <span className="ml-1 text-sm text-gray-300">
                          {destination.rating}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">À partir de</p>
                      <p className="text-xl font-bold text-white">
                        {destination.price} €
                      </p>
                    </div>
                  </div>
                  
                  <button className="btn-outline mt-4 w-full">
                    Voir le séjour
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/destinations" className="btn-primary">
              Explorer toutes les destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-fairway-200 md:text-4xl">
              Une expérience de réservation exceptionnelle
            </h2>
            <p className="mt-4 text-gray-300">
              Golf Pass révolutionne la façon dont vous réservez vos séjours golf
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🔍",
                title: "Recherche avancée",
                description: "Filtres multicritères pour trouver le séjour parfait selon vos préférences et votre budget.",
              },
              {
                icon: "💳",
                title: "Paiement sécurisé",
                description: "Réservez en toute confiance avec notre système de paiement sécurisé et notre option de split payment.",
              },
              {
                icon: "🤖",
                title: "Recommandations IA",
                description: "Notre intelligence artificielle vous suggère des séjours personnalisés selon votre profil de golfeur.",
              },
              {
                icon: "🔮",
                title: "AR Preview",
                description: "Visualisez le trou signature en réalité augmentée avant de réserver votre séjour.",
              },
              {
                icon: "👑",
                title: "Abonnement Premium",
                description: "Accédez à des offres exclusives et bénéficiez d'avantages VIP avec notre abonnement Premium.",
              },
              {
                icon: "💬",
                title: "Messagerie sécurisée",
                description: "Communiquez directement avec les vendeurs pour personnaliser votre séjour selon vos besoins.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fairway-500 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-dark-blue-950 to-dark-blue-900 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Ce que disent nos golfeurs
            </h2>
            <p className="mt-4 text-gray-300">
              Découvrez les expériences vécues par notre communauté de passionnés
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Marc Dupont",
                role: "Golfeur Luxe",
                image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                comment: "Golf Pass a transformé ma façon de planifier mes séjours golf. Le service VIP et les parcours sélectionnés sont vraiment exceptionnels.",
                rating: 5,
              },
              {
                name: "Claire Martin",
                role: "CEO & Golfeuse",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                comment: "J'ai organisé un incentive golf pour mon équipe en quelques clics. Le service client a été irréprochable et l'expérience a dépassé nos attentes.",
                rating: 5,
              },
              {
                name: "Lucas Petit",
                role: "Golfeur Passionné",
                image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80",
                comment: "Les recommandations IA sont bluffantes ! J'ai découvert des parcours incroyables que je n'aurais jamais trouvés autrement. Le split payment entre amis est un vrai plus.",
                rating: 4,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="glass-card flex flex-col"
              >
                <div className="mb-4 flex items-center">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="flex-1 text-gray-300">"{testimonial.comment}"</p>
                
                <div className="mt-4 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400"
                          : "text-gray-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.11l7.871-1.143L10 0l2.542 5.967 7.871 1.143-5.693 5.325 1.35 7.857z"
                      />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Golf course"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark-blue-900/80" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Prêt à vivre l'expérience Golf Pass ?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Rejoignez notre communauté de golfeurs passionnés et réservez votre prochain séjour golf d'exception dès aujourd'hui.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/inscription" className="btn-primary text-lg">
              Créer un compte
            </Link>
            <Link href="/destinations" className="btn-outline text-lg">
              Explorer les séjours
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-dark-blue-950 py-16">
        <div className="container mx-auto px-4">
          <div className="glass-card mx-auto max-w-4xl">
            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-white">
                Restez informé
              </h3>
              <p className="mt-2 text-gray-300">
                Inscrivez-vous à notre newsletter pour recevoir nos meilleures offres et actualités
              </p>
            </div>
            
            <form className="mt-6 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="input flex-1"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                S'inscrire
              </button>
            </form>
            
            <p className="mt-4 text-center text-xs text-gray-400">
              En vous inscrivant, vous acceptez notre politique de confidentialité et nos conditions d'utilisation.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
