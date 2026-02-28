
# 🚀 دليل زين الشامل (Localhost + APK)

هلا زين، هذا الدليل يعلمك شلون تشغل الموقع على حاسبتك وتجربه، وشلون تحوله تطبيق موبايل.

---

## 💻 الجزء الأول: تشغيل على الحاسبة (Localhost)

قبل لا تسوي APK، جرب النظام على المتصفح (Chrome/Edge):

1. **تثبيت المكاتب:**
   افتح الـ Terminal في VS Code (تأكد أنك داخل مجلد المشروع) واكتب:
   ```bash
   npm install
   ```

2. **مفتاح الذكاء الاصطناعي (ضروري):**
   * سوي ملف جديد اسمه `.env` في المجلد الرئيسي (بجانب `package.json`).
   * افتح الملف واكتب بداخله السطر التالي (بدل X بالمفتاح مالك):
   ```env
   VITE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **التشغيل:**
   اكتب هذا الأمر في الـ Terminal:
   ```bash
   npm run dev
   ```
   * راح يطلعلك رابط (مثل `http://localhost:5173`).
   * اضغط `Ctrl + Click` على الرابط، ومبروك عليك النظام شغال!

> **ملاحظة:** الكاميرا والماسح الضوئي (Scanner) سيستخدمون كاميرا اللابتوب (Webcam) في هذا الوضع.

---

## 📱 الجزء الثاني: تحويل إلى تطبيق (APK)

بس تكمل تجربة وتتأكد كلشي تمام، اتبع هاي الخطوات لتحويله لموبايل:

1. **بناء المشروع (Build):**
   ```bash
   npm run build
   ```

2. **تجهيز أندرويد وتثبيت المكاتب:**
   ```bash
   # تنزيل أدوات الموبايل وملفات النظام (ضروري جداً)
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/camera @capacitor/haptics @capacitor/filesystem

   # إضافة منصة أندرويد
   npx cap add android
   npx cap sync
   ```

3. **فتح أندرويد ستوديو:**
   ```bash
   npx cap open android
   ```

4. **إضافة الصلاحيات (أهم خطوة):**
   داخل Android Studio، روح للملف:
   `app` -> `manifests` -> `AndroidManifest.xml`
   
   ضيف هاي الأسطر فوك وسم `<application ...>` (يعني مع بقية الـ uses-permission):
   
   ```xml
   <!-- انترنت للذكاء الاصطناعي -->
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   
   <!-- كاميرا للماسح -->
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-feature android:name="android.hardware.camera" />
   
   <!-- تخزين الملفات (للتقارير والبوسترات) -->
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   ```

5. **استخراج APK:**
   من قائمة `Build` في أندرويد ستوديو -> اختار `Build Bundle(s) / APK(s)` -> ثم `Build APK(s)`.

---

## 💡 ملاحظات مهمة

*   **تحديث الكود:** في حال غيرت أي شي بالكود، لازم دائماً تسوي:
    ```bash
    npm run build
    npx cap sync
    ```
    قبل لا تطلع الـ APK الجديد.
*   **مكان الملفات:** في الأندرويد، الملفات المحفوظة (PDF) ستجدها غالباً في مجلد:
    `Android/data/com.biomed.os/files/Documents/BioMed_OS`
    أو في مجلد المستندات الرئيسي حسب إصدار الأندرويد.

بالتوفيق!
