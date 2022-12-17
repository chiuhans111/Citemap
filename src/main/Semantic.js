import { MetadataAPI, Metadata } from "./MetadataAPI"

class Semantic extends MetadataAPI {

    constructor() {
        super()
    }

    async request(url) {
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
        return res.json()
    }


    async _get(doi) {
        const metadata = new Metadata(doi)

        const result = await this.request("https://api.semanticscholar.org/graph/v1/paper/" + doi + "?fields=title,authors,year")
        const citations = await this.request("https://api.semanticscholar.org/graph/v1/paper/DOI:" + doi + "/citations?fields=paperId")
        const references = await this.request("https://api.semanticscholar.org/graph/v1/paper/DOI:" + doi + "/references?fields=paperId")
        
        console.log(result, citations, references)

        metadata.title = result.title
        metadata.author = result.authors

        metadata.citations = {}
        metadata.references = {}


        return metadata
    }
}


export default Semantic