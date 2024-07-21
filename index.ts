import { router } from "./router";

function convertTypeBoxToSwaggerSchema(typeboxSchema: any) {
  const { properties, required } = typeboxSchema;
  const swaggerProperties: any = {};
  for (const [key, value] of Object.entries(properties)) {
    const { type, example } = value as { type: string; example: string };
    swaggerProperties[key] = {
      type: type,
      example: example,
    };
  }
  return {
    type: "object",
    properties: swaggerProperties,
    required: required || [],
  };
}

function extractParameters(str: string) {
  const regex = /\[([^\]]+)\]/g;
  const matches = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

enum SwaggerResponseContentType {
  json = "application/json",
}

interface SwaggerPathDefinitionResponse {
  description?: string;
  content?: {
    [key in SwaggerResponseContentType]: {
      schema: {
        $ref?: string;
        type?: string;
        items?: { [key: string]: string };
        properties?: { [key: string]: { type: string; example?: string } };
      };
    };
  };
}

interface SwaggerPathDefinitionUtils {
  $ref: (schemaName: string) => { $ref: string };
}

export class SwaggerPathDefinition {
  responses: { [key: string]: SwaggerPathDefinitionResponse } = {};
  response(code: number, cfg?: SwaggerPathDefinitionResponse) {
    this.responses[code] = {};
    cfg?.description && (this.responses[code].description = cfg.description);
    cfg?.content && (this.responses[code].content = cfg.content);
  }
}

type SwaggerPathCallback = (
  route: SwaggerPathDefinition,
  utils: SwaggerPathDefinitionUtils
) => void;

export class SwaggerPath {
  #get: { [key: string]: unknown } = {};
  #post: { [key: string]: unknown } = {};
  #put: { [key: string]: unknown } = {};
  #delete: { [key: string]: unknown } = {};
  constructor() {}
  #set(
    method: string,
    summary: string,
    cb?: (
      route: SwaggerPathDefinition,
      utils: SwaggerPathDefinitionUtils
    ) => unknown
  ) {
    const definition = new SwaggerPathDefinition();
    // run the callback
    cb &&
      cb(definition, {
        $ref(schemaName: string) {
          return {
            $ref: "#/components/schemas/" + schemaName,
          };
        },
      });

    const cfg = {
      summary,
      ...definition,
    };

    switch (method) {
      case "get":
        this.#get = cfg;
        break;
      case "post":
        this.#post = cfg;
        break;
      case "put":
        this.#put = cfg;
        break;
      case "delete":
        this.#delete = cfg;
        break;
      default:
        throw new Error(`Invalid HTTP method: ${method}`);
    }

    return this;
  }
  get(summary: string, cb?: SwaggerPathCallback) {
    this.#set("get", summary, cb);
    return this;
  }
  post(summary: string, cb?: SwaggerPathCallback) {
    this.#set("post", summary, cb);
    return this;
  }
  put(summary: string, cb?: SwaggerPathCallback) {
    this.#set("put", summary, cb);
    return this;
  }
  delete(summary: string, cb?: SwaggerPathCallback) {
    this.#set("delete", summary, cb);
    return this;
  }
  json() {
    const data: { [key: string]: unknown } = {};
    this.#get && (data.get = this.#get);
    this.#post && (data.post = this.#post);
    this.#put && (data.put = this.#put);
    this.#delete && (data.delete = this.#delete);
    return data;
  }
}

const swaggerJson = {
  openapi: "3.0.0",
  info: {
    title: "API de Usuários",
    description: "API para gerenciar usuários",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  paths: {} as any,
  components: {
    schemas: {} as { [key: string]: unknown },
  },
};

export default function Swagger(){
    
}

for (const path in router.routes) {
  const filePath = router.routes[path];
  const isValid = !path.includes(".test") && !path.includes("/$");
  if (isValid) {
    const cfg = (await import(filePath)).swagger;
    if (cfg) {
      const { paths, schemas } = cfg;
      // console.log(`Importando Swagger do arquivo ${path}`);
      for (const schema in schemas) {
        const element = convertTypeBoxToSwaggerSchema(schemas[schema]);
        swaggerJson.components.schemas[schema] = element;
      }
      if (paths) {
        // extract paths
        swaggerJson.paths[path] = paths.json();
        // extract parameters from path and add them to swagger paths
        const data = extractParameters(path);
        if (data.length) {
          for (const key in swaggerJson.paths[path]) {
            const element = swaggerJson.paths[path][key];
            element.parameters = [];
            data.map((value) => {
              element.parameters.push({
                name: value,
                in: "path",
                required: true,
                schema: {
                  type: "string",
                },
              });
            });
          }
          // console.log(data, paths.json());
        }
      }
    }
  }
}

await Bun.write(
  process.cwd() + "/public/api.json",
  JSON.stringify(swaggerJson, null, 2)
);
// console.log(swaggerJson);