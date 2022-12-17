import { toRaw } from "vue"
import { MetadataAPI, Metadata } from "./MetadataAPI"


class CiteMap {
    api = new MetadataAPI()
    map = {}

    constructor(api) {
        this.api = api
    }


    async metadata(doi) {
        return await this.api.get(doi)
    }

    createObj(doi) {
        return {
            explored: false,
            score: 1,
            metadata: new Metadata(doi)
        }
    }


    async explore(doi) {
        if (doi in this.map && this.map[doi].explored)
            return

        const result = await this.metadata(doi)
        console.log(result)

        if (this.map[doi] === undefined) this.map[doi] = this.createObj(doi)

        const obj = this.map[doi]

        obj.metadata = result
        obj.explored = true


        for (const x in obj.metadata.citations) {
            this.map[x] = this.map[x] || this.createObj(x)
            this.map[x].metadata.references[doi] = true
        }

        for (const x in obj.metadata.references) {
            this.map[x] = this.map[x] || this.createObj(x)
            this.map[x].metadata.citations[doi] = true
        }
    }

    async expand() {
        const items = this.items().filter(x => !x.explored)
        if (items.length > 0) {
            await Promise.all(items.slice(0, 10).map(x => {
                return this.explore(x.metadata.doi)
            }))
        }
    }

    iterate() {
        const temp = {}
        let bank = 0
        const ratio = 0.6
        const map = toRaw(this.map)

        for (const x in map) {
            temp[x] = 0
        }

        for (const x in map) {
            const item = map[x]

            const references = Object.keys(item.metadata.references)
            const citations = Object.keys(item.metadata.citations)

            const reference_count = references.length
            const citation_count = citations.length


            const fake_reference = Math.max(0, 40 - reference_count)
            const fake_citation = Math.max(0, 5 - citation_count)

            const payment = item.score * ratio / (reference_count + fake_reference)
            const generate = item.score * (1 - ratio) / (citation_count + fake_citation)

            for (let doi of references) {
                if (doi in temp) temp[doi] += payment
                else bank += payment
            }

            for (let doi of citations) {
                if (doi in temp) temp[doi] += generate
                else bank += payment
            }

            bank += fake_reference * payment
            bank += fake_citation * generate

        }

        const count = Object.keys(this.map).length

        for (const x in temp) {
            this.map[x].score = temp[x] + bank / count
        }
    }

    items() {
        const items = Object.keys(this.map).map(x => this.map[x])
        items.sort((a, b) => b.score - a.score)
        return items
    }

    displayItems() {
        const items = this.items()
        const group = {}

        for (let i of items) {
            if (!i.explored) continue
            const key = i.metadata.year
            if (group[key] === undefined) group[key] = {
                key, items: []
            }
            group[key].items.push(i)
        }

        const keys = Object.keys(group)
        keys.sort((a, b) => a - b)
        return keys.map(x => group[x])
    }
}


export default CiteMap