# SorachioChat v2

**SorachioChat v2** is a sleek, AI-powered chatbot web application with **multimodal capabilities** — allowing users to chat using text, voice, and even images. The entire project was generated in minutes using [Lovable.dev](https://lovable.dev), with backend AI powered by OpenRouter API, and deployed securely via Netlify.

## 🔗 Live Demo

Try it now: [sorachio.netlify.app](https://sorachio.netlify.app)

## ✨ Features

- **Multimodal Chat**: Send text and image inputs to the AI (supports GPT-4 Vision, Claude 3, and more)
- **Voice Input**: Record voice, convert it to text, and send it as a message
- **Sidebar Chat Management**: View chat history, create new chats, and delete conversations
- **Responsive Design**: Clean UI built with Tailwind CSS and shadcn/ui components
- **Serverless & Secure**: API requests are routed through Netlify Functions to hide API keys
- **Rapid Prototyping**: The full app was generated with the help of AI in just minutes

## ⚙️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **Backend**: Netlify Functions
- **AI Models**: Accessed via OpenRouter API (LLMs with multimodal support)

## 🧠 How It Works

1. User sends input (text, image, or voice)
2. The frontend formats and sends the request to a Netlify Function
3. The serverless function securely forwards the request to OpenRouter API
4. AI generates a response, which is returned and displayed in the chat UI
5. Sidebar allows users to manage conversations

## 🛠️ Getting Started

### Prerequisites

Ensure you have **Node.js** or **Bun** installed.

### Installation

```bash
git clone https://github.com/IzzulGod/SorachioChat-v2
cd SorachioChat-v2

# Install dependencies
npm install     # or: bun install

# Start development server
npm run dev     # or: bun dev
```

Then open your browser at http://localhost:5173

### Build for Production

```bash
npm run build
# or
bun run build
```

## 📦 Scripts

- `dev` – Start local development server
- `build` – Build for production
- `preview` – Preview production build locally
- `lint` – Run ESLint for code quality

## ☁️ Deployment

This project is fully configured for deployment via Netlify, with automatic builds from GitHub and backend logic running through serverless functions.

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

##  Credits

- Built with [Lovable.dev](https://lovable.dev) – AI-generated coding assistant
- UI components by [shadcn/ui](https://ui.shadcn.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Powered by [OpenRouter API](https://openrouter.ai)
