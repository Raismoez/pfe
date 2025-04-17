import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { trigger, transition, style, animate } from '@angular/animations';

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
  };
}

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [RouterLink, CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './offre-list.component.html',
  styleUrls: ['./offre-list.component.css'],
 
})
export class OffreListComponent implements OnInit {
  offers: Offer[] = [
    {
      id: 1,
      title: 'FAST LINK Guichet Unique',
      description: 'Service Internet très haut débit avec une connexion stable et garantie',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
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
        price: 'À partir de 79€/mois'
      }
    },
    {
      id: 2,
      title: 'Rapido PRO',
      description: 'Solution professionnelle haute performance jusqu\'à 100 Mbps',
      imageUrl: 'https://eshop.tunisietelecom.tn/entreprise/211-home_default/rapido-pro.jpg',
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
        price: 'À partir de 129€/mois'
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
        price: 'À partir de 199€/mois'
      }
    }
  ];

  ngOnInit() {
    // Ajouter des animations lors du chargement de la page
    setTimeout(() => {
      const cards = document.querySelectorAll('.offer-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('visible');
        }, index * 150);
      });
    }, 100);
  }
}