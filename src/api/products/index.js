import express from "express";
import ProductsModel from "./module.js";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductsModel.find();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).send(savedProduct);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.id);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send("sorry, this product has not been found");
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send("Product has been deleted successfully");
    } else {
      res.status(404).send("Sorry, this product has not been found");
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedProduct) {
      res.status(201).send("Product updated successfully");
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
