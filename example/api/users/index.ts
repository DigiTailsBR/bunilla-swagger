import { SwaggerPath } from "@/index";

export const paths = new SwaggerPath();

paths.get("Get all users", (route, { $ref }) => {
  route.response(200, {
    description: "List of users",
    content: {
      "application/json": {
        schema: $ref("User"),
      },
    },
  });
});

export const swagger = {
  paths,
  schemas: {
    User: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
      },
    },
  },
};
