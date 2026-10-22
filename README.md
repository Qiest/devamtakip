# DevamTakip

Derslerdeki devamsızlıkları takip eden, mobil öncelikli ve çevrimdışı çalışabilen bir PWA.
React + Vite + TypeScript + Tailwind CSS. Veriler Firebase Realtime Database'de (ücretsiz plan) saklanır. Giriş yoktur, tek kişilik kullanım içindir.

## Özellikler
- Ders ekleme, düzenleme, silme (isteğe bağlı devamsızlık limiti ve renk)
- Bugüne ya da seçilen tarihe devamsızlık ekleme (aynı derste aynı gün iki kez eklenemez)
- Ders başına toplam, GG/AA/YYYY tarih listesi ve kalan hak; kayıt silme ve "Geri al"
- PWA: manifest, service worker, çevrimdışı açılış, iOS `apple-touch-icon` ve tam ekran meta etiketleri

## Firebase kurulumu
1. Firebase Console → Build → **Realtime Database** → Veritabanı oluştur.
2. **Rules** sekmesine `database.rules.json` içeriğini yapıştırıp Yayınla.
3. Proje ayarlarındaki Web uygulaması değerlerini `.env` dosyasına yaz (`.env.example` örnek).
4. `.env` repoya eklenirse Vercel ayrıca değişken istemez; eklenmezse aynı 4 değişkeni Vercel → Settings → Environment Variables altına gir.

Güvenlik notu: giriş olmadığı için kurallar yalnızca tek bir uzun kayıt adına izin verir (`DATA_DOC_ID`). Bu adı bilmeyen kimse veriye ulaşamaz; adı paylaşma.

## Çalıştırma
```bash
npm install
npm run dev       # geliştirme
npm run build     # üretim derlemesi (dist/)
npm run preview   # derlemeyi yerelde dene
npm run icons     # public/logo-source.jpg'den ikonları yeniden üretir
```

## Vercel'e yayınlama
Repoyu Vercel'e bağla. Framework "Vite" otomatik algılanır (Build: `npm run build`, Output: `dist`). Ek ayar gerekmez.

## Ana ekrana ekleme
- iPhone: Safari → Paylaş → Ana Ekrana Ekle
- Android: Chrome → menü → Uygulamayı yükle

## Notlar
- Veriler Realtime Database'de tek bir kayıtta durur; telefon ve bilgisayarda aynıdır. Çevrimdışıyken de çalışır, internet gelince eşitlenir.
- Eski sürümden kalan yerel veri, ilk girişte otomatik buluta taşınır.
- Tarihler yerel saate göre YYYY-MM-DD olarak saklanır, ekranda GG/AA/YYYY gösterilir.
- Veri anahtarı: `devamtakip:v1`
