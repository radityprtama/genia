import { createAPIFileRoute } from "@tanstack/react-start/api"

export const APIRoute = createAPIFileRoute("/builder/api")({
  GET: () =>
    Response.json({
      message:
        "AI Website Builder is currently unavailable. This is a mock implementation.",
      status: "disabled",
      version: "1.0.0",
    }),
  POST: () =>
    Response.json({
      message:
        "AI Website Builder operations are currently disabled. This is a mock implementation.",
      status: "disabled",
      operation: "not_supported",
    }),
})
