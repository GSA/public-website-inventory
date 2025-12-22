/**
 * Site Scanning dataset row
 * Based on the Site Scanning API
 */
export interface SiteScannerData {
    // Basic Info & Ownership
    name?: string;
    agency?: string;
    bureau?: string;
    branch?: string;
    source_list?: string;

    // Initial Request Data
    initial_url?: string;
    initial_domain?: string;
    initial_base_domain?: string;
    initial_top_level_domain?: string;

    // Final URL / Crawl Results
    url?: string;
    domain?: string;
    base_domain?: string;
    top_level_domain?: string;
    redirect?: boolean | string;
    live?: boolean | string;
    filter?: boolean | string;
    status_code?: number | string;
    media_type?: string;
    page_hash?: string;
    "404_test"?: boolean | string;

    // Scan Metadata & Statuses
    scan_date?: string;
    primary_scan_status?: string;
    accessibility_scan_status?: string;
    dns_scan_status?: string;
    not_found_scan_status?: string;
    performance_scan_status?: string;
    robots_txt_scan_status?: string;
    security_scan_status?: string;
    sitemap_xml_scan_status?: string;
    www_scan_status?: string;

    // Performance & SEO
    accessibility_violations?: number | string;
    pageviews?: number | string;
    visits?: number | string;
    ipv6?: boolean | string;
    hostname?: string;
    cms?: string;
    login_provider?: string;
    login?: boolean | string;
    site_search?: boolean | string;
    search_dot_gov?: boolean | string;
    viewport_meta_tag?: boolean | string;
    cumulative_layout_shift?: number | string;
    largest_contentful_paint?: number | string;
    title?: string;
    description?: string;
    keywords?: string;
    canonical_link?: string;
    language?: string;
    language_link?: string;
    main_element_present?: boolean | string;

    // DAP & Analytics
    dap?: boolean | string;
    dap_parameters?: string;
    dap_version?: string;
    ga_tag_id?: string;

    // Third Party Services
    third_party_service_domains?: string;
    third_party_service_urls?: string;
    third_party_service_count?: number | string;
    cookie_domains?: string;

    // Required Links
    required_links_url?: string;
    required_links_text?: string;
    https_enforced?: boolean | string;
    hsts?: boolean | string;

    // Open Graph
    og_title?: string;
    og_description?: string;
    og_article_published?: string;
    og_article_modified?: string;
    og_image?: string;
    og_type?: string;
    og_url?: string;

    // robots.txt
    robots_txt_detected?: boolean | string;
    robots_txt_url?: string;
    robots_txt_status_code?: number | string;
    robots_txt_media_type?: string;
    robots_txt_filesize?: number | string;
    robots_txt_crawl_delay?: number | string;
    robots_txt_sitemap_locations?: string;

    // sitemap.xml
    sitemap_xml_detected?: boolean | string;
    sitemap_xml_url?: string;
    sitemap_xml_status_code?: number | string;
    sitemap_xml_media_type?: string;
    sitemap_xml_filesize?: number | string;
    sitemap_xml_count?: number | string;
    sitemap_xml_lastmod?: string;
    sitemap_xml_pdf_count?: number | string;
    sitemap_xml_page_hash?: string;

    // USWDS Detection
    uswds_favicon?: number | string;
    uswds_favicon_in_css?: number | string;
    uswds_publicsans_font?: number | string;
    uswds_inpage_css?: number | string;
    uswds_usa_class_list?: string;
    uswds_banner_heres_how?: boolean | string;
    uswds_usa_classes?: number | string;
    uswds_string?: number | string;
    uswds_string_in_css?: number | string;
    uswds_semantic_version?: string;
    uswds_version?: string;
    uswds_count?: number | string;

    // WWW subdomain check
    www_url?: string;
    www_status_code?: number | string;
    www_title?: string;

    /**
     * Bulk CSV includes many more columns over time.
     * Keep this to avoid breaking when new columns appear.
     */
    [key: string]: any;
}