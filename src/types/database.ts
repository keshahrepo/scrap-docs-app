export interface Database {
  public: {
    Tables: {
      sellers: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          address: string;
          contact_person: string | null;
          phone: string | null;
          fax: string | null;
          email: string | null;
          bank_name: string | null;
          account_number: string | null;
          routing_number: string | null;
          swift_code: string | null;
          bank_address: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          address: string;
          contact_person?: string | null;
          phone?: string | null;
          fax?: string | null;
          email?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          routing_number?: string | null;
          swift_code?: string | null;
          bank_address?: string | null;
          is_default?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["sellers"]["Insert"]>;
      };
      buyers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string;
          gst_no: string | null;
          pan_no: string | null;
          ie_code: string | null;
          email: string | null;
          phone: string | null;
          contact_person: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address: string;
          gst_no?: string | null;
          pan_no?: string | null;
          ie_code?: string | null;
          email?: string | null;
          phone?: string | null;
          contact_person?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["buyers"]["Insert"]>;
      };
      commodities: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          hs_code: string;
          basel_no: string;
          packing_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          hs_code?: string;
          basel_no?: string;
          packing_type?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["commodities"]["Insert"]>;
      };
      shipments: {
        Row: {
          id: string;
          user_id: string;
          seller_id: string;
          buyer_id: string;
          commodity_id: string;
          invoice_number: string;
          invoice_date: string;
          bl_number: string | null;
          vessel_name: string | null;
          voyage_number: string | null;
          port_of_loading: string | null;
          port_of_discharge: string | null;
          final_destination: string | null;
          place_of_receipt: string | null;
          sales_contract_ref: string | null;
          rate_per_mt: number;
          currency: string;
          incoterms: string;
          incoterms_destination: string | null;
          advance_paid: number;
          freight_per_container: number | null;
          payment_terms: string | null;
          total_containers: number;
          total_net_weight: number;
          total_gross_weight: number;
          total_tare_weight: number;
          total_amount: number;
          balance_due: number;
          purchase_cost_per_mt: number;
          other_costs: number;
          total_cost: number;
          status: "draft" | "final" | "shipped";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          seller_id: string;
          buyer_id: string;
          commodity_id: string;
          invoice_number: string;
          invoice_date?: string;
          bl_number?: string | null;
          vessel_name?: string | null;
          voyage_number?: string | null;
          port_of_loading?: string | null;
          port_of_discharge?: string | null;
          final_destination?: string | null;
          place_of_receipt?: string | null;
          sales_contract_ref?: string | null;
          rate_per_mt: number;
          currency?: string;
          incoterms?: string;
          incoterms_destination?: string | null;
          advance_paid?: number;
          freight_per_container?: number | null;
          payment_terms?: string | null;
          total_containers?: number;
          total_net_weight?: number;
          total_gross_weight?: number;
          total_tare_weight?: number;
          total_amount?: number;
          balance_due?: number;
          purchase_cost_per_mt?: number;
          other_costs?: number;
          total_cost?: number;
          status?: "draft" | "final" | "shipped";
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shipments"]["Insert"]>;
      };
      containers: {
        Row: {
          id: string;
          shipment_id: string;
          sequence_number: number;
          container_number: string;
          seal_number: string | null;
          container_size: string;
          gross_weight_mt: number;
          tare_weight_mt: number;
          net_weight_mt: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          sequence_number: number;
          container_number: string;
          seal_number?: string | null;
          container_size?: string;
          gross_weight_mt: number;
          tare_weight_mt: number;
          net_weight_mt?: number;
        };
        Update: Partial<Database["public"]["Tables"]["containers"]["Insert"]>;
      };
    };
  };
}
