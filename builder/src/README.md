# Public Website Inventory Builder
## Overview
The Public Website Inventory Builder is a tool for building the inventory of public websites.
## Prerequisites
- Node.js (See .nvmrc for version)
- Npm 
- Nvm
## Usage
To utilize the builder:
You can follow the following commandline steps below:
```
cd builder
nvm use
npm ci
npm run build
```

### Generate Website Inventory
- The following command will generate the [us-gov-public-website-inventory.csv](../../us-gov-public-website-inventory.csv)
```
npm run generate-inventory
```
- Snapshots are generated for each website in the inventory under [snapshots](../../snapshots)

### Generate Website Inventory Reports and Analysis
- The following command will generate the additions and removals report:
```
npm run generate-reports
```
- The addition report is saved under [reports/candidates_for_addition.csv](../../reports/candidates_for_addition.csv)
- The removal report is saved under [reports/candidates_for_removal.csv](../../reports/candidates_for_removal.csv)

- The following command will run inventory analysis, stats and scan errors report:
```
npm run run-all-analysis
```
- The inventory analysis report is saved under [reports/inventory_analysis.csv](../../reports/inventory_analysis.csv)
- The stats report is saved under [reports/stats.csv](../../reports/inventory_stats.csv)
- The scan errors report is saved under [reports/scan_errors.csv](../../reports/scan_errors.csv)
