import notifee, {
  AndroidImportance,
  TriggerType,
} from '@notifee/react-native';

export const CHANNEL_ID = 'ticktick_reminders';
export const FOCUS_CHANNEL_ID = 'ticktick_focus';

export const setupNotifications = async (): Promise<void> => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Task Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
  await notifee.createChannel({
    id: FOCUS_CHANNEL_ID,
    name: 'Focus Timer',
    importance: AndroidImportance.DEFAULT,
  });
};

export const scheduleTaskReminder = async (
  taskId: string,
  title: string,
  dueDate: number,
  dueTime: number | null,
  offsetMinutes: number,
): Promise<void> => {
  const triggerTime = (dueTime || dueDate) - offsetMinutes * 60 * 1000;
  if (triggerTime <= Date.now()) return;

  await notifee.createTriggerNotification(
    {
      id: `task_${taskId}_${offsetMinutes}`,
      title: 'Task Reminder',
      body: title,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_notification',
        pressAction: {id: 'default'},
      },
      data: {taskId},
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime,
    },
  );
};

export const cancelTaskReminders = async (taskId: string): Promise<void> => {
  const notifications = await notifee.getTriggerNotifications();
  for (const n of notifications) {
    if (n.notification?.data?.taskId === taskId) {
      await notifee.cancelTriggerNotification(n.notification.id!);
    }
  }
};

export const scheduleAllReminders = async (task: any): Promise<void> => {
  if (!task.dueDate || !task.reminderOffsets) return;
  await cancelTaskReminders(task.id);
  const offsets: number[] = JSON.parse(task.reminderOffsets || '[]');
  for (const offset of offsets) {
    await scheduleTaskReminder(task.id, task.title, task.dueDate, task.dueTime, offset);
  }
};

export const showFocusCompleteNotification = async (
  sessionType: string,
): Promise<void> => {
  const messages: Record<string, {title: string; body: string}> = {
    pomodoro: {title: 'Focus session complete!', body: "Time for a break. You're doing great!"},
    short_break: {title: 'Break over!', body: 'Ready to focus again?'},
    long_break: {title: 'Long break over!', body: "Let's get back to work!"},
  };
  const msg = messages[sessionType] || messages.pomodoro;
  await notifee.displayNotification({
    title: msg.title,
    body: msg.body,
    android: {channelId: FOCUS_CHANNEL_ID, smallIcon: 'ic_notification'},
  });
};
