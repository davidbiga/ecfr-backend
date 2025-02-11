/**
 * This file contains the functions for fetching data from the eCFR API.
 * It is used to get the agency data and the corrections data.
 * It is used to get the title data.
 */
const axios = require('axios');
const ECFR_API_URL = 'https://www.ecfr.gov/api/admin/v1';


async function fetchAgencyData() {
  try {
    const response = await axios.get(`${ECFR_API_URL}/agencies`);
    return response.data.agencies;
  } catch (error) {
    console.error('Error fetching agency data:', error);
    throw error;
  }
}

async function fetchCorrectionsData() {
  try {
    const response = await axios.get(`${ECFR_API_URL}/corrections.json`);
    return response.data.ecfr_corrections;
  } catch (error) {
    console.error('Error fetching corrections data:', error);
    throw error;
  }
}

async function fetchECFRData() {
  try {
    const [agencies, allCorrections] = await Promise.all([
      fetchAgencyData(),
      fetchCorrectionsData()
    ]);
    
    // Get unique titles from agency CFR references
    const titles = new Set();
    agencies.forEach(agency => {
      agency.cfr_references.forEach(ref => {
        titles.add(ref.title);
      });
    });
    
    // Create corrections map by title
    const correctionsByTitle = allCorrections.reduce((acc, correction) => {
      if (!acc[correction.title]) {
        acc[correction.title] = [];
      }
      acc[correction.title].push(correction);
      return acc;
    }, {});
    
    // Create title data without fetching content
    const titleData = Array.from(titles).map(titleNum => ({
      titleNum,
      agencies: agencies.filter(agency => 
        agency.cfr_references.some(ref => ref.title === titleNum)
      ),
      corrections: correctionsByTitle[titleNum] || []
    }));
    
    return titleData;
  } catch (error) {
    console.error('Error fetching eCFR data:', error);
    throw error;
  }
}

module.exports = {
  fetchAgencyData,
  fetchCorrectionsData,
  fetchECFRData
}; 