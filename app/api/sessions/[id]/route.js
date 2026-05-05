import { NextResponse } from "next/server";
import { getSession, deleteSession } from "@/lib/db";
import supabase from "@/lib/supabase";

export async function GET(_, { params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return Response.json(null, { status: 404 });
  }

  return Response.json({
    ...data,
    createdAt: data.created_at,
  });
}

export async function DELETE(_request, { params }) {
  const ok = await deleteSession(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
