import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { connectToMongoDB } from "./utils/mongodb.js";

const app = express();
const PORT = process.env.PORT || 5000;
// Connect to Database
await connectToMongoDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
	res.status(200).json({
		message: "Express server is running!",
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
