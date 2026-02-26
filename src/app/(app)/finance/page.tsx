"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface FinanceShipment {
  id: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  total_cost: number;
  balance_due: number;
  total_net_weight: number;
  currency: string;
  status: string;
  buyer: { name: string } | null;
  commodity: { description: string } | null;
}

interface MonthRow {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  shipments: number;
  weight: number;
}

interface BuyerRow {
  name: string;
  shipments: number;
  revenue: number;
  receivables: number;
  weight: number;
}

interface CommodityRow {
  name: string;
  shipments: number;
  revenue: number;
  weight: number;
  avgRate: number;
}

export default function FinancePage() {
  const supabase = createClient();
  const [shipments, setShipments] = useState<FinanceShipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("shipments")
        .select(
          "id, invoice_number, invoice_date, total_amount, total_cost, balance_due, total_net_weight, currency, status, buyer:buyers(name), commodity:commodities(description)"
        )
        .order("invoice_date", { ascending: false });

      if (data) setShipments(data as unknown as FinanceShipment[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Monthly breakdown
  const monthlyMap = new Map<string, MonthRow>();
  const active = shipments.filter((s) => s.status !== "draft");

  for (const s of active) {
    const month = format(new Date(s.invoice_date), "yyyy-MM");
    const existing = monthlyMap.get(month) || {
      month,
      revenue: 0,
      cost: 0,
      profit: 0,
      margin: 0,
      shipments: 0,
      weight: 0,
    };
    existing.revenue += Number(s.total_amount);
    existing.cost += Number(s.total_cost || 0);
    existing.shipments += 1;
    existing.weight += Number(s.total_net_weight);
    monthlyMap.set(month, existing);
  }

  const monthly = Array.from(monthlyMap.values())
    .map((m) => ({
      ...m,
      profit: m.revenue - m.cost,
      margin: m.revenue > 0 ? ((m.revenue - m.cost) / m.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  // Per-buyer summary
  const buyerMap = new Map<string, BuyerRow>();
  for (const s of shipments) {
    const name = s.buyer?.name || "Unknown";
    const existing = buyerMap.get(name) || {
      name,
      shipments: 0,
      revenue: 0,
      receivables: 0,
      weight: 0,
    };
    existing.shipments += 1;
    existing.revenue += Number(s.total_amount);
    existing.receivables += Math.max(0, Number(s.balance_due));
    existing.weight += Number(s.total_net_weight);
    buyerMap.set(name, existing);
  }
  const buyers = Array.from(buyerMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  // Per-commodity summary
  const commodityMap = new Map<string, CommodityRow>();
  for (const s of shipments) {
    const name = s.commodity?.description || "Unknown";
    const existing = commodityMap.get(name) || {
      name,
      shipments: 0,
      revenue: 0,
      weight: 0,
      avgRate: 0,
    };
    existing.shipments += 1;
    existing.revenue += Number(s.total_amount);
    existing.weight += Number(s.total_net_weight);
    commodityMap.set(name, existing);
  }
  const commodities = Array.from(commodityMap.values())
    .map((c) => ({
      ...c,
      avgRate: c.weight > 0 ? c.revenue / c.weight : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Totals
  const totalRevenue = active.reduce(
    (sum, s) => sum + Number(s.total_amount),
    0
  );
  const totalCost = active.reduce(
    (sum, s) => sum + Number(s.total_cost || 0),
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const totalWeight = active.reduce(
    (sum, s) => sum + Number(s.total_net_weight),
    0
  );

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Finance</h2>
        <p className="text-muted-foreground">
          Revenue, costs, and profitability across all shipments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${fmt(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${fmt(totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ${fmt(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0
                ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin`
                : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalWeight.toFixed(1)} MT
            </div>
            <p className="text-xs text-muted-foreground">
              {active.length} shipments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No finalized shipments yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Weight (MT)
                    </TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      Cost
                    </TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthly.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell className="font-medium">
                        {format(new Date(m.month + "-01"), "MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {m.shipments}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {m.weight.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${fmt(m.revenue)}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        ${fmt(m.cost)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${m.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ${fmt(m.profit)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${m.margin >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {m.margin.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Buyer Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Buyer</CardTitle>
        </CardHeader>
        <CardContent>
          {buyers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Weight (MT)
                    </TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Receivables</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyers.map((b) => (
                    <TableRow key={b.name}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-right">
                        {b.shipments}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {b.weight.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${fmt(b.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {b.receivables > 0 ? (
                          <Badge variant="outline" className="text-yellow-600">
                            ${fmt(b.receivables)}
                          </Badge>
                        ) : (
                          <span className="text-green-600">Paid</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Commodity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Commodity</CardTitle>
        </CardHeader>
        <CardContent>
          {commodities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commodity</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right">Weight (MT)</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Avg Rate/MT
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commodities.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">
                        {c.shipments}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.weight.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${fmt(c.revenue)}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        ${fmt(c.avgRate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
