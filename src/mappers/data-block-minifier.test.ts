import test from "ava";
import { DataBlockMinifier } from "./data-block-minifier";
import { HourlyDataBlock } from "../entities";

test("Hourly", (t) => {
  const hourlyBlock: HourlyDataBlock = {
    icon: 1,
    data: [
      {
        icon: 1,
        windDir: "NE",
        temperature: 1.2,
        time: 1212131313
      }
    ]
  };

  const hourlyBlockString = DataBlockMinifier.fromHourly(hourlyBlock);

  const decompressedHourlyBlock = DataBlockMinifier.toHourly(hourlyBlockString);

  t.deepEqual(hourlyBlock, decompressedHourlyBlock);
});
