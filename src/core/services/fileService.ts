
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const FileService = {
  /**
   * يحفظ ملفاً (Base64) في مجلد خاص بالتطبيق
   */
  saveFile: async (fileName: string, dataBase64: string, folderName: string = 'BioMed_OS'): Promise<string | null> => {
    try {
      // 1. تنظيف بيانات Base64
      const cleanData = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64;

      // 2. التحقق من المنصة
      if (Capacitor.isNativePlatform()) {
        // --- Android / iOS Logic ---
        
        // تحديد المجلد المناسب حسب النظام
        // Android: External (App Specific) هو الأضمن للعمل بدون مشاكل صلاحيات معقدة
        // iOS: Documents هو المكان القياسي
        const targetDirectory = Capacitor.getPlatform() === 'ios' ? Directory.Documents : Directory.External;

        // أ. التأكد من وجود المجلد (أو إنشاؤه)
        try {
          await Filesystem.mkdir({
            path: folderName,
            directory: targetDirectory,
            recursive: true
          });
        } catch (e) {
          // المجلد موجود غالباً، نتجاهل الخطأ
        }

        // ب. كتابة الملف
        const result = await Filesystem.writeFile({
          path: `${folderName}/${fileName}`,
          data: cleanData,
          directory: targetDirectory,
          encoding: Encoding.UTF8
        });

        return result.uri;

      } else {
        // --- Web Browser Fallback ---
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${cleanData}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return 'web-download';
      }

    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  /**
   * تحويل Blob إلى Base64
   */
  blobToBase64: (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
};
