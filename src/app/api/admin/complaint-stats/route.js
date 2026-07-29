import connectDB from "@/app/lib/db";
import ComplaintStats from "@/app/lib/models/ComplaintStats";

const DEFAULT_STATS = {
  reportingMonth: "April 2026",
  monthlyReceiptRows: [
    {
      source: "Directly from Investors",
      pendingAtEndLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionDays: 0,
    },
    {
      source: "SEBI (SCORES)",
      pendingAtEndLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionDays: 0,
    },
    {
      source: "Other Sources (if any)",
      pendingAtEndLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionDays: 0,
    },
  ],
  monthlyTrends: [
    {
      month: "April 2026",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      month: "March 2026",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      month: "February 2026",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      month: "Previous Monthly Complaint for this FY",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
  ],
  annualTrends: [
    {
      year: "FY25-26",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      year: "FY24-25",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
  ],
};

async function getOrCreateStats() {
  await connectDB();
  let stats = await ComplaintStats.findOne().lean();
  if (!stats) {
    stats = await ComplaintStats.create(DEFAULT_STATS);
    stats = stats.toObject();
  }
  return stats;
}

export async function GET() {
  const stats = await getOrCreateStats();
  return new Response(JSON.stringify(stats), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(request) {
  const body = await request.json();
  await connectDB();
  const updated = await ComplaintStats.findOneAndUpdate({}, body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
