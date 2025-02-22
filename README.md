# datosenabierto.es - Visualizador del BOE

datosenabierto.es es una aplicación web moderna que permite consultar y visualizar el Boletín Oficial del Estado (BOE) de España de forma interactiva y organizada. La plataforma está diseñada para hacer más accesible y comprensible la información oficial del Estado español.

## 🎯 Objetivo del Proyecto

El proyecto nace con la misión de democratizar el acceso a la información oficial del Estado, transformando los datos del BOE en un formato más accesible y comprensible para todos los ciudadanos. Utilizamos la API oficial de datos abiertos del BOE para proporcionar una experiencia de usuario moderna y eficiente.

## 🌟 Características

### Para Usuarios

- **Consulta Interactiva**:

  - Búsqueda intuitiva por rango de fechas
  - Calendario visual para selección de fechas
  - Filtrado dinámico de contenidos
  - Previsualización rápida de sumarios

- **Organización Inteligente**:

  - Boletines agrupados por semanas
  - Vista jerárquica de secciones y departamentos
  - Navegación fluida entre documentos relacionados
  - Marcadores y referencias cruzadas

- **Accesibilidad Multiplataforma**:

  - Diseño responsive optimizado para móviles y tablets
  - Acceso directo a documentos en PDF, HTML y XML
  - Interfaz adaptada a lectores de pantalla
  - Soporte para modo oscuro

- **Herramientas de Análisis**:
  - Estadísticas detalladas por boletín
  - Gráficos de distribución de contenidos
  - Métricas de secciones y disposiciones
  - Tendencias temporales

### Características Técnicas

- **Arquitectura Moderna**:

  - SSR (Server-Side Rendering) para óptimo SEO
  - Arquitectura JAMstack con Nuxt 3
  - Sistema de caché inteligente
  - API REST optimizada

- **Rendimiento Optimizado**:

  - Carga progresiva de datos
  - Compresión y optimización de assets
  - Lazy loading de componentes
  - Prefetching inteligente

- **Seguridad y Fiabilidad**:
  - Validación robusta de datos
  - Protección contra ataques CSRF/XSS
  - Rate limiting en API
  - Monitorización de errores

## 🛠 Stack Tecnológico

### Frontend

- **Framework**: Nuxt.js 3 (Vue 3 + Composition API)
- **Estilos**:
  - Tailwind CSS para diseño responsive
  - Sistema de componentes personalizado
  - Variables CSS para temas

### Componentes UI

- **Calendario**: v-calendar con personalización
- **Iconografía**: Heroicons optimizados
- **Gráficos**: Chart.js para visualizaciones
- **Modal**: Sistema propio de modales accesibles

### Backend y API

- **Servidor**: Nitro (Nuxt 3)
- **Caché**: Sistema en memoria + persistencia
- **Procesamiento**:
  - fast-xml-parser para datos XML
  - date-fns para manipulación temporal

## 📦 Instalación y Desarrollo

### Requisitos Previos

- Node.js 20.x o superior
- npm o yarn
- Git

### Configuración Inicial

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/datosenabierto.es.git
cd datosenabierto.es

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Comandos Principales

```bash
# Desarrollo local (http://localhost:3000)
npm run dev

# Construcción para producción
npm run build

# Previsualización de producción
npm run preview

# Linting y formateo
npm run lint
npm run format
```

## 🚀 Despliegue

El proyecto está optimizado para despliegue en Netlify:

- **Build Command**: `npm run build`
- **Publish Directory**: `.output/public`
- **Functions Directory**: `.output/server`
- **Node Version**: 20.x

### Variables de Entorno Necesarias

```env
NODE_ENV=production
API_BASE_URL=https://boe.es/datosabiertos/api
CACHE_DURATION=3600
```

## 📈 Monitorización y Análisis

- Integración con Google Analytics
- Monitorización de errores con Sentry
- Métricas de rendimiento con Lighthouse
- Logs de servidor estructurados

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestra guía de contribución antes de enviar PRs.

1. Fork del repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit de cambios (`git commit -am 'Añade nueva mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- Abre un issue en GitHub
- Contacta por email: soporte@datosenabierto.es
- Discord: [Únete a nuestra comunidad](https://discord.gg/datosenabierto)
