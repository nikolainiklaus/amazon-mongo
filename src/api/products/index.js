import express from "express";
import ProductsModel from "./module.js";
import ReviewsModel from "../reviews/model.js";
import q2m from "query-to-mongo";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res, next) => {
  console.log("query", req.query);
  console.log("query", q2m(req.query));
  const mongoQuery = q2m(req.query);
  try {
    const products = await ProductsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({
        path: "reviews",
        select: "comment",
      });

    const total = await ProductsModel.countDocuments(mongoQuery.criteria);

    res.send({
      links: mongoQuery.links("http://localhost:3001/products", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    });
    // res.send(products);
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
    const product = await ProductsModel.findById(req.params.id).populate({
      path: "reviews",
      select: "comment",
    });
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

productsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.id);
    if (product) {
      const newReview = new ReviewsModel(req.body);
      const savedReview = await newReview.save();
      product.reviews.push(savedReview._id);
      const savedProduct = await product.save();
      res.status(201).send(savedProduct);
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.id);
    if (product) {
      const reviews = await ReviewsModel.find({ productId: req.params.id });
      res.send(reviews);
    } else {
      res.status(404).send("Sorry, this product has not been found");
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const product = await ProductsModel.findById(req.params.productId);
      if (!product) {
        return res.status(404).send("Product not found");
      }

      const review = await ReviewsModel.findOneAndDelete({
        _id: req.params.reviewId,
        productId: req.params.productId,
      });

      if (!review) {
        return res.status(404).send("Review not found");
      }

      res.status(200).send("Review deleted successfully");
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId);
    if (product) {
      const review = await ReviewsModel.findById(req.params.reviewId);
      if (review) {
        review.comment = req.body.comment;
        const updatedReview = await review.save();

        res.status(200).send(updatedReview);
      } else {
        res.status(404).send("Review not found");
      }
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
