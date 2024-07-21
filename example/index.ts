import { FileSystemRouter } from "bun";
import Swagger from "..";

export const router = new FileSystemRouter({
  dir: "./example/api",
  style: "nextjs",
});

const swagger = Swagger({
  openapi: "3.0.0",
  info: {
    title: "Bunilla Swagger Example",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Development Server",
    },
  ],
});

const json = await swagger.json(router);

console.log(json);
