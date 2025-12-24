export class InventoryStats {
    _agency: string = "";
    _website_inventory: string = "";
    _last_updated_date: string = "";
    _website_count: number = 0;
    _bureau_count: number = 0;
    _office_count: number = 0;
    _entries_without_bureau: number = 0;
    _entries_without_office: number = 0;
    _duplicate_websites: number = 0;
    _unique_websites: Set<string> = new Set<string>();
    _unacceptable_urls: number = 0;

    get agency(): string {
        return this._agency;
    }

    set agency(value: string) {
        this._agency = value;
    }

    get website_inventory(): string {
        return this._website_inventory;
    }

    set website_inventory(value: string) {
        this._website_inventory = value;
    }

    get last_updated_date(): string {
        return this._last_updated_date;
    }

    set last_updated_date(value: string) {
        this._last_updated_date = value;
    }

    get website_count(): number {
        return this._website_count;
    }

    set website_count(value: number) {
        this._website_count = value;
    }

    get bureau_count(): number {
        return this._bureau_count;
    }

    set bureau_count(value: number) {
        this._bureau_count = value;
    }

    get office_count(): number {
        return this._office_count;
    }

    set office_count(value: number) {
        this._office_count = value;
    }

    get entries_without_bureau(): number {
        return this._entries_without_bureau;
    }

    set entries_without_bureau(value: number) {
        this._entries_without_bureau = value;
    }

    get entries_without_office(): number {
        return this._entries_without_office;
    }

    set entries_without_office(value: number) {
        this._entries_without_office = value;
    }

    get duplicate_websites(): number {
        return this._duplicate_websites;
    }

    set duplicate_websites(value: number) {
        this._duplicate_websites = value;
    }

    get unique_websites(): Set<string> {
        return this._unique_websites;
    }

    set unique_websites(value: Set<string>) {
        this._unique_websites = value;
    }

    get unacceptable_urls(): number {
        return this._unacceptable_urls;
    }

    set unacceptable_urls(value: number) {
        this._unacceptable_urls = value;
    }

    toCsvRow() {
        return {
            agency: this._agency,
            website_inventory: this._website_inventory,
            last_updated_date: this._last_updated_date,
            website_count: this._website_count,
            bureau_count: this._bureau_count,
            office_count: this._office_count,
            entries_without_bureau: this._entries_without_bureau,
            entries_without_office: this._entries_without_office,
            duplicate_websites: this._duplicate_websites,
        }
    }
}