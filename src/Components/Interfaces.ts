export interface Product {
  id: number;
  TourName: string;
  TourPrice: number;
  TourDescription: string;
  TourSlug: string;
  TourDuration: number | null;
  ProductType: string;
  MetaTitle: string;
  MetaKeywords: string;
  MetaDescription: string;
  CanonicalUrl: string;
  MetaRobots: string;
  OgTitle: string;
  OgDescription: string;
  OgImage: string;
  SchemaMarkup: string | null;
  BreadcrumbPath: string;
}

export interface Title {
  list_title: string;
  list_titletxt: string;
}

export interface Item {
  list_title: string;
  list_item: string;
}

export interface ListData {
  titles: Title[];
  items: Item[];
}
export interface Itinerary {
  TourName: string;
  TourInfo: string;
  TourSlug: string;
}
