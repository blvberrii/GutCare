import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertScan } from "@shared/schema";

export function useScans(limit?: number) {
  return useQuery({
    queryKey: [api.scans.list.path, limit],
    queryFn: async () => {
      let url = api.scans.list.path;
      if (limit) url += `?limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scans");
      return api.scans.list.responses[200].parse(await res.json());
    },
  });
}

export function useScan(id: number) {
  return useQuery({
    queryKey: [api.scans.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.scans.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Scan not found");
      if (!res.ok) throw new Error("Failed to fetch scan");
      return api.scans.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScan) => {
      const res = await fetch(api.scans.create.path, {
        method: api.scans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save scan");
      return api.scans.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.scans.list.path] }),
  });
}

// Hook for the analysis endpoint
export function useAnalyzeProduct() {
  return useMutation({
    mutationFn: async (base64Image: string) => {
      const res = await fetch(api.analyze.product.path, {
        method: api.analyze.product.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to analyze product");
      return api.analyze.product.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertScan>) => {
      const url = buildUrl(api.scans.update.path, { id });
      const res = await fetch(url, {
        method: api.scans.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update scan");
      return api.scans.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.scans.get.path, variables.id] });
    },
  });
}
