import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import AppointmentConfirmationEmail from "@/components/email/AppointmentConfirmationEmail";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      appointmentType,
      duration,
      price,
    } = body;
    if (!userEmail || !doctorName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Send confirmation email using Resend
    const { data, error } = await resend.emails.send({
      from: "Dental App <no-reply@resend.dev>",
      to: [userEmail],
      subject: "Appointment Confirmation - Dentwise",
      react: AppointmentConfirmationEmail({
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration,
        price,
      }),
    });
    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Confirmation email sent successfully", emailId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in send-confirmation-email route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
