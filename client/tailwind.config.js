/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'text-1': '#ffffff',
        'text-2': '#dbdbdb',
        'text-3': '#2F2F2F',
        'text-4': '#707070',
        'text-5': '#4A4947',
        'text-6': '#878787',
        'bg-red': '#B53325',
        'bg-yellow': '#e5a657',
        'bg-semi-black': '#333333',
        'bg-gray': '#f5f5f5',
        'bg-semi-white': '#fefefe',
        'bg-blue': '#3578e4',
      },
      fontFamily: {
        'dosis-bold': ['Dosis-Bold'], 
        'dosis-regular': ['Dosis-Regular'], 
        'dosis-light': ['Dosis-Light'],
        'dosis-medium': ['Dosis-Medium'],
        'dosis-semibold': ['Dosis-SemiBold'],
      },
    },
  },
  plugins: [],
}