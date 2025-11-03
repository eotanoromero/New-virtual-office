import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { AddAuthorization } from './authorization/add-authorization/add-authorization';
import { AuthorizationDetail } from './authorization/authorization-detail/authorization-detail';
import { Authorization } from './authorization/authorization';
import { Consume } from './consume/consume';
import { Refund } from './refund/refund';
import { AddRefund } from './refund/add-refund/add-refund';
import { RefundDetail } from './refund/refund-detail/refund-detail';
import { DigitalId } from './dependent-affiliates/digital-id/digital-id';
import { HealthProvider } from './health-provider/health-provider';
import { Payment } from './payment/payment';
import { PaymentDetail } from './payment/payment-detail/payment-detail';
import { AddPayment } from './payment/add-payment/add-payment';

export default [
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

    { path: '**', redirectTo: '/notfound' }
] as Routes;
