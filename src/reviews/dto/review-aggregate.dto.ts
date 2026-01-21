export class ReviewAggregateDto {
  recipientId: string;
  reviewCount: number;
  avgRating: number | null;
  ratings: Record<string, number>; // keys: "1".."5"
  updatedAt: string;
}
