export interface Product {
  id: number;
  TourName: string;
  Llegada: string;
  EdadMinima: string;
  TourBadge: string;
  TourPrice: number;
  TourDescription: string;
  TourSlug: string;
  TourMap: string;
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

export interface MinMaxProducts {
  mindias: number;
  maxdias: number;
  minprecio: number;
  maxprecio: number;
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
  day: number;
  descriptionitinerary: string;
}
export interface Month {
  Month: string;
  MonthSmallBanner: string;
  MonthLargeBanner: string;
}

export interface FieldOption {
  value: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FieldConfig {
  id: string;
  label?: string;
  icon: React.ComponentType | null;
  options?: FieldOption[];
  optional?: boolean;
  type?: "button";
  buttonText?: string;
  group?: FieldConfig[];
}

export interface CardsCarruselProps {
  filter?: string | number;
}

export interface Traveler {
  title: string;
  firstName: string;
  lastName: string;
}
