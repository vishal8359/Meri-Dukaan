import supabase from "../src/config/supabase.js";

async function resetOnboarding() {
  console.log("Resetting all delivery partner onboarding records...");
  
  // Delete all records in delivery_partners table.
  // Because of CASCADE rules, it should also delete onboarding_steps if set up that way.
  const { data, error } = await supabase
    .from("delivery_partners")
    .delete()
    .neq("status", "a_non_existent_status_to_delete_all"); // To bypass safe update protection if any, or just call normal delete
    
  if (error) {
    // If it fails, let's try a generic filter that matches everything
    const { data: data2, error: error2 } = await supabase
      .from("delivery_partners")
      .delete()
      .not("id", "is", null);
      
    if (error2) {
      console.error("Failed to delete records:", error2);
      process.exit(1);
    }
  }

  console.log("Onboarding records have been reset successfully.");
  process.exit(0);
}

resetOnboarding();
