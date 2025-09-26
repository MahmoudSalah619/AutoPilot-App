export interface TypeItem {
  serviceTypeId: string;
  name: string;
  slug: string;
  defaultInterval: number | null;
}

export interface TypesResponse {
  message: string;
  data: TypeItem[];
}
