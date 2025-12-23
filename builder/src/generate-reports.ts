import csvParser from 'csv-parser';
import {DataFrame} from 'dataframe-js';
import fs from "node:fs/promises";
import axios from "axios";
import {Readable} from "node:stream";
import type {SiteScannerData} from "./types/site-scanner-data.js";
import {RemovalData} from "./model/removal-data.js";

async function fetchSiteScannerData() {
    console.log("Fetching site scanner data...");
    const response = await axios.get("https://api.gsa.gov/technology/site-scanning/data/site-scanning-latest.csv", {
        withCredentials: true,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/csv,text/plain,*/**',
        },
        responseType: 'stream',
    }).catch(error => {
        return error.response
    });

    if (!response.status || response.status !== 200) {
        console.warn(`There was an issue downloading the CSV from site-scanner: HTTP ${response.status}).`);
        return null;
    }

    const siteScannerData: SiteScannerData[] = [];
    await new Promise<void>((resolve, reject) => {
        (response.data as Readable)
            .pipe(csvParser())
            .on("data", (row: SiteScannerData) => {
                siteScannerData.push(row);
            })
            .on("end", resolve)
            .on("error", reject);
    });

    console.log(`Fetched ${siteScannerData.length} rows of site scanner data.`);
    return siteScannerData;
}

async function generateAdditions(siteScannerData: SiteScannerData[] | null) {
    if (!siteScannerData) return;
    console.log("Filtering candidates for addition...");
    let filteredScannerData =  siteScannerData.filter(row =>
        !row.source_list?.includes('omb_idea') &&
        row.branch === 'Executive' &&
        row.filter === 'false' &&
        row.status_code !== undefined &&
        Number(row.status_code) >= 200 && Number(row.status_code) < 400 &&
        row.dap === 'true' &&
        row.redirect === 'false'
    );

    console.log(`Filtered ${filteredScannerData.length} candidates for addition.`);
    try {
        let filteredScannerDataDf = new DataFrame(filteredScannerData);
        filteredScannerDataDf = filteredScannerDataDf.select("agency", "bureau", "initial_domain");
        let orderedFilteredScannerDataDf = filteredScannerDataDf.sortBy(['agency', 'bureau', 'initial_domain'])
        const writeCsv = orderedFilteredScannerDataDf.toCSV();
        await fs.writeFile("../reports/candidates_for_addition.csv", writeCsv);
    } catch (error) {
        console.error(error);
    }
    console.log("Candidate for addition report has been generated.");
}

async function generateRemovals(siteScannerData: SiteScannerData[] | null) {
    if (!siteScannerData) return;
    console.log("Filtering candidates for removal...");
    const filteredScannerData: RemovalData[] = [];
    for (const siteScannerDataRow of siteScannerData) {
        if (!siteScannerDataRow.source_list?.includes('omb_idea') &&
            siteScannerDataRow.branch === 'Executive') {
            let reason: string[] = [];
            if (siteScannerDataRow.filter === 'false') reason.push('Filter');
            if (siteScannerDataRow.redirect === 'true') reason.push('Redirect');
            if (siteScannerDataRow.status_code !== undefined && Number(siteScannerDataRow.status_code) >= 400)
                reason.push('Status Code');
            if (reason.length > 0) {
                const currentAgency = siteScannerDataRow.agency === undefined ? "" : siteScannerDataRow.agency;
                const currentBureau = siteScannerDataRow.bureau === undefined ? "" : siteScannerDataRow.bureau;
                const currentInitialDomain = siteScannerDataRow.initial_domain === undefined ? "" : siteScannerDataRow.initial_domain;
                filteredScannerData.push(new RemovalData(currentAgency, currentBureau, currentInitialDomain, reason))
            }
        }
    }
    console.log(`Writing ${filteredScannerData.length} filtered candidates for removal...`);
    if (filteredScannerData.length > 0) {
        try {
            let filteredScannerDataDf = new DataFrame(filteredScannerData);
            let orderedFilteredScannerDataDf = filteredScannerDataDf.sortBy(['agency', 'bureau', 'initial_domain'])
            const writeCsv = orderedFilteredScannerDataDf.toCSV();
            await fs.writeFile("../reports/candidates_for_removal.csv", writeCsv);
        } catch (error) {
            console.error(error);
        }
    }
}

export async function generateReports() {
    console.log("Running report generation...");
    const scannerApiData = await fetchSiteScannerData()
    await generateAdditions(scannerApiData);
    await generateRemovals(scannerApiData);
    console.log("Report generation complete.");
}