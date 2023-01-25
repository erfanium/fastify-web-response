import assert from "assert";
import fastify, { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { fastifyWebResponse } from "..";
import { startStaticServer } from "./utils";

let staticServer: FastifyInstance | null = null;
let mainServer: FastifyInstance | null = null;

beforeAll(async () => {
  staticServer = await startStaticServer();
  mainServer = fastify();

  mainServer.register(fastifyWebResponse);

  mainServer.route({
    method: "GET",
    url: "/response/:method",
    async handler(req, rep) {
      const { method } = req.params as { method: string };
      return fetch(`http://0.0.0.0:3001/${method}`);
    },
  });

  mainServer.route({
    method: "GET",
    url: "/readable-stream/:method",
    async handler(req, rep) {
      const { method } = req.params as { method: string };
      const response = await fetch(`http://0.0.0.0:3001/${method}`);
      return response.body;
    },
  });

  await mainServer.ready();
});

afterAll(async () => {
  await staticServer?.close();
  await mainServer?.close();
});

describe("response as return value", () => {
  test("with body", async () => {
    assert(mainServer);
    const response = await mainServer.inject({
      method: "GET",
      url: "/response/with-body",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("text/plain");
    expect(response.headers["x-custom-header"]).toBe("hey bro");
    expect(response.body).toBe("0123456789");
  });

  test("empty body", async () => {
    assert(mainServer);
    const response = await mainServer.inject({
      method: "GET",
      url: "/response/empty-body",
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["x-custom-header"]).toBe("hey bro");
    expect(response.body).toBe("");
  });

  test("other status codes", async () => {
    assert(mainServer);
    const response = await mainServer.inject({
      method: "GET",
      url: "/response/404",
    });
    expect(response.statusCode).toBe(404);
    expect(response.headers["x-custom-header"]).toBe("hey bro");
    expect(response.body).toBe("");
  });

  test("other status codes", async () => {
    assert(mainServer);
    const response = await mainServer.inject({
      method: "GET",
      url: "/response/404",
    });
    expect(response.statusCode).toBe(404);
    expect(response.headers["x-custom-header"]).toBe("hey bro");
    expect(response.body).toBe("");
  });
});

describe("readable-stream as return value", () => {
  test("test", async () => {
    assert(mainServer);
    const response = await mainServer.inject({
      method: "GET",
      url: "/readable-stream/with-body",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("0123456789");
  });
});
