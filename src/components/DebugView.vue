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

        <table>

            <tr v-for="item, i in api.items().slice(0, 40)"
                :key="i">

                <td>
                    {{ item.score }}
                </td>
                <td>
                    {{ item.doi }}
                </td>
                <template v-if="item.explored">
                    <td>
                        {{ item.author }}
                    </td>
                    <td>
                        {{ item.title }}
                    </td>
                </template>
                <template v-else>
                    <td>
                        ?
                    </td>
                    <td>
                        ?
                    </td>
                </template>
            </tr>
        </table>
    </div>
</template>

<script>
import CiteMap from '@/main/CiteMap'
import { toRaw } from 'vue'
// import CiteAs from '@/main/CiteAs'
export default {
    data() {
        return {
            api: new CiteMap(),
            api_token: "",
            query: "10.1117/3.2559304"
        }
    },
    mounted() {
        if (localStorage.getItem('api_token') == null) {
            console.log('no token found')
            this.ask_api_token()
        }
        this.api_token = localStorage.getItem('api_token')
        this.api = new CiteMap(this.api_token)
    },
    methods: {
        ask_api_token() {
            const api_token = prompt("API TOKEN:")
            if (api_token !== null) {
                localStorage.setItem('api_token', api_token)
                this.api_token = api_token
            }
        },

        async search() {
            console.log(await this.api.explore(this.query))
        },
        async expand() {
            await this.api.expand()
        },
        iterate() {
            this.api.iterate()
        },
        save() {
            const link = document.createElement("a")
            const file = new Blob([JSON.stringify(toRaw(this.api.map))], { type: 'application/json' })
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
                        console.log(reader.result)
                        vm.api.map = JSON.parse(reader.result)
                    }
                    reader.readAsText(link.files[0], "UTF-8")
                }
            }
            link.click()
        }
    }
}
</script>