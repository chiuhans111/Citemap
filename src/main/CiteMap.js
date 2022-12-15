import { toRaw } from "vue"


class CiteMap {
    api_token = null
    map = {}
    constructor(api_token) {
        this.api_token = api_token
    }

    async call_api(url) {
        const req = new Request(
            url, {
            method: "get",
            // mode: "cors",
            headers: {
                "authorization": this.api_token,
                "Accept": "application/json"
            }
        }
        )
        console.log('requesting', req)
        const res = await fetch(req)
        return res
    }

    async metadata(dois) {
        return await (await this.call_api("https://opencitations.net/index/coci/api/v1/metadata/" + dois.join("__"))).json()
    }


    async explore(dois) {
        if (typeof (dois) == "string") dois = dois.split('\n')
        dois = dois.filter(x => !(x in this.map) || this.map[x].explored == false)
        const results = await this.metadata(dois)
        for (const result of results) {
            const obj = this.map[result.doi] || {}
            obj.doi = result.doi
            obj.title = result.title
            obj.author = result.author
            obj.citations = {} || obj.citations
            obj.references = {} || obj.references

            result.citation.split(';').map(x => x.trim()).filter(x => x.length > 0).map(x => obj.citations[x] = true)
            result.reference.split(';').map(x => x.trim()).filter(x => x.length > 0).map(x => obj.references[x] = true)

            obj.year = parseInt(result.year)
            obj.score = obj.score || 1
            obj.explored = true
            this.map[result.doi] = obj

            Object.keys(obj.citations)
                .map(x => this.map[x] = this.map[x] || { doi: x, explored: false, score: 1, references: {}, citations: {} })

            Object.keys(obj.references)
                .map(x => this.map[x] = this.map[x] || { doi: x, explored: false, score: 1, references: {}, citations: {} })

            Object.keys(obj.citations).map(x => { this.map[x].references[obj.doi] = true })
            Object.keys(obj.references).map(x => { this.map[x].citations[obj.doi] = true })

        }
    }

    async expand() {
        const items = this.items().filter(x => !x.explored)
        if (items.length > 0)
            await this.explore(items.slice(0, 10).map(x => x.doi))
    }

    iterate() {
        const temp = {}
        let bank = 0
        const ratio = 0.8
        const map = toRaw(this.map)

        Object.keys(map).map(x => temp[x] = 0)
        Object.keys(map).map(x => {
            const item = map[x]
            const reference_count = Object.keys(item.references).length
            const citation_count = Object.keys(item.citations).length


            const fake_reference = Math.max(0, 40 - reference_count)
            const fake_citation = Math.max(0, 5 - citation_count)

            const payment = item.score * ratio / (reference_count + fake_reference)
            const generate = item.score * (1 - ratio) / (citation_count + fake_citation)


            Object.keys(item.references).map(x => temp[x] += payment)
            Object.keys(item.citations).map(x => temp[x] += generate)

            bank += fake_reference * payment
            bank += fake_citation * generate

        })


        Object.keys(temp).map(x => this.map[x].score = temp[x] + bank / Object.keys(this.map).length)
    }

    items() {
        const items = Object.keys(this.map).map(x => this.map[x])
        items.sort((a, b) => b.score - a.score)
        return items
    }
}


export default CiteMap