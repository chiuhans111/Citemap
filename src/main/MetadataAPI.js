class Metadata {
    title = ""
    citations = {}
    references = {}
    doi = ""
    author = ""
    constructor(doi) {
        this.doi = doi
    }
}

/**
 * A basic framework for getting metadata from doi
 * users should call get(doi) to retrive metadata object
 * API should implement _get(doi) and return metadata object
 */
class MetadataAPI {
    /**@type {} */
    cache = {}
    constructor() {
    }

    /**
     * Get Metadata of doi
     * @param {String} doi 
     */
    async get(doi) {
        if (!(doi in this.cache))
            this.cache[doi] = await this._get(doi)
        return this.cache[doi]
    }

    /**
     * Get Metadata of doi
     * @param {String} doi 
     */
    async _get(doi) {
        return new Metadata(doi)
    }
}


export { MetadataAPI, Metadata }