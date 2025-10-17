"use client";
import { getDoctors, createDoctor, updateDoctor } from "@/lib/actions/doctors";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
// Hook to fetch doctors
export function useGetDoctors() {
  const result = useQuery({
    queryKey: ["getDoctors"],
    queryFn: getDoctors,
  });

  return result;
}
// Hook to create a new doctor
export function useCreateDoctor() {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationFn: createDoctor,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
    },
    onError: (error: any) => {
      console.error("Error creating doctor:", error.message);
    },
  });

  return result;
}
// Hook to update an existing doctor
export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationFn: updateDoctor,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
      console.log("Doctor updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating doctor:", error.message);
    },
  });

  return result;
}
