import { SwaggerPath } from "@/index";

export const paths = new SwaggerPath();

paths.get("Get user by id", (route) => {
  route.response(200, {
    description: "Get user",
    content: {
      "application/json": {
        schema: {
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
          },
        },
      },
    },
  });
  route.response(400, {
    description: "Bad request",
  });
});

paths.put("Update user by id", (route, { $ref }) => {
  route.response(200, {
    description: "Get user",
    content: {
      "application/json": {
        schema: $ref("User"),
      },
    },
  });
  route.response(400, {
    description: "Bad request",
  });
});

paths.delete("Remove user by id", (route, { $ref }) => {
  route.response(200, {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
              example: "true",
            },
          },
        },
      },
    },
  });
  route.response(400, {
    description: "Bad request",
  });
});

export const swagger = {
  paths,
  //   schemas: {
  //     User: UserSchema,
  //   },
};
