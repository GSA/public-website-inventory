export class ScanErrors {
    _agency: string = "";
    _bureau: string = "";
    _initial_url: string = "";
    _initial_domain: string = "";
    _url: string = "";
    _domain: string = "";
    _issue: string = "";

    constructor(agency: string, bureau: string, initial_url: string, initial_domain: string, url: string, domain: string) {
        this._agency = agency;
        this._bureau = bureau;
        this._initial_url = initial_url;
        this._initial_domain = initial_domain;
        this._url = url;
        this._domain = domain;
    }

    get issue(): string {
        return this._issue;
    }

    set issue(value: string) {
        this._issue = value;
    }

    toCsvRow() {
        return {
            agency: this._agency,
            bureau: this._bureau,
            initial_url: this._initial_url,
            initial_domain: this._initial_domain,
            url: this._url,
            domain: this._domain,
            issue: this._issue
        }
    }

}