import fastify from "fastify";
import { Readable } from "stream";

const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));
async function* ResponseGenerator() {
  for (let i = 0; i < 10; i++) {
    await delay(1);
    yield i.toString();
  }
}

export async function startStaticServer() {
  const app = fastify();

  app.route({
    method: "GET",
    url: "/with-body",
    async handler(req, reply) {
      reply.header("Content-Type", "text/plain");
      reply.header("x-custom-header", "hey bro");
      return Readable.from(ResponseGenerator());
    },
  });

  app.route({
    method: "GET",
    url: "/empty-body",
    async handler(req, reply) {
      reply.header("x-custom-header", "hey bro");
      reply.status(200);
      reply.send();
    },
  });

  app.route({
    method: "GET",
    url: "/404",
    async handler(req, reply) {
      reply.header("x-custom-header", "hey bro");
      reply.status(404);
      reply.send();
    },
  });

  await app.listen({
    host: "0.0.0.0",
    port: 3001,
  });

  return app;
}
