import StateSelection from "@/libs/state-selection/main";

async function getStates() {
  try {
    const response = await fetch("https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json", {
      cache: 'force-cache',
    });
    if (!response.ok) {
      return {"N/A": "Not Applicable"}
    }
    const states = await response.json();
    return states;
  } catch (error) {
    console.error("Failed to fetch states:", error);
    return {"N/A": "Not Applicable"}
  }
}

export default async function Home() {
  const states = await getStates();
  return <StateSelection states={states}/>
}
