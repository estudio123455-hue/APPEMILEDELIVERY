import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    // Hashear la contraseña con salt seguro
    const hashedPassword = await bcrypt.hash(password, 10);

    // En desarrollo/producción aquí se guarda en la base de datos (ej. Prisma/Supabase)
    console.log(`[AUTH REGISTER] Usuario registrado: ${email} (${name}) con hash ${hashedPassword.substring(0, 15)}...`);

    return NextResponse.json({ message: "Usuario creado exitosamente" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Error interno" }, { status: 500 });
  }
}
