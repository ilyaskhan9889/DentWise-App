"use server";
import { Gender } from "@prisma/client";
import { prisma } from "../prisma";
import { generateAvatar } from "../utils";
import { revalidatePath } from "next/cache";
// Fetch all doctors with appointment counts
export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.log("Error in getDoctors server action", error);
    throw new Error("Failed to fetch doctors");
  }
}
// Input type for creating a new doctor
interface CreateDoctorInput {
  name: string;
  email: string;
  phone: string;
  speciality: string;
  gender: Gender;
  isActive: boolean;
}
// Create a new doctor with avatar generation
export async function createDoctor(input: CreateDoctorInput) {
  try {
    if (!input.name || !input.email)
      throw new Error("Name and email are required");

    const doctor = await prisma.doctor.create({
      data: {
        ...input,
        imageUrl: generateAvatar(input.name, input.gender),
      },
    });

    revalidatePath("/admin"); // Revalidate admin path to reflect new doctor
    return doctor;
  } catch (error: any) {
    console.error("Error creating doctor:", error);

    // handle unique constraint violation (email already exists)
    if (error?.code === "P2002") {
      throw new Error("A doctor with this email already exists");
    }

    throw new Error("Failed to create doctor");
  }
}
// partial means some fields can be omitted
interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
}
export async function updateDoctor(input: UpdateDoctorInput) {
  try {
    //check required fields
    if (!input.name || !input.email)
      throw new Error("Name and email are required");
    // Fetch current doctor data
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: input.id },
    });
    // check if doctor exists
    if (!currentDoctor) throw new Error("Doctor not found");
    // If email is being updated, check for uniqueness
    if (input.email !== currentDoctor.email) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { email: input.email! },
      });
      if (existingDoctor) {
        throw new Error("A doctor with this email already exists");
      }
    }
    const doctor = await prisma.doctor.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        speciality: input.speciality,
        gender: input.gender,
        isActive: input.isActive,
      },
    });
    return doctor;
  } catch (error: any) {
    console.error("Error updating doctor:", error);
    throw new Error("Failed to update doctor");
  }
}

export async function getAvailableDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.log("Error in getAvailableDoctors server action", error);
    throw new Error("Failed to fetch available doctors");
  }
}
