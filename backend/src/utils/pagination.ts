export function parsePagination(query: { page?: unknown; limit?: unknown }): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}
