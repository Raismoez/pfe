import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Offer {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  popular?: boolean;
  hasPromo?: boolean;
  details: {
    objectives: string[];
    description: string;
    features: string[];
    price?: string;
    pricing?: {
      paymentOptions: string[];
    };
    subscription?: {
      channels: string[];
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private offersSubject = new BehaviorSubject<Offer[]>([
    {
      id: 1,
      title: 'FAST LINK Guichet Unique',
      description: 'Service Internet très haut débit avec une connexion stable et garantie',
      imageUrl: 'https://topnet.tn/u_p_l_d/offres/smart-lik_15_0252452001717495224665ee5b83da73.png',
      popular: true,
      hasPromo: true,
      details: {
        objectives: [
          'Offrir aux clients une connexion très haut débit stable et garantie à des tarifs attractifs',
          'Améliorer l\'expérience client avec un service premium',
          'Contrecarrer les offres de la concurrence avec des avantages exclusifs'
        ],
        description: 'La relance de l\'offre Fast Link consiste à proposer une tarification avantageuse pour les nouveaux clients uniquement pour les accès FO Internet avec des débits supérieurs ou égal à 30M. Notre engagement est de fournir une connexion stable et performante pour répondre à tous vos besoins numériques.',
        features: [
          'Débit jusqu\'à 100 Mbps symétrique',
          'Installation rapide sous 48h',
          'Support technique dédié 24/7',
          'Garantie de service (SLA)'
        ],
        price: 'À partir de 79€/mois',
        pricing: {
          paymentOptions: [
            'Paiement échelonné sur 12 mois ou 24 mois ou 36 mois',
            'Paiement au comptant',
            'À partir de 79€/mois'
          ]
        },
        subscription: {
          channels: [
            'La Direction Marché Entreprises',
            'Les Espaces Entreprises',
            'Réseaux de distribution indirecte'
          ]
        }
      }
    },
    {
      id: 2,
      title: 'Rapido PRO',
      description: 'Solution professionnelle haute performance jusqu\'à 100 Mbps',
      imageUrl: 'https://www.topnet.tn/u_p_l_d/offres/smart-rapido-pro_86_0710448001699976624655395b0ad77b.png',
      hasPromo: false,
      details: {
        objectives: [
          'Fournir une connexion professionnelle stable et ultra-rapide',
          'Garantir un support dédié 24/7',
          'Offrir des solutions personnalisées pour chaque entreprise'
        ],
        description: 'Service Internet professionnel haute performance avec garantie de service et support prioritaire. Rapido PRO est conçu pour les entreprises exigeantes qui nécessitent une connexion fiable et rapide pour leurs activités quotidiennes.',
        features: [
          'Débit garanti jusqu\'à 100 Mbps',
          'Adresse IP fixe incluse',
          'Support premium avec temps de réponse garanti',
          'Options de sécurité avancées'
        ],
        price: 'À partir de 129€/mois',
        pricing: {
          paymentOptions: [
            'Paiement échelonné sur 12 mois ou 24 mois ou 36 mois',
            'Paiement au comptant'
          ]
        },
        subscription: {
          channels: [
            'La Direction Marché Entreprises',
            'Les Espaces Entreprises',
            'Réseaux de distribution indirecte'
          ]
        }
      }
    },
    {
      id: 3,
      title: 'VSAT Enterprise',
      description: 'Connectivité satellite pour les zones reculées',
      imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=1200',
      popular: false,
      hasPromo: true,
      details: {
        objectives: [
          'Assurer une couverture Internet dans les zones non desservies',
          'Fournir une solution de backup fiable',
          'Garantir une connexion stable peu importe la localisation'
        ],
        description: 'Solution de connectivité par satellite idéale pour les entreprises situées dans des zones non couvertes par la fibre optique. VSAT Enterprise garantit une connexion stable et performante partout en Tunisie.',
        features: [
          'Couverture nationale garantie',
          'Installation professionnelle incluse',
          'Idéal pour les sites isolés',
          'Solution de secours fiable'
        ],
        price: 'À partir de 199€/mois',
        pricing: {
          paymentOptions: [
            'Paiement échelonné sur 12 mois ou 24 mois ou 36 mois',
            'Paiement au comptant'
          ]
        },
        subscription: {
          channels: [
            'La Direction Marché Entreprises',
            'Les Espaces Entreprises',
            'Réseaux de distribution indirecte'
          ]
        }
      }
    }
  ]);

  offers$ = this.offersSubject.asObservable();

  constructor() { }

  getOffers(): Observable<Offer[]> {
    return this.offers$;
  }

  getOfferById(id: number): Offer | undefined {
    return this.offersSubject.value.find(offer => offer.id === id);
  }

  addOffer(offer: Omit<Offer, 'id'>): void {
    const currentOffers = this.offersSubject.value;
    const newId = currentOffers.length > 0 
      ? Math.max(...currentOffers.map(o => o.id)) + 1 
      : 1;
    
    const newOffer: Offer = {
      ...offer,
      id: newId
    };
    
    this.offersSubject.next([...currentOffers, newOffer]);
  }

  updateOffer(updatedOffer: Offer): void {
    const currentOffers = this.offersSubject.value;
    const index = currentOffers.findIndex(offer => offer.id === updatedOffer.id);
    
    if (index !== -1) {
      const newOffers = [...currentOffers];
      newOffers[index] = updatedOffer;
      this.offersSubject.next(newOffers);
    }
  }

  deleteOffer(id: number): void {
    const currentOffers = this.offersSubject.value;
    this.offersSubject.next(currentOffers.filter(offer => offer.id !== id));
  }
}