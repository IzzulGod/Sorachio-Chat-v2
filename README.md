# SorachioChat v2

**SorachioChat v2** is an advanced AI chatbot application with **multimodal** capabilities — enabling users to interact using text, voice, and images. This entire project was built with AI assistance using [Lovable.dev](https://lovable.dev), powered by OpenRouter API backend, and securely deployed through Netlify.

## 🔗 Live Demo

Try it now: [sorachio.netlify.app](https://sorachio.netlify.app)

## ✨ Key Features

### 🤖 AI Assistant - Sorachio
- **Gen Z Personality**: AI with a friendly, casual, and fun personality
- **Indonesian Language**: Supports conversations in Indonesian
- **Multimodal Chat**: Send text and images to AI (supports GPT-4 Vision, Claude 3, and other models)
- **Voice Input**: Record voice, convert to text, and send as messages

### 💬 Chat Management
- **Sidebar Chat History**: View chat history, create new chats, and delete conversations
- **Multiple Conversations**: Manage multiple conversations simultaneously
- **Auto-generated Titles**: Automatic chat titles based on first message
- **Persistent Storage**: Chats saved in browser storage

### 🎨 User Interface
- **Responsive Design**: Clean and responsive UI for desktop and mobile
- **Mobile-Optimized**: Sidebar adapted for mobile display
- **Smooth Animations**: Smooth transitions and loading indicators
- **Image Preview**: Preview images sent in chat

### ⚡ Performance & Security
- **Serverless Backend**: API requests through Netlify Functions for security
- **Image Compression**: Automatic image compression for optimal performance
- **Error Handling**: Comprehensive error handling with informative messages
- **Timeout Management**: Timeout management for heavy requests

## ⚙️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **State Management**: React Hooks (useState, useCallback)
- **Backend**: Netlify Functions
- **AI Models**: OpenRouter API (supports various multimodal LLM models)
- **Speech Recognition**: Web Speech API
- **Image Processing**: Canvas API for image compression

## 🧠 How It Works

1. **Input Processing**: User sends input (text, image, or voice)
2. **Client-side Processing**: 
   - Voice converted to text using Web Speech API
   - Images compressed using Canvas API
3. **Secure API Call**: Frontend sends request to Netlify Function
4. **AI Processing**: Serverless function forwards request to OpenRouter API securely
5. **Response Handling**: AI generates response displayed in chat UI
6. **Chat Management**: Sidebar enables management of multiple conversations

## 🛠️ Getting Started

### Prerequisites

Make sure you have **Node.js** or **Bun** installed.

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

### Environment Setup

To run the backend, you need to setup environment variables in Netlify:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Build for Production

```bash
npm run build
# or
bun run build
```

## 📦 Available Scripts

- `dev` – Start local development server
- `build` – Build for production
- `preview` – Preview production build locally
- `lint` – Run ESLint for code quality

## 🎯 Special Features

### Image Processing
- Automatic image resizing (max 800px)
- JPEG compression (60% quality)
- Support for JPG and PNG formats

### Voice Recognition
- Real-time speech-to-text
- Support for multiple languages
- Visual feedback during recording

### Error Handling
- Timeout handling for heavy requests
- Specific error messages for various scenarios
- Toast notifications for user feedback

### Mobile Experience
- Touch-optimized interface
- Adaptive sidebar width (50% screen on mobile)
- Keyboard-aware scrolling
- Orientation change handling

## ☁️ Deployment

This project is fully configured for deployment via Netlify, with automatic builds from GitHub and backend logic running through serverless functions.

### Netlify Functions
- `/netlify/functions/chat.js` - Main API endpoint for chat
- Environment variables management
- CORS handling

## 🔧 Customization

### Changing AI Model
Edit the `src/hooks/useChat.ts` file and change the model in `apiPayload`:

```typescript
const apiPayload = {
  model: 'meta-llama/llama-4-maverick:free', // Replace with your preferred model
  // ...
};
```

### Modifying AI Personality
Edit the system prompt in `useChat.ts`:

```typescript
{
  role: 'system',
  content: 'You are Sorachio, an AI created by...' // Customize personality here
}
```

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
