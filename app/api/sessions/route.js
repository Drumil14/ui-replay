import { NextResponse } from "next/server";
import { listSessions, saveSession } from "@/lib/db";
import supabase from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return Response.json([]);
  }

  return Response.json(
    data.map((s) => ({
      id: s.id,
      createdAt: s.created_at,
      duration: s.duration,
      width: s.width,
      height: s.height,
      eventCount: Array.isArray(s.events) ? s.events.length : 0,
    })),
  );
}

export async function POST(req) {
  const session = await req.json();

  const newSession = {
    ...session,
    id: session.id || crypto.randomUUID(), // generate id
    created_at: new Date().toISOString(), // always give date
    duration: Math.round(session.duration),
    width: Math.round(session.width),
    height: Math.round(session.height),
  };

  const { error } = await supabase.from("sessions").insert([newSession]);

  if (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }

  return Response.json({
    id: newSession.id,
  });
}

export const dynamic = "force-dynamic";
