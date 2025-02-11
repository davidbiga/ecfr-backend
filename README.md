# ecfr-backend
API for processing responses from the ECFR API and further doing analysis on the data or formatting it for our needs.

## Project Structure

- `ecfr-api.js`: API endpoints for the ECFR API with minor formatting for our needs
- `index.js`: Main file for processing ECFR data.

## API Endpoints

- `GET /api/analysis/historical-changes`: Returns the historical changes to the ECFR.
```
{
  "byAgency": {
    "agriculture-department": {
      "name": "Department of Agriculture",
      "shortName": "USDA",
      "titles": [5, 48, 2, 7],
      "correctionCount": 6,
      "lastCorrectionDate": "2025-01-07",
      "modificationDates": [
        "2025-01-07",
        "2022-12-05",
        "2021-12-22"
      ],
      "corrections": [
        {
          "titleNum": 48,
          "errorCorrected": "2025-01-06",
          "errorOccurred": "2025-01-03",
          "action": "(g) revised",
          "lastModified": "2025-01-07",
          "cfrReferences": [
            {
              "cfr_reference": "48 CFR 47.101",
              "hierarchy": {
                "title": "48",
                "chapter": "1",
                "subchapter": "G",
                "part": "47",
                "subpart": "47.1",
                "section": "47.101"
              }
            }
          ]
        },
        ...
```
- `GET /api/agencies`: Returns the agencies and their references.
```
{
  "totalAgencies": 41,
  "agenciesByTitle": {
    "1": [
      {
        "name": "Administrative Conference of the United States",
        "shortName": "ACUS",
        "chapter": "III"
      },
      {
        "name": "National Commission for Employment Policy",
        "shortName": "",
        "chapter": "IV"
      },
      {
        "name": "Administrative Committee of the Federal Register",
        "shortName": "ACFR",
        "chapter": "I"
      },
      {
        "name": "National Commission on Military, National, and Public Service",
        "shortName": "NCMNPS",
        "chapter": "IV"
      },
      {
        "name": "National Capital Planning Commission",
        "shortName": "NCPC",
        "chapter": "IV"
      },
      {
        "name": "National Capital Planning Commission",
        "shortName": "NCPC",
        "chapter": "VI"
      },
      {
        "name": "President's Commission on White House Fellowships",
        "shortName": "",
        "chapter": "IV"
      }
    ],
    ...

```

## Future Work

- Add more analysis on the data such as word count, sentence count, etc.
- Add implementation for an LLM to do further analysis on the data.
- Add the search API endpoint for ECFR

## Running the project

```bash
nvm use 22
npm install
npm start
```
