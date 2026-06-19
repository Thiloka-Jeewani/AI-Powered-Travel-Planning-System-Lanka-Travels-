export interface Package {
    package_id: string;
    package_name: string;
    description: string;
    duration_days: number;
    price_per_person_usd: number;
    per_person_cost: number;
    package_type: string;
    routes: string;
    accommodation_type: string;
    included_meal_plans: string;
    transport_included: boolean;
    transport_type: string;
    image_urls?: string;
}

export interface Route {
    day: number;
    location: string;
    description: string;
    activities: string[];
}