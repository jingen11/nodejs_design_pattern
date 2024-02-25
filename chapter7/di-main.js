import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Blog } from "./di-db.js";
import { createDb } from "./di-db.js";

async function main() {
  const db = createDb(join(__dirname, "data.sq;ite"));
  const blog = new Blog(db);
  await blog.initialize();
  const posts = await blog.getAllPosts();
  if (posts.length === 0) {
    console.log(
      "No post available. Run `node import-posts.js`" +
        " to load some sample posts"
    );
  }
  for (const post of posts) {
    console.log(post.title);
    console.log("-".repeat(post.title.length));
    console.log(`Published on ${new Date(post.created_at).toISOString()}`);
    console.log(post.content);
  }
}
main().catch(console.error);
