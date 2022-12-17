import { MetadataAPI, Metadata } from "./MetadataAPI"

class OpenCitation extends MetadataAPI {
    api_token = null

    constructor(api_token) {
        super()
        this.api_token = api_token
    }

    // Call api with authorization header and get json object
    async call_api(url) {
        const req = new Request(
            url, {
            method: "get",
            mode: "cors",
            headers: {
                "authorization": this.api_token,
                "Accept": "application/json"
            }
        }
        )
        console.log('requesting', req)
        const res = await fetch(req)
        return await res.json()
    }

    // get metadata
    async metadata(doi) {
        return (await this.call_api("https://opencitations.net/index/coci/api/v1/metadata/" + doi))[0]
    }

    async _get(doi) {
        const metadata = new Metadata(doi)
        const result = await this.metadata(doi)
        console.log(result)
        metadata.title = result.title
        metadata.author = result.author
        metadata.citations = {}
        metadata.references = {}

        result.citation.split(';')
            .map(x => x.trim()).filter(x => x.length > 0)
            .map(x => metadata.citations[x] = true)

        result.reference.split(';')
            .map(x => x.trim()).filter(x => x.length > 0)
            .map(x => metadata.references[x] = true)

        metadata.year = parseInt(result.year)

        return metadata
    }
}


export default OpenCitation