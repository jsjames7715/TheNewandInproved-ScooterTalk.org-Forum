import { demo } from "./demo";
import { forumRouter } from "./forum/index.ts";

export const router = {
  demo,
  forum: forumRouter,
};
