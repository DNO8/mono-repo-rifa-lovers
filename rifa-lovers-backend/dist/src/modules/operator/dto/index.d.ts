export declare class CreatePackDto {
    name: string;
    price: number;
    luckyPassQuantity: number;
    isFeatured?: boolean;
    isPreSale?: boolean;
}
export declare class UpdatePackDto {
    name?: string;
    price?: number;
    luckyPassQuantity?: number;
    isFeatured?: boolean;
    isPreSale?: boolean;
}
export declare class CreateOrganizationDto {
    name: string;
    slug?: string;
}
