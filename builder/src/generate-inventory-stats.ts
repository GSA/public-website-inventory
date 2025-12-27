import {execSync} from "node:child_process";
import * as fs from 'fs';
import csvParser from 'csv-parser';
import {DataFrame} from "dataframe-js";
import {InventoryAnalysis} from "./model/inventory-analysis.js";
import {InventoryStats} from "./model/inventory-stats.js";
import {retrieveDomainFromUrl} from "./utils.js";
import type {FederalFileData} from "./types/federal-file-data.js";
import type {PublicWebsiteInventory} from "./types/public-website-inventory-data.js";
import type {WebsiteInventory} from "./types/website-inventory-data.js";
import axios from "axios";
import {Readable} from "node:stream";

async function generateWebsiteInventoryMap(): Promise<Map<string, string>> {
    const inventoryFilePath = './website_inventories.csv';

    let websiteInventoryMap = new Map<string, string>();
    const inventoryStream = fs.createReadStream(inventoryFilePath, { encoding: 'utf8' });
    const parser = csvParser();
    try {
        inventoryStream.pipe(parser);
        for await (const row of parser) {
            const websiteInventoryRow = row as WebsiteInventory;
            websiteInventoryMap.set(websiteInventoryRow.agency, websiteInventoryRow.website_inventory);
        }
    } catch (error) {
      console.error(`There was an issue while reading the Website Inventory: ${error}`);
    } finally {
        inventoryStream.destroy();
    }
    return websiteInventoryMap;
}

/**
 * Metrics to collect:
 * 1. Source Inventory (website_inventories.csv): Agency name and inventory URL.
 * 2. VCS Metadata: Last updated date (via git commit history).
 * 3. Public Inventory Stats (us-gov-public-website-inventory.csv):
 *    - Counts: Total websites, bureaus, and offices.
 *    - Data Quality: Entries missing bureaus/offices, duplicate websites across agencies.
 *    - URL Validation: Identify unacceptable formats (contains '\', ':', '?', or 'www.').
 * 4. Public Inventory Analytics (federal-data.csv):
 */
async function generateInventoryStats(inventoryMap: Map<string, string>) {
    console.log("Generating all inventory analytics...");
    let reportMap = new Map<string, InventoryStats>;

    let usInventoryWebsiteCountMap = new Map<string, number>();
    let inventoryAnalysisResults: any[] = [];
    const federalFileData: FederalFileData[] = await fetchFederalFileData();

    const federalFileDf: DataFrame = new DataFrame(federalFileData);
    const uniqueAgencyList = new Set(federalFileDf.select("agency").toArray().flat());
    const uniqueBureauList = new Set(federalFileDf.select("organization_name").toArray().flat());

    const publicWebsiteInventoryStream =
        fs.createReadStream('../us-gov-public-website-inventory.csv', { encoding: 'utf8' });
    const parser = csvParser({
        mapHeaders: ({header}) => header.toLowerCase()
    });

    try {
        publicWebsiteInventoryStream.pipe(parser);
        for await (const row of parser) {
            getInventoryStats(row, reportMap, usInventoryWebsiteCountMap);
            if (federalFileData.length !== 0) {
                await getInventoryAnalytics(row , federalFileData, inventoryAnalysisResults, uniqueAgencyList, uniqueBureauList);
            }
        }
    } catch (error) {
        console.error(`There was an issue while reading the Website Inventory to generate all analytics: ${error}`);
        process.exit(1);
    } finally {
        publicWebsiteInventoryStream.destroy();
    }

        // add website inventory and commit date from the Website Inventory file and the inventory snapshot csv file
    try {
        let inventoryStats = [];
        for (const [agency, currentInventory] of inventoryMap.entries()) {
            let currentInventoryStat = reportMap.get(agency);

            if (currentInventoryStat) {
                const domain = retrieveDomainFromUrl(currentInventory);
                const latestCommitDate = getLastCommitDate(`../snapshots/${domain}.csv`);
                let currentWebsiteDuplicationCount = 0;
                for ( const uniqueWebsite of currentInventoryStat._unique_websites) {
                    let currentWebsiteCount = usInventoryWebsiteCountMap.get(uniqueWebsite);
                    if (!currentWebsiteCount) continue;
                    if (currentWebsiteCount > 1) {
                        currentWebsiteDuplicationCount = currentWebsiteDuplicationCount + currentWebsiteCount;
                    }
                }

                currentInventoryStat._duplicate_websites = currentWebsiteDuplicationCount;
                currentInventoryStat.website_inventory = currentInventory;
                currentInventoryStat.last_updated_date = latestCommitDate;
                inventoryStats.push(currentInventoryStat.toCsvRow());
            }
        }

        let inventoryStatsDf = new DataFrame(inventoryStats);
        inventoryStatsDf.toCSV(true, '../reports/inventory_stats.csv');

        let inventoryAnalysisDf = new DataFrame(inventoryAnalysisResults);
        inventoryAnalysisDf.toCSV(true, '../reports/inventory_analysis.csv');

    } catch (error) {
        console.error(`There was an writing while reading the Website Inventory: ${error}`);
    }
}

function getInventoryStats(row: any, reportMap: Map<any, any>, websiteCountMap: Map<string, number>) {
    const currentPublicInventoryRow = row as PublicWebsiteInventory;
    const currentAgency = currentPublicInventoryRow.agency;
    let currentInventoryStat = reportMap.get(currentAgency);

    if (!currentInventoryStat) {
        currentInventoryStat = new InventoryStats();
        reportMap.set(currentAgency, currentInventoryStat);
    }
    currentInventoryStat._agency = currentAgency;

    if (currentPublicInventoryRow.website?.trim()) {
        currentInventoryStat._website_count = currentInventoryStat._website_count + 1;
        const currentWebsite = currentPublicInventoryRow.website;
        let currentWebsiteCount = websiteCountMap.get(currentWebsite);
        if (!currentWebsiteCount) {
            currentWebsiteCount = 0;
        }
        websiteCountMap.set(currentWebsite, currentWebsiteCount + 1);
        if (!currentInventoryStat._unique_websites.has(currentWebsite)) {
            currentInventoryStat._unique_websites.add(currentWebsite);
        }

        const re = /(\\|:|\?|www\.)/;
        if (re.test(currentWebsite)) {
            currentInventoryStat._unacceptable_urls = currentInventoryStat._unacceptable_urls + 1;
        }
    }

    if (currentPublicInventoryRow.bureau?.trim()) {
        currentInventoryStat._bureau_count = currentInventoryStat._bureau_count + 1;
    } else {
        currentInventoryStat._entries_without_bureau = currentInventoryStat._entries_without_bureau + 1;
    }

    if (currentPublicInventoryRow.office?.trim()) {
        currentInventoryStat._office_count = currentInventoryStat._office_count + 1;
    } else {
        currentInventoryStat._entries_without_office = currentInventoryStat._entries_without_office + 1;
    }
}

/**
 * This function will populate the inventory_analysis.csv file with the following columns from @\link InventoryAnalysis:
 *
 * @param row
 * @param federalFileData
 * @param inventoryAnalysis
 * @param uniqueAgencyList
 * @param uniqueBureauList
 */
async function getInventoryAnalytics(row: PublicWebsiteInventory,
                                     federalFileData: FederalFileData[],
                                     inventoryAnalysis: any[],
                                     uniqueAgencyList: Set<string>,
                                     uniqueBureauList: Set<string>) {
    const currentPublicInventoryRow = row as PublicWebsiteInventory;
    const currentWebsite = currentPublicInventoryRow.website;
    const currentAgency = currentPublicInventoryRow.agency;
    const currentBureau = currentPublicInventoryRow.bureau;
    const currentOffice = currentPublicInventoryRow.office;
    let currentInventoryAnalysis = new InventoryAnalysis(currentWebsite, currentAgency, currentBureau, currentOffice);

    for (const federalFileRow of federalFileData) {
        const currentFedRow = federalFileRow as FederalFileData;
        currentInventoryAnalysis._domain_agency_in_registry = currentFedRow.agency
        currentInventoryAnalysis._domain_bureau_in_registry = currentFedRow.organization_name;
        currentInventoryAnalysis._agency_matches = currentFedRow.agency === currentAgency;
        currentInventoryAnalysis._bureau_matches = currentFedRow.organization_name === currentBureau;
        currentInventoryAnalysis._website_agency_name_in_registry = currentInventoryAnalysis._agency_matches || uniqueAgencyList.has(currentAgency);
        currentInventoryAnalysis._website_bureau_name_in_registry = currentInventoryAnalysis._bureau_matches || uniqueBureauList.has(currentBureau);
        inventoryAnalysis.push(currentInventoryAnalysis.toCsvRow());
    }
}

async function fetchFederalFileData() {
    console.log("Fetching federal file data...");
    const response = await axios.get("https://raw.githubusercontent.com/cisagov/dotgov-data/refs/heads/main/current-federal.csv", {
        withCredentials: true,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/csv,text/plain,*/**',
        },
        responseType: 'stream',
    }).catch(error => {
        return error.response
    });

    const federalFileData: FederalFileData[] = [];
    if (!response.status || response.status !== 200) {
        console.warn(`There was an issue downloading the federal file CSV: HTTP ${response.status}).`);
        return federalFileData;

    }
    const parser = csvParser({
        mapHeaders: ({ header }) =>
            header.trim().toLowerCase().replace(/\s+/g, "_")
    });
    await new Promise<void>((resolve, reject) => {
        (response.data as Readable)
            .pipe(parser)
            .on("data", (row: FederalFileData) => {
                federalFileData.push(row);
            })
            .on("end", resolve)
            .on("error", reject);
    });

    console.log(`Fetched ${federalFileData.length} rows of site scanner data.`);
    return federalFileData;
}

function getLastCommitDate(filePath: string) {
    const output = execSync(
        `git log -1 --format=%ci -- ${filePath}`,
        { encoding: "utf8" }
    ).trim();
    const d = new Date(output);

    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);

    return `${mm}-${dd}-${yy}`;
}

// usage
export async function generateAnalytics() {
    const inventoryMap = await generateWebsiteInventoryMap();
    await generateInventoryStats(inventoryMap);
}
