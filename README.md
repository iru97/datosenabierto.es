# DatosEnAbierto

A data visualization platform that makes complex public data accessible and understandable.

## 🚀 Tech Stack

### Frontend
- **Vue 3** - UI Framework
- **Nuxt 3** - SSR Framework
- **TypeScript** - Static Typing
- **Pinia** - State Management
- **TailwindCSS** - CSS Utilities
- **Chart.js** - Data Visualization
- **Lucide Vue** - Icons

### Backend
- **Nuxt Server** - REST API
- **Zod** - Data Validation
- **Netlify Functions** - Serverless

### Caching & State
- **Pinia** - Global State
- **Nuxt Cache** - SSR Cache

### Monitoring & Analytics
- **OpenTelemetry** - Distributed Tracing
- **Web Vitals** - Performance Metrics
- **Netlify Analytics** - Usage Analytics
- **k6** - Load Testing

### Testing
- **Vitest** - Unit Testing
- **Vue Test Utils** - Component Testing
- **Playwright** - E2E Testing
- **MSW** - API Mocking

### CI/CD & Deployment
- **Netlify** - Hosting & Deployment
- **Terser** - Minification
- **Compression** - Brotli/Gzip

## 🛠️ Prerequisites

- Node.js 18 or higher
- npm 7 or higher

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/datosenabierto.git
cd datosenabierto
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your values.

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
- `npm test` - Run tests
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run clean` - Clean cache and generated files

## 🏗️ Project Structure

```
├── components/       # Vue components
│   ├── charts/      # Chart components
│   └── ui/          # UI components
├── composables/     # Composables & hooks
├── layouts/         # Page layouts
├── pages/          # Pages & routes
├── public/         # Static files
├── server/         # API & middleware
│   └── api/        # API endpoints
├── stores/         # Pinia stores
├── types/          # TypeScript types
└── utils/          # Utilities
```

## 🔧 Configuration

### Environment Variables

```env
# APIs
NUXT_PUBLIC_CONTRATACION_API_URL=   # Contracting API
NUXT_PUBLIC_DATOS_GOB_API_URL=      # Datos.gob API
NUXT_PUBLIC_TRANSPARENCY_API_URL=    # Transparency API
NUXT_PUBLIC_BACKUP_API_URL=         # Backup API

# Analytics
NUXT_PUBLIC_ANALYTICS_ID=           # Analytics ID
```

### Deployment

The application is configured for Netlify deployment with SSR (Server Side Rendering):

1. Connect repository in Netlify
2. Configure environment variables
3. Deploy:
```bash
npm run build
```

The `netlify.toml` includes:
```toml
[build]
  command = "npm run build"
  publish = ".output/public"
  functions = ".output/server"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

### API & SSR

The application uses Nuxt Server to provide:
- REST API with endpoints in `/server/api/`
- SSR for better SEO and performance
- Data validation with Zod
- Server-side caching

### Performance

Implemented optimizations:
- SSR for better First Contentful Paint
- Aggressive static asset caching
- Brotli/Gzip compression
- Automatic code splitting
- Route prefetching
- Image lazy loading
- Dependency tree shaking

## 📈 Monitoring

### Key Metrics
- **Web Vitals**
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
- **API Performance**
  - Latency
  - Error rate
  - Cache hit ratio
- **Resources**
  - Memory usage
  - Load time
  - Bundle size

### Alerts
The system generates alerts for:
- High latency (>1000ms)
- High error rate (>5%)
- Low cache ratio (<80%)

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Load Tests
```bash
npm run test:load
```

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request