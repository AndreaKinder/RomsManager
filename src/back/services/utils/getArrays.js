import consolesData from "../../data/consoles.json" with { type: "json" };

export function getSystemIdArray() {
  const consolesArray = [];
  const consoles = consolesData.consoles;
  for (const key in consoles) {
    if (consoles[key].id_name) {
      consolesArray.push(consoles[key].id_name);
    }
  }
  return consolesArray;
}
