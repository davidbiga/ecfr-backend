/**
 * This file contains the API endpoints for the eCFR Analysis API.
 * It is used to get the agency information and their CFR references.
 * It is used to get the historical changes to the eCFR.
 */
const express = require('express')
const cors = require('cors')
const { fetchECFRData } = require('./ecfr-api')
const app = express()
const port = 3000

app.use(express.json())
app.use(cors('*'))

// Endpoint to get agency information and their CFR references
app.get('/api/agencies', async (req, res) => {
  try {
    const titleData = await fetchECFRData();
    
    const agencyAnalysis = {
      totalAgencies: titleData.length,
      agenciesByTitle: {},
      agencies: titleData.map(title => ({
        name: title.name,
        shortName: title.agencies[0].short_name,
        slug: title.agencies[0].slug,
        cfrReferences: title.agencies.map(agency => ({
          title: agency.cfr_references[0].title,
          chapter: agency.cfr_references[0].chapter
        }))
      }))
    };

    // Organize agencies by CFR title
    titleData.forEach(title => {
      title.agencies.forEach(agency => {
        agency.cfr_references.forEach(ref => {
          if (!agencyAnalysis.agenciesByTitle[ref.title]) {
            agencyAnalysis.agenciesByTitle[ref.title] = [];
          }
          agencyAnalysis.agenciesByTitle[ref.title].push({
            name: agency.name,
            shortName: agency.short_name,
            chapter: ref.chapter
          });
        });
      });
    });

    res.json(agencyAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analysis/historical-changes', async (req, res) => {
  try {
    const titleData = await fetchECFRData();
    
    const historicalChanges = {
      byAgency: {},
      metadata: {
        totalCorrections: 0,
        totalAgencies: 0
      }
    };

    // First, create a map of all agencies with their CFR references
    const agencyMap = new Map();
    titleData.forEach(title => {
      title.agencies.forEach(agency => {
        console.log('Processing agency:', agency);
        if (!agencyMap.has(agency.slug)) {
          agencyMap.set(agency.slug, {
            name: agency.name,
            shortName: agency.short_name,
            slug: agency.slug,
            cfrReferences: agency.cfr_references || [],
            corrections: [],
            correctionCount: 0,
            lastCorrectionDate: null,
            modificationDates: new Set(), // Using Set to avoid duplicate dates
            titles: new Set()
          });
        }
        agencyMap.get(agency.slug).titles.add(title.titleNum);
      });
    });

    // Process corrections and assign them to agencies
    titleData.forEach(title => {
      console.log(`Processing title ${title.titleNum} with ${title.corrections?.length || 0} corrections`);
      
      (title.corrections || []).forEach(correction => {
        const correctionData = {
          titleNum: title.titleNum,
          errorCorrected: correction.error_corrected,
          errorOccurred: correction.error_occurred,
          action: correction.corrective_action,
          lastModified: correction.last_modified,
          cfrReferences: correction.cfr_references
        };

        // Check each agency to see if this correction belongs to them
        agencyMap.forEach((agencyData, slug) => {
          // Check if any of the agency's CFR references match the correction's references
          const isRelated = (agencyData.cfrReferences || []).some(agencyRef => {
            return correction.cfr_references.some(corrRef => {
              const titleMatch = corrRef.hierarchy.title.toString() === agencyRef.title.toString();
              const chapterMatch = !agencyRef.chapter || 
                                 (corrRef.hierarchy.section && 
                                  corrRef.hierarchy.section.startsWith(agencyRef.chapter.toString())) ||
                                 (corrRef.hierarchy.part && 
                                  corrRef.hierarchy.part.startsWith(agencyRef.chapter.toString()));
              return titleMatch && chapterMatch;
            });
          });

          if (isRelated) {
            agencyData.corrections.push(correctionData);
            agencyData.correctionCount++;
            
            // Add modification date to the Set
            if (correction.last_modified) {
              agencyData.modificationDates.add(correction.last_modified);
            }
            
            if (!agencyData.lastCorrectionDate || 
                correction.last_modified > agencyData.lastCorrectionDate) {
              agencyData.lastCorrectionDate = correction.last_modified;
            }
            
            historicalChanges.metadata.totalCorrections++;
          }
        });
      });
    });

    // Convert agency map to final format
    agencyMap.forEach((agencyData, slug) => {
      if (agencyData.corrections.length > 0) {
        historicalChanges.byAgency[slug] = {
          name: agencyData.name,
          shortName: agencyData.shortName,
          titles: Array.from(agencyData.titles),
          correctionCount: agencyData.correctionCount,
          lastCorrectionDate: agencyData.lastCorrectionDate,
          modificationDates: Array.from(agencyData.modificationDates).sort((a, b) => 
            new Date(b) - new Date(a)
          ),
          corrections: agencyData.corrections.sort((a, b) => 
            new Date(b.lastModified) - new Date(a.lastModified)
          )
        };
      }
    });

    historicalChanges.metadata.totalAgencies = Object.keys(historicalChanges.byAgency).length;
    res.json(historicalChanges);
  } catch (error) {
    console.error('Error in historical-changes endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('eCFR Analysis API - Use /api endpoints for data')
})

app.listen(port, () => {
  console.log(`eCFR Analysis API listening on port ${port}`)
})