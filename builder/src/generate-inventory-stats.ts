import {execSync} from "node:child_process";
import * as fs from 'fs';
import csvParser from 'csv-parser';
import {InventoryStats} from "./model/inventory-stats.js";
import type {WebsiteInventory} from "./types/website-inventory-data.js";
import type {PublicWebsiteInventory} from "./types/public-website-inventory-data.js";
import {retrieveDomainFromUrl} from "./utils.js";
import {DataFrame} from "dataframe-js";

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
 * 3. Public Inventory Analysis (us-gov-public-website-inventory.csv):
 *    - Counts: Total websites, bureaus, and offices.
 *    - Data Quality: Entries missing bureaus/offices, duplicate websites across agencies.
 *    - URL Validation: Identify unacceptable formats (contains '\', ':', '?', or 'www.').
 */
async function generateInventoryStats(inventoryMap: Map<string, string>) {
    let reportMap = new Map<string, InventoryStats>;
    let websiteCountMap = new Map<string, number>();
    // to check duplicates across all agencies, I should build a map of websites -> number of them found
    // then iterate over the unique websites list of each agency and add return the sum of all the counts for that agency's websites
    const publicWebsiteInventoryStream =
        fs.createReadStream('../us-gov-public-website-inventory.csv', { encoding: 'utf8' });
    const parser = csvParser({
        mapHeaders: ({header}) => header.toLowerCase()
    });
    try {
        publicWebsiteInventoryStream.pipe(parser);
        for await (const row of parser) {
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
                if(!currentInventoryStat._unique_websites.has(currentWebsite)) {
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
    } catch (error) {
        console.error(`There was an issue while reading the Website Inventory: ${error}`);
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
                    let currentWebsiteCount = websiteCountMap.get(uniqueWebsite);
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

    } catch (error) {
        console.error(`There was an writing while reading the Website Inventory: ${error}`);
    }
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
