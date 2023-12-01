"use strict";
const { Readable } = require("node:stream");
const fp = require("fastify-plugin");

const noop = (v) => v;

/**
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {*} config
 * @param {*} done
 */
function fastifyWebResponse(fastify, config, done) {
  fastify.addHook("onSend", (req, reply, payload, done) => {
    if (payload && payload instanceof Response) {
      reply.status(payload.status);
      reply.headers(Object.fromEntries(payload.headers.entries()));

      if (payload.body) {
        // set a noop serialize. we don't want out response body to be serialized
        reply.serializer(noop);

        const readable = Readable.fromWeb(payload.body);
        return done(null, readable);
      }

      return done(null, undefined);
    }

    if (payload && payload instanceof ReadableStream) {
      // set a noop serialize. we don't want out response body to be serialized
      reply.serializer(noop);

      const readable = Readable.fromWeb(payload);
      return done(null, readable);
    }

    return done(null, payload);
  });

  done();
}

module.exports = fp(fastifyWebResponse, {
  fastify: "4.x",
  name: "fastify-web-response",
});
module.exports.default = fastifyWebResponse;
module.exports.fastifyWebResponse = fastifyWebResponse;
