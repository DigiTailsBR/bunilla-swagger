import { FileSystemRouter } from "bun";

export const router = new FileSystemRouter({
  dir: "./api",
  style: "nextjs",
});
