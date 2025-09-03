This folder contains automatically generated reports that flag websites that agencies may want to consider adding or removing from their website inventories.  They are generated in the following manner (with more explanation at bottom):


[Candidates for Removal](https://github.com/GSA/public-website-inventory/blob/main/reports/candidates_for_removal.csv):


- Is in the Public Website Inventory (source contains `omb_idea`)
- Is Executive Branch (branch=executive)
- Has a filter flag (filter=TRUE)
  - Or redirects (redirect=TRUE)
  - Or is down (status code = 4xx or 5xx)

[Candidates for Addition](https://github.com/GSA/public-website-inventory/blob/main/reports/candidates_for_addition.csv):


- Is not in the Public Website Inventory (source does not contain `omb_idea`)
- Is Executive Branch (branch=executive)
- Does not have a filter flag (filter does not equal TRUE)
- Has a status code = 2xx (status code = 2xx)
- Has DAP (dap=true)
- Doesn't redirect (redirect does not equal TRUE)

[Possible Scan Errors](https://github.com/GSA/public-website-inventory/blob/main/reports/scan_errors.csv)
- suspected meta redirect = redirect=TRUE and has a value in pageviews field
- SSL = primary scan status code of invalid_ssl_cert, ssl_protocol_error, ssl_version_cipher_mismatch
- www-required = status_code = 4xx or 5xx (e.g. 399<x<600) AND www_status_code = 2xx
- www-forbidden = initial_domain and initial_base are the same value AND www_status_code = 4xx or 5xx AND status_code=2xx.


------------

## Details

- 'In the Public Website Inventory' = Already exists in the combined [`us-government-website-inventory.csv` file](https://github.com/GSA/public-website-inventory/blob/main/us-gov-public-website-inventory.csv), which is what provides the `omb_idea` source list in the Site Scanning data.
- 'Is Executive Branch' = aligns with a domain indicated as belonging to an executive branch agency [in the dot-gov registry](https://github.com/cisagov/dotgov-data/blob/main/current-federal.csv).
- 'Filter flag' = Whether the [two ignore lists](https://github.com/GSA/federal-website-index/tree/main/builder/criteria) maintained here suggest that this website may not be best thought of as a public website (e.g. intranets, staff login pages, or non-websites such as APIs or email servers).
- 'Redirects' = Whether the `Initial Domain` resolves to a different final `Domain`, excluding the addition or removal of `www`.
- 'Status Code' = HTTP Status Code, which is a generally good indicator of a site being live or down/dead.
- 'DAP' = Participation in the Digital Analytics Program.

For more details, see the [Site Scanning data dictionary](https://github.com/GSA/site-scanning-documentation/blob/main/data/Site_Scanning_Data_Dictionary.csv).  


## [Inventory Stats Report](https://github.com/GSA/public-website-inventory/blob/main/reports/inventory_stats.csv)

...

