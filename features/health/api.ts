import { apiRequest } from "@/lib/api/client";
import { HealthStatusDto } from "@/features/health/types";

export async function getHealthStatus() {
  return apiRequest<HealthStatusDto>("/health");
}
