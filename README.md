# BinGenius-AI

**BinGenius AI** adalah aplikasi web interaktif yang menggunakan *machine learning* untuk mengklasifikasikan jenis sampah secara *real-time* melalui webcam Anda. Arahkan sampah ke kamera dan biarkan AI memberi tahu Anda tempat membuangnya.

## Fitur Utama
* **Deteksi Real-time:** Menggunakan model TensorFlow.js dari Teachable Machine untuk mengidentifikasi sampah langsung dari webcam.
* **Panduan Suara:** Aplikasi akan memberi tahu Anda di mana harus membuang sampah yang terdeteksi, menggunakan Web Speech API.
* **Animasi Interaktif:** Tutup tempat sampah yang benar akan terbuka secara otomatis menggunakan animasi GSAP (GreenSock Animation Platform).
* **Fakta Menarik:** Pelajari fakta lingkungan yang relevan tentang jenis sampah yang baru saja Anda pindai.
* **History Pemindaian:** Melacak semua item yang telah Anda pindai dalam sesi saat ini, tersimpan di *local storage*.

## Teknologi yang Digunakan
* **Frontend:** HTML, CSS, JavaScript
* **Machine Learning:** TensorFlow.js
* **Model Training:** Google Teachable Machine
* **Animasi:** GSAP (GreenSock Animation Platform)
* **Text-to-Speech:** Web Speech API