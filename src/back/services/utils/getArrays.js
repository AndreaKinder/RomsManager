import consolesData from "../../data/consoles.json" with { type: "json" };

export function getSystemIdArray() {
  return Object.values(consolesData.consoles)
    .filter((console) => console.id_name)
    .map((console) => console.id_name);
}
