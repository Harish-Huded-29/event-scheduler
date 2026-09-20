package com.immortal.eventscheduler;

import android.content.Intent;
import android.net.Uri;
import android.webkit.MimeTypeMap;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "NativeFileOpener")
public class NativeFileOpenerPlugin extends Plugin {

    @PluginMethod
    public void openFile(PluginCall call) {
        String filePath = call.getString("filePath");
        String mimeType = call.getString("mimeType");

        if (filePath == null || filePath.isEmpty()) {
            call.reject("filePath is required");
            return;
        }

        try {
            Uri contentUri;
            File file = null;

            if (filePath.startsWith("content://")) {
                contentUri = Uri.parse(filePath);
            } else if (filePath.startsWith("file://")) {
                file = new File(Uri.parse(filePath).getPath());
                contentUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    file
                );
            } else {
                file = new File(filePath);
                contentUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    file
                );
            }

            if (mimeType == null || mimeType.isEmpty() || mimeType.equals("application/octet-stream")) {
                String extension = MimeTypeMap.getFileExtensionFromUrl(filePath);
                if (extension != null && !extension.isEmpty()) {
                    mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.toLowerCase());
                }
                if (mimeType == null || mimeType.isEmpty()) {
                    if (filePath.toLowerCase().endsWith(".pdf")) {
                        mimeType = "application/pdf";
                    } else if (filePath.toLowerCase().matches(".*\\.(jpg|jpeg|png|webp|gif|svg)$")) {
                        mimeType = "image/*";
                    } else if (filePath.toLowerCase().matches(".*\\.(mp4|webm|mkv|mov|avi|3gp)$")) {
                        mimeType = "video/*";
                    } else if (filePath.toLowerCase().matches(".*\\.(mp3|wav|m4a|aac|ogg|flac)$")) {
                        mimeType = "audio/*";
                    } else {
                        mimeType = "*/*";
                    }
                }
            }

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, mimeType);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            Intent chooser = Intent.createChooser(intent, "Open with");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getContext().startActivity(chooser);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error opening file: " + e.getMessage(), e);
        }
    }
}
