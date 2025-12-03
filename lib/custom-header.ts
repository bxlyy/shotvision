// lib/custom-header.ts
// Custom header functionality added here, since we use it in multiple places
export function validateAppSource(req: Request): boolean {
  const sourceHeader = req.headers.get("x-app-source");
  return sourceHeader === "shotvision-web";
}
