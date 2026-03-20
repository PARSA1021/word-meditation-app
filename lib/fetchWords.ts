// lib/fetchWords.ts
export async function fetchWords({
  type,
  query,
  page = 1,
  limit = 20,
}: {
  type?: "general" | "cheonseong"
  query?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (type) params.append("type", type)
  if (query) params.append("q", query)
  params.append("page", page.toString())
  params.append("limit", limit.toString())

  const res = await fetch(`/api/words?${params.toString()}`)
  const data = await res.json()
  return data
}