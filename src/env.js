import path from "path";
import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV;

const env = NODE_ENV ? `.${NODE_ENV}` : "";

dotenv.config({
  path: path.resolve(process.cwd(), `.env${env}`),
});
