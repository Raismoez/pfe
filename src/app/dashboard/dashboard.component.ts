import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { SidebarComponent } from "../components/sidebar/sidebar.component";
import { HeaderComponent } from "../components/header/header.component";
import { DashboardService } from '../Service/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, HeaderComponent]
})
export class DashboardComponent implements OnInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('manufacturerChart') manufacturerChartRef!: ElementRef;
  @ViewChild('stockEvolutionChart') stockEvolutionChartRef!: ElementRef;
  @ViewChild('entriesChart') entriesChartRef!: ElementRef;
  @ViewChild('exitsChart') exitsChartRef!: ElementRef;

  // Metrics
  totalArticles: number = 0;
  totalQuantity: number = 0;
  lowStockItemsCount: number = 0;
  expiringItemsCount: number = 0;
  totalEntries: number = 0;
  totalExits: number = 0;

  // Charts
  categoryChart: Chart | null = null;
  manufacturerChart: Chart | null = null;
  stockEvolutionChart: Chart | null = null;
  entriesChart: Chart | null = null;
  exitsChart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardMetrics();
    this.loadChartData();
  }

  ngAfterViewInit() {
    // Charts will be created after data is loaded
  }

  loadDashboardMetrics() {
    this.dashboardService.getDashboardMetrics().subscribe(metrics => {
      this.totalArticles = metrics.totalArticles;
      this.totalQuantity = metrics.totalQuantity;
      this.lowStockItemsCount = metrics.lowStockItemsCount;
      this.expiringItemsCount = metrics.expiringItemsCount;
      this.totalEntries = metrics.totalEntries;
      this.totalExits = metrics.totalExits;
    });
  }

  loadChartData() {
    // Load Category Distribution
    this.dashboardService.getCategoryDistribution().subscribe(categoryData => {
      const chartData = {
        labels: Object.keys(categoryData),
        data: Object.values(categoryData)
      };
      this.createCategoryChart(chartData);
    });

    // Load Manufacturer Distribution
    this.dashboardService.getManufacturerDistribution().subscribe(manufacturerData => {
      const chartData = {
        labels: Object.keys(manufacturerData),
        data: Object.values(manufacturerData)
      };
      this.createManufacturerChart(chartData);
    });

    // Load Stock Evolution
    this.dashboardService.getStockEvolution().subscribe(stockEvolutionData => {
      this.createStockEvolutionChart(stockEvolutionData);
    });

    // Load Entries and Exits Evolution
    this.dashboardService.getEntriesAndExitsEvolution().subscribe(entriesExitsData => {
      this.createEntriesAndExitsCharts(entriesExitsData);
    });
  }

  createCategoryChart(categoryData: {labels: string[], data: number[]}) {
    if (this.categoryChart) this.categoryChart.destroy();

    const categoryCtx = this.categoryChartRef.nativeElement.getContext('2d');
    this.categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'blue'
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
  }

  createManufacturerChart(manufacturerData: {labels: string[], data: number[]}) {
    if (this.manufacturerChart) this.manufacturerChart.destroy();

    const manufacturerCtx = this.manufacturerChartRef.nativeElement.getContext('2d');
    this.manufacturerChart = new Chart(manufacturerCtx, {
      type: 'bar',
      data: {
        labels: manufacturerData.labels,
        datasets: [{
          label: 'Quantité par Constructeur',
          data: manufacturerData.data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(75, 192, 192, 0.7)'
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

  
createStockEvolutionChart(stockEvolutionData: any[]) {
  
  if (this.stockEvolutionChart) this.stockEvolutionChart.destroy();

  // Formatter les mois
  const formattedData = stockEvolutionData.map(item => ({
    month: this.formatMonthLabel(item.month),
    totalQuantity: item.totalQuantity
  }));

  const stockEvolutionCtx = this.stockEvolutionChartRef.nativeElement.getContext('2d');
  this.stockEvolutionChart = new Chart(stockEvolutionCtx, {
    type: 'line',
    data: {
      labels: formattedData.map(item => item.month),
      datasets: [{
        label: 'Évolution du Stock Total',
        data: formattedData.map(item => item.totalQuantity),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Évolution du Stock Total',
          font: { size: 16, weight: 'bold' }
        },
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Quantité Totale'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Période'
          }
        }
      }
    }
  });
}

// Méthode pour formater les étiquettes de mois
formatMonthLabel(monthCode: string): string {
  const [year, month] = monthCode.split('-');
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  // Converti le mois en nombre (soustrait 1 car les tableaux commencent à 0)
  const monthIndex = parseInt(month) - 1;
  
  return `${monthNames[monthIndex]} ${year}`;
}

  createEntriesAndExitsCharts(entriesExitsData: any[]) {
    if (this.entriesChart) this.entriesChart.destroy();
    if (this.exitsChart) this.exitsChart.destroy();

    // Entries Bar Chart
    const entriesCtx = this.entriesChartRef.nativeElement.getContext('2d');
    this.entriesChart = new Chart(entriesCtx, {
      type: 'bar',
      data: {
        labels: entriesExitsData.map(item => item.month),
        datasets: [{
          label: 'Entrées de Stock',
          data: entriesExitsData.map(item => item.totalEntries),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Évolution des Entrées de Stock',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantité'
            }
          }
        }
      }
    });

    // Exits Bar Chart
    const exitsCtx = this.exitsChartRef.nativeElement.getContext('2d');
    this.exitsChart = new Chart(exitsCtx, {
      type: 'bar',
      data: {
        labels: entriesExitsData.map(item => item.month),
        datasets: [{
          label: 'Sorties de Stock',
          data: entriesExitsData.map(item => item.totalExits),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Évolution des Sorties de Stock',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
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
}