import { NextRequest, NextResponse } from "next/server";
import { DynamicPricing } from "@/app/utils/dynamicPricing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bikeId = searchParams.get("bikeId");
    const duration = searchParams.get("duration");

    if (!bikeId || !duration) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const price = await DynamicPricing.calculatePrice(bikeId, parseInt(duration));
    const breakdown = await DynamicPricing.getPriceBreakdown(bikeId, parseInt(duration));

    return NextResponse.json(
      {
        price,
        breakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calculating price:", error);
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    );
  }
}