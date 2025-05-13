// src/app/api/admin/rental-report/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getAllInvoices } from "@/model/Invoice";

export async function GET(request: NextRequest) {
    try {
        const rentals = await getAllInvoices();
        return NextResponse.json(rentals, { status: 200 });
    }
    catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to fetch rental history" },
            { status: 500 }
        );
    }
}
