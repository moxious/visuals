# 3D Visualizer App

**🌟 [View Live Application](https://moxious.github.io/visuals/)**

A React + Three.js visualizer application featuring interactive 3D scenes and animations. Built with modern web technologies for immersive visual experiences.

## ✨ Features

- **🎯 Interactive 3D Visualizers**: Multiple visualizer components including pyramids, star fields, and alien terrain
- **🎛️ Visualizer Selector**: Dropdown menu to easily switch between different visualizers
- **🎮 Mouse Controls**: Pan, zoom, and rotate through 3D scenes (where enabled)
- **🌈 Dynamic Animations**: Smooth camera movements and object animations
- **🎨 Customizable**: Configurable colors, sizes, speeds, and animation patterns
- **📱 Responsive**: Works across different screen sizes and devices
- **🚀 Fast**: Built with Vite for lightning-fast development and builds

## 🎬 Current Visualizers

### Pyramid Visualizer
Interactive 3D pyramid with customizable materials, colors, and rotation animations.

### Star Field Visualizer  
Immersive space-flight experience with thousands of procedurally generated stars and animated camera movement through 3D space.

### Alien Terrain Visualizer
Spaceship journey through thick layers of rotating alien geometric shapes (rings, torus, cylinders) in bright colors.

## 🛠️ Developer Setup

### Prerequisites
- Node.js 18+ 
- npm

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd visuals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - The app will automatically reload when you make changes

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 📚 Documentation

### 🏗️ [Architecture & Structure](src/STRUCTURE.md)
Complete guide to the project architecture, how to add new visualizers, and component organization.

### 🚀 [Deployment Guide](DEPLOYMENT.md)  
Instructions for GitHub Pages deployment, CI/CD setup, and troubleshooting.

## 🎯 Technology Stack

- **Frontend Framework**: React 18
- **3D Graphics**: Three.js + React Three Fiber
- **Build Tool**: Vite
- **Styling**: CSS
- **Deployment**: GitHub Pages + GitHub Actions

## 🎨 Adding New Visualizers

The app is designed with a modular architecture that makes it easy to add new 3D visualizers. See the [Structure Documentation](src/STRUCTURE.md) for detailed instructions on creating new visualizer components.

## 🔧 Configuration

The app uses different base paths for development and production:
- **Development**: `http://localhost:5173/`
- **Production**: `https://[username].github.io/visuals/`

This is handled automatically in `vite.config.js`.

## 🚀 Deployment

The application automatically deploys to GitHub Pages when code is pushed to the main branch. See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-visualizer`)
3. Make your changes
4. Follow the architecture patterns described in [STRUCTURE.md](src/STRUCTURE.md)
5. Test your changes with `npm run dev`
6. Commit your changes (`git commit -m 'Add amazing visualizer'`)
7. Push to the branch (`git push origin feature/amazing-visualizer`)
8. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**🌟 [Experience the live visualizers now!](https://moxious.github.io/visuals/)**
