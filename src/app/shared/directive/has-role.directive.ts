import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  @Input() set hasRole(roles: string[]) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user?.role;
    if (roles.includes(userRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}
}
