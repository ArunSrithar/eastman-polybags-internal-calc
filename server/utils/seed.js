import { existsSync } from "fs";
import { writeJson } from "./fileStore.js";
import { GRAVURE_SETTINGS_PATH } from "../config/paths.js";

const now = new Date().toISOString();

function makeRateEntry(rate) {
  return { rate, changedBy: "Admin", changedAt: now };
}

function makeMaterial(label, price, microns, qtys) {
  return {
    label,
    priceHistory: price ? [{ price, changedBy: "Admin", changedAt: now }] : [],
    micronOptions: microns.map((v) => ({ value: v, createdAt: now })),
    qtyOptions: qtys.map((v) => ({ value: v, createdAt: now })),
  };
}

const DEFAULT_SETTINGS = {
  materials: {
    polyester: makeMaterial(
      "Polyester",
      220,
      ["12", "15", "20", "25"],
      ["0.5", "1", "1.5", "2", "2.5", "3"],
    ),
    silverPet: makeMaterial(
      "Silver PET",
      260,
      ["12", "15", "20"],
      ["0.5", "1", "1.5", "2"],
    ),
    ldRoll: makeMaterial(
      "L.D. Roll",
      158,
      ["25", "30", "40", "50"],
      ["0.5", "1", "1.5", "2"],
    ),
    bopp: makeMaterial("B.O.P.P.", 0, ["20", "25", "30"], ["0.5", "1", "1.5"]),
  },
  pouches: [
    {
      id: "ps-1",
      length: "4",
      breadth: "6",
      rate: 15,
      enabled: true,
      createdBy: "Admin",
      createdAt: now,
      modifiedBy: null,
      modifiedAt: null,
    },
    {
      id: "ps-2",
      length: "5",
      breadth: "7",
      rate: 18,
      enabled: true,
      createdBy: "Admin",
      createdAt: now,
      modifiedBy: null,
      modifiedAt: null,
    },
    {
      id: "ps-3",
      length: "6",
      breadth: "8",
      rate: 20,
      enabled: true,
      createdBy: "Admin",
      createdAt: now,
      modifiedBy: null,
      modifiedAt: null,
    },
    {
      id: "ps-4",
      length: "7",
      breadth: "10",
      rate: 25,
      enabled: true,
      createdBy: "Admin",
      createdAt: now,
      modifiedBy: null,
      modifiedAt: null,
    },
  ],
  normalColorRate: {
    label: "Normal Color Rate",
    unit: "₹/color",
    history: [makeRateEntry(5)],
  },
  metallicColorRate: {
    label: "Metallic Color Rate",
    unit: "₹/color",
    history: [makeRateEntry(8)],
  },
  mattFinishRate: {
    label: "Matt Finish Rate",
    unit: "₹/kg",
    history: [makeRateEntry(3)],
  },
  singleLamRate: {
    label: "Single Lamination",
    unit: "₹/kg",
    history: [makeRateEntry(12)],
  },
  doubleLamRate: {
    label: "Double Lamination",
    unit: "₹/kg",
    history: [makeRateEntry(20)],
  },
  slittingRate: {
    label: "Slitting Charges",
    unit: "₹/kg",
    history: [makeRateEntry(4)],
  },
};

export function seedIfMissing() {
  if (!existsSync(GRAVURE_SETTINGS_PATH)) {
    writeJson(GRAVURE_SETTINGS_PATH, DEFAULT_SETTINGS);
    console.log("Seeded gravure-settings.json with defaults");
  }
}
