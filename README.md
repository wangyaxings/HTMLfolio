# HTML Card Viewer

A modern web application for organizing and viewing HTML files with a beautiful card-based interface. Built with Angular 19 and PrimeNG 19, featuring a Go backend for file management.

## Features

- 🎨 **Modern UI**: Beautiful card-based interface with dark mode support
- 📁 **File Organization**: Categorize HTML files by type (Dashboard, Portfolio, Documentation, etc.)
- 🏷️ **Tagging System**: Add and search files by tags
- 🔍 **Advanced Search**: Search files by name, title, description, or tags
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Fast Performance**: Built with Angular 19 and optimized for speed
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📤 **Drag & Drop Upload**: Easy file upload with drag and drop support

## Tech Stack

### Frontend
- **Angular 19** - Modern web framework
- **PrimeNG 19** - Rich UI component library
- **TypeScript** - Type-safe development
- **SCSS** - Advanced styling

### Backend
- **Go** - High-performance backend server
- **HTTP File Server** - Static file serving
- **CORS Support** - Cross-origin resource sharing

## Project Structure

```
20250522/
├── go-backend/                 # Go backend server
│   ├── main.go                # Main server file
│   ├── go.mod                 # Go module definition
│   └── uploads/               # Uploaded HTML files
├── primeng-frontend/          # Angular frontend
│   └── html-card-viewer/      # Main Angular application
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   │   ├── home/          # Home page component
│       │   │   │   └── html-viewer/   # HTML file viewer
│       │   │   ├── services/          # Angular services
│       │   │   └── app.component.ts   # Root component
│       │   └── styles.css     # Global styles
│       ├── package.json       # Dependencies
│       └── angular.json       # Angular configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- **Node.js** (18.19.1 or newer)
- **Go** (1.19 or newer)
- **Angular CLI** (19.x)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 20250522
   ```

2. **Install frontend dependencies**
   ```bash
   cd primeng-frontend/html-card-viewer
   npm install
   ```

3. **Start the backend server**
   ```bash
   cd ../../go-backend
   go run main.go
   ```
   The backend will start on `http://localhost:8080`

4. **Start the frontend development server**
   ```bash
   cd ../primeng-frontend/html-card-viewer
   npm start
   ```
   The frontend will start on `http://localhost:4200`

### Quick Start Script

For Windows users, you can use the provided batch script:
```bash
start.bat
```

## Usage

### Uploading HTML Files

1. Click the **"Upload Files"** button on the home page
2. Select a category for your HTML file
3. Add optional tags and description
4. Choose your HTML files or drag & drop them
5. Click **"Upload"** to save the files

### Organizing Files

- **Categories**: Files are automatically organized by categories like Dashboard, Portfolio, Documentation, etc.
- **Tags**: Add custom tags to make files easier to find
- **Search**: Use the search bar to find files by name, title, description, or tags

### Viewing HTML Files

1. Click the **"View"** button on any file card
2. The HTML file will open in a secure iframe viewer
3. Use the toolbar to:
   - Go back to the home page
   - Copy the file path
   - Open the file in a new tab

### Dark Mode

Toggle dark mode using the moon/sun icon in the top navigation bar. Your preference will be saved automatically.

## API Endpoints

### Backend Server (Port 8080)

- `POST /upload` - Upload HTML files
- `GET /uploads/{filename}` - Serve uploaded HTML files
- `OPTIONS /*` - CORS preflight requests

## Development

### Frontend Development

```bash
cd primeng-frontend/html-card-viewer

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Backend Development

```bash
cd go-backend

# Run the server
go run main.go

# Build executable
go build -o html-card-viewer main.go
```

## Configuration

### Frontend Configuration

The frontend is configured in `primeng-frontend/html-card-viewer/src/app/app.config.ts`:

```typescript
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
```

### Backend Configuration

The backend server runs on port 8080 by default. You can modify the port in `go-backend/main.go`:

```go
if err := http.ListenAndServe(":8080", nil); err != nil {
    log.Fatalf("Server startup failed: %s\n", err)
}
```

## File Categories

The application supports the following predefined categories:

- 📊 **Dashboard** - Analytics and dashboard pages
- 💼 **Portfolio** - Portfolio and showcase pages
- 📚 **Documentation** - Documentation and help pages
- 🎨 **Template** - Template and layout files
- 🏠 **Landing Page** - Landing and marketing pages
- ⚙️ **Admin Panel** - Administrative interfaces
- 🛒 **E-commerce** - Shopping and e-commerce pages
- ✏️ **Blog** - Blog and content pages
- 📁 **Other** - Miscellaneous files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **Upload fails**: Make sure the Go backend is running on port 8080
2. **Files not displaying**: Check that the uploads directory has proper permissions
3. **Build errors**: Ensure you're using compatible versions of Node.js and Angular CLI
4. **CORS errors**: The backend includes CORS headers, but make sure both servers are running

### Support

If you encounter any issues, please check the [troubleshooting guide](troubleshooting.md) or create an issue in the repository.

## Acknowledgments

- [Angular](https://angular.io/) - The web framework
- [PrimeNG](https://primeng.org/) - UI component library
- [Go](https://golang.org/) - Backend programming language
- [PrimeIcons](https://github.com/primefaces/primeicons) - Icon library