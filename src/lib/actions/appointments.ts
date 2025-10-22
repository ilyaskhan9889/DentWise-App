"use server";
import { th } from "date-fns/locale";
import { prisma } from "../prisma";
import { auth } from "@clerk/nextjs/server";
import { use } from "react";
function transformAppointment(appointment: any) {
  return {
    ...appointment,
    patientName: `${appointment.user.firstName || ""} ${
      appointment.user.lastName || ""
    }`.trim(),
    patientEmail: appointment.user.email,
    doctorName: appointment.doctor.name,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.date.toISOString().split("T")[0],
  };
}

export async function getAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        doctor: {
          select: { name: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return appointments;
  } catch (error) {
    console.log("Error in getDoctors server action", error);
    throw new Error("Failed to fetch doctors");
  }
}
export async function getUserAppointments() {
  try {
    // get the current authenticated user
    const { userId } = await auth();
    // ensure the user is logged in
    if (!userId) throw new Error("You must be logged in to view appointments");
    // find the user in the database
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      throw new Error(
        "User not found. Please ensure your account is properly set up."
      );
    // fetch appointments for the user
    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        doctor: {
          select: { name: true, imageUrl: true },
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments");
  }
}
export async function getUserAppointmentStats() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be authenticated");

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) throw new Error("User not found");

    // these calls will run in parallel, instead of waiting each other
    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({
        where: { userId: user.id },
      }),
      prisma.appointment.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
        },
      }),
    ]);

    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}
export async function getBookedTimeSlots(doctorId: string, date: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          in: ["CONFIRMED", "COMPLETED"], // consider both confirmed and completed appointments as blocking
        },
      },
      select: { time: true },
    });

    return appointments.map((appointment) => appointment.time);
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return []; // return empty array if there's an error
  }
}
interface BookAppointmentInput {
  doctorId: string;
  date: string; // in YYYY-MM-DD format
  time: string; // in HH:mm format
  reason?: string;
}
export async function bookAppointment(input: BookAppointmentInput) {
  try {
    const { userId } = await auth();
    if (!userId)
      throw new Error("You must be logged in to book an appointment");
    if (!input.doctorId || !input.date || !input.time)
      throw new Error(
        "Doctor, date, and time are required to book an appointment"
      );
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found");
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId: input.doctorId,
        date: new Date(input.date),
        time: input.time,
        reason: input.reason || "",
        status: "CONFIRMED",
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        doctor: {
          select: { name: true, imageUrl: true },
        },
      },
    });
    return transformAppointment(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw new Error("Failed to book appointment");
  }
}
