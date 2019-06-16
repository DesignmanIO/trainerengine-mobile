import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import _ from 'lodash';

import { fonts, images } from './assets';

export default async function startup() {
  await Font.loadAsync(fonts);
  await Asset.loadAsync(_.map(images, image => image));
  return true;
}
