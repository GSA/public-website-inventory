import csvParser from 'csv-parser';
import {DataFrame} from 'dataframe-js';
import axios from "axios";
import {Readable} from "node:stream";
import type {SiteScannerData} from "./types/site-scanner-data";

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
    console.log("Filtering candidates for addition...");
    if (!siteScannerData) return;
    let filteredScannerData =  siteScannerData.filter(row =>
        !row.source_list?.includes('omb_idea') &&
        row.branch === 'executive' &&
        !row.filter &&
        row.status_code !== undefined &&
        Number(row.status_code) >= 200 && Number(row.status_code) < 400 &&
        row.dap &&
        !row.redirect
    );

    console.log(`Filtered ${filteredScannerData.length} candidates for addition.`);
    let filteredScannerDataDf = new DataFrame(filteredScannerData);
    filteredScannerDataDf.select("agency", "bureau", "initial_domain");
    filteredScannerDataDf.toCSV(true, "../../reports/test_candidates_for_addition.csv");
    console.log("Candidate for addition report has been generated.");
}

export async function generateReports() {
    console.log("Running report generation...");
    const scannerApiData = await fetchSiteScannerData()
    await generateAdditions(scannerApiData);
    console.log("Report generation complete.");
}