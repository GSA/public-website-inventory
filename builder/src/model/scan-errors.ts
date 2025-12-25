import * as domain from "node:domain";

export class ScanErrors {
    _agency: string = ""; // site scanner column
    _bureau: string = ""; // site scanner column
    _initial_url: string = ""; // site scanner column
    _initial_domain: string = ""; // site scanner column
    _url: string = ""; // site scanner column
    _domain: string = ""; // site scanner column
    _issue: string = "";
    /**
     * _issue
     *  - redirect = true === "suspected meta redirect"
     *  - primary_scan_status = "invalid_ssl_cert" | "ssl_protocol_error" | "ssl_version_cipher_mismatch" === SSL
     *  - www_status_code = 2xx && status_code = 4xx to 5xx === "www-required"
     *  - initial_domain === initial_base && (www_status_code = 2xx && status_code = 4xx to 5xx)
     */
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