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
  // forwards response status and readers when response is found as payload
  // opts-out of serialization when a response or response body is found as payload
  fastify.addHook("preSerialization", (req, reply, payload, done) => {
    // if we've got a Response, we want to select the body
    const body = payload instanceof Response
      ? payload.body
      : payload;

    if (payload instanceof Response) {
      reply.status(payload.status);
      reply.headers(Object.fromEntries(payload.headers.entries()));
    }

    if (body instanceof ReadableStream) {
      // set a noop serialize. we don't want out response body to be serialized
      reply.serializer(noop);
    }

    return done(null, body);
  });

  // converts a ReadableStream payload to a NodeJS Readable that Fastify can handle
  fastify.addHook("onSend", (req, reply, payload, done) => {
    const body = payload instanceof ReadableStream
      ? Readable.fromWeb(payload)
      : payload

    return done(null, body);
  });

  done();
}

module.exports = fp(fastifyWebResponse, {
  fastify: "4.x",
  name: "fastify-web-response",
});
module.exports.default = fastifyWebResponse;
module.exports.fastifyWebResponse = fastifyWebResponse;
