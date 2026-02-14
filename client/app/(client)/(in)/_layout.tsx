import React from "react";
import Svg, { Path } from "react-native-svg";

import Tab from "@/components/tab";

const tabs = [
  {
    name: "index",
    title: "Home",
    isLg: false,
    icons: {
      default: (color: string, size: number) => (
        <Svg width={size} height={size} viewBox="0 0 48 48">
          <Path
            fill={color}
            d="M23.95 4L8.86 15.52A7.5 7.5 0 0 0 6 21.41V40.5A2.5 2.5 0 0 0 8.5 43h10A2.5 2.5 0 0 0 21 40.5v-10a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v10A2.5 2.5 0 0 0 29.5 43h10A2.5 2.5 0 0 0 42 40.5V21.41a7.5 7.5 0 0 0-2.86-5.89L24.93 4a1.5 1.5 0 0 0-.98 0Z"
          />
        </Svg>
      ),
      focused: (color: string, size: number) => (
        <Svg width={size} height={size} viewBox="0 0 48 48">
          <Path
            fill={color}
            d="M39.5 43h-9a2.5 2.5 0 0 1-2.5-2.5v-9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v9A2.5 2.5 0 0 1 17.5 43h-9A2.5 2.5 0 0 1 6 40.5V21.41a7.5 7.5 0 0 1 2.86-5.89L23.07 4.32a1.5 1.5 0 0 1 1.86 0L39.14 15.52A7.5 7.5 0 0 1 42 21.41V40.5A2.5 2.5 0 0 1 39.5 43Z"
          />
        </Svg>
      ),
    },
  },
];

export default function InLayout() {
  return <Tab data={tabs} />;
}
