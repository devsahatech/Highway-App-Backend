const express = require("express");

const { createOrder, getOrders, getOrdersBatch, getOrder, updateStatus, cancelOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);
router.post("/batch", getOrdersBatch);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateStatus);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
