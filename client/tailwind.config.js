/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "text-1": "#ffffff",
        "text-2": "#dbdbdb",
        "text-3": "#2F2F2F",
        "text-4": "#707070",
        "text-5": "#4A4947",
        "text-6": "#878787",
        "bg-red": "#B53325",
        "bg-yellow": "#e5a657",
        "bg-semi-black": "#333333",
        "bg-gray": "#f5f5f5",
        "bg-semi-white": "#fefefe",
        "bg-blue": "#3578e4",
        "bg-blue-black": "#054FAF",
      },
      fontFamily: {
        "outfit-thin": ["Outfit-Thin"],
        "outfit-extralight": ["Outfit-ExtraLight"],
        "outfit-light": ["Outfit-Light"],
        "outfit-regular": ["Outfit-Regular"],
        "outfit-medium": ["Outfit-Medium"],
        "outfit-bold": ["Outfit-Bold"],
        "outfit-extrabold": ["Outfit-ExtraBold"],
      },
    },
  },
  plugins: [],
};
