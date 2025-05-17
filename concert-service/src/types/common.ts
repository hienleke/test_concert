export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

export type SoftDelete = {
  isActive: boolean;
  deletedAt?: Date;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SortOrder = 'asc' | 'desc';

export type QueryOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  filter?: Record<string, any>;
};
