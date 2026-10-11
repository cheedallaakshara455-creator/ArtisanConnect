// API endpoints return { success, message, data }; unwrap that envelope while
// remaining compatible with endpoints that return a raw value.
export const responseData = (response) => response?.data?.data ?? response?.data;

export const responseList = (response) => {
  const payload = responseData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

export const responsePage = (response) => {
  const payload = responseData(response);
  return payload && Array.isArray(payload.content)
    ? payload
    : { content: [], totalPages: 0 };
};
