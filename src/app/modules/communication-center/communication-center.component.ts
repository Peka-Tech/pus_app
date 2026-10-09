
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
export type CommunicationSection = | 'messages' | 'notifications' | 'information';
export interface CommunicationUserI {id: string;name: string;imageUrl?: string}

export interface CommunicationMessageI {
  id: string;
  sender: CommunicationUserI;
  content: string;
  createdAt: string | Date;
  read?: boolean;
  mine?: boolean;
}
export interface CommunicationNotificationI {
  id: string;
  title: string;
  message: string;
  createdAt: string | Date;
  icon?: string;
  severity?:
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
  read?: boolean;
}
export interface CommunicationInformationI {
  id: string;
  title: string;
  message: string;
  createdAt?: string | Date;
  icon?: string;
}
export interface CommunicationSendEventI {
  content: string;
}

@Component({
  selector: 'pus-communication-center',
  standalone: false,
  templateUrl: './communication-center.component.html',
  styleUrl: './communication-center.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommunicationCenterComponent {
  @Input()
  visible = false;

  @Input()
  activeSection:
    CommunicationSection = 'messages';

  @Input()
  messages:
    readonly CommunicationMessageI[] = [];

  @Input()
  notifications:
    readonly CommunicationNotificationI[] = [];

  @Input()
  information:
    readonly CommunicationInformationI[] = [];

  @Input()
  sending = false;

  @Output()
  readonly visibleChange =
    new EventEmitter<boolean>();

  @Output()
  readonly activeSectionChange =
    new EventEmitter<CommunicationSection>();

  @Output()
  readonly messageSend =
    new EventEmitter<CommunicationSendEventI>();

  @Output()
  readonly notificationClick =
    new EventEmitter<CommunicationNotificationI>();

  @Output()
  readonly markAllNotificationsRead =
    new EventEmitter<void>();

  draft = '';

  get unreadMessages(): number {
    return this.messages.filter(
      message => message.read !== true
    ).length;
  }

  get unreadNotifications(): number {
    return this.notifications.filter(
      notification =>
        notification.read !== true
    ).length;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) {
      this.close();
    }
  }

  setSection(
    section: CommunicationSection
  ): void {
    if (section === this.activeSection) {
      return;
    }

    this.activeSection = section;
    this.activeSectionChange.emit(section);
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  sendMessage(): void {
    if (this.sending) {
      return;
    }

    const content = this.draft.trim();

    if (!content) {
      return;
    }

    this.messageSend.emit({ content });
    this.draft = '';
  }

  onMessageKeydown(
    event: KeyboardEvent
  ): void {
    if (
      event.key !== 'Enter' ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    this.sendMessage();
  }

  openNotification(
    notification:
      CommunicationNotificationI
  ): void {
    this.notificationClick.emit(
      notification
    );
  }
}