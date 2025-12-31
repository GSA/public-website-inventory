import csvParser from 'csv-parser';
import {DataFrame} from 'dataframe-js';
import fs from "node:fs/promises";
import axios from "axios";
import {Readable} from "node:stream";
import type {SiteScannerData} from "./types/site-scanner-data.js";
import {RemovalData} from "./model/removal-data.js";
import {ScanErrors} from "./model/scan-errors.js";

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
        !row.source_list?.includes('public_inventory') &&
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
        if (!siteScannerDataRow.source_list?.includes('public_inventory') &&
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

async function generateScannerErrorsReport(siteScannerData: SiteScannerData[] | null) {
    if (!siteScannerData) {
        console.warn("No site scanner data found.");
        return;
    }

    let scanErrors = [];
    for (const siteScannerDataRow of siteScannerData) {
        const suspectedMetaRedirect = siteScannerDataRow.redirect === 'true';

        const sslSet: Set<string> = new Set(['invalid_ssl_cert', 'ssl_protocol_error', 'ssl_version_cipher_mismatch']);
        const primaryScanStatus = siteScannerDataRow.primary_scan_status ?? "";
        const ssl = sslSet.has(primaryScanStatus);

        const sameDomainAndBase = siteScannerDataRow.initial_domain === siteScannerDataRow.base_domain;
        const statusCode = Number(siteScannerDataRow.status_code);
        const wwwStatusCode = Number(siteScannerDataRow.www_status_code);
        const onlyWwwStatusCodeIsValid = (statusCode >= 400 && statusCode < 600) && (wwwStatusCode >= 200 && wwwStatusCode < 300);

        const wwwRequired = !sameDomainAndBase && onlyWwwStatusCodeIsValid;
        const wwwForbidden = sameDomainAndBase && onlyWwwStatusCodeIsValid;

        // if there is no scan error, skip this row
        if (!suspectedMetaRedirect && !ssl && !wwwRequired && !wwwForbidden) {
            continue;
        }

        let scanError: ScanErrors = new ScanErrors(
            siteScannerDataRow.agency ?? "",
            siteScannerDataRow.bureau ?? "",
            siteScannerDataRow.initial_url ?? "",
            siteScannerDataRow.initial_domain ?? "",
            siteScannerDataRow.url ?? "",
            siteScannerDataRow.domain ?? ""
        );

        if (suspectedMetaRedirect) {
            scanError._issue = "Suspected Meta Redirect";
        } else if (ssl) {
            scanError._issue = "ssl";
        } else if (wwwRequired) {
            scanError._issue = "www-required";
        } else {
            scanError._issue = "www-forbidden";
        }
        scanErrors.push(scanError.toCsvRow());
    }

    if (scanErrors.length > 0) {
        console.log(`Writing ${scanErrors.length} scan errors to scan-errors.csv...`);
        try {
            let scanErrorsDf = new DataFrame(scanErrors);
            scanErrorsDf = scanErrorsDf.sortBy(['agency', 'bureau'])
            const writeCsv = scanErrorsDf.toCSV();
            await fs.writeFile("../reports/scan_errors.csv", writeCsv);
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
    await generateScannerErrorsReport(scannerApiData);
    console.log("Report generation complete.");
}