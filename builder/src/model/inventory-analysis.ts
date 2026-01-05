export class InventoryAnalysis {
    _website: string = "";
    _website_agency: string = "";
    _website_bureau: string = "";
    _website_office: string = "";
    _domain_agency_in_registry: string = "";
    _domain_bureau_in_registry: string = "";
    _agency_matches: boolean = false;
    _bureau_matches: boolean = false;
    _website_agency_name_in_registry: boolean = false;
    _website_bureau_name_in_registry: boolean = false;

    constructor(website: string, website_agency: string, website_bureau: string, website_office: string) {
        this._website = website;
        this._website_agency = website_agency;
        this._website_bureau = website_bureau;
        this._website_office = website_office;
    }

    toCsvRow() {
        return {
            website: this._website,
            website_agency: this._website_agency,
            website_bureau: this._website_bureau,
            website_office: this._website_office,
            domain_agency_in_registry: this._domain_agency_in_registry,
            domain_bureau_in_registry: this._domain_bureau_in_registry,
            agency_matches: this._agency_matches,
            bureau_matches: this._bureau_matches,
            website_agency_name_in_registry: this._website_agency_name_in_registry,
            website_bureau_name_in_registry: this._website_bureau_name_in_registry
        }
    }

}