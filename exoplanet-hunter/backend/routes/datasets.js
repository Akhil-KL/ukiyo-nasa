import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import validator from '../middleware/requestValidator.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Real NASA datasets configuration
const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data', 'raw');
const DATASETS = {
  k2: 'K2 Planets and Candidate.csv',
  kepler: 'Kepler Objects of Interest(KOI).csv', 
  tess: 'TESS Objects of Interest(TOI).csv'
};

/**
 * Helper function to read and parse NASA CSV files
 */
async function parseNASADataset(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Skip NASA header comments (lines starting with #)
    const lines = fileContent.split('\n');
    const dataStart = lines.findIndex(line => !line.startsWith('#') && line.trim() !== '');
    const csvContent = lines.slice(dataStart).join('\n');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error(`Error parsing dataset ${filePath}:`, error);
    throw error;
  }
}

/**
 * Helper function to get dataset metadata
 */
function getDatasetMetadata(datasetName) {
  const metadata = {
    k2: {
      name: 'K2 Planets and Candidates',
      description: 'K2 mission exoplanet discoveries and candidates',
      source: 'NASA Exoplanet Archive',
      mission: 'K2',
      columns: {
        primary: ['pl_name', 'hostname', 'disposition', 'discoverymethod'],
        physical: ['pl_rade', 'pl_radj', 'pl_bmasse', 'pl_bmassj'],
        orbital: ['pl_orbper', 'pl_orbsmax', 'pl_orbeccen'],
        stellar: ['st_teff', 'st_rad', 'st_mass', 'st_met']
      }
    },
    kepler: {
      name: 'Kepler Objects of Interest (KOI)',
      description: 'Kepler mission objects of interest and dispositions',
      source: 'NASA Exoplanet Archive',
      mission: 'Kepler',
      columns: {
        primary: ['kepoi_name', 'kepler_name', 'koi_disposition', 'koi_pdisposition'],
        physical: ['koi_prad', 'koi_pradj', 'koi_pmass', 'koi_pmassj'],
        orbital: ['koi_period', 'koi_sma', 'koi_eccen'],
        stellar: ['koi_stemp', 'koi_srad', 'koi_smass', 'koi_smet']
      }
    },
    tess: {
      name: 'TESS Objects of Interest (TOI)',
      description: 'TESS mission transiting exoplanet candidates',
      source: 'NASA Exoplanet Archive',
      mission: 'TESS',
      columns: {
        primary: ['toi', 'tid', 'tfopwg_disp'],
        physical: ['pl_rade', 'pl_radj', 'pl_bmasse', 'pl_bmassj'],
        orbital: ['pl_orbper', 'pl_orbsmax', 'pl_orbeccen'],
        stellar: ['st_teff', 'st_rad', 'st_mass', 'st_met']
      }
    }
  };
  return metadata[datasetName] || null;
}

/**
 * GET /api/datasets
 * Returns available NASA datasets with pagination and filtering
 */
router.get('/', validator.queryDatasets, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      dataset = 'all',
      disposition = '',
      discoveryMethod = '',
      minYear = '',
      maxYear = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 items per page
    const offset = (pageNum - 1) * limitNum;

    let allData = [];
    let datasetsInfo = [];

    // Determine which datasets to include
    const datasetsToLoad = dataset === 'all' ? Object.keys(DATASETS) : [dataset];
    
    for (const datasetName of datasetsToLoad) {
      if (!DATASETS[datasetName]) continue;
      
      try {
        const filePath = path.join(DATA_DIR, DATASETS[datasetName]);
        const data = await parseNASADataset(filePath);
        
        // Add dataset source to each record
        const dataWithSource = data.map(item => ({
          ...item,
          dataset_source: datasetName,
          dataset_mission: getDatasetMetadata(datasetName)?.mission || datasetName.toUpperCase()
        }));
        
        allData = allData.concat(dataWithSource);
        datasetsInfo.push({
          name: datasetName,
          count: data.length,
          metadata: getDatasetMetadata(datasetName)
        });
        
      } catch (error) {
        console.error(`Error loading dataset ${datasetName}:`, error);
        // Continue with other datasets
      }
    }

    // Apply filters
    let filteredData = allData.filter(item => {
      // Search filter (across multiple fields)
      if (search) {
        const searchLower = search.toLowerCase();
        const searchFields = [
          item.pl_name, item.hostname, item.kepoi_name, item.kepler_name, 
          item.toi, item.tid
        ].filter(Boolean);
        
        const matchesSearch = searchFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }

      // Disposition filter
      if (disposition) {
        const itemDisposition = item.disposition || item.koi_disposition || item.tfopwg_disp || '';
        if (!itemDisposition.toLowerCase().includes(disposition.toLowerCase())) {
          return false;
        }
      }

      // Discovery method filter
      if (discoveryMethod) {
        const method = item.discoverymethod || '';
        if (!method.toLowerCase().includes(discoveryMethod.toLowerCase())) {
          return false;
        }
      }

      // Year filters
      if (minYear || maxYear) {
        const year = parseInt(item.disc_year) || 0;
        if (minYear && year < parseInt(minYear)) return false;
        if (maxYear && year > parseInt(maxYear)) return false;
      }

      return true;
    });

    // Sort data
    filteredData.sort((a, b) => {
      const aName = a.pl_name || a.kepoi_name || a.toi || '';
      const bName = b.pl_name || b.kepoi_name || b.toi || '';
      return aName.localeCompare(bName);
    });

    // Paginate
    const paginatedData = filteredData.slice(offset, offset + limitNum);
    const totalPages = Math.ceil(filteredData.length / limitNum);

    // Generate summary statistics
    const summary = {
      totalPlanets: filteredData.length,
      totalInAllDatasets: allData.length,
      datasets: datasetsInfo,
      dispositions: {},
      discoveryMethods: {},
      yearRange: {
        earliest: null,
        latest: null
      }
    };

    // Calculate disposition stats
    filteredData.forEach(item => {
      const disp = item.disposition || item.koi_disposition || item.tfopwg_disp || 'Unknown';
      summary.dispositions[disp] = (summary.dispositions[disp] || 0) + 1;
      
      const method = item.discoverymethod || 'Unknown';
      summary.discoveryMethods[method] = (summary.discoveryMethods[method] || 0) + 1;
      
      const year = parseInt(item.disc_year);
      if (!isNaN(year)) {
        if (!summary.yearRange.earliest || year < summary.yearRange.earliest) {
          summary.yearRange.earliest = year;
        }
        if (!summary.yearRange.latest || year > summary.yearRange.latest) {
          summary.yearRange.latest = year;
        }
      }
    });

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: filteredData.length,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      summary,
      filters: {
        search,
        dataset,
        disposition,
        discoveryMethod,
        minYear,
        maxYear
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/datasets/:id
 * Get detailed information about a specific planet/object
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Search across all datasets for the planet
    for (const [datasetName, filename] of Object.entries(DATASETS)) {
      try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await parseNASADataset(filePath);
        
        const planet = data.find(item => 
          item.pl_name === id || 
          item.kepoi_name === id || 
          item.kepler_name === id ||
          item.toi === id ||
          item.hostname === id
        );
        
        if (planet) {
          const enrichedPlanet = {
            ...planet,
            dataset_source: datasetName,
            dataset_metadata: getDatasetMetadata(datasetName),
            calculated_properties: calculateDerivedProperties(planet)
          };
          
          return res.json({
            success: true,
            data: enrichedPlanet
          });
        }
      } catch (error) {
        console.error(`Error searching dataset ${datasetName}:`, error);
      }
    }
    
    res.status(404).json({
      success: false,
      error: {
        message: 'Planet not found',
        type: 'NOT_FOUND'
      }
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/datasets/:id/download
 * Download planet data in CSV format
 */
router.get('/:id/download', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the planet first
    let planetData = null;
    let sourceDataset = null;
    
    for (const [datasetName, filename] of Object.entries(DATASETS)) {
      try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await parseNASADataset(filePath);
        
        const planet = data.find(item => 
          item.pl_name === id || 
          item.kepoi_name === id || 
          item.kepler_name === id ||
          item.toi === id ||
          item.hostname === id
        );
        
        if (planet) {
          planetData = planet;
          sourceDataset = datasetName;
          break;
        }
      } catch (error) {
        console.error(`Error searching dataset ${datasetName}:`, error);
      }
    }
    
    if (!planetData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Planet not found',
          type: 'NOT_FOUND'
        }
      });
    }
    
    // Convert to CSV
    const csv = Papa.unparse([planetData]);
    const filename = `${id}_${sourceDataset}_data.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
    
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/datasets/stats
 * Get comprehensive statistics across all datasets
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = {
      datasets: {},
      overall: {
        totalObjects: 0,
        confirmedPlanets: 0,
        candidates: 0,
        falsePositives: 0
      },
      missions: {},
      discoveryMethods: {},
      yearlyDiscoveries: {}
    };

    for (const [datasetName, filename] of Object.entries(DATASETS)) {
      try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await parseNASADataset(filePath);
        
        stats.datasets[datasetName] = {
          name: getDatasetMetadata(datasetName)?.name || datasetName,
          count: data.length,
          confirmed: 0,
          candidates: 0,
          falsePositives: 0,
          lastUpdated: new Date().toISOString()
        };

        stats.overall.totalObjects += data.length;
        
        // Count dispositions
        data.forEach(item => {
          const disposition = (item.disposition || item.koi_disposition || item.tfopwg_disp || '').toLowerCase();
          
          if (disposition.includes('confirmed')) {
            stats.datasets[datasetName].confirmed++;
            stats.overall.confirmedPlanets++;
          } else if (disposition.includes('candidate')) {
            stats.datasets[datasetName].candidates++;
            stats.overall.candidates++;
          } else if (disposition.includes('false')) {
            stats.datasets[datasetName].falsePositives++;
            stats.overall.falsePositives++;
          }
          
          // Discovery methods
          const method = item.discoverymethod || 'Unknown';
          stats.discoveryMethods[method] = (stats.discoveryMethods[method] || 0) + 1;
          
          // Yearly discoveries
          const year = item.disc_year;
          if (year) {
            stats.yearlyDiscoveries[year] = (stats.yearlyDiscoveries[year] || 0) + 1;
          }
          
          // Mission stats
          const mission = getDatasetMetadata(datasetName)?.mission || datasetName.toUpperCase();
          if (!stats.missions[mission]) {
            stats.missions[mission] = { total: 0, confirmed: 0 };
          }
          stats.missions[mission].total++;
          if (disposition.includes('confirmed')) {
            stats.missions[mission].confirmed++;
          }
        });
        
      } catch (error) {
        console.error(`Error processing stats for ${datasetName}:`, error);
      }
    }

    res.json({
      success: true,
      data: stats,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to calculate derived properties
 */
function calculateDerivedProperties(planet) {
  const derived = {};
  
  try {
    // Calculate habitability indicators
    const radius = parseFloat(planet.pl_rade) || parseFloat(planet.koi_prad);
    const period = parseFloat(planet.pl_orbper) || parseFloat(planet.koi_period);
    const temp = parseFloat(planet.pl_eqt) || parseFloat(planet.koi_teq);
    const stellarTemp = parseFloat(planet.st_teff) || parseFloat(planet.koi_stemp);
    
    if (radius) {
      derived.size_category = radius < 1.25 ? 'Earth-size' :
                             radius < 2.0 ? 'Super-Earth' :
                             radius < 4.0 ? 'Mini-Neptune' :
                             radius < 10.0 ? 'Neptune-size' : 'Jupiter-size+';
    }
    
    if (period && stellarTemp) {
      // Rough habitable zone calculation
      const stellarLuminosity = Math.pow(stellarTemp / 5778, 4);
      const habitableZoneInner = Math.sqrt(stellarLuminosity / 1.1);
      const habitableZoneOuter = Math.sqrt(stellarLuminosity / 0.53);
      
      const semiMajor = parseFloat(planet.pl_orbsmax) || parseFloat(planet.koi_sma);
      if (semiMajor) {
        derived.in_habitable_zone = semiMajor >= habitableZoneInner && semiMajor <= habitableZoneOuter;
      }
    }
    
    if (temp) {
      derived.temperature_category = temp < 200 ? 'Too Cold' :
                                   temp < 273 ? 'Cold' :
                                   temp < 373 ? 'Temperate' :
                                   temp < 500 ? 'Hot' : 'Too Hot';
    }
    
  } catch (error) {
    console.error('Error calculating derived properties:', error);
  }
  
  return derived;
}

export default router;