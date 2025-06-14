package com.safeher;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.SystemClock;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class PowerButtonModule extends ReactContextBaseJavaModule {
    private static final String POWER_BUTTON_EVENT = "PowerButtonTriplePress";
    private static final long TIME_WINDOW_MS = 2000; // 2 seconds window for 3 presses
    private long[] pressTimestamps = new long[3];
    private int pressCount = 0;
    private BroadcastReceiver powerButtonReceiver;

    public PowerButtonModule(ReactApplicationContext reactContext) {
        super(reactContext);
        registerPowerButtonReceiver();
    }

    @Override
    public String getName() {
        return "PowerButton";
    }

    private void registerPowerButtonReceiver() {
        powerButtonReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                long currentTime = SystemClock.elapsedRealtime();
                pressTimestamps[pressCount % 3] = currentTime;
                pressCount++;

                if (pressCount >= 3) {
                    long timeDiff = pressTimestamps[(pressCount - 1) % 3] - pressTimestamps[(pressCount - 3) % 3];
                    if (timeDiff <= TIME_WINDOW_MS) {
                        getReactApplicationContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit(POWER_BUTTON_EVENT, null);
                        pressCount = 0; // Reset count
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        filter.addAction(Intent.ACTION_SCREEN_ON);
        getReactApplicationContext().registerReceiver(powerButtonReceiver, filter);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        if (powerButtonReceiver != null) {
            getReactApplicationContext().unregisterReceiver(powerButtonReceiver);
        }
    }
}