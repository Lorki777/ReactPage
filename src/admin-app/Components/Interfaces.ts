/**
 * @file Interfaces.ts
 * @brief TypeScript interfaces for the application.
 * @details This file contains all the interfaces used across the application for type safety and consistency.
 * @date
 */

/**
 * @interface Product
 * @brief Represents a product in the application.
 * @details This interface defines the structure of a product object, including its properties and types.
 * @property {number} product_id - Unique identifier for the product.
 * @property {string} tour_name - Name of the tour.
 * @property {string} city_name - Name of the city.
 * @property {string} min_age - Minimum age requirement.
 * @property {string} tour_badge_name - Badge name for the tour.
 * @property {number} tour_price - Price of the tour.
 * @property {string} tour_description - Description of the tour.
 * @property {string} tour_slug - URL slug for the tour.
 * @property {string} tour_map - Map URL for the tour.
 * @property {number | null} tour_duration - Duration of the tour in days.
 * @property {string} product_type_name - Type of the product.
 * @property {string} meta_title - Meta title for SEO.
 * @property {string} meta_description - Meta description for SEO.
 * @property {string} canonical_url - Canonical URL for SEO.
 * @property {string} meta_robots - Robots meta tag for SEO.
 * @property {string} og_title - Open Graph title for social sharing.
 * @property {string} og_description - Open Graph description for social sharing.
 * @property {string} og_image - Open Graph image URL for social sharing.
 * @property {string | null} schema_markup - Schema markup for structured data.
 * @property {string} breadcrumb_path - Breadcrumb path for navigation.
 */
export interface Product {
  product_id: number /**< Unique identifier for the product. */;
  tour_name: string /**< Name of the tour. */;
  city_name: string /**< Name of the city. */;
  min_age: string /**< Minimum age requirement. */;
  tour_badge_name: string /**< Badge name for the tour. */;
  tour_price: number /**< Price of the tour. */;
  tour_description: string /**< Description of the tour. */;
  tour_slug: string /**< URL slug for the tour. */;
  tour_map: string /**< Map URL for the tour. */;
  tour_duration: number | null /**< Duration of the tour in days. */;
  product_type_name: string /**< Type of the product. */;
  meta_title: string /**< Meta title for SEO. */;
  meta_description: string /**< Meta description for SEO. */;
  canonical_url: string /**< Canonical URL for SEO. */;
  meta_robots: string /**< Robots meta tag for SEO. */;
  og_title: string /**< Open Graph title for social sharing. */;
  og_description: string /**< Open Graph description for social sharing. */;
  og_image: string /**< Open Graph image URL for social sharing. */;
  schema_markup: string | null /**< Schema markup for structured data. */;
  breadcrumb_path: string /**< Breadcrumb path for navigation. */;
}
/**
 * @interface MinMaxProducts
 * @brief Represents the minimum and maximum values for products.
 * @details This interface defines the structure of minimum and maximum values for days and prices.
 * @property {number} min_days - Minimum number of days for the product.
 * @property {number} max_days - Maximum number of days for the product.
 * @property {number} min_price - Minimum price for the product.
 * @property {number} max_price - Maximum price for the product.
 */

export interface MinMaxProducts {
  min_days: number;
  max_days: number;
  min_price: number;
  max_price: number;
}
/**
 * @interface Title
 * @brief Represents a title in a list.
 * @details This interface defines the structure of a title object, including its properties and types.
 * @property {string} list_title_id - Unique identifier for the list title.
 * @property {string} list_title_text - Text content of the list title.
 */
export interface Title {
  list_title_id: string;
  list_title_text: string;
}
/**
 * @interface Item
 * @brief Represents an item in a list.
 * @details This interface defines the structure of an item object, including its properties and types.
 * @property {string} list_title_id - Unique identifier for the list title.
 * @property {string} item_text - Text content of the item.
 */
export interface Item {
  list_title_id: string;
  item_text: string;
}
/**
 * @interface ListData
 * @brief Represents a list of data items in the application.
 * @details This interface defines the structure of a list data object, including its titles and items.
 * @property {Title[]} titles - Array of title objects.
 * @property {Item[]} items - Array of item objects.
 */
export interface ListData {
  titles: Title[];
  items: Item[];
}
/**
 * @interface Itinerary
 * @brief Represents an itinerary for a tour.
 * @details This interface defines the structure of an itinerary object, including its day and description.
 * @property {number} day - Day number of the itinerary.
 * @property {string} description - Description of the itinerary for that day.
 */
export interface Itinerary {
  day: number;
  description: string;
}
/**
 * @interface Month
 * @brief Represents a month in the application.
 * @details This interface defines the structure of a month object, including its name and banner images.
 * @property {string} month_name - Name of the month.
 * @property {string} month_small_banner - URL for the small banner image of the month.
 * @property {string} month_large_banner - URL for the large banner image of the month.
 */
export interface Month {
  month_name: string;
  month_small_banner: string;
  month_large_banner: string;
}
/**
 * @interface FieldOption
 * @brief Represents an option for a field in the application.
 * @details This interface defines the structure of a field option, including its value and text.
 * @property {string} value - The value of the field option.
 * @property {string} text - The display text for the field option.
 */
export interface FieldOption {
  value: string;
  text: string;
}
/**
 * @interface FaqItem
 * @brief Represents a frequently asked question item.
 * @details This interface defines the structure of a FAQ item, including its question and answer.
 * @property {string} question - The question text.
 * @property {React.ReactNode} answer - The answer text, which can be a React node for rendering.
 */
export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}
/**
 * @interface FieldConfig
 * @brief Represents the configuration for a field in the application.
 * @details This interface defines the structure of a field configuration object, including its properties and types.
 * @property {string} id - Unique identifier for the field.
 * @property {string} [label] - Optional label for the field.
 * @property {React.ComponentType | null} icon - Icon component for the field.
 * @property {FieldOption[]} [options] - Optional array of field options.
 * @property {boolean} [optional] - Indicates if the field is optional.
 * @property {string} [type] - Type of the field (e.g., "button").
 * @property {string} [buttonText] - Text for the button field.
 * @property {FieldConfig[]} [group] - Optional array of grouped fields.
 */
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
/**
 * @interface CardsCarruselProps
 * @brief Represents the properties for the CardsCarrusel component.
 * @details This interface defines the structure of the props object for the CardsCarrusel component, including its properties and types.
 * @property {string | number} [filter] - Optional filter for the cards in the carrusel.
 */
export interface CardsCarruselProps {
  filter?: string | number;
}

/**
 * @interface Traveler
 * @brief Represents a traveler in the application.
 * @details This interface defines the structure of a traveler object, including its properties and types.
 * @property {string} title - Title of the traveler (e.g., Mr., Mrs., etc.).
 * @property {string} firstName - First name of the traveler.
 * @property {string} lastName - Last name of the traveler.
 */

export interface Traveler {
  title: string;
  firstName: string;
  lastName: string;
}
/**
 * @interface TourService
 * @brief Represents a tour service in the application.
 * @details This interface defines the structure of a tour service object, including its properties and types.
 * @property {number} service_id - Unique identifier for the service.
 * @property {string | null} service_name - Name of the service.
 * @property {number | null} city_id - Unique identifier for the city.
 * @property {string | null} city_name - Name of the city.
 * @property {number} service_type_id - Unique identifier for the service type.
 * @property {string} service_type_name - Name of the service type.
 * @property {number} adult_price - Price for adults.
 * @property {number} child_price - Price for children.
 */

export interface TourService {
  service_id: number;
  service_name: string | null;
  city_id: number | null;
  city_name: string | null;
  service_type_id: number;
  service_type_name: string;
  adult_price: number;
  child_price: number;
}

/** Representa un post de blog */
export interface BlogPost {
  blog_id: number;
  title: string;
  blog_description: string;
  blog_featured_image: string;
  blog_header_image: string;
  published_date: string; // ISO date
  content_html: string;
  custom_css: string | null;
  is_public: number;
}
