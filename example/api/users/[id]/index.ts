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
});

export const swagger = {
  paths,
  //   schemas: {
  //     User: UserSchema,
  //   },
};
