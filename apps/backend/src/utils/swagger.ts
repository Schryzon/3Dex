import swagger_js_doc from "swagger-jsdoc";

export const swagger_spec = swagger_js_doc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "3Dex API",
      version: "1.0.0",
      description: "Auto-generated API docs for 3Dex backend via Swagger",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
});
