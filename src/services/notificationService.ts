import { getDatabase } from '../db';
import { Q } from '@nozbe/watermelondb';
import type { AppNotification } from '../types';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

export class NotificationService {
  private db = getDatabase();

  // Запланировать уведомление
  async scheduleNotification(notification: Omit<AppNotification, 'id'>) {
    await this.db.write(async () => {
      await this.db.get('notifications').create(model => {
        // @ts-ignore
        model.type = notification.type;
        // @ts-ignore
        model.title = notification.title;
        // @ts-ignore
        model.message = notification.message;
        // @ts-ignore
        model.scheduled_for = new Date(notification.scheduled_for).getTime();
        // @ts-ignore
        model.delivered = false;
        // @ts-ignore
        model.data = notification.data ? JSON.stringify(notification.data) : null;
      });
    });
  }

  // Получить предстоящие уведомления
  async getPendingNotifications(): Promise<AppNotification[]> {
    const now = Date.now();
    const notifications = await this.db.get('notifications').query(
      Q.where('scheduled_for', Q.lt(now)),
      Q.where('delivered', false)
    ).fetch();

    return notifications.map(n => ({
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      scheduled_for: new Date(n.scheduled_for).toISOString(),
      delivered: n.delivered,
      data: n.data ? JSON.parse(n.data) : undefined,
    }));
  }

  // Отметить уведомление как доставленное
  async markAsDelivered(notificationId: string) {
    await this.db.write(async () => {
      const notification = await this.db.get('notifications').find(notificationId);
      // @ts-ignore
      await notification.update(n => {
        // @ts-ignore
        n.delivered = true;
      });
    });
  }

  // Создать серию ежедневных напоминаний
  async scheduleDailyReminders(hour: number = 12, days: number = 7) {
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const reminderTime = new Date(now);
      reminderTime.setDate(now.getDate() + i);
      reminderTime.setHours(hour, 0, 0, 0);

      if (reminderTime > now) {
        await this.scheduleNotification({
          type: 'daily_login_bonus',
          title: '💰 Ежедневный бонус ждет!',
          message: `Зайдите в приложение сегодня, чтобы получить бонус и поддержать серию в ${i + 1} дней!`,
          scheduled_for: reminderTime.toISOString(),
          delivered: false,
        });
      }
    }
  }

  // Создать уведомление о достижении серии
  async scheduleStreakReminder(hours: number = 12) {
    const reminderTime = new Date();
    reminderTime.setHours(hours, 0, 0, 0);

    if (reminderTime <= new Date()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    await this.scheduleNotification({
      type: 'streak_reminder',
      title: '🔥 Не прервите серию!',
      message: 'Зайдите в приложение, чтобы сохранить текущую серию и получить бонус!',
      scheduled_for: reminderTime.toISOString(),
      delivered: false,
    });
  }

  // Проверить и показать уведомления
  async checkAndShowNotifications() {
    try {
      const pendingNotifications = await this.getPendingNotifications();

      for (const notification of pendingNotifications) {
        // Check if notifications are enabled in settings
        const settings = await this.db.get('settings').query().fetch();
        const notificationsEnabled = settings[0]?.notifications_enabled ?? true;

        if (!notificationsEnabled) {
          console.log('Notifications are disabled, skipping notification');
          await this.markAsDelivered(notification.id);
          continue;
        }

        // Show the notification using notifee
        await this.displayNotification(notification);

        // Mark as delivered
        await this.markAsDelivered(notification.id);
      }
    } catch (error) {
      console.error('Error checking and showing notifications:', error);
    }
  }

  // Display a notification using notifee
  private async displayNotification(notification: AppNotification) {
    try {
      // Create notification channel for Android
      const channelId = await notifee.createChannel({
        id: 'achievements',
        name: 'Achievements',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      // Display the notification
      await notifee.displayNotification({
        title: notification.title,
        body: notification.message,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      });

      console.log('Notification displayed:', notification.title);
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }

  // Создать уведомление о доступной награде
  async createRewardNotification(rewardId: string, rewardTitle: string) {
    await this.scheduleNotification({
      type: 'reward_available',
      title: '🎁 Новая награда доступна!',
      message: `Получите награду "${rewardTitle}" прямо сейчас!`,
      scheduled_for: new Date().toISOString(),
      delivered: false,
      data: { rewardId },
    });
  }

  // Создать уведомление о разблокировке достижения
  async createAchievementUnlockNotification(achievementName: string, points: number) {
    await this.scheduleNotification({
      type: 'achievement_unlock',
      title: '🏆 Новое достижение!',
      message: `Вы разблокировали "${achievementName}" и заработали ${points} очков!`,
      scheduled_for: new Date().toISOString(),
      delivered: false,
    });
  }

  // Очистить старые доставленные уведомления
  async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    await this.db.write(async () => {
      const oldNotifications = await this.db.get('notifications').query(
        Q.where('delivered', true),
        Q.where('scheduled_for', Q.lt(cutoffDate))
      ).fetch();

      for (const notification of oldNotifications) {
        await notification.destroyPermanently();
      }
    });
  }
}

export const notificationService = new NotificationService();
