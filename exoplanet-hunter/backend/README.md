# Exoplanet Hunter Backend API

A comprehensive REST API for exoplanet data analysis, machine learning predictions, and dataset management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## � **Real NASA Data Integration**

### **Datasets Used**
The backend integrates with authentic NASA Exoplanet Archive datasets:

- **K2 Planets and Candidates** (`K2 Planets and Candidate.csv`)
  - 4,000+ confirmed planets and candidates from K2 mission
  - Fields: `pl_name`, `hostname`, `disposition`, `pl_rade`, `pl_masse`, `st_teff`, etc.

- **Kepler Objects of Interest** (`Kepler Objects of Interest(KOI).csv`)
  - 9,500+ KOI objects with disposition scores
  - Fields: `kepoi_name`, `koi_disposition`, `koi_prad`, `koi_period`, `koi_score`, etc.

- **TESS Objects of Interest** (`TESS Objects of Interest(TOI).csv`)
  - 7,700+ TOI candidates from TESS mission
  - Fields: `toi`, `tid`, `tfopwg_disp`, transit parameters, etc.

### **Data Structure**
```
data/
├── raw/                   # Original NASA CSV files
│   ├── K2 Planets and Candidate.csv
│   ├── Kepler Objects of Interest(KOI).csv
│   └── TESS Objects of Interest(TOI).csv
├── processed/             # Processed data files
├── models/               # ML model files
└── scalers/              # Feature scaling parameters
```

## 🛠 API Endpoints

### Prediction Endpoints

#### POST `/api/predict/habitability`
Predict exoplanet habitability using ML models.

**Request Body:**
```json
{
  "data": [
    {
      "pl_name": "Kepler-452 b",
      "pl_rade": 1.63,
      "pl_masse": 5.0,
      "pl_orbper": 384.84,
      "pl_orbsmax": 1.05,
      "pl_eqt": 265,
      "st_teff": 5757,
      "st_rad": 1.11,
      "st_mass": 1.04
    }
  ],
  "options": {
    "confidenceThreshold": 0.7,
    "includeDetails": true
  }
}
```

**Response:**
```json
[
  {
    "success": true,
    "planet_name": "Kepler-452 b",
    "prediction": "potentially_habitable",
    "confidence": 0.75,
    "probabilities": {
      "habitable": 0.15,
      "potentially_habitable": 0.75,
      "not_habitable": 0.10
    },
    "details": {
      "habitability_score": 68.5,
      "reasoning": [
        "Planet size is in the optimal range for habitability",
        "Temperature allows for liquid water"
      ]
    }
  }
]
```

#### POST `/api/predict/classification`
Classify planet types (Rocky, Super-Earth, Neptune-like, Gas Giant).

#### POST `/api/predict/detection`
Validate exoplanet detection status (CONFIRMED, CANDIDATE, FALSE_POSITIVE).

#### POST `/api/predict/batch`
Process multiple prediction types in a single request.

#### GET `/api/predict/models`
Get information about available ML models.

### Dataset Endpoints

#### GET `/api/datasets`
Retrieve paginated dataset listings.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search term for planet names
- `discoveryMethod` (string): Filter by discovery method
- `minYear` (number): Minimum discovery year
- `maxYear` (number): Maximum discovery year

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalPlanets": 100,
    "discoveryMethods": {
      "Transit": 65,
      "Radial Velocity": 25,
      "Direct Imaging": 10
    },
    "yearRange": {
      "earliest": 1995,
      "latest": 2024
    }
  }
}
```

#### GET `/api/datasets/:id`
Get detailed information about a specific planet.

#### GET `/api/datasets/:id/download`
Download planet data in CSV format.

#### GET `/api/datasets/stats`
Get comprehensive dataset statistics.

### Upload Endpoints

#### POST `/api/upload`
Upload and process CSV dataset files.

**Request:** Multipart form data with file field

**Response:**
```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "file": {
    "filename": "exoplanets_2024.csv",
    "size": 1048576,
    "uploadPath": "/uploads/exoplanets_2024.csv"
  },
  "analysis": {
    "totalRows": 1000,
    "validRows": 987,
    "invalidRows": 13,
    "columns": [...],
    "qualityScore": 87.5,
    "issues": [...]
  }
}
```

#### GET `/api/upload/history`
Get upload history and file management.

## 🔒 Security Features

- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers for XSS, CSRF protection
- **File Validation**: Strict file type and size validation
- **Request Validation**: Joi schema validation for all inputs
- **Error Handling**: Comprehensive error responses without sensitive data

## 🤖 Machine Learning Features

### Models
- **Habitability Prediction**: Multi-class classification (habitable, potentially_habitable, not_habitable)
- **Planet Classification**: Type classification (Rocky, Super-Earth, Neptune-like, Gas Giant)
- **Detection Validation**: Status validation (CONFIRMED, CANDIDATE, FALSE_POSITIVE)

### Features Used
- **Habitability**: Planet radius, mass, orbital period, stellar temperature, etc.
- **Classification**: Planet radius, mass, bulk mass, density
- **Detection**: Transit depth, period stability, signal-to-noise ratio

### Capabilities
- Real-time prediction processing
- Batch prediction support
- Confidence scoring
- Feature importance analysis
- Model performance metrics

## ⚙️ Configuration

### Environment Variables

```bash
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_MAX_FILE_SIZE=10485760
UPLOAD_ALLOWED_TYPES=.csv,.json,.txt

# ML Configuration
ML_CONFIDENCE_THRESHOLD=0.7
ML_BATCH_SIZE=32
```

## 📊 Data Format

### Required Planet Data Fields
```json
{
  "pl_name": "string",           // Planet name
  "pl_rade": "number",          // Planet radius (Earth radii)
  "pl_masse": "number",         // Planet mass (Earth masses)
  "pl_orbper": "number",        // Orbital period (days)
  "pl_orbsmax": "number",       // Semi-major axis (AU)
  "pl_eqt": "number",           // Equilibrium temperature (K)
  "st_teff": "number",          // Stellar effective temperature (K)
  "st_rad": "number",           // Stellar radius (Solar radii)
  "st_mass": "number",          // Stellar mass (Solar masses)
  "discoverymethod": "string",   // Discovery method
  "disc_year": "number"         // Discovery year
}
```

## 🚀 Performance

- **Response Times**: < 200ms for single predictions
- **Batch Processing**: Up to 1000 planets per request
- **Memory Usage**: Optimized TensorFlow.js operations
- **File Processing**: Streaming CSV parsing for large datasets
- **Caching**: Model caching for improved performance

## 🔧 Development

### Available Scripts
```bash
npm start          # Production server
npm run dev        # Development with auto-reload
npm test           # Run tests
npm run lint       # ESLint checking
npm run format     # Prettier formatting
```

### API Testing
Use the real NASA datasets:
- **K2 Dataset**: 4,000+ confirmed planets and candidates
- **Kepler Dataset**: 9,500+ objects of interest with disposition scores  
- **TESS Dataset**: 7,700+ transiting exoplanet candidates

### Example API Calls

**Get K2 planets:**
```bash
curl "http://localhost:5000/api/datasets?dataset=k2&limit=10"
```

**Search for specific planet:**
```bash
curl "http://localhost:5000/api/datasets?search=TRAPPIST-1"
```

**Get dataset statistics:**
```bash
curl "http://localhost:5000/api/datasets/stats"
```

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "type": "VALIDATION_ERROR",
    "details": {
      "field": "pl_rade",
      "issue": "must be a positive number"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Types
- `VALIDATION_ERROR`: Invalid request data
- `ML_ERROR`: Machine learning processing error
- `FILE_ERROR`: File upload/processing error
- `RATE_LIMIT_ERROR`: Too many requests
- `SERVER_ERROR`: Internal server error

## 🤝 Integration

### Frontend Integration
```javascript
// Prediction request
const response = await fetch('/api/predict/habitability', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: planetData,
    options: { includeDetails: true }
  })
});

const results = await response.json();
```

### File Upload Integration
```javascript
const formData = new FormData();
formData.append('file', csvFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

## 📚 Additional Resources

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
- [Express.js Documentation](https://expressjs.com/)
- [Joi Validation](https://joi.dev/api/)

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Check `CORS_ORIGIN` in `.env`
2. **File Upload Fails**: Verify file size and type restrictions
3. **ML Predictions Slow**: Reduce batch size or enable model caching
4. **High Memory Usage**: Monitor TensorFlow.js tensor disposal

### Support
For issues and feature requests, please check the project documentation or create an issue in the repository.