export class InventoryAnalysis {
    _website: string = ""; // from us-gov-public-website-inventory.csv
    _website_agency: string = ""; // from us-gov-public-website-inventory.csv
    _website_bureau: string = ""; // from us-gov-public-website-inventory.csv
    _website_office: string = ""; // from us-gov-public-website-inventory.csv
    _domain_agency_in_registry: boolean = false; // take base domain of us-gov-public-website-inventory.csv Website Column, match to fed file and grab the Agency field
    _domain_bureau_in_registry: boolean = false; // take base domain of us-gov-public-website-inventory.csv Website Column, match to fed file and grab the Organizetion field
    _agency_matches: boolean = false; // does _website_agency match _domain_agency_in_registry
    _bureau_matches: boolean = false; // does _website_bureau match _domain_bureau_in_registry
    _website_agency_name_in_registry: boolean = false; //
    _website_bureau_name_in_registry: boolean = false;
}