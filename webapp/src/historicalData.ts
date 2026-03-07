import type { ChartData } from "chart.js";
import dayjs from "dayjs";

export type HistoricalData = HistoricalPage[];

export type HistoricalPage = {
  component: {
    name: string
  },
  months: HistoricalMonth[],
};

export type HistoricalMonth = {
  name: string,
  year: number,
  uptime_percentage: number,
  days: HistoricalDay[]
};

export type HistoricalDay = {
  color: string,
  date?: string,
  events?: unknown[],
  p?: number,
  m?: number,
}

export type MonthlyData = Record<string, MonthlyEntry>;

export type MonthlyEntry = {
  month: string,
  year: number,
  component_uptimes: Record<string, number>
};

export type Dataset = (ChartData<"line", { key: number, value: number }>)["datasets"][number];
export type Datasets = {
  datasets: Dataset[],
  minY: number,
  maxY: number,
};

export const aggregateMonthly = (data: HistoricalData, selectedCompNames: string[]): { monthlyData: MonthlyData, numConflict: number } => {
  const monthlyData: MonthlyData = {};
  let numConflict = 0;

  for (const page of data) {
    // Filter for relevant components
    const compName = page["component"]["name"];

    if (!selectedCompNames.includes(compName)) {
      continue;
    }

    // Add to relevant bin, creating it if needed
    for (const month of page["months"]) {
      const groupName = `${month.year}:${month.name}`;

      // Filter out incomplete months
      let incompleteMonth = false;

      for (const day of month["days"]) {
        if (day.events === undefined) {
          incompleteMonth = true;
          break;
        }
      }

      if (incompleteMonth) {
        console.warn(`Skip month ${groupName} with incomplete data`);
        continue;
      }

      // Find monthly bin first
      let group = monthlyData[groupName];

      if (group === undefined) {
        group = {
          month: month.name,
          year: month.year,
          component_uptimes: {}
        }
        monthlyData[groupName] = group;
      }

      // Update component uptime entry for the bin
      const uptime = month.uptime_percentage;
      const existingUptime = group.component_uptimes[compName];

      if (existingUptime !== undefined && existingUptime !== uptime) {
        console.warn(`Conflicting uptime! Month ${groupName} already registered as ${existingUptime}, but was also declared as ${uptime}`);
        numConflict++;
      }

      group.component_uptimes[compName] = uptime;
    }
  };

  return { monthlyData, numConflict };
};

export const checkMissingComponents = (monthlyData: MonthlyData, selectedCompNames: string[]): number => {
  let numMissing = 0;

  for (const groupName in monthlyData) {
    const group = monthlyData[groupName];

    for (const compName of selectedCompNames) {
      if (group.component_uptimes[compName] === undefined) {
        console.warn(`WARNING: Missing data for ${compName} at ${groupName}`);
        numMissing++;
      }
    }
  }

  return numMissing;
};

export const averageMonthly = (monthlyData: MonthlyData, avgCompName: string): MonthlyData => {
  const avgMonthlyData: MonthlyData = {};

  for (const groupName in monthlyData) {
    const group = monthlyData[groupName];
    const compNames = Object.keys(monthlyData[groupName].component_uptimes);
    const avg = compNames.reduce((sum, compName) => sum + group.component_uptimes[compName], 0) / compNames.length;
    avgMonthlyData[groupName] = {
      ...group,
      component_uptimes: {
        [avgCompName]: avg,
      },
    };
  }

  return avgMonthlyData;
};

export const getDatasets = (monthlyData: MonthlyData, selectedCompNames: string[]): Datasets => {
  const datasets: Dataset[] = [];
  let minY = 1;
  let maxY = 0;

  for (const compName of selectedCompNames) {
    const dps: [number, number][] = [];

    for (const groupName in monthlyData) {
      const date = dayjs(groupName, "YYYY:MMMM");
      const uptime = monthlyData[groupName].component_uptimes[compName];
      dps.push([date.toDate().getTime(), uptime]);

      if (uptime < minY) {
        minY = uptime;
      }

      if (uptime > maxY) {
        maxY = uptime;
      }
    }

    dps.sort((a, b) => a[0] - b[0]); // Ascending
    datasets.push({
      label: compName,
      data: dps as unknown as Dataset["data"],
    });
  };

  return { datasets, minY, maxY };
};
