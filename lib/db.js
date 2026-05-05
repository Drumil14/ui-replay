import supabase from "../lib/supabase";

// 🔹 Get all sessions
export async function listSessions() {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((s) => ({
    id: s.id,
    created_at: s.created_at,
    duration: s.duration,
    width: s.width,
    height: s.height,
    eventCount: Array.isArray(s.events) ? s.events.length : 0,
  }));
}

// 🔹 Get single session
export async function getSession(id) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

// 🔹 Save session
export async function saveSession(session) {
  const { error } = await supabase.from("sessions").insert([
    {
      ...session,
      id: session.id || crypto.randomUUID(),
      created_at: session.created_at,
    },
  ]);

  if (error) {
    console.error(error);
  }

  return session;
}

// 🔹 Delete session
export async function deleteSession(id) {
  const { error } = await supabase.from("sessions").delete().eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}
