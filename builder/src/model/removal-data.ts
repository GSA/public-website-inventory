/**
 * Removal Data for the Candidate of Removals list
 */
export class RemovalData {
    agency: string;
    bureau: string;
    initial_domain: string;
    reason: string[];

    constructor(agency: string, bureau: string, initial_domain: string, reason: string[]) {
        this.agency = agency;
        this.bureau = bureau;
        this.initial_domain = initial_domain;
        this.reason = reason;
    }
}