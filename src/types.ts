export interface VehicleData {
  model: string;
  year: string;
  km: string;
  version: string;
  price: string;
  city: string;
  differentials: string;
  whatsapp: string;
  instagram: string;
  images: string[]; // base64 strings
  status?: string;
  color?: string;
  description?: string;
  stockType?: 'proprio' | 'consignado';
}
