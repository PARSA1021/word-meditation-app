// lib/highlight.tsx
import React from "react"

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.trim().length < 2) return text

  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) return text

  const regex = new RegExp(`(${tokens.join("|")})`, "gi")

  const parts = text.split(regex)

  return parts.map((part, index) => {
    const isMatch = tokens.some((token) =>
      part.toLowerCase() === token
    )

    if (isMatch) {
      return (
        <span
          key={index}
          className="bg-yellow-200 text-black px-1 rounded"
        >
          {part}
        </span>
      )
    }

    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}