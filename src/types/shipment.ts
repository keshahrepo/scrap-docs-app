import type { Database } from "./database";

export type Seller = Database["public"]["Tables"]["sellers"]["Row"];
export type SellerInsert = Database["public"]["Tables"]["sellers"]["Insert"];
export type Buyer = Database["public"]["Tables"]["buyers"]["Row"];
export type BuyerInsert = Database["public"]["Tables"]["buyers"]["Insert"];
export type Commodity = Database["public"]["Tables"]["commodities"]["Row"];
export type CommodityInsert =
  Database["public"]["Tables"]["commodities"]["Insert"];
export type Shipment = Database["public"]["Tables"]["shipments"]["Row"];
export type ShipmentInsert =
  Database["public"]["Tables"]["shipments"]["Insert"];
export type Container = Database["public"]["Tables"]["containers"]["Row"];
export type ContainerInsert =
  Database["public"]["Tables"]["containers"]["Insert"];

export type ShipmentWithRelations = Shipment & {
  seller: Seller;
  buyer: Buyer;
  commodity: Commodity;
  containers: Container[];
};
