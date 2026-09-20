package com.immortal.eventscheduler;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeFileOpenerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
