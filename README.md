
# SorachioChat v2

**SorachioChat v2** adalah aplikasi chatbot AI yang canggih dengan kemampuan **multimodal** — memungkinkan pengguna untuk berinteraksi menggunakan teks, suara, dan gambar. Seluruh project ini dibangun dengan bantuan AI menggunakan [Lovable.dev](https://lovable.dev), dengan backend AI yang didukung oleh OpenRouter API, dan di-deploy secara aman melalui Netlify.

## 🔗 Live Demo

Coba sekarang: [sorachio.netlify.app](https://sorachio.netlify.app)

## ✨ Fitur Utama

### 🤖 AI Assistant - Sorachio
- **Kepribadian Gen Z**: AI dengan personality ramah, gaul, dan seru
- **Bahasa Indonesia**: Mendukung percakapan dalam bahasa Indonesia
- **Multimodal Chat**: Kirim teks dan gambar ke AI (mendukung GPT-4 Vision, Claude 3, dan model lainnya)
- **Voice Input**: Rekam suara, konversi ke teks, dan kirim sebagai pesan

### 💬 Chat Management
- **Sidebar Chat History**: Lihat riwayat chat, buat chat baru, dan hapus percakapan
- **Multiple Conversations**: Kelola beberapa percakapan sekaligus
- **Auto-generated Titles**: Judul chat otomatis berdasarkan pesan pertama
- **Persistent Storage**: Chat tersimpan dalam browser storage

### 🎨 User Interface
- **Responsive Design**: UI yang bersih dan responsif untuk desktop dan mobile
- **Mobile-Optimized**: Sidebar yang disesuaikan untuk tampilan mobile
- **Smooth Animations**: Transisi yang halus dan loading indicators
- **Image Preview**: Preview gambar yang dikirim dalam chat

### ⚡ Performance & Security
- **Serverless Backend**: Request API melalui Netlify Functions untuk keamanan
- **Image Compression**: Kompresi gambar otomatis untuk performa optimal
- **Error Handling**: Penanganan error yang comprehensive dengan pesan yang informatif
- **Timeout Management**: Manajemen timeout untuk request yang berat

## ⚙️ Tech Stack

- **Frontend**: React 18 dengan TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **State Management**: React Hooks (useState, useCallback)
- **Backend**: Netlify Functions
- **AI Models**: OpenRouter API (mendukung berbagai model LLM multimodal)
- **Speech Recognition**: Web Speech API
- **Image Processing**: Canvas API untuk kompresi gambar

## 🧠 Cara Kerja

1. **Input Processing**: User mengirim input (teks, gambar, atau suara)
2. **Client-side Processing**: 
   - Voice dikonversi ke teks menggunakan Web Speech API
   - Gambar dikompres menggunakan Canvas API
3. **Secure API Call**: Frontend mengirim request ke Netlify Function
4. **AI Processing**: Serverless function meneruskan request ke OpenRouter API secara aman
5. **Response Handling**: AI menghasilkan response yang ditampilkan di chat UI
6. **Chat Management**: Sidebar memungkinkan pengelolaan multiple conversations

## 🛠️ Getting Started

### Prerequisites

Pastikan Anda memiliki **Node.js** atau **Bun** terinstall.

### Installation

```bash
git clone https://github.com/IzzulGod/SorachioChat-v2
cd SorachioChat-v2

# Install dependencies
npm install     # atau: bun install

# Start development server
npm run dev     # atau: bun dev
```

Kemudian buka browser di http://localhost:5173

### Environment Setup

Untuk menjalankan backend, Anda perlu setup environment variables di Netlify:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Build for Production

```bash
npm run build
# atau
bun run build
```

## 📦 Available Scripts

- `dev` – Start local development server
- `build` – Build for production
- `preview` – Preview production build locally
- `lint` – Run ESLint untuk quality code

## 🎯 Fitur Khusus

### Image Processing
- Automatic image resizing (max 800px)
- JPEG compression (60% quality)
- Support untuk format JPG dan PNG

### Voice Recognition
- Real-time speech-to-text
- Support untuk berbagai bahasa
- Visual feedback saat recording

### Error Handling
- Timeout handling untuk request berat
- Specific error messages untuk berbagai skenario
- Toast notifications untuk user feedback

### Mobile Experience
- Touch-optimized interface
- Adaptive sidebar width (50% screen pada mobile)
- Keyboard-aware scrolling
- Orientation change handling

## ☁️ Deployment

Project ini sudah dikonfigurasi lengkap untuk deployment via Netlify, dengan automatic builds dari GitHub dan backend logic yang berjalan melalui serverless functions.

### Netlify Functions
- `/netlify/functions/chat.js` - Main API endpoint untuk chat
- Environment variables management
- CORS handling

## 🔧 Customization

### Mengganti Model AI
Edit file `src/hooks/useChat.ts` dan ubah model di dalam `apiPayload`:

```typescript
const apiPayload = {
  model: 'meta-llama/llama-4-maverick:free', // Ganti dengan model pilihan
  // ...
};
```

### Mengubah Personality AI
Edit system prompt di `useChat.ts`:

```typescript
{
  role: 'system',
  content: 'Kamu adalah Sorachio, AI yang dibuat oleh...' // Customize personality di sini
}
```

## 🤝 Contributing

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Project ini menggunakan MIT License.

## 🙏 Credits

- Dibangun dengan [Lovable.dev](https://lovable.dev) – AI-powered coding assistant
- UI components oleh [shadcn/ui](https://ui.shadcn.com)
- Styling dengan [Tailwind CSS](https://tailwindcss.com)
- AI backend oleh [OpenRouter API](https://openrouter.ai)
- Created by **Izzul Fahmi** - AI Engineer Indonesia

## 📞 Contact

- GitHub: [@IzzulGod](https://github.com/IzzulGod)
- Project Link: [https://github.com/IzzulGod/SorachioChat-v2](https://github.com/IzzulGod/SorachioChat-v2)
- Live Demo: [sorachio.netlify.app](https://sorachio.netlify.app)

---

*"Built with ❤️ and AI assistance from Lovable.dev"*
