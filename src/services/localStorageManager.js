import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const FOLDER_NAME = 'EventSchedule';

class LocalStorageManager {
  constructor() {
    this.folderInitialized = false;
  }

  /**
   * Ensure the "EventSchedule" folder exists in Documents directory.
   * If deleted from File Manager by the user, this automatically recreates it.
   */
  async ensureFolderExists() {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      await Filesystem.stat({
        path: FOLDER_NAME,
        directory: Directory.Documents
      });
      this.folderInitialized = true;
      return true;
    } catch (err) {
      // Directory doesn't exist, recreate it
      try {
        await Filesystem.mkdir({
          path: FOLDER_NAME,
          directory: Directory.Documents,
          recursive: true
        });
        this.folderInitialized = true;
        return true;
      } catch (mkdirErr) {
        console.warn('Could not create EventSchedule directory in Documents, trying Data directory:', mkdirErr);
        try {
          await Filesystem.mkdir({
            path: FOLDER_NAME,
            directory: Directory.Data,
            recursive: true
          });
          this.folderInitialized = true;
          return true;
        } catch (fallbackErr) {
          console.error('Failed to create EventSchedule directory:', fallbackErr);
          return false;
        }
      }
    }
  }

  /**
   * Converts a Web File object to Base64 string without memory bloat
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Strip data:...;base64, prefix for Capacitor Filesystem
        const base64Index = result.indexOf(';base64,');
        if (base64Index !== -1) {
          resolve(result.substring(base64Index + 8));
        } else {
          resolve(result);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Save an uploaded file directly into the device's EventSchedule folder.
   * Avoids duplicate copies and ensures clean memory release.
   */
  async saveFile(file) {
    await this.ensureFolderExists();

    const timestamp = Date.now();
    const cleanOriginalName = (file.name || 'file')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');
    const storedFileName = `event_${timestamp}_${cleanOriginalName}`;
    const relativePath = `${FOLDER_NAME}/${storedFileName}`;

    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = await this.fileToBase64(file);

        // Write file directly to EventSchedule folder in Documents
        let writtenResult;
        let chosenDirectory = Directory.Documents;

        try {
          writtenResult = await Filesystem.writeFile({
            path: relativePath,
            data: base64Data,
            directory: chosenDirectory
          });
        } catch (docWriteErr) {
          chosenDirectory = Directory.Data;
          writtenResult = await Filesystem.writeFile({
            path: relativePath,
            data: base64Data,
            directory: chosenDirectory
          });
        }

        const uriResult = await Filesystem.getUri({
          path: relativePath,
          directory: chosenDirectory
        });

        const nativeUri = uriResult.uri;
        const displayUrl = Capacitor.convertFileSrc(nativeUri);

        return {
          id: `att_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          storedFileName,
          relativePath,
          directoryType: chosenDirectory === Directory.Documents ? 'Documents' : 'Data',
          fileUri: nativeUri,
          displayUrl,
          type: file.type || 'application/octet-stream',
          size: file.size,
          createdAt: new Date().toISOString()
        };
      } catch (err) {
        console.error('Error saving file to native filesystem:', err);
        throw new Error(`Failed to save file locally: ${err.message}`);
      }
    } else {
      // Browser / Web fallback (Data URL stored for offline preview in dev)
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      return {
        id: `att_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        storedFileName,
        relativePath,
        fileUri: '',
        displayUrl: dataUrl,
        localDataUrl: dataUrl,
        type: file.type || 'application/octet-stream',
        size: file.size,
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Verifies if a stored file still exists on the device storage.
   * If user deleted it from File Manager, detects it and returns status.
   */
  async verifyFileExists(attachment) {
    if (!attachment || !attachment.relativePath) {
      return { exists: false, error: 'No file path found' };
    }

    if (!Capacitor.isNativePlatform()) {
      return { exists: true, displayUrl: attachment.displayUrl || attachment.localDataUrl };
    }

    const directory =
      attachment.directoryType === 'Data' ? Directory.Data : Directory.Documents;

    try {
      await Filesystem.stat({
        path: attachment.relativePath,
        directory
      });

      // File exists! Ensure displayUrl is fresh
      const uriResult = await Filesystem.getUri({
        path: attachment.relativePath,
        directory
      });
      const displayUrl = Capacitor.convertFileSrc(uriResult.uri);

      return { exists: true, displayUrl, fileUri: uriResult.uri };
    } catch (err) {
      // Check if folder was deleted and auto-recreate it for future files
      this.ensureFolderExists().catch(() => {});
      return {
        exists: false,
        error: 'File was deleted from device storage (File Manager)'
      };
    }
  }

  /**
   * Delete a file from the device's EventSchedule folder.
   */
  async deleteFile(attachment) {
    if (!attachment || !attachment.relativePath) return true;

    if (!Capacitor.isNativePlatform()) return true;

    const directory =
      attachment.directoryType === 'Data' ? Directory.Data : Directory.Documents;

    try {
      await Filesystem.deleteFile({
        path: attachment.relativePath,
        directory
      });
      return true;
    } catch (err) {
      // File might have already been deleted from File Manager by user
      console.warn('File already deleted or missing on disk:', attachment.relativePath);
      return true;
    }
  }

  /**
   * Delete multiple files (e.g. when an entire event is deleted)
   */
  async deleteFiles(attachments = []) {
    for (const att of attachments) {
      await this.deleteFile(att);
    }
    return true;
  }

  /**
   * Open the file using the user's preferred native Android viewer app (Adobe Acrobat, Google Drive PDF Viewer, Gallery, VLC, etc.)
   * When the Android Back button is pressed in that external viewer, the user returns right back to this app!
   */
  async openFileWithNativeApp(attachment) {
    if (!attachment) return false;

    if (Capacitor.isNativePlatform()) {
      try {
        let targetPath = attachment.fileUri;
        const directory = attachment.directoryType === 'Data' ? Directory.Data : Directory.Documents;

        if (attachment.relativePath) {
          try {
            const uriRes = await Filesystem.getUri({
              path: attachment.relativePath,
              directory
            });
            targetPath = uriRes.uri;
          } catch (uriErr) {
            console.warn('Could not resolve getUri:', uriErr);
          }
        }

        const NativeFileOpener = window.Capacitor?.Plugins?.NativeFileOpener;
        if (NativeFileOpener) {
          await NativeFileOpener.openFile({
            filePath: targetPath || attachment.fileUri || attachment.relativePath,
            mimeType: attachment.type || '*/*'
          });
          return true;
        }
      } catch (err) {
        console.error('Error launching native viewer intent:', err);
        throw err;
      }
    }

    // Web browser fallback: open in new window or blob url
    const webUrl = attachment.displayUrl || attachment.localDataUrl || attachment.url;
    if (webUrl) {
      window.open(webUrl, '_blank');
      return true;
    }

    return false;
  }
}

export const localStorageManager = new LocalStorageManager();
