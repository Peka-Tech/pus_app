import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('émet le clic sur le profil', () => {
  component.profile = {
    id: 'current-user',
    name: 'Jean Peka',
    subtitle: 'Administrateur',
    status: 'online'
  };

  spyOn(component.profileClick, 'emit');

  component.openProfile();

  expect(
    component.profileClick.emit
  ).toHaveBeenCalledWith(
    component.profile
  );
});

});
