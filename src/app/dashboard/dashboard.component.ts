import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";

interface StockItem {
  article: string;
  constructeur: string;
  categorie: string;
  date: string;
  quantite: number;
  endOfSale: string;
  endOfSupport: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent]
})
export class DashboardComponent implements OnInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('manufacturerChart') manufacturerChartRef!: ElementRef;

  stockData: StockItem[] = [
    { article: 'NIM-4G-LTE-GA', constructeur: 'CISCO', categorie: 'Carte NIM 4G', date: '1/1/2022', quantite: 100, endOfSale: '31-Oct-23', endOfSupport: '31-Oct-28' },
    { article: 'NIM-1GE-CU-SFP', constructeur: 'CISCO', categorie: 'Carte NIM FO', date: '1/1/2022', quantite: 90, endOfSale: '31-Oct-23', endOfSupport: '31-Oct-28' },
    { article: 'Carte NIM FXS 4ports', constructeur: 'CISCO', categorie: 'Carte NIM FXS', date: '1/1/2022', quantite: 70, endOfSale: '31-Oct-23', endOfSupport: '31-Oct-28' },
    { article: 'NIM-VDSL2/ADSL2/2+', constructeur: 'CISCO', categorie: 'Carte NIM VDSL', date: '1/1/2022', quantite: 50, endOfSale: '31-Oct-23', endOfSupport: '31-Oct-28' },
    { article: 'Jarretière optique FC/LC 2m duplex', constructeur: 'CISCO', categorie: 'Jarretière optique', date: '1/5/2022', quantite: 100, endOfSale: 'Not announced', endOfSupport: 'Not announced' },
    { article: 'Jarretière optique FC/LC 2m SM', constructeur: 'CISCO', categorie: 'Jarretière optique', date: '1/5/2022', quantite: 150, endOfSale: 'Not announced', endOfSupport: 'Not announced' },
    { article: 'Jarretière optique LC/LC 2m duplex', constructeur: 'CISCO', categorie: 'Jarretière optique', date: '1/5/2022', quantite: 80, endOfSale: 'Not announced', endOfSupport: 'Not announced' },
    { article: 'Jarretière optique LCPC/LCPC 2m SM', constructeur: 'CISCO', categorie: 'Jarretière optique', date: '1/5/2022', quantite: 120, endOfSale: 'Not announced', endOfSupport: 'Not announced' },
    { article: 'GLC-BX-D', constructeur: 'CISCO', categorie: 'Module SFP', date: '1/10/2022', quantite: 5, endOfSale: '31-Jan-22', endOfSupport: '31-Jan-27' },
    { article: 'GLC-BX-U', constructeur: 'CISCO', categorie: 'Module SFP', date: '1/10/2022', quantite: 0, endOfSale: '31-Jan-22', endOfSupport: '31-Jan-27' },
    { article: 'C1117-4P', constructeur: 'CISCO', categorie: 'Routeur', date: '1/15/2022', quantite: 180, endOfSale: '31-Oct-27', endOfSupport: '31-Oct-32' },
    { article: 'AR651', constructeur: 'Huawei', categorie: 'Routeur', date: '1/26/2022', quantite: 100, endOfSale: '31-Dec-23', endOfSupport: '31-Dec-28' },
    { article: 'FortiGate 80F', constructeur: 'Fortinet', categorie: 'Routeur', date: '1/30/2022', quantite: 200, endOfSale: 'Not announced', endOfSupport: 'Not announced' }
  ];

  filteredStockData: StockItem[] = [];
  totalArticles: number = 0;
  totalQuantity: number = 0;
  lowStockItemsCount: number = 0;
  expiringItemsCount: number = 0;

  categoryChart: Chart | null = null;
  manufacturerChart: Chart | null = null;

  constructor() {
    this.filteredStockData = [...this.stockData];
  }

  ngOnInit() {
    this.calculateDashboardMetrics();
  }

  ngAfterViewInit() {
    this.createCharts();
  }

  calculateDashboardMetrics() {
    this.totalArticles = this.stockData.length;
    this.totalQuantity = this.getTotalQuantity();
    this.lowStockItemsCount = this.getLowStockItems().length;
    this.expiringItemsCount = this.getExpiringItems().length;
  }

  getTotalQuantity(): number {
    return this.stockData.reduce((total, item) => total + item.quantite, 0);
  }

  createCharts() {
    const categoryData = this.getCategoryData();
    const manufacturerData = this.getManufacturerData();

    // Destroy existing charts if they exist
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.manufacturerChart) {
      this.manufacturerChart.destroy();
    }

    // Category Doughnut Chart
    const categoryCtx = this.categoryChartRef.nativeElement.getContext('2d');
    this.categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',   // Soft Blue
            'rgba(255, 99, 132, 0.8)',   // Soft Pink
            'rgba(75, 192, 192, 0.8)',   // Teal
            'rgba(255, 206, 86, 0.8)',   // Soft Yellow
            'rgba(153, 102, 255, 0.8)',  // Lavender
            'rgba(255, 159, 64, 0.8)',
            'blue'    // Orange
          ],
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribution des Stocks par Catégorie',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'right',
            labels: {
              font: { size: 12 },
              usePointStyle: true,
            }
          }
        }
      }
    });

    // Manufacturer Horizontal Bar Chart
    const manufacturerCtx = this.manufacturerChartRef.nativeElement.getContext('2d');
    this.manufacturerChart = new Chart(manufacturerCtx, {
      type: 'bar',
      data: {
        labels: manufacturerData.labels,
        datasets: [{
          label: 'Quantité par Constructeur',
          data: manufacturerData.data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',   // Blue
            'rgba(255, 99, 132, 0.7)',   // Pink
            'rgba(75, 192, 192, 0.7)'    // Teal
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1,
          borderRadius: 10
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Quantité de Stock par Constructeur',
            font: { size: 16, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantité'
            }
          }
        }
      }
    });
  }

  getCategoryData() {
    const categories: { [key: string]: number } = {};
    this.stockData.forEach(item => {
      categories[item.categorie] = (categories[item.categorie] || 0) + item.quantite;
    });
    return {
      labels: Object.keys(categories),
      data: Object.values(categories)
    };
  }

  getManufacturerData() {
    const manufacturers: { [key: string]: number } = {};
    this.stockData.forEach(item => {
      manufacturers[item.constructeur] = (manufacturers[item.constructeur] || 0) + item.quantite;
    });
    return {
      labels: Object.keys(manufacturers),
      data: Object.values(manufacturers)
    };
  }

  getExpiringItems(): StockItem[] {
    const today = new Date();
    const threemonths = new Date();
    threemonths.setMonth(threemonths.getMonth() + 3);
    
    return this.stockData.filter(item => {
      if (item.endOfSale === 'Not announced') return false;
      const [day, month, year] = item.endOfSale.split('-');
      const endOfSale = new Date(`${month} ${day} ${year}`);
      return endOfSale <= threemonths && endOfSale >= today;
    });
  }

  getLowStockItems(): StockItem[] {
    return this.stockData.filter(item => item.quantite < 20);
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredStockData = this.stockData.filter(item => 
      item.article.toLowerCase().includes(searchTerm) ||
      item.constructeur.toLowerCase().includes(searchTerm) ||
      item.categorie.toLowerCase().includes(searchTerm)
    );
  }

  viewItem(item: StockItem) {
    console.log('Viewing item:', item);
  }

  editItem(item: StockItem) {
    console.log('Editing item:', item);
  }
}