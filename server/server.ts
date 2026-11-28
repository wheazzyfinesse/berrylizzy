import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectToMongoDB } from "./utils/config/mongodb.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhooks/clerkWebhook.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductRouter from "./routes/productRoutes.js";
import OrderRouter from "./routes/orderRoutes.js";
import AddressRouter from "./routes/addressRoutes.js";
import { getMe, protect } from "./middleware/auth.js";
import releaseExpiredOrderReservations from "./controllers/orderControllers/releaseExpiredOrderReservations.js";
import { paystackWebhook } from "./controllers/webhooks/paystackWebhook.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
await connectToMongoDB();
app.post(
	"/api/paystack/webhook",
	express.raw({ type: "application/json" }),
	paystackWebhook,
);
app.post(
	"/api/clerk/webhook",
	express.raw({ type: "application/json" }),
	clerkWebhook,
);

// Middleware
app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Product Routes
app.use("/api/products", ProductRouter);

// Order Routes
app.use("/api/orders", OrderRouter);

// Address Routes
app.use("/api/addresses", AddressRouter);

// Auth Route
app.get("/api/auth/me", protect, getMe);

app.get("/api/cron/release-expired-orders", async (req, res) => {
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
		return res.status(401).json("Unauthorized");
	}

	try {
		const releasedCount = await releaseExpiredOrderReservations();

		return res.status(200).json({
			success: true,
			releasedCount,
		});
	} catch (error) {
		console.error("Expired order cleanup failed:", error);
		return res.status(500).json("Expired order cleanup failed");
	}
});

await makeAdmin();

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
