import { createClient } from "@supabase/supabase-js";
import env from "./env.js";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export default supabase;
