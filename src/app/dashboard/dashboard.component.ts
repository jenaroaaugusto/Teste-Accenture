import { Component, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Inject } from '@angular/core';
import {AfterViewInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
  data: string;
}

export interface DadosTeste{
    data:string;
    demanda: number;
    capacidade:number;
    atendimentop:number;
    atendimentor:number;
    desvio:number;
}

/** Constants used to fill up our data base. */
const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray'
];
const NAMES: string[] = [
  'Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack', 'Charlotte', 'Theodore', 'Isla', 'Oliver',
  'Isabella', 'Jasper', 'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'
];
const DATA: string[] = [
  '01-08-2021','02-08-2021' , '03-08-2021', '04-08-2021', '05-08-2021', '06-08-2021', '07-08-2021', '08-08-2021', '09-08-2021', '10-08-2021',
  '11-08-2021', '12-08-2021', '13-08-2021', '13-08-2021', '15-08-2021', '16-08-2021', '17-08-2021', '18-08-2021', '19-08-2021'
];

const ELEMENT_DATA: DadosTeste[] = [
  {data: '01-08-2021', demanda: 1.0079, capacidade: 1.0079, atendimentop:50,atendimentor:10,desvio:40,},
  {data: '02-08-2021', demanda: 4.0026, capacidade: 5.0000,atendimentop:29,atendimentor:15,desvio:40},
  {data: '03-08-2021', demanda: 6.941, capacidade: 8.0000,atendimentop:60,atendimentor:10,desvio:40},
  {data: '04-08-2021', demanda: 9.0122, capacidade: 9.1500,atendimentop:50,atendimentor:10,desvio:40},
  {data: '05-08-2021', demanda: 10.811, capacidade: 12.0008,atendimentop:90,atendimentor:90,desvio:0},
  {data: '06-08-2021', demanda: 12.0107, capacidade: 15.0000,atendimentop:25,atendimentor:30,desvio:5},
  {data: '07-08-2021', demanda: 14.0067, capacidade: 10.000,atendimentop:60,atendimentor:58,desvio:2},
  {data: '08-08-2021', demanda: 15.9994, capacidade:25.0000,atendimentop:18,atendimentor:36,desvio:18},
  {data: '09-08-2021', demanda: 18.9984, capacidade: 20.0000,atendimentop:100,atendimentor:60,desvio:40},
  {data: '10-08-2021', demanda: 20.1797, capacidade: 19.0000,atendimentop:10,atendimentor:100,desvio:90},
];


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = [ 'data','demanda', 'capacidade','atendimentop', 'atendimentor','desvio'];
  dataSource: MatTableDataSource<any>;
  panelOpenState = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private chart: am4charts.XYChart;
  

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {

    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewInit() {
    console.log("Paginator" + this.paginator)
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Chart code goes in here
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chart = am4core.create("chartdiv", am4charts.XYChart);
      chart.exporting.menu = new am4core.ExportMenu();
      chart.paddingRight = 20;
      // Add percent sign to all numbers
      chart.numberFormatter.numberFormat = "#.#'%'";
      chart.data = ELEMENT_DATA;

      /* Create axes */
  
      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "data";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 30;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = "Diferença";
      // valueAxis.title.fontWeight = 800;

      // Create series
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = "capacidade";
      series.dataFields.categoryX = "data";
      series.clustered = false;
      series.tooltipText = "Capacidade {categoryX} : [bold]{valueY}[/]";

      let series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.dataFields.valueY = "atendimentor";
      series2.dataFields.categoryX = "data";
      series2.clustered = false;
      series2.columns.template.width = am4core.percent(50);
      series2.tooltipText = "Atendimento Realizado {categoryX} : [bold]{valueY}[/]";

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.lineX.disabled = true;
      chart.cursor.lineY.disabled = true;

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series2);
      chart.scrollbarX = scrollbarX;

      this.chart = chart;
    });
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  ngOnInit(): void {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  

  
}
function createNewUser(id: number): UserData {
  const name = NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
      NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';
  // const data =DATA[];
  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    color: COLORS[Math.round(Math.random() * (COLORS.length - 1))],
    data: DATA[ Math.round(Math.random() * (DATA.length - 1)) ]
  };
}
