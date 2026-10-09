import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules PrimeNG
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DatePickerModule } from 'primeng/datepicker';
import { ListboxModule } from 'primeng/listbox';
import { OrderListModule } from 'primeng/orderlist';
import { DataViewModule } from 'primeng/dataview';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { KnobModule } from 'primeng/knob';
import { ChipModule } from 'primeng/chip';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputMaskModule } from 'primeng/inputmask';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabsModule } from 'primeng/tabs';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TreeSelectModule } from 'primeng/treeselect'; 
import { RatingModule } from 'primeng/rating';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { FormsModule } from '@angular/forms'; 

const primeModules = [
  CommonModule,
  FormsModule,
  TableModule,
  TagModule,
  DrawerModule,
  AvatarModule,
  TooltipModule,
  AccordionModule,
  PopoverModule,
  DividerModule,
  SplitterModule,
  BadgeModule,
  IconFieldModule,
  InputIconModule,
  ProgressBarModule,
  CardModule,
  ButtonModule,
  InputTextModule,
  InputNumberModule,
  ToastModule,
  DialogModule,
  TieredMenuModule,
  AutoCompleteModule,
  CascadeSelectModule,
  ColorPickerModule,
  TreeSelectModule, 
  RatingModule,
  ProgressSpinnerModule,
  KnobModule,
  ChipModule,
  ChartModule,
  SelectButtonModule,
  RadioButtonModule,
  InputMaskModule,
  TextareaModule,
  SplitButtonModule,
  SelectModule,
  ToggleSwitchModule,
  CheckboxModule,
  SliderModule,
  PasswordModule,
  MessageModule,
  ConfirmDialogModule,
  SkeletonModule,
  PanelModule,
  TimelineModule,
  DataViewModule,
  OrderListModule,
  ListboxModule,
  DatePickerModule,
  ToggleButtonModule,
  ScrollPanelModule,
  TabsModule,
  MenuModule,
  MultiSelectModule
];

@NgModule({
  imports: primeModules,
  exports: primeModules
})
export class PrimerModule {}