import { NextResponse } from "next/server";
import { RUPEE_HISTORICAL_DATA } from "@/data/rupee-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentData = JSON.parse(JSON.stringify(RUPEE_HISTORICAL_DATA));
  let liveFetched = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const liveJson = await res.json();
      const inrRate = liveJson?.rates?.INR;

      if (inrRate && typeof inrRate === "number") {
        liveFetched = true;
        // Update USD rate
        if (currentData.usd?.data?.length) {
          currentData.usd.data[currentData.usd.data.length - 1].rate = Number(inrRate.toFixed(2));
        }

        // Update other cross rates if present
        const rates = liveJson.rates;
        if (rates?.GBP && currentData.gbp?.data?.length) {
          currentData.gbp.data[currentData.gbp.data.length - 1].rate = Number((inrRate / rates.GBP).toFixed(2));
        }
        if (rates?.EUR && currentData.eur?.data?.length) {
          currentData.eur.data[currentData.eur.data.length - 1].rate = Number((inrRate / rates.EUR).toFixed(2));
        }
        if (rates?.JPY && currentData.jpy?.data?.length) {
          // per 100 JPY
          currentData.jpy.data[currentData.jpy.data.length - 1].rate = Number(((inrRate / rates.JPY) * 100).toFixed(2));
        }
        if (rates?.CNY && currentData.cny?.data?.length) {
          currentData.cny.data[currentData.cny.data.length - 1].rate = Number((inrRate / rates.CNY).toFixed(2));
        }
        if (rates?.AED && currentData.aed?.data?.length) {
          currentData.aed.data[currentData.aed.data.length - 1].rate = Number((inrRate / rates.AED).toFixed(2));
        }
        if (rates?.SAR && currentData.sar?.data?.length) {
          currentData.sar.data[currentData.sar.data.length - 1].rate = Number((inrRate / rates.SAR).toFixed(2));
        }
        if (rates?.CAD && currentData.cad?.data?.length) {
          currentData.cad.data[currentData.cad.data.length - 1].rate = Number((inrRate / rates.CAD).toFixed(2));
        }
        if (rates?.SGD && currentData.sgd?.data?.length) {
          currentData.sgd.data[currentData.sgd.data.length - 1].rate = Number((inrRate / rates.SGD).toFixed(2));
        }
      }
    }
  } catch {
    // Graceful fallback to verified hardcoded benchmark rates
    liveFetched = false;
  }

  return NextResponse.json({
    success: true,
    live_synced: liveFetched,
    last_updated: new Date().toISOString(),
    base_currency: "INR",
    currencies: currentData,
  });
}
