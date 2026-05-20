import { Tabs } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { HapticTab } from "@/components/layout/haptic-tab";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const TabStyle = {
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom + 4,
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
    backgroundColor: "#fefefe",
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        tabBarInactiveTintColor: "#8e8e93",
        tabBarButton: HapticTab,
        tabBarStyle: TabStyle,
        headerTransparent: true,
        header: (props) => <TopSearchBar {...props} />,
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 0,
        },
      }}
    >
      {/* ---------------- PESTAÑA: INICIO ---------------- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: true,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            return focused ? (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"
                />
              </Svg>
            ) : (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M304 70.1C313.1 61.9 326.9 61.9 336 70.1L568 278.1C577.9 286.9 578.7 302.1 569.8 312C560.9 321.9 545.8 322.7 535.9 313.8L527.9 306.6L527.9 511.9C527.9 547.2 499.2 575.9 463.9 575.9L175.9 575.9C140.6 575.9 111.9 547.2 111.9 511.9L111.9 306.6L103.9 313.8C94 322.6 78.9 321.8 70 312C61.1 302.2 62 287 71.8 278.1L304 70.1zM320 120.2L160 263.7L160 512C160 520.8 167.2 528 176 528L224 528L224 424C224 384.2 256.2 352 296 352L344 352C383.8 352 416 384.2 416 424L416 528L464 528C472.8 528 480 520.8 480 512L480 263.7L320 120.3zM272 528L368 528L368 424C368 410.7 357.3 400 344 400L296 400C282.7 400 272 410.7 272 424L272 528z"
                />
              </Svg>
            );
          },
        }}
      />

      {/* ---------------- PESTAÑA: BUSCAR ---------------- */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            return focused ? (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
                />
              </Svg>
            ) : (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
                />
              </Svg>
            );
          },
        }}
      />

      {/* ---------------- PESTAÑA: CHATS ---------------- */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => {
            const size = 26;
            return focused ? (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M321.9 96C199.3 96 96 194.5 96 316.1C96 320 96.1 544 96.1 544L321.9 543.8C444.6 543.8 544 441.5 544 319.9C544 198.3 444.6 96 321.9 96zM320 448C300.6 448 282.1 443.7 265.6 435.9L184.5 456L207.4 381C197.6 362.9 192 342.1 192 320C192 249.3 249.3 192 320 192C390.7 192 448 249.3 448 320C448 390.7 390.7 448 320 448z"
                />
              </Svg>
            ) : (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M321.9 96C199.3 96 96 194.5 96 316.1C96 320 96.1 544 96.1 544L321.9 543.8C444.6 543.8 544 441.5 544 319.9C544 198.3 444.6 96 321.9 96zM320 448C300.6 448 282.1 443.7 265.6 435.9L184.5 456L207.4 381C197.6 362.9 192 342.1 192 320C192 249.3 249.3 192 320 192C390.7 192 448 249.3 448 320C448 390.7 390.7 448 320 448z"
                />
              </Svg>
            );
          },
        }}
      />

      {/* ---------------- PESTAÑA: CREATE ---------------- */}
      <Tabs.Screen
        name="create"
        options={{
          title: "Crear",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            return focused ? (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"
                />
              </Svg>
            ) : (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"
                />
              </Svg>
            );
          },
        }}
      />
    </Tabs>
  );
}
