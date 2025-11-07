import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAuthorization } from './authorization/add-authorization/add-authorization';
import { AuthorizationDetail } from './authorization/authorization-detail/authorization-detail';
import { Authorization } from './authorization/authorization';
import { Refund } from './refund/refund';
import { AddRefund } from './refund/add-refund/add-refund';
import { RefundDetail } from './refund/refund-detail/refund-detail';
import { DigitalId } from './dependent-affiliates/digital-id/digital-id';
import { HealthProvider } from './health-provider/health-provider';
import { Consume } from './consume/consume';
import { Documentation } from './documentation/documentation';
import { Payment } from './payment/payment';
import { PaymentDetail } from './payment/payment-detail/payment-detail';
import { AddPayment } from './payment/add-payment/add-payment';
import { Reports } from './reports/reports';
import { Contact } from './contact/contact';

const routes: Routes = [
    { path: 'add-authorization', component: AddAuthorization },
    { path: 'authorization-detail', component: AuthorizationDetail },
    { path: 'authorization', component: Authorization },
    { path: 'refund', component: Refund },
    { path: 'add-refund', component: AddRefund },
    { path: 'refund-detail', component: RefundDetail },
    { path: 'dependent', component: DigitalId },
    { path: 'health-provider', component: HealthProvider },
    { path: 'medicine', component: Consume },
    { path: 'documentation', component: Documentation },
    { path: 'payment-history', component: Payment },
    { path: 'payment-detail', component: PaymentDetail },
    { path: 'add-payment', component: AddPayment },
    { path: 'report', component: Reports },
    { path: 'documentation', component: Documentation },
    { path: 'contact', component: Contact }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}
