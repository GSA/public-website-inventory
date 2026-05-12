# Under Construction - Draft

This repository is a prototype public website inventory for the U.S. Federal Government.  The [inventory file](https://github.com/GSA/public-website-inventory/blob/main/us-gov-public-website-inventory.csv) can be [downloaded directly here](https://raw.githubusercontent.com/GSA/public-website-inventory/refs/heads/main/us-gov-public-website-inventory.csv).  

## Context for Pilot Program Participants

Prior to launching a public website inventory process for all agencies, select agencies have agreed to participate in a pilot program for a potential version of it. The goals of this pilot program are to gather feedback on:
- The instructions on GitHub for how to update and upload files containing agency websites and their organizational owners;
- The [reports](https://github.com/GSA/public-website-inventory/tree/main/reports) on Github that help agencies identify websites to potentially add or remove from their list, and that help agencies understand which websites have problems that prevent successful scanning;
- The process to update and upload files to the agency's principal website;
- The accuracy of the inventory produced by aggregating files uploaded to agencies' principal websites; and
- The helpfulness of the inventory for managing your agency's web footprint and responding to data collections.

## Instructions for Pilot Program Participants

- Wait for an email from OFCIO containing the list of websites for you to upload to your agency's principal website.
- Review the [reports](https://github.com/GSA/public-website-inventory/tree/main/reports) on GitHub that list potential candidates for addition or removal from your list, and make changes to your list as appropriate. (Optional: Review the report containing websites with scanning problems, and reach out to website owners as appropriate.) Document your feedback on these reports.
- NOTE: In comparison to the "Low-Hanging Fruit" data exercise, the public website inventory should include all websites with Website Status (Agency Response) as "Active" (but NOT "Eliminated"). 
- Follow the instructions on GitHub to upload the file to your agency's principal website, then email OFCIO to inform them that you are finished. Document your feedback on the instructions, as well as the process to update and upload the file.
- Wait for an email from OFCIO informing you that the public website inventory has been updated based on uploads by the pilot program participants.
- Review the public website inventory (filtered for your agency) for accuracy and helpfulness as part of your agency's overall efforts to manage its web footprint and respond to data calls. Document your feedback on the inventory's accuracy and helpfulness.

## What the Public Website Inventory is...

The Public Website Inventory is a comprehensive list of the public-facing websites of the U.S. Federal Government, currently required for all CFO Act agencies and optional for the remaining agencies of the Executive branch. Each website must list its agency (top-tier entity) owner and bureau (second-tier entity) owner, with the option to include an office (third-tier entity) owner.

For the purpose of this inventory: 
- "Public-facing” means intended to be accessed and used by a member of the public or a customer, as opposed to a site which is intended to be accessed and used primarily by current Federal Government employees or contractors on behalf of an agency. Use the following steps to determine whether your website is public-facing:
  - First, are the primary intended users Federal employees or contractors? If yes, the website is NOT public-facing. If no, continue to the next question.
  - Second, are the primary intended users anyone, without restriction? If yes, the website IS public-facing. If no, then the primary intended users are part of some defined and restricted group, and you should continue to the next question.
  - Third, are the primary intended users customers (i.e., someone receiving a benefit or service, or support to comply with a law or regulation)? If yes, the website IS public-facing. If no, the website is NOT public-facing. 
- “Website” means a group of globally accessible interlinked web pages under a unique host name that is accessible using a web browser.
  - The website should be listed (and should load properly) without `www.`
  - The website should be listed without any page paths (such as “/program/page1” or "/index.html").
  - The website should be listed without a protocol (such as "https://"). 
  - For example, “agency.gov” and “program.agency.gov” are proper acceptable URL structures for websites in this inventory.
- Even if a website requires a user to log in, in which sense it is not accessible to the general public, it could still be public-facing if it is intended to be used by general public (such as online accounts for government services or benefits).
- Likewise, even if a website is accessible by the general public, it might not be intended for use by the general public (such as in the case of some beta or staging websites) and thus would not be public-facing.
- A website that is primarily used by federal employees or contractors but that is accessible to the public may be public-facing if the website content is of significant public value (e.g., for transparency purposes). Agencies must make this determination on a case-by-case basis.

The inventory is maintained by an automated harvester that first gathers [each of the individual agency website inventory files](https://github.com/GSA/public-website-inventory/blob/main/builder/website_inventories.csv), creates [a snapshot of each agency file](https://github.com/GSA/public-website-inventory/tree/main/snapshots), and then combines them into [one combined inventory](https://github.com/GSA/public-website-inventory/blob/main/us-gov-public-website-inventory.csv).  

#### Examples of what should be included:  
- Sites that are mostly behind logins but that are nonetheless public-facing. 
- Public-facing websites on the .gov and .mil top level domains only.
- Archived or scheduled-to-be-decommissioned websites, if still public-facing.
- Sites that resolve to a human-readable 'document' (e.g. HTML, TXT, PDF).

#### Examples of what should be excluded: 
- Redirects should not be included; instead, provide the final URL website that the target URL redirects to
- Dead or deprecated websites, including former public-facing websites that now redirect elsewhere
- API endpoints
- Sites that resolve to a machine-readable 'data file' (e.g. XML, JSON, CSV)
- FTP servers
- Mail servers
- Staging or development sites that are not public-facing
- Website assets
- Infrastructure-only domains (e.g. www2.x.gov)
- Admin panels that are not public-facing
- Collaboration sites that are not public-facing
- Software as a service sites (e.g. agency.sharepoint.com)
- Social media websites 

## How to update an agency's website inventory...

Each agency is required to host and keep up to date their public website inventory at `agency.gov/websites.csv` with the following specifications: 

- The inventory file must follow the schema demonstrated with [this example file](https://github.com/GSA/public-website-inventory/blob/main/builder/example.csv).
- The `website` field should not contain a protocol (e.g. https://), port (e.g. :8080), or path (e.g. /anything).  In other words, it should only contain subdomains, root domains, and the top level domain (e.g. `x.y.gov`).
- Furthermore, `www.` should not be included for any website.  https://www.x.gov should be represented as `x.gov` and https://www.x.y.gov should be represented as `x.y.gov` in the Website field.  
- The `agency` (i.e., top-tier entity) and `bureau` (i.e., second-tier entity) names, spelling, and capitalization should be standardized.
- The `office` (i.e., third-tier entity) field is optional and should express which office or sub-bureau component operates a website. Names, spelling, and capitalization should be standardized.
- The inventory file should be kept up to date with what is currently live on the public internet.  Planned but not yet live sites should not be included.  Sites that are scheduled for but have not yet been decommissioned should remain.  When sites go live or are turned off, they should then be added or removed from the inventory file.
- agency.gov/websites.csv can redirect to a final URL, but the file must resolve when https://agency.gov/websites.csv is loaded into a browser.  

This model is [similar to other reporting requirements](https://github.com/GSA/site-scanning/issues/1104) and attempts to be straightforward for agencies to manage however works best for them.  

#### Quick Links
- [Where to find an agency's website inventory](https://github.com/GSA/public-website-inventory/blob/main/builder/website_inventories.csv).
- [The guidelines to follow for what should go in a website inventory](https://github.com/GSA/public-website-inventory?tab=readme-ov-file).
- [A report suggesting sites that agencies may want to add to their inventories](https://github.com/GSA/public-website-inventory/blob/main/reports/candidates_for_addition.csv) (live, have DAP, don't redirect, and not being filtered as likely non-public sites).
- [A report suggesting sites that agencies may want to remove from their inventories](https://github.com/GSA/public-website-inventory/blob/main/reports/candidates_for_removal.csv) (Redirects or has a 4xx, 5xx status code).

## How to Get Help...

This inventory is overseen by the [Site Scanning program](https://digital.gov/site-scanning) at GSA.  You can contact them anytime at [site-scanning@gsa.gov](mailto:site-scanning@gsa.gov)

## Why is this inventory necessary?  

- There is no central catalog of all Federal websites that can point to which all websites the government operates for public use.  This inventory provides that.
- This inventory provides another important service, answering not just which agency but also which bureau and potentially office administers which website.  The [.gov registry that is published by CISA](https://github.com/cisagov/dotgov-data/blob/main/current-federal.csv) can only provide that information for an entire base domain and does not have fidelity at the subdomain level.  

## Helpful Links
- [Website inventory file made interactive via Flat GitHub](https://flatgithub.com/GSA/public-website-inventory/blob/main/us-gov-public-website-inventory.csv)
- [Website inventory file via GitHub.dev](https://github.dev/GSA/public-website-inventory/blob/main/us-gov-public-website-inventory.csv)
