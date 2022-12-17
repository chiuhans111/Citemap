<template>
    <div>
        <p>api_token: {{ api_token }} <button
                @click="ask_api_token">change</button></p>
        <textarea name="query" id="query" cols="30"
            rows="10" v-model="query"></textarea>
        <div>
            <button @click="search">search</button>
            <button @click="expand">expand</button>
            <button @click="iterate">iterate</button>
        </div>
        <div>
            <button @click="save">save</button>
            <button @click="load">load</button>
        </div>
        <div class="preview">
            <div v-for="item in items.filter(x => x.explored)"
                class="item_line" @click="select(item)"
                :class="{
                    selected: selected == item,
                    reference: selected !== null && selected.metadata.references[item.metadata.doi],
                    citation: selected !== null && selected.metadata.citations[item.metadata.doi],
                }" :key="item.metadata.doi">
                {{ item.score.toFixed(2) }}
                {{ item.metadata.title }}
            </div>
        </div>
        <div class="groups">
            <div class="group" v-for="group in displayItems"
                :key="group.key">
                <h2>{{ group.key }}</h2>
                <div class="items">

                    <div class="item"
                        v-for="item in group.items"
                        :key="item.metadata.doi"
                        @click="select(item)" :class="{
                            selected: selected == item,
                            reference: selected !== null && selected.metadata.references[item.metadata.doi],
                            citation: selected !== null && selected.metadata.citations[item.metadata.doi],
                        }">
                        <h3 class="title">
                            {{ item.metadata.title }}
                        </h3>
                        <p>
                            {{ item.metadata.author }}
                        </p>
                        <p>
                            {{ item.metadata.doi }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.groups {
    width: fit-content;
}

.group {
    margin: 0px 10px;
    flex-grow: 1;
}

.items {
    display: flex;
    flex-wrap: wrap;
}

.item {
    position: relative;
    width: 400px;
    height: 200px;
    padding: 10px;
}

.item_line {
    padding: 2px;
    position: relative;
    box-sizing: border-box;
}

.selected::after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    border: solid 2px red;
}

.citation::after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    border: solid 2px green;
}

.preview {
    height: 500px;
    overflow: auto;
}

.reference::after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    border: solid 2px blue;
}
</style>
<script>
import CiteMap from '@/main/CiteMap'
import { MetadataAPI } from '@/main/MetadataAPI'
import OpenCitation from '@/main/OpenCitation'
// import Semantic from '@/main/Semantic'
import { toRaw } from 'vue'

let api = new MetadataAPI()
let map = new CiteMap(api)



// import CiteAs from '@/main/CiteAs'
export default {
    data() {
        return {
            api_token: "",
            query: "10.1117/3.2559304",
            items: [],
            displayItems: [],
            selected: null
        }
    },
    mounted() {
        this.api_token = localStorage.getItem('api_token')
        if (this.api_token == null) {
            this.ask_api_token()
        } else {
            this.initialize()
        }
    },

    methods: {
        ask_api_token() {
            const api_token = prompt("API TOKEN:")
            if (api_token !== null) {
                localStorage.setItem('api_token', api_token)
                this.api_token = api_token
            }
            this.initialize()
        },

        initialize() {
            api = new OpenCitation(this.api_token)
            // api = new Semantic()
            map = new CiteMap(api)
        },

        async search() {
            console.log(await map.explore(this.query))
            this.update()
        },
        async expand() {
            await map.expand()
            this.update()
        },
        iterate() {
            map.iterate()
            this.update()
        },
        save() {
            const link = document.createElement("a")
            const file = new Blob([JSON.stringify(toRaw(map.map))], { type: 'application/json' })
            link.href = URL.createObjectURL(file)
            link.download = "data.json"
            link.click()
        },
        load() {
            const link = document.createElement("input")
            link.type = "file"
            const vm = this
            link.onchange = function () {
                if (link.files.length > 0) {
                    const reader = new FileReader()
                    reader.onload = function () {
                        map.map = JSON.parse(reader.result)
                        vm.update()
                    }
                    reader.readAsText(link.files[0], "UTF-8")
                }
            }
            link.click()
        },
        update() {
            this.items = map.items()
            this.displayItems = map.displayItems()
        },
        select(item) {
            this.selected = item
        }
    }
}
</script>
