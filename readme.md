# fastify-web-response

enables returning `Response` and `ReadableStream` as a result value in fastify routes.  
so this code will be work:

```js
import fastify from "fastify"
import fastifyWebResponse from "fastify-web-response"

const app = fastify();

app.register(fastifyWebResponse)

app.route({
  method: "GET",
  url: "/",
  handler() {
    return fetch("https://example-api.com");
  }
})

app.listen({
  port: 3000
})
```

you can also return ReadableStream

```js
app.route({
  method: "GET",
  url: "/",
  async handler() {
    const response = await fetch("https://example-api.com");
    return response.body;
  }
})
```


## Installation
```sh
npm i fastify-web-response
```

## Experimental
`fetch` api is experimental. I'll release the v1.0.0 of this module when it's stable
