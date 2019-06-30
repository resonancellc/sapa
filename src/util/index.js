
import * as App from "./App";
import BaseStore from "./BaseStore";
import Dom from "./Dom";
import * as Event from "./Event";
import UIElement from "./UIElement";

import * as func from './functions/func';

export default {
  BaseStore,
  Dom,  
  UIElement,  
  ...App,
  ...Event,
  ...func
};
