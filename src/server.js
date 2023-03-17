import Express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import productsRouter from "./api/products/index.js";

const server = Express();
const port = process.env.PORT || 3001;

server.use(Express.json());

// ENDPOINTS
server.use("/products", productsRouter);
mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("✅ Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
