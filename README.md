# Image Text Composer

A modern web application for adding and editing text overlays on images with real-time preview, drag-and-drop functionality, and persistent state management.

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-000000?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwind-css)

## ✨ Features

- **Drag & Drop Image Upload** - Upload images via drag-and-drop or file selection
- **Interactive Text Editing** - Add, edit, and position text layers with real-time preview
- **Rich Text Properties** - Customize font family, size, weight, color, opacity, and alignment
- **Layer Management** - Reorder, select, and delete text layers with intuitive controls
- **Canvas Manipulation** - Drag and rotate text directly on the canvas
- **Auto-save & Persistence** - Automatic saving with localStorage persistence across sessions
- **Undo/Redo System** - Full history management with visual indicators
- **High-Quality Export** - Export final compositions as PNG files
- **Responsive Design** - Works seamlessly across desktop and mobile devices

## 🚀 Setup and Run Instructions

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with HTML5 Canvas support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd akash-image-text-composer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🏗️ Architecture Overview

The application follows a modern React architecture with clear separation of concerns:

### Component Structure
```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
│   ├── ImageTextComposer   # Main application component
│   ├── CanvasArea         # Canvas and action buttons
│   ├── LayersList         # Text layers management
│   ├── TextProperties     # Text editing controls
│   └── Toolbar           # Undo/redo and history
├── contexts/              # React Context for state management
├── hooks/                 # Custom React hooks
├── foundations/           # Base UI components (Button, Input, etc.)
└── utils/                # Utility functions
```

### Key Architectural Patterns

1. **Component Composition** - Modular components with single responsibilities
2. **Custom Hooks** - Business logic separated into reusable hooks
3. **Context API** - Centralized state management for complex application state
4. **Foundation Components** - Consistent UI component library with design system
5. **TypeScript** - Full type safety across the application

### Data Flow

1. **TextLayersContext** manages all application state (layers, history, canvas)
2. **Custom hooks** handle specific concerns (canvas management, image upload)
3. **Components** consume context and hooks for rendering and user interactions
4. **Auto-save system** persists state to localStorage with debouncing

## 🛠️ Technology Choices and Trade-offs

### Core Technologies

| Technology | Choice | Trade-offs |
|------------|--------|------------|
| **Next.js 15** | App Router, Turbopack | ✅ Performance, SSR, Developer Experience<br/>❌ Learning curve for new features |
| **React 19** | Latest features, improved performance | ✅ Better performance, new hooks<br/>❌ Potential compatibility issues |
| **TypeScript** | Full type safety | ✅ Better DX, fewer runtime errors<br/>❌ Initial setup complexity |
| **Fabric.js** | Canvas manipulation | ✅ Rich canvas features, text manipulation<br/>❌ Large bundle size (~200KB) |
| **Tailwind CSS v4** | Utility-first styling | ✅ Rapid development, consistent design<br/>❌ Learning curve, class verbosity |

### Library Choices

- **react-dropzone** - File upload with excellent UX
- **react-color** - Color picker with multiple formats
- **react-icons** - Comprehensive icon library
- **clsx** - Conditional className management

### Performance Optimizations

- **Dynamic imports** - Code splitting for Fabric.js
- **useCallback/useMemo** - Prevent unnecessary re-renders
- **Debounced auto-save** - Reduced localStorage writes
- **Optimized canvas rendering** - Minimal re-renders on text updates

## 🎯 Implemented Bonus Points

### ✅ Advanced Features Implemented

1. **Persistent State Management**
   - Auto-save every 2 seconds with debouncing
   - localStorage persistence across browser sessions
   - Automatic restoration on page refresh

2. **Rich Text Editing**
   - Font family selection (20+ fonts)
   - Font weight options (normal, bold, etc.)
   - Color picker with hex values
   - Opacity slider with real-time preview
   - Text alignment options

3. **Advanced Canvas Interactions**
   - Drag text directly on canvas
   - Rotate text objects
   - Real-time position tracking
   - Multi-layer management

4. **Enhanced UX**
   - Undo/Redo system with history indicators
   - Visual layer selection and management
   - Responsive design for mobile devices
   - Loading states and smooth transitions

5. **Export Functionality**
   - High-quality PNG export
   - Maintains original image resolution
   - Proper scaling for text elements

### 🎨 UI/UX Enhancements

- **Modern Design System** - Consistent spacing, colors, and typography
- **Icon Integration** - Professional icons from react-icons
- **Interactive Feedback** - Hover states, focus indicators
- **Accessibility** - Keyboard navigation, focus management

## ⚠️ Known Limitations

### Technical Limitations

1. **Canvas Performance**
   - May slow down with 20+ text layers
   - Large images (>10MB) may impact performance

2. **Browser Compatibility**
   - Requires modern browsers with HTML5 Canvas support
   - Some features may not work in IE11
   

### Feature Limitations

1. **Text Features**
   - No rich text formatting (bold, italic, underline)
   - Limited text effects (no shadows, outlines)
   - No text wrapping or multi-line support

2. **Image Support**
   - No image filters or adjustments
   - No support for vector formats (SVG)
   - No batch processing

3. **Export Options**
   - Only PNG export (no JPEG, PDF)
   - No custom export dimensions
   - No print optimization

### Performance Considerations

- **Memory Usage** - Large images with many layers may consume significant memory
- **Bundle Size** - Fabric.js adds ~200KB to the bundle
- **localStorage Limits** - Large projects may hit browser storage limits

## 🔮 Future Improvements

- Add text effects (shadows, outlines, gradients)
- Implement image filters and adjustments
- Add support for multiple export formats
- Improve mobile touch interactions
- Add collaborative editing features
- Implement cloud storage integration

## 📄 License

This project is for educational and demonstration purposes.

---

Built with ❤️ using Next.js, React, and TypeScript
