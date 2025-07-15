import { Component } from '@angular/core';

interface TransactionStat {
  time: string;
  title?: string;
  subtext?: string;
  link?: string;
  color: string; // e.g., 'success', 'warning', etc.
}

@Component({
  selector: 'app-latest-orders',
  templateUrl: './latest-orders.component.html',
  styleUrls: ['./latest-orders.component.scss']
})
export class LatestOrdersComponent {
  stats: TransactionStat[] = [
    {
      time: '09:30 AM',
      title: 'Order #ML-3467 received',
      subtext: 'Payment pending',
      link: '#',
      color: 'primary'
    },
    {
      time: '10:15 AM',
      title: 'Order #ML-3468 shipped',
      subtext: 'Via FedEx Express',
      link: '#',
      color: 'success'
    },
    {
      time: '11:45 AM',
      title: 'Order #ML-3469 cancelled',
      subtext: 'Customer refund initiated',
      link: '#',
      color: 'error'
    },
    {
      time: '01:20 PM',
      title: 'Order #ML-3470 completed',
      subtext: 'Delivered to client',
      link: '#',
      color: 'info'
    }
  ];
}
