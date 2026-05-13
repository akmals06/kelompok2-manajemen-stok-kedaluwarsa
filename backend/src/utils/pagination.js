// Technical assumption: Default page 1, default limit 10, max limit 100
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  let page = parseInt(query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) page = DEFAULT_PAGE;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit, skip: (page - 1) * limit };
};

const buildPaginationMeta = (total, page, limit) => {
  return {
    total_data: total,
    total_page: Math.ceil(total / limit),
    current_page: page,
    per_page: limit,
  };
};

module.exports = { parsePagination, buildPaginationMeta };
