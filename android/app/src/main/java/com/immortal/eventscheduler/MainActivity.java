package com.immortal.eventscheduler;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static final String ALARM_CHANNEL_ID = "alarm_channel";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createAlarmNotificationChannel();
        checkExactAlarmPermission();
    }

    private void createAlarmNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Alarm Clock & Reminders";
            String description = "High-priority sound and vibration alerts for tasks and schedules";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(ALARM_CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            channel.setLightColor(Color.parseColor("#C5A059"));
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 800});
            channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true);

            Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.beep);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build();
            channel.setSound(soundUri, audioAttributes);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void checkExactAlarmPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null && !alarmManager.canScheduleExactAlarms()) {
                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    intent.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(intent);
                } catch (Exception ignored) {
                }
            }
        }
    }
}
