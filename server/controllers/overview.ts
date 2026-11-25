"use server";

import type { OrderType } from "@/lib/types";
import Order from "../models/order";

interface MonthlyTotal {
	name: string;
	total: number;
}

export async function getMonthlyTotals(): Promise<MonthlyTotal[]> {
	try {
		const now = new Date();
		const startOfYear = new Date(now.getFullYear(), 0, 1);

		const orders = (await Order.find({
			createdAt: { $gte: startOfYear },
		})) as OrderType[];

		const monthlyTotals: MonthlyTotal[] = Array.from(
			{ length: 12 },
			(_, i) => ({
				name: new Date(now.getFullYear(), i, 1).toLocaleString("default", {
					month: "short",
				}),
				total: 0,
			}),
		);

		orders.forEach((order) => {
			const monthIndex = new Date(order.createdAt).getMonth();
			monthlyTotals[monthIndex].total += order.totalAmount;
		});

		return monthlyTotals;
	} catch (error) {
		console.error("Error fetching monthly totals:", error);
		throw new Error("Failed to fetch monthly totals");
	}
}
