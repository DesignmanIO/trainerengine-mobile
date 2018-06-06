import { Font } from "expo";

import { fonts } from "./assets";

export default async function startup() {
  await Font.loadAsync(fonts);
}
