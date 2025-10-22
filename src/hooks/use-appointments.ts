"use client";
import {
  getAppointments,
  getBookedTimeSlots,
  bookAppointment,
  getUserAppointments
} from "@/lib/actions/appointments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export function useGetAppointments() {
  const result = useQuery({
    queryKey: ["getAppointments"],
    queryFn: getAppointments,
  });

  return result;
}
export function useGetBookedTimeSlots(doctorId: string, date: string) {
  const result = useQuery({
    queryKey: ["getBookedTimeSlots"],
    queryFn: () => getBookedTimeSlots(doctorId, date),
    enabled: !!doctorId && !!date, // only run the query if both doctorId and date are provided
  });

  return result;
}
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      // Invalidate and refetch appointments after booking
      queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
    },
    onError: (error) => {
      console.error("Error booking appointment:", error);
    },
  });
}
export function useUserAppointments() {
  const result = useQuery({
    queryKey: ["getUserAppointments"],
    queryFn: getUserAppointments,
  });

  return result;
}