"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Eye,
  Download,
  Search,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Ship,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface ShipmentRow {
  id: string;
  invoice_number: string;
  invoice_date: string;
  buyer: { name: string } | null;
  commodity: { description: string } | null;
  total_amount: number;
  total_cost: number;
  balance_due: number;
  currency: string;
  total_containers: number;
  status: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("shipments")
      .select(
        "id, invoice_number, invoice_date, total_amount, total_cost, balance_due, currency, total_containers, status, buyer:buyers(name), commodity:commodities(description)"
      )
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    if (data) setShipments(data as unknown as ShipmentRow[]);
    setLoading(false);
  }, [supabase, statusFilter]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const filtered = shipments.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.invoice_number.toLowerCase().includes(q) ||
      s.buyer?.name?.toLowerCase().includes(q) ||
      s.commodity?.description?.toLowerCase().includes(q)
    );
  });

  function statusColor(status: string) {
    switch (status) {
      case "draft":
        return "secondary" as const;
      case "final":
        return "default" as const;
      case "shipped":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  }

  // KPI calculations (non-draft shipments for financial metrics)
  const activeShipments = shipments.filter((s) => s.status !== "draft");
  const totalRevenue = activeShipments.reduce(
    (sum, s) => sum + Number(s.total_amount),
    0
  );
  const totalCost = activeShipments.reduce(
    (sum, s) => sum + Number(s.total_cost || 0),
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const totalReceivables = shipments.reduce(
    (sum, s) => sum + Math.max(0, Number(s.balance_due)),
    0
  );

  // Receivables aging
  const receivables = shipments
    .filter((s) => Number(s.balance_due) > 0)
    .map((s) => ({
      ...s,
      daysOutstanding: differenceInDays(new Date(), new Date(s.invoice_date)),
    }))
    .sort((a, b) => b.daysOutstanding - a.daysOutstanding);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{greeting}, Fufu!</h2>
          <p className="text-muted-foreground">
            {shipments.length === 0
              ? "Ready to create your first shipment?"
              : `${shipments.length} shipment${shipments.length === 1 ? "" : "s"} and counting`}
          </p>
        </div>
        <Button asChild>
          <Link href="/shipments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      {shipments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${fmt(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeShipments.length} finalized shipment{activeShipments.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${fmt(totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalRevenue > 0
                  ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin`
                  : "No data yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receivables</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${fmt(totalReceivables)}
              </div>
              <p className="text-xs text-muted-foreground">
                {receivables.length} unpaid shipment{receivables.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shipments</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shipments.length}</div>
              <p className="text-xs text-muted-foreground">
                {shipments.filter((s) => s.status === "draft").length} draft,{" "}
                {shipments.filter((s) => s.status === "final").length} final,{" "}
                {shipments.filter((s) => s.status === "shipped").length} shipped
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Receivables Aging */}
      {receivables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outstanding Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead className="hidden sm:table-cell">Buyer</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Link
                          href={`/shipments/${s.id}`}
                          className="font-medium hover:underline"
                        >
                          {s.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {s.buyer?.name || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.currency} {fmt(Number(s.balance_due))}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            s.daysOutstanding > 60
                              ? "text-red-600 font-semibold"
                              : s.daysOutstanding > 30
                                ? "text-yellow-600 font-semibold"
                                : "text-green-600"
                          }
                        >
                          {s.daysOutstanding}d
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice #, buyer, or commodity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="final">Final</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shipments Table */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {shipments.length === 0
            ? "No shipments yet. Create your first shipment to get started."
            : "No shipments match your search."}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden md:table-cell">Buyer</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Containers
                </TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {s.invoice_number}
                  </TableCell>
                  <TableCell>
                    {format(new Date(s.invoice_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {s.buyer?.name || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {s.total_containers}
                  </TableCell>
                  <TableCell>
                    {s.currency}{" "}
                    {Number(s.total_amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(s.status)}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/shipments/${s.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={`/api/documents/${s.id}/all`}
                          download
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
