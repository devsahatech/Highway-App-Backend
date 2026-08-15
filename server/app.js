const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Devsaha backend is running",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
module.exports = app;
